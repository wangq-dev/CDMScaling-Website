"""Export notebook-backed explorer data using only the Python standard library.

Usage: python3 scripts/export-explorer-data.py ../CDMScaling
PCA is fitted only on the first 32 text rows. The saved normalized notebook
weights fix S; the four coefficients are recovered by least squares because the
notebook output does not print B0/P0. No notebook code is executed.
"""
import csv
import hashlib
import json
import math
from pathlib import Path
import re
import sys

root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1]) if len(sys.argv) > 1 else root.parent / 'CDMScaling'
notebook_path = source / 'fit_law_across_32_LLM_backbones.ipynb'
notebook = json.loads(notebook_path.read_text())
output = ''.join(''.join(o.get('text', [])) for c in notebook['cells'] for o in c.get('outputs', []))
weights = [float(v) for v in re.findall(r'k\d+\s*=\s*([-\d.]+)', output)]
assert len(weights) == 12

def read(name):
    with (source / 'eval_results' / name).open() as f:
        return list(csv.DictReader(f))

texts = read('text_accuracy.csv')
multimodal = {r['BaseModel'].split('/')[-1]: r for r in read('multimodal_accuracy.csv')}
features = list(texts[0])[1:]
train = [[float(row[k]) for k in features] for row in texts[:32]]
mean = [sum(row[j] for row in train) / len(train) for j in range(len(features))]
x = [[v - mean[j] for j, v in enumerate(row)] for row in train]
n = len(features)
a = [[sum(row[i] * row[j] for row in x) for j in range(n)] for i in range(n)]
v = [[float(i == j) for j in range(n)] for i in range(n)]
# Jacobi eigensolver for the symmetric, mean-centered covariance matrix.
for _ in range(12000):
    p, q = max(((i, j) for i in range(n) for j in range(i + 1, n)), key=lambda ij: abs(a[ij[0]][ij[1]]))
    if abs(a[p][q]) < 1e-13:
        break
    angle = 0.5 * math.atan2(2 * a[p][q], a[q][q] - a[p][p])
    c, s = math.cos(angle), math.sin(angle)
    app, aqq, apq = a[p][p], a[q][q], a[p][q]
    for k in range(n):
        if k not in (p, q):
            akp, akq = a[k][p], a[k][q]
            a[k][p] = a[p][k] = c * akp - s * akq
            a[k][q] = a[q][k] = s * akp + c * akq
        vkp, vkq = v[k][p], v[k][q]
        v[k][p], v[k][q] = c * vkp - s * vkq, s * vkp + c * vkq
    a[p][p] = c*c*app - 2*s*c*apq + s*s*aqq
    a[q][q] = s*s*app + 2*s*c*apq + c*c*aqq
    a[p][q] = a[q][p] = 0
order = sorted(range(n), key=lambda j: a[j][j], reverse=True)
variance = [max(0, a[j][j]) for j in order]
cumulative, needed = 0, 0
for ev in variance:
    cumulative += ev / sum(variance)
    needed += 1
    if cumulative >= .95:
        break
assert needed == len(weights), (needed, len(weights))
components = []
for j in order[:needed]:
    component = [v[i][j] for i in range(n)]
    projected = [sum(z*w for z,w in zip(row,component)) for row in x]
    sign = 1 if projected[max(range(len(projected)), key=lambda i: abs(projected[i]))] >= 0 else -1
    components.append([sign*z for z in component])
norm = math.sqrt(sum(w*w for w in weights))
weights = [w/norm for w in weights]
models = []
for idx, row in enumerate(texts):
    name = row['model_name']
    centered = [float(row[k])-mean[j] for j,k in enumerate(features)]
    pcs = [sum(a*b for a,b in zip(centered, pc)) for pc in components]
    score = sum(w*pc for w,pc in zip(weights,pcs))
    family = next((family for prefix, family in [('Qwen2.5','Qwen2.5'),('Qwen3','Qwen3'),('Falcon','Falcon3'),('Llama','Llama-3.2'),('gemma','Gemma-2'),('deepseek','DeepSeek'),('Mistral','Mistral')] if name.startswith(prefix)), None)
    size = float(re.search(r'(\d+(?:\.\d+)?)[bB](?:-|$)', name).group(1))
    points=[]
    for key,value in multimodal[name].items():
        if not key.startswith('ckpt-') or not value or value == 'Error':
            continue
        step=int(key[5:])
        accuracy=float(value.strip('%')) / (100 if '%' in value else 1)
        if math.isfinite(accuracy): points.append({'step':step,'tokens':step*8192*512/1e9,'accuracy':accuracy})
    models.append({'id':name,'family':family,'size':size,'variant':'Instruct' if idx % 2 == 0 else 'Base','holdout':idx>=32,'s':score,'points':points})

def solve(matrix, rhs):
    a=[list(row)+[b] for row,b in zip(matrix,rhs)]
    for i in range(len(a)):
        p=max(range(i,len(a)),key=lambda r:abs(a[r][i]))
        a[i],a[p]=a[p],a[i]
        pivot=a[i][i]
        assert abs(pivot)>1e-12
        a[i]=[z/pivot for z in a[i]]
        for j in range(len(a)):
            if i!=j:
                t=a[j][i];a[j]=[z-t*w for z,w in zip(a[j],a[i])]
    return [row[-1] for row in a]
rows=[];ys=[]
for model in models[:32]:
    for point in model['points']:
        s=model['s'];ld=math.log(point['tokens'])
        rows.append([s,ld,-s*ld,1]);ys.append(point['accuracy'])
matrix=[[sum(r[i]*r[j] for r in rows) for j in range(4)] for i in range(4)]
rhs=[sum(r[i]*y for r,y in zip(rows,ys)) for i in range(4)]
coeff=solve(matrix,rhs)
A,B0,Bm,P0=coeff
assert A>0 and Bm>0 and min(B0-Bm*m['s'] for m in models[:32])>=0
predict=lambda m,p:A*m['s']+(B0-Bm*m['s'])*math.log(p['tokens'])+P0
mae=lambda ms:sum(abs(predict(m,p)-p['accuracy']) for m in ms for p in m['points'])/sum(len(m['points']) for m in ms)
train_mae=mae(models[:32]);holdout_mae=mae(models[32:])
assert abs(train_mae-.012871)<.00002, train_mae
result={'provenance':{'notebook':notebook_path.name,'notebookSha256':hashlib.sha256(notebook_path.read_bytes()).hexdigest(),'components':needed,'explainedVariance':sum(variance[:needed])/sum(variance),'method':'Frozen notebook PCA direction; constrained least-squares refits of A, B0, Bm, P0.','roundedNotebookWeights':True},'baseline':{'A':A,'B0':B0,'Bm':Bm,'P0':P0,'trainMae':train_mae,'holdoutMae':holdout_mae},'models':models}
(root/'lib/explorer-data.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'models':len(models),'points':sum(len(m['points']) for m in models),'components':needed,'baseline':result['baseline'],'sRange':[min(m['s'] for m in models),max(m['s'] for m in models)]},indent=2))
