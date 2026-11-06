from pathlib import Path
import csv,json,unittest,collections,hashlib
ROOT=Path(__file__).resolve().parents[1]
load=lambda name:json.loads((ROOT/'data'/name).read_text())
class DataValidation(unittest.TestCase):
    def test_population(self):
        p=load('poblacion.json')
        self.assertEqual(len(p),196)
        self.assertEqual(sum(v['2025'] for v in p.values()),34350244)
        self.assertEqual(sum(v['2026'] for v in p.values()),34660114)
        self.assertEqual(p['0101'],{'2025':65024,'2026':65320})
        self.assertEqual(set(p),{v['c'] for v in load('original-2025.json')['provincias']})
    def test_cases(self):
        r=load('original-2025.json'); y26=load('original-2026.json')
        types=['Económica o patrimonial','Psicológica','Física','Sexual']
        keys=['economica','psicologica','fisica','sexual']
        for year,meta,provs in [('2025',r['meta'],{v['c']:v for v in r['provincias']}),('2026',y26['meta'],y26['prov'])]:
            with self.subTest(year=year):
                agg=collections.Counter()
                for row in csv.DictReader((ROOT/f'data/demografia-{year}.csv').read_text().splitlines()):
                    self.assertIn(row['sexo'],['0','1']);self.assertIn(row['edad'],list('01234'))
                    self.assertIn(row['tipo'],list('0123'))
                    n=int(row['casos']);self.assertGreater(n,0)
                    agg[(row['provincia'],int(row['trimestre']),int(row['tipo']))]+=n
                total=0
                for c,p in provs.items():
                    nq=4 if year=='2025' else 3
                    actual=sum(agg[c,q,t] for q in range(nq) for t in range(4))
                    self.assertEqual(actual,p['n']);total+=actual
                    for q in range(nq):
                        self.assertEqual(sum(agg[c,q,t] for t in range(4)),p['trim'][q])
                    for t,(key,label) in enumerate(zip(keys,types)):
                        vals=[agg[c,q,t] for q in range(nq)]
                        expected=p['tipos'][label]
                        self.assertTrue(expected=='<5' and 1<=sum(vals)<=4 or expected==sum(vals))
                        for v,stored in zip(vals,p['trimt'][key]):
                            self.assertTrue(stored=='<5' and 1<=v<=4 or stored==v)
                self.assertEqual(total+meta['sin_ubicacion'],meta['casos'])
                self.assertEqual(sum(meta['nac'].values()),meta['casos'])
    def test_preserved_hashes(self):
        manifest=json.loads((ROOT/'docs/provenance.json').read_text())
        for name,digest in manifest['files'].items():
            self.assertEqual(hashlib.sha256((ROOT/name).read_bytes()).hexdigest(),digest)
if __name__=='__main__':unittest.main()
