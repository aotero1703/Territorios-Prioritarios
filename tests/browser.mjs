import { chromium } from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
const read=f=>JSON.parse(fs.readFileSync(new URL('../data/'+f,import.meta.url),'utf8'));
const R=read('original-2025.json'),Y26=read('original-2026.json'),population=read('poblacion.json');
const source25=structuredClone(R.provincias);
const server=spawn('python',['-m','http.server','8765','--bind','127.0.0.1'],{cwd:new URL('..',import.meta.url),stdio:'ignore'});
let browser;let checks=0;
try {
 for(let i=0;i<40;i++){try{if((await fetch('http://127.0.0.1:8765/')).ok)break}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8765/'))external.push(r.url());});
 await page.goto('http://127.0.0.1:8765/');await page.waitForSelector('#rank button');
 assert.equal(await page.locator('#map path').count(),197);
 assert.equal(await page.locator('#sexBars .demog-bar').count(),2);
 assert.equal(await page.locator('#ageBars .demog-bar').count(),5);
 for(const year of ['2025','2026']){
  await page.selectOption('#year',year);
  const provs=year==='2025'?source25:source25.map(p=>({...p,...Y26.prov[p.c]}));
  const periods=year==='2025'?['all','0','1','2','3']:['all','0','1','2'];
  for(const dep of ['', 'Amazonas']){
   await page.selectOption('#dep',dep);
   for(const q of periods){
    await page.selectOption('#quarter',q);
    if(year==='2026'&&q==='2')assert.match(await page.locator('#quarter option:checked').innerText(),/parcial/);
    for(const [type,label] of [['total',null],['fisica','Física'],['psicologica','Psicológica'],['sexual','Sexual'],['economica','Económica o patrimonial']]){
     await page.locator(`.type[data-v="${type}"]`).click();
     const count=p=>q==='all'?(type==='total'?p.n:p.tipos[label]):(type==='total'?p.trim:p.trimt[type])[Number(q)];
     for(const metric of ['rate','cases']){
      await page.selectOption('#metric',metric);
      const value=p=>metric==='cases'?count(p):count(p)/population[p.c][year]*100000;
      const expected=provs.filter(p=>(!dep||p.dep===dep)&&typeof count(p)==='number'&&count(p)>=5).sort((a,b)=>value(b)-value(a)||a.c.localeCompare(b.c)).slice(0,10).map(p=>p.c);
      assert.deepEqual(await page.locator('#rank button').evaluateAll(bs=>bs.map(b=>b.dataset.c)),expected,`${year}/${dep}/${q}/${type}/${metric}`);
      checks++;
     }
    }
   }
  }
  await page.selectOption('#dep','');await page.selectOption('#quarter','all');await page.locator('.type[data-v="total"]').click();await page.selectOption('#metric','rate');
  const first=await page.locator('#rank button').first().getAttribute('data-c');
  await page.locator('#rank button').first().click();
  const p=provs.find(p=>p.c===first),rate=Math.round(p.n/population[first][year]*100000).toLocaleString('es-PE');
  assert.equal(await page.locator('#ficha .stat b').nth(1).innerText(),rate);
  assert.match(await page.locator('#ficha .dep').innerText(),new RegExp(String(population[first][year]).replace(/\B(?=(\d{3})+(?!\d))/g,',')+' habitantes'));
  assert.match(await page.locator('#yearNote').innerText(),year==='2026'?/ocurrencia/:/domicilio/);
  await page.locator('#reset').click();assert.equal(await page.locator('.grid.has-selection').count(),0);
 }
 // Keyboard selects a province and small cells do not produce rates.
 await page.locator('#map path').first().focus();await page.keyboard.press('Enter');assert.equal(await page.locator('.grid.has-selection').count(),1);await page.locator('#reset').click();
 await page.selectOption('#year','2025');await page.locator('.type[data-v="economica"]').click();
 const small=source25.find(p=>p.tipos['Económica o patrimonial']==='<5');
 assert.ok(small,'fixture de reserva requerido');if(small){await page.locator('#map path').evaluateAll((paths,c)=>{const e=paths.find(p=>p.__data__.properties.c===c);e.dispatchEvent(new MouseEvent('click',{bubbles:true}));},small.c);assert.equal(await page.locator('#ficha .stat b').first().innerText(),'Menos de 5');assert.equal(await page.locator('#ficha .stat b').nth(1).innerText(),'No disponible');}
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/mobile.png',fullPage:true});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile horizontal overflow');
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'test-results/desktop.png',fullPage:true});
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 const failed=await browser.newPage();await failed.route('**/data/original-2025.json',r=>r.abort());await failed.goto('http://127.0.0.1:8765/');await failed.waitForSelector('[role=alert]');assert.match(await failed.locator('[role=alert]').innerText(),/No se pudo cargar/);
 console.log(`${checks} rankings validados contra cálculo independiente; fichas, filtros, teclado, móvil, reserva, error de carga y cero peticiones externas: OK`);
} finally {if(browser)await browser.close();server.kill();}
