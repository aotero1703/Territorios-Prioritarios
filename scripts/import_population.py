"""Reproduce denominators from the preserved official workbook. Requires openpyxl."""
from pathlib import Path
import csv, json, re
import openpyxl
ROOT=Path(__file__).resolve().parents[1]
w=openpyxl.load_workbook(ROOT/'data/sources/inei-2018-2026.xlsx',data_only=True)
assert w.active.cell(5,10).value==2025 and w.active.cell(5,11).value==2026
population={};rows=[]
for i,row in enumerate(w.active.values,1):
    code=str(row[0])
    if re.fullmatch(r'\d{6}',code) and code.endswith('00') and not code.endswith('0000'):
        assert code[:4] not in population
        assert all(isinstance(n,int) and n>0 for n in row[9:11])
        population[code[:4]]={'2025':row[9],'2026':row[10]}
        rows.append([code[:4],row[1],row[9],row[10],i])
assert len(population)==196
(ROOT/'data/poblacion.json').write_text(json.dumps(population,ensure_ascii=False,separators=(',',':'))+'\n')
with (ROOT/'data/poblacion.csv').open('w') as f:
    writer=csv.writer(f,lineterminator="\n");writer.writerow(['ubigeo_provincia','provincia','poblacion_2025','poblacion_2026','fila_excel']);writer.writerows(rows)
print('196 provincias; columnas J (2025), K (2026); sin sumar distritos ni duplicar departamentos.')
