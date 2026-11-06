async function get(path, json=true) {
 const response=await fetch(new URL('../data/'+path,import.meta.url));
 if(!response.ok) throw new Error('No se pudo cargar '+path);
 return json?response.json():response.text();
}
function unpack(csv) {
 const map=new Map();
 for(const line of csv.trim().split('\n').slice(1)) {
  const [c,q,sex,age,type,n]=line.trim().split(',');
  const key=[c,q,sex,age,type].join('|');map.set(key,(map.get(key)||0)+Number(n));
 }
 return map;
}
export async function loadData() {
 const [R,Y26,GEO,population,d25,d26]=await Promise.all([
  get('original-2025.json'),get('original-2026.json'),get('provincias.geojson'),get('poblacion.json'),get('demografia-2025.csv',false),get('demografia-2026.csv',false)]);
 return {R,Y26,GEO,population,demographics:{'2025':unpack(d25),'2026':unpack(d26)}};
}
