# 3D-прототип (лаборатория)

Собранная страница: `lab/proto3d.html` → https://tsenze13.github.io/Simbioz/lab/proto3d.html

Сборка (Three.js r169 вшивается внутрь, страница работает без интернета):
```
git clone --depth 1 --branch r169 --filter=blob:none --sparse https://github.com/mrdoob/three.js three
cd three && git sparse-checkout set build examples/jsm/postprocessing examples/jsm/shaders examples/jsm/utils && cd ..
python3 bundle.py          # → three_bundle.js (THREE и THREE_X: EffectComposer, RenderPass, UnrealBloomPass, OutputPass, mergeGeometries)
python3 -c "s=open('shell.html').read();s=s.replace('/*THREE*/',open('three_bundle.js').read()).replace('/*PROTO*/',open('proto.js').read());open('../proto3d.html','w').write(s)"
```
npm в рабочей среде недоступен, поэтому вместо сборщика — маленький `bundle.py`.
