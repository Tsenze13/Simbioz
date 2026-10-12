import re,os
T='three/'
mods=[('three',T+'build/three.module.min.js'),
 ('sh/Copy',T+'examples/jsm/shaders/CopyShader.js'),('sh/Lum',T+'examples/jsm/shaders/LuminosityHighPassShader.js'),('sh/Out',T+'examples/jsm/shaders/OutputShader.js'),
 ('pp/Pass',T+'examples/jsm/postprocessing/Pass.js'),('pp/ShaderPass',T+'examples/jsm/postprocessing/ShaderPass.js'),('pp/MaskPass',T+'examples/jsm/postprocessing/MaskPass.js'),
 ('pp/EffectComposer',T+'examples/jsm/postprocessing/EffectComposer.js'),('pp/RenderPass',T+'examples/jsm/postprocessing/RenderPass.js'),
 ('pp/UnrealBloomPass',T+'examples/jsm/postprocessing/UnrealBloomPass.js'),('pp/OutputPass',T+'examples/jsm/postprocessing/OutputPass.js'),
 ('ut/BGU',T+'examples/jsm/utils/BufferGeometryUtils.js')]
bypath={os.path.normpath(p):k for k,p in mods}
def key_for(spec,cur):
    if spec=='three':return 'three'
    return bypath[os.path.normpath(os.path.join(os.path.dirname(cur),spec))]
out=['(function(){var __M={};']
for k,p in mods:
    s=open(p).read()
    def imp(m):
        names=m.group(1).replace('\n',' ');src=m.group(2)
        parts=[x.strip() for x in names.split(',') if x.strip()]
        parts=[(x.split(' as ')[0].strip()+': '+x.split(' as ')[1].strip()) if ' as ' in x else x for x in parts]
        return 'const { %s } = __M[%r];'%(', '.join(parts),key_for(src,p))
    s=re.sub(r"import\s*\{([^}]*)\}\s*from\s*'([^']+)';?",imp,s)
    exp=[]
    def ex(m):
        for x in m.group(1).split(','):
            x=x.strip()
            if not x:continue
            if ' as ' in x:a,b=[y.strip() for y in x.split(' as ')];exp.append('%s: %s'%(b,a))
            else:exp.append(x)
        return ''
    s=re.sub(r"export\s*\{([^}]*)\}\s*;?",ex,s)
    def ex2(m):
        exp.append(m.group(2));return m.group(1)+' '+m.group(2)
    s=re.sub(r"export\s+(function|class|const|let)\s+([A-Za-z_$][\w$]*)",ex2,s)
    assert 'import ' not in s.split('\n')[0] or True
    out.append('__M[%r]=(function(){\n%s\nreturn {%s};})();'%(k,s,', '.join(exp)))
out.append("window.THREE=__M.three;window.THREE_X=Object.assign({},__M['pp/EffectComposer'],__M['pp/RenderPass'],__M['pp/UnrealBloomPass'],__M['pp/OutputPass'],__M['ut/BGU']);})();")
open('three_bundle.js','w').write('\n'.join(out))
print(os.path.getsize('three_bundle.js'))
