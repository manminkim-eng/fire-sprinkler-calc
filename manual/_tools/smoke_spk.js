// 스모크: 페이지 로드 · 콘솔 오류 · 탭 3개 렌더 · 엔진 값
const {chromium}=require('playwright');const {setup,server}=require('./serve.js');const path=require('path');
(async()=>{const repo=path.resolve(__dirname,'../..');const srv=await server(repo,8905);
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1400,height:900},serviceWorkers:'block'});await setup(ctx);
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push('PE '+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
await pg.goto('http://127.0.0.1:8905/index.html');await pg.waitForFunction(()=>window.__mmHyd,null,{timeout:30000});
const r={};for(const t of [0,1,2]){await pg.evaluate(t=>window.__mmHyd.setTab(t),t);await pg.waitForTimeout(400);r['tab'+t]=(await pg.evaluate(()=>document.body.innerText.length));}
await pg.evaluate(()=>window.__mmHyd.setShowFormula(true));await pg.waitForTimeout(300);r.modal=await pg.evaluate(()=>!!document.querySelector('.fml-box'));
const st=await pg.evaluate(()=>window.__mmHyd.get());r.C=await pg.evaluate(s=>{const c=window.SPKENG.calc(s.sys,s.segs);return {A:c.A,Clpm:c.Clpm,D:c.D,R:c.R,Dt:c.Dt,F:+c.F.toFixed(3),J:c.J,Pkw:+c.Pkw.toFixed(3),Php:c.Php,S:+c.Pdis.toFixed(3),T:+c.Plow.toFixed(3),vel:c.sdets.map(d=>+d.vel.toFixed(2)+'/'+d.vlim)}},st);
console.log(JSON.stringify(r));console.log('ERR',errs.length,errs.slice(0,5).join(' | '));await b.close();srv.close();})();
