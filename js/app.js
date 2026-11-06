import { loadData } from './data.js';
try {
const {R,Y26,GEO,population,demographics}=await loadData();
const P=Object.fromEntries(R.provincias.map(p=>[p.c,p]));
const FIELDS=['n','tipos','trim','trimt','psev','tent'];
const YD={'2025':{meta:{casos:R.meta.casos,nac:R.meta.nac,tent:270},prov:Object.fromEntries(R.provincias.map(p=>[p.c,Object.fromEntries(FIELDS.map(f=>[f,p[f]]))]))},'2026':Y26};
const QL={'2025':['enero–marzo de 2025','abril–junio de 2025','julio–septiembre de 2025','octubre–diciembre de 2025'],'2026':['enero–marzo de 2026','abril–junio de 2026','julio–agosto de 2026']};
const QO={'2025':['Trimestre 1 (ene–mar)','Trimestre 2 (abr–jun)','Trimestre 3 (jul–sep)','Trimestre 4 (oct–dic)'],'2026':['Trimestre 1 (ene–mar)','Trimestre 2 (abr–jun)','Trimestre 3 parcial (jul–ago)']};
const DEMOGS=demographics;
const LV=['Muy alta','Alta','Media','Baja'];
const T={
 total:{n:'Total',k:null,ramp:['#dce9f1','#9bbfd4','#4887ac','#24547a'],cnt:R.meta.casos},
 fisica:{n:'Física',k:'Física',ramp:['#fde3d2','#f6aa7c','#e8641c','#a5410a'],cnt:R.meta.nac['Física']},
 psicologica:{n:'Psicológica',k:'Psicológica',ramp:['#fbeecf','#efc977','#d19718','#8a5d04'],cnt:R.meta.nac['Psicológica']},
 sexual:{n:'Sexual',k:'Sexual',ramp:['#ece4f6','#c0a8e1','#7c54b9','#41216f'],cnt:R.meta.nac['Sexual']},
 economica:{n:'Económica o patrimonial',k:'Económica o patrimonial',ramp:['#f4e4da','#dcab90','#a95b36','#5f2a14'],cnt:R.meta.eco}};
const S={tipo:'total',dep:'',sel:null,q:'all',sex:'all',age:'all',y:'2026',metric:'rate'};
function applyYear(){const d=YD[S.y];for(const p of R.provincias){const v=d.prov[p.c];FIELDS.forEach(f=>p[f]=v?.[f]??null);p.pob=population[p.c]?.[S.y]??null}
 const m=d.meta;T.total.cnt=m.casos;T.fisica.cnt=m.nac['Física'];T.psicologica.cnt=m.nac['Psicológica'];T.sexual.cnt=m.nac['Sexual'];T.economica.cnt=m.nac['Económica o patrimonial'];
 DEMOG=DEMOGS[S.y]||null;
 $('quarter').innerHTML=`<option value="all">${S.y==='2025'?'Anual 2025':'Acumulado enero–agosto 2026'}</option>`+QO[S.y].map((l,i)=>`<option value="${i}">${l}</option>`).join('');$('quarter').value=S.q;
 $('yearNote').hidden=false;$('yearNote').textContent=S.y==='2026'?'2026: enero–agosto, preliminar; provincia de ocurrencia. No comparar directamente con 2025 (domicilio, enero–diciembre). Julio–agosto es un trimestre parcial.':'2025: enero–diciembre; provincia de domicilio. La ubicación difiere de 2026 (ocurrencia). No interpretar diferencias como evolución de la violencia.'}
let DEMOG=null;
const typeIndex={economica:0,psicologica:1,fisica:2,sexual:3};
const selectedDemog=()=>S.sex!=='all'||S.age!=='all';
const demogCount=(p,t)=>{const code=String(p.c).padStart(4,'0');let n=0;for(const [key,val] of DEMOG){const [c,q,sex,age,typ]=key.split('|');if(c!==code||(S.q!=='all'&&q!==S.q)||(S.sex!=='all'&&sex!==S.sex)||(S.age!=='all'&&age!==S.age)||(t!=='total'&&Number(typ)!==typeIndex[t]))continue;n+=val}return n<5&&n>0?'<5':n};
const $=id=>document.getElementById(id), fmt=n=>typeof n==='number'?n.toLocaleString('es-PE'):(n==='<5'?'Menos de 5':n);
const col=(t,l)=>l==='Sin casos'?'#e7edf2':l==='Dato reservado'?'#e7edf2':T[t].ramp[3-LV.indexOf(l)], base=t=>T[t].ramp[2], tint=t=>T[t].ramp[0];
const OFFICIAL_2025={fisica:62617,psicologica:74004,sexual:32180,economica:735,tent:270};
const annualCount=(p,t)=>t==='total'?p.n:p.tipos[T[t].k];
const quarterly=(p,t)=>t==='total'?p.trim:p.trimt[t];
const count=(p,t)=>{const n=DEMOG&&selectedDemog()?demogCount(p,t):S.q==='all'?annualCount(p,t):quarterly(p,t)?.[Number(S.q)];return typeof n==='number'&&n>0&&n<5?'<5':n??'Sin datos'};
const periodLabel=()=>S.q==='all'?(S.y==='2025'?'anual 2025':'enero–agosto de 2026'):QL[S.y][Number(S.q)];
const yearLabel=()=>S.y==='2025'?'total anual 2025':'enero–agosto 2026';
const countValue=v=>typeof v==='number'?v:0;
const rate=p=>{const n=count(p,S.tipo);return !selectedDemog()&&typeof n==='number'&&(n===0||n>=5)&&p.pob>0?n/p.pob*100000:null};
let thresholds=[];
const updateThresholds=()=>{const rr=R.provincias.map(rate).filter(v=>v!==null&&v>0).sort((a,b)=>a-b);const at=q=>rr.length?rr[Math.min(rr.length-1,Math.ceil(q*rr.length)-1)]:Infinity;thresholds=[at(.25),at(.5),at(.75)]};
const priority=p=>{const v=rate(p);if(v===null)return 'Dato reservado';if(v===0)return 'Sin casos';if(v>thresholds[2])return 'Muy alta';if(v>thresholds[1])return 'Alta';if(v>thresholds[0])return 'Media';return 'Baja'};
const officialNote='Fuente: registro de casos CEM 2025 (Warmi Ñan/MIMP). Población: INEI, proyecciones provinciales al 30 de junio de 2025. Clasificación oficial según TIPO_VIO; las modalidades son respuestas múltiples.';
const sumCases=(rows,k)=>{let n=0,hidden=0;for(const p of rows){const v=count(p,k);if(typeof v==='number')n+=v;else if(v==='<5')hidden++}return hidden?`${fmt(n)}–${fmt(n+4*hidden)}`:fmt(n)};
const scope=()=>S.sel&&P[S.sel]?[P[S.sel]]:R.provincias.filter(p=>!S.dep||p.dep===S.dep);
const scopeName=()=>S.sel&&P[S.sel]?P[S.sel].prov:S.dep||'Perú';
const scopeTotal=(rows,k)=>{if(!selectedDemog()&&!S.dep&&!S.sel&&S.q==='all'){const v=T[k].cnt;return {lo:v,hi:v}}if(DEMOG){const ok=new Set(rows.map(p=>String(p.c).padStart(4,'0')));let n=0;for(const [key,v] of DEMOG){const [c,q,sex,age,typ]=key.split('|');if(!ok.has(c)||(S.q!=='all'&&q!==S.q)||(S.sex!=='all'&&sex!==S.sex)||(S.age!=='all'&&age!==S.age)||(k!=='total'&&Number(typ)!==typeIndex[k]))continue;n+=v}return {lo:n,hi:n}}let lo=0,hi=0;for(const p of rows){const v=count(p,k);if(typeof v==='number'){lo+=v;hi+=v}else if(v==='<5'){hi+=4}}return {lo,hi}};
const displayTotal=r=>r.lo===r.hi?(r.lo>0&&r.lo<5?'Menos de 5':fmt(r.lo)):r.lo===0&&r.hi<=4?'Menos de 5':fmt(r.lo)+'–'+fmt(r.hi);
function renderTypes(){const rows=scope();$('types').innerHTML=Object.entries(T).map(([k,t])=>`<button type="button" class="type" data-v="${k}" aria-pressed="${k===S.tipo}" style="--c:${t.ramp[2]};--t:${t.ramp[0]}"><span class="band"></span><span class="tx"><b>${t.n}</b><span>${displayTotal(scopeTotal(rows,k))} casos · ${scopeName()} · ${S.q==='all'?(S.y==='2025'?'Anual 2025':'Ene–ago 2026'):`Trimestre ${Number(S.q)+1} · ${S.y}`}</span></span></button>`).join('');document.querySelectorAll('.type').forEach(b=>b.onclick=()=>setTipo(b.dataset.v))}
function renderBars(){const rows=scope(),keys=['fisica','psicologica','sexual','economica'],vals=keys.map(k=>({k,r:scopeTotal(rows,k)})),max=Math.max(1,...vals.map(v=>v.r.hi));$('barsScope').textContent=`${scopeName()} · ${periodLabel()} · casos clasificados por tipo principal`;$('typeBars').innerHTML=vals.map(({k,r})=>`<div class="hbar"><span class="name">${T[k].n}</span><div class="track"><div class="fill" style="width:${Math.max(0,r.lo/max*100)}%;background:${base(k)}"></div></div><span class="amount">${displayTotal(r)}</span></div>`).join('')}

function tentativeRange(rows){let lo=0,hi=0;for(const p of rows){if(typeof p.tent==='number'){lo+=p.tent;hi+=p.tent}else if(p.tent==='<5'){hi+=4}}return {lo,hi}}
function tentLabel(r){return r.lo===r.hi?fmt(r.lo):`${fmt(r.lo)}–${fmt(r.hi)}`}
// El selector se actualiza según el territorio seleccionado.
applyYear();
renderTypes();
function setTipo(v){S.tipo=v;draw()}
[...new Set(R.provincias.map(p=>p.dep))].sort((a,b)=>a.localeCompare(b,'es')).forEach(d=>$('dep').insertAdjacentHTML('beforeend',`<option>${d}</option>`));
// mapa
const W=560,H=760,svg=d3.select('#map').attr('viewBox',`0 0 ${W} ${H}`);
const proj=d3.geoMercator().fitExtent([[8,8],[W-8,H-8]],GEO),path=d3.geoPath(proj);
const gm=svg.append('g');
const paths=gm.selectAll('path').data(GEO.features).join('path').attr('tabindex',0).attr('d',path).attr('role','button').attr('aria-label',f=>P[f.properties.c]?.prov||'Sin datos')
 .on('mousemove',(e,f)=>tip(e,f)).on('mouseleave',()=>$('tip').hidden=true)
 .on('click',(e,f)=>pick(f.properties.c)).on('keydown',(e,f)=>{if(e.key==='Enter'||e.key===' ')pick(f.properties.c)});
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
function pick(c){if(P[c]){S.sel=c;S.dep=P[c].dep;$('dep').value=S.dep;draw();const d=P[c].dep;zoomTo(GEO.features.filter(f=>P[f.properties.c]&&P[f.properties.c].dep===d),.12)}}
function zoomTo(feats,pad){
  let k=1,tx=0,ty=0;
  if(feats&&feats.length){const [[x0,y0],[x1,y1]]=path.bounds({type:'FeatureCollection',features:feats});
    k=Math.min(5,(1-(pad||.1))/Math.max((x1-x0)/W,(y1-y0)/H));tx=W/2-k*(x0+x1)/2;ty=H/2-k*(y0+y1)/2}
  (RM?gm:gm.transition().duration(750)).attr('transform',`translate(${tx},${ty}) scale(${k})`);
  $('reset').hidden=k===1;
}
function tip(e,f){const p=P[f.properties.c],t=$('tip');
 t.innerHTML=p?`<b>${p.prov}</b> · ${p.dep}<br>Clasificación <b style="color:${col(S.tipo,priority(p))}">${priority(p).toLowerCase()}</b><br>${fmt(count(p,S.tipo))} casos · ${periodLabel()}`:'<b>Sin datos</b>';
 t.hidden=false;t.style.left=Math.min(e.clientX+14,innerWidth-t.offsetWidth-8)+'px';t.style.top=Math.min(e.clientY+14,innerHeight-t.offsetHeight-8)+'px'}
const metricValue=p=>S.metric==='cases'?(typeof count(p,S.tipo)==='number'&&count(p,S.tipo)>=5?count(p,S.tipo):null):rate(p);
const list=()=>R.provincias.filter(p=>(!S.dep||p.dep===S.dep)&&metricValue(p)!==null&&metricValue(p)>0).sort((a,b)=>metricValue(b)-metricValue(a)||a.c.localeCompare(b.c));
function renderDemogCharts(){
  const context=scopeName()+' · '+periodLabel()+' · '+T[S.tipo].n+(!S.dep&&!S.sel?' · solo casos con ubicación provincial; '+(S.y==='2025'?'35':'36')+' casos nacionales sin ubicación (todos los tipos, acumulado)':'');
  $('sexContext').textContent=context;$('ageContext').textContent=context;
  if(!DEMOG){$('sexBars').innerHTML='<p class="demog-empty">Cargando datos…</p>';$('ageBars').innerHTML='<p class="demog-empty">Cargando datos…</p>';return}
  const valid=new Set(scope().map(p=>String(p.c).padStart(4,'0')));
  const sexes=[0,0],ages=[0,0,0,0,0];
  for(const [key,n] of DEMOG){const [c,q,sex,age,typ]=key.split('|');if(!valid.has(c)||(S.q!=='all'&&q!==S.q)||(S.tipo!=='total'&&Number(typ)!==typeIndex[S.tipo]))continue;sexes[Number(sex)]+=n;ages[Number(age)]+=n}
  const make=(id,labels,vals)=>{const max=Math.max(1,...vals);$(id).innerHTML=labels.map((label,i)=>{const n=vals[i];return '<div class="demog-bar"><span>'+label+'</span><div class="track"><div class="fill" style="width:'+(n/max*100).toFixed(1)+'%;--bar-color:'+T[S.tipo].ramp[2]+'"></div></div><strong>'+(n>0&&n<5?'Menos de 5':fmt(n))+'</strong></div>'}).join('')};
  make('sexBars',['Mujer','Hombre'],sexes);
  make('ageBars',['0–11 años','12–17 años','18–29 años','30–59 años','60 años a más'],ages);
}
function draw(){
  updateThresholds();
  renderTypes();
  renderDemogCharts();
  paths.attr('fill',f=>{const p=P[f.properties.c];if(!p)return 'var(--nodata)';return col(S.tipo,priority(p))})
   .attr('opacity',f=>{const p=P[f.properties.c];return S.dep&&p&&p.dep!==S.dep?.18:1}).classed('sel',f=>f.properties.c===S.sel);
  $('mapTitle').textContent=S.tipo==='total'?'Casos atendidos · Total':`Casos atendidos · Violencia ${T[S.tipo].n.toLowerCase()}`;

  $('legend').innerHTML=LV.map(l=>`<span><i style="background:${col(S.tipo,l)}"></i>${l}</span>`).join('')+'<span><i style="background:#e7edf2"></i>Sin casos / dato reservado</span><span><i style="background:#eceef3"></i>Sin datos</span>';
  const L=list().slice(0,10);
  $('rankTitle').textContent=S.metric==='cases'?'Provincias con más casos atendidos':'Provincias con mayor tasa de casos atendidos';$('rankSub').textContent=(S.metric==='cases'?'Ranking por número de casos. ':'Ranking por casos por 100 000 habitantes; población INEI al 30 de junio de '+S.y+'. ')+periodLabel()+'. Se excluyen cifras reservadas y faltantes. Empates: UBIGEO. La atención registrada no mide prevalencia ni riesgo.';
  $('rank').innerHTML=L.map((p,i)=>`<button type="button" class="zoom${p.c===S.sel?' on':''}" data-c="${p.c}" style="--c:${base(S.tipo)}"><span class="rk">${i+1}</span>${miniMap(p)}<b>${p.prov}</b><span class="d">${p.dep}</span><span class="v">${S.metric==='cases'?fmt(count(p,S.tipo))+' casos':fmt(Math.round(rate(p)))+' casos por 100 000 hab.'}</span></button>`).join('');
  document.querySelectorAll('#rank .zoom').forEach(b=>b.onclick=()=>{pick(b.dataset.c);document.querySelector('.grid').scrollIntoView({block:'start',behavior:RM?'auto':'smooth'})});
  document.querySelector('.grid').classList.toggle('has-selection',Boolean(S.sel&&P[S.sel]));
  ficha(S.sel?P[S.sel]:null,false);
}
function miniMap(p){
  const dep=GEO.features.filter(f=>P[f.properties.c]&&P[f.properties.c].dep===p.dep),me=GEO.features.find(f=>f.properties.c===p.c);
  if(!me)return '<svg viewBox="0 0 100 100"></svg>';
  const pr=d3.geoMercator().fitExtent([[6,6],[94,94]],{type:'FeatureCollection',features:dep}),pa=d3.geoPath(pr);
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${dep.map(f=>`<path d="${pa(f)}" fill="${f===me?base(S.tipo):'#dfe2ea'}" stroke="#fff" stroke-width=".6"/>`).join('')}</svg>`}
function columns(v,color){const w=300,h=120,bw=46,gap=(w-4*bw)/5,mx=Math.max(...v.filter(x=>typeof x==='number'),1);
  return `<svg viewBox="0 0 ${w} ${h+34}" role="img" aria-label="Casos por trimestre: ${v.join(', ')}">`+v.map((x,i)=>{const bh=typeof x==='number'?Math.max(x===0?0:3,x/mx*(h-22)):0,xx=gap+i*(bw+gap),active=S.q!=='all'&&Number(S.q)===i;
   return `<rect class="${active?'active-quarter':''}" x="${xx}" y="${h-bh}" width="${bw}" height="${bh}" rx="5" fill="${color}" opacity="${S.q==='all'||active?1:.32}"/><text x="${xx+bw/2}" y="${h-bh-6}" text-anchor="middle" font-size="12" font-weight="700" fill="#171c33">${fmt(x)}</text><text x="${xx+bw/2}" y="${h+18}" text-anchor="middle" font-size="11" fill="#4a5068">${['Trimestre 1','Trimestre 2','Trimestre 3','Trimestre 4'][i]}</text>`}).join('')+`<line x1="0" x2="${w}" y1="${h}" y2="${h}" stroke="#e3e6ee"/></svg>`}
function ficha(p,auto){if(!p){$('ficha').innerHTML='<p class="sub">Detalle provincial</p><h3>Explora una provincia</h3><p>Selecciona una provincia en el mapa o en el ranking inferior para consultar sus indicadores.</p>';return}
  const lv=priority(p),nT=count(p,S.tipo);
  $('ficha').innerHTML=`<p class="sub">${auto?'Provincia con mayor tasa de casos atendidos':'Provincia seleccionada'}</p><h3>${p.prov}</h3><div class="dep">Provincia: ${p.prov} · Departamento: ${p.dep} · ${fmt(p.pob)} habitantes · INEI al 30 de junio de ${S.y} · UBIGEO ${p.c}</div>
   <span class="pill" style="background:${col(S.tipo,lv)};color:${LV.indexOf(lv)>=2?'#171c33':'#fff'}">${lv==='Sin casos'||lv==='Dato reservado'?lv:'Nivel de atención: '+lv.toLowerCase()}</span>
   <div class="stats"><div class="stat"><b>${fmt(nT)}</b><span>${S.tipo==='total'?'casos registrados (todos los tipos)':'casos de violencia '+T[S.tipo].n.toLowerCase()} · ${periodLabel()}</span></div>
   <div class="stat"><b>${rate(p)===null?'No disponible':fmt(Math.round(rate(p)))}</b><span>tasa de atención por 100 mil hab. · ${periodLabel()} (no mide riesgo)</span></div>
   <div class="stat"><b>${p.psev==null?'No disponible':fmt(p.psev)+'%'}</b><span>de casos clasificados con riesgo severo · ${yearLabel()} (no es la tasa de atención)</span></div>
   <div class="stat"><b>${typeof p.tent==='number'&&p.tent>0&&p.tent<5?'Menos de 5':fmt(p.tent??'No disponible')}</b><span>tentativas de feminicidio en ${p.prov} · ${yearLabel()} (no filtrado por trimestre)</span></div></div>
   ${p.n<(S.y==='2025'?50:33)?'<p class="note">Pocos casos registrados: puede reflejar menor acceso a un CEM más que menos violencia.</p>':''}`;
}
$('quarter').onchange=e=>{S.q=e.target.value;draw()};
$('year').onchange=e=>{S.y=e.target.value;S.q='all';applyYear();draw()};
$('dep').onchange=e=>{S.dep=e.target.value;S.sel=null;draw();zoomTo(S.dep?GEO.features.filter(f=>P[f.properties.c]&&P[f.properties.c].dep===S.dep):null,.08)};
$('reset').onclick=()=>{S.dep='';$('dep').value='';S.sel=null;draw();zoomTo(null)};
draw();

$('metric').onchange=e=>{S.metric=e.target.value;draw()};

} catch(error) { console.error(error); const p=document.createElement('p');p.className='note';p.setAttribute('role','alert');p.textContent='No se pudo cargar el tablero. Recarga la página o revisa la conexión.';document.querySelector('main').prepend(p); }
