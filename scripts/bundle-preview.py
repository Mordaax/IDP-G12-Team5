import re, base64, glob, os, json, sys
d='dist'
sys.path.insert(0,'.')
routes = re.findall(r"\{ path: ROUTES\.(\w+),\s*figma: '([^']*)',\s*nodeId: '[^']*',\s*built: (true|false)", open('src/data/routes.ts').read())
paths = dict(re.findall(r"(\w+):\s*'(/[^']*)'", open('src/data/routes.ts').read().split('export const SCREENS')[0]))
built = [(paths[k], name) for k, name, b in routes if b == 'true']
css_all = ''
for f in sorted(glob.glob(d+'/_astro/*.css')):
    css_all += open(f).read()
def fontfix(m):
    b=m.group(0); u=re.search(r'url\((/_astro/[^)]+)\)',b)
    if not u: return b
    if re.search(r'/_astro/[a-z-]+?-latin-\d+-normal\.[^)]+\.woff2',u.group(1)):
        data=base64.b64encode(open(d+u.group(1),'rb').read()).decode()
        return re.sub(r'src:[^;}]*',f'src:url(data:font/woff2;base64,{data}) format("woff2")',b)
    return ''
css_all = re.sub(r'@font-face\s*\{.*?\}',fontfix,css_all,flags=re.S)
cache={}
def uri(p):
    if p not in cache:
        ext=p.rsplit('.',1)[1]; mime={'png':'image/png','svg':'image/svg+xml','jpg':'image/jpeg','jpeg':'image/jpeg','webp':'image/webp'}[ext]
        cache[p]=f'data:{mime};base64,'+base64.b64encode(open(d+p,'rb').read()).decode()
    return cache[p]
built_paths = {p for p,_ in built}
templates=[]
for p,name in built:
    html=open(d+p.rstrip('/')+'/index.html').read()
    body=re.search(r'<main class="screen">(.*)</main>',html,re.S).group(1)
    body=re.sub(r'src="(/assets/[^"]+)"',lambda m:f'src="{uri(m.group(1))}"',body)
    def href(m):
        h=m.group(1).rstrip('/') or '/'
        return f'href="#{h}"' if h in built_paths else 'href="#" data-missing="1"'
    body=re.sub(r'href="(/[^"]*)"',href,body)
    templates.append(f'<template data-path="{p}" data-name="{name}">{body}</template>')
first=built[0][0]
nav=''.join(f'<option value="{p}">{n}</option>' for p,n in built)
shell=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>LittleRedMusic — Hi Fi screens</title><style>{css_all}</style><style>
:root{{--gutter:#e9e9ec;--bar:#ffffff;--bar-text:#1b1a19;--bar-line:#d9d9de;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--gutter:#1c1c1f;--bar:#26262a;--bar-text:#ececf1;--bar-line:#3a3a40;color-scheme:dark}}}}
:root[data-theme="dark"]{{--gutter:#1c1c1f;--bar:#26262a;--bar-text:#ececf1;--bar-line:#3a3a40;color-scheme:dark}}
html{{scroll-padding-top:env(safe-area-inset-top,0px)}} html,body{{background:var(--gutter)!important;margin:0}}
.bar{{position:sticky;top:env(safe-area-inset-top,0px);z-index:50;display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:10px 16px;background:var(--bar);color:var(--bar-text);border-bottom:1px solid var(--bar-line);font:13px/1.4 Inter,system-ui,sans-serif}}
.bar select{{font:inherit;padding:6px 8px;border-radius:8px;border:1px solid var(--bar-line);background:var(--bar);color:var(--bar-text);max-width:100%}}
.bar small{{opacity:.7}} .frame-scroll{{overflow-x:auto;max-width:100%}} .screen{{color-scheme:light}}
.toast{{position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:#1b1a19;color:#fff;padding:8px 14px;border-radius:999px;font:12px Inter,system-ui,sans-serif;opacity:0;transition:opacity .2s;pointer-events:none;z-index:60}}
.toast.on{{opacity:1}}</style></head><body>
<div class="bar"><strong>LittleRedMusic · Hi Fi</strong><select id="pick" aria-label="Jump to screen">{nav}</select><small>{len(built)} of {len(routes)} screens built · click through like the prototype</small></div>
<div class="frame-scroll"><main class="screen" id="screen"></main></div><div class="toast" id="toast">That screen isn’t built yet</div>
{''.join(templates)}
<script>
const screen=document.getElementById('screen'),pick=document.getElementById('pick'),toast=document.getElementById('toast');
function show(){{const p=(location.hash.slice(1)||'{first}');const t=document.querySelector('template[data-path="'+p+'"]')||document.querySelector('template');
screen.replaceChildren(t.content.cloneNode(true));pick.value=t.dataset.path;document.title=t.dataset.name+' · LittleRedMusic';window.scrollTo(0,0);}}
addEventListener('hashchange',show);pick.addEventListener('change',()=>location.hash=pick.value);
screen.addEventListener('click',e=>{{const a=e.target.closest('a[data-missing]');if(a){{e.preventDefault();toast.classList.add('on');setTimeout(()=>toast.classList.remove('on'),1600);}}}});
show();
</script></body></html>'''
open('/mnt/user-data/outputs/hifi-preview.html','w').write(shell)
print(len(shell), len(built), [p for p,_ in built])
