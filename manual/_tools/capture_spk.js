// 스프링클러설비 펌프 용량 계산서 매뉴얼 화면 캡처 — usage: node capture_spk.js <repoDir> <outDir>
// 규격: 1440×900 · DSF 1.25 (영상용 좁은 화면: MM_VW=720 MM_VH=1280 MM_DSF=2) · serviceWorkers block · _marks.json · _example.json(앱 엔진 결과)
// 입력은 앱의 캡처용 창구 window.__mmHyd(setSys · setSegs · setProj · setTab · setShowFormula)로 넣고, 결과는 window.SPKENG.calc(엔진)로 읽는다.
const {chromium}=require(process.env.MM_PW||'playwright');const fs=require('fs');const path=require('path');const {setup,server}=require('./serve');
const repo=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);fs.mkdirSync(out,{recursive:true});
const VW=+(process.env.MM_VW||1440),VH=+(process.env.MM_VH||900),DSF=+(process.env.MM_DSF||1.25),PORT=8907;
const Z={e90:0,e45:0,teeB:0,teeS:0,gate:0,ball:0,angle:0,check:0};
const sg=(o)=>Object.assign({},Z,o);
/* 예제 A = 익산 ○○ 업무시설(지하 2층 · 지상 8층) — 표 2.1.1.1 그 밖의 것 · 헤드 부착높이 8 m 미만 10개 · 실양정 38 m · KS D 3507 · 옥상수조 설치 · 최저층 헤드 펌프 기준 +3 m
   예제 B = ○○ 아파트 35층(고층건축물) — NFTC 608 아파트등 10개 · NFTC 604 3.2 m³ · 실양정 112 m · KS D 3562 · 최저층 헤드 펌프와 같은 높이 → 1.2 MPa 상한 초과 · 감압 검토
   예제 C = ○○ 판매시설 지상 2층 — 판매시설 30개 · 설치개수 24개 적용 · 높이 10 m 이하 옥상수조 면제 · 가지배관 25A 240 L/min 유속 초과 */
const EX={"A": {"proj": {"name": "익산시 ○○동 업무시설 신축공사", "designer": "김만민", "date": "2026-10-15"}, "sys": {"baseType": "H10", "installN": 0, "buildingFloor": 1, "roofEx": 0, "actualHead": 38, "pumpDia": 100, "pumpEff": 60, "transType": "1", "pipeType": "SCH10", "lowHead": 3}, "segs": [{"e90": 2, "e45": 0, "teeB": 1, "teeS": 0, "gate": 1, "ball": 0, "angle": 0, "check": 1, "kind": "oth", "flow": 800, "dia": 100, "len": 30}, {"e90": 2, "e45": 0, "teeB": 1, "teeS": 0, "gate": 0, "ball": 0, "angle": 0, "check": 0, "kind": "oth", "flow": 640, "dia": 80, "len": 35}, {"e90": 1, "e45": 0, "teeB": 0, "teeS": 1, "gate": 0, "ball": 0, "angle": 0, "check": 0, "kind": "oth", "flow": 320, "dia": 65, "len": 6}, {"e90": 1, "e45": 0, "teeB": 0, "teeS": 0, "gate": 0, "ball": 0, "angle": 0, "check": 0, "kind": "br", "flow": 160, "dia": 50, "len": 20}]}, "B": {"proj": {"name": "○○ 아파트(35층) 신축공사", "designer": "김만민", "date": "2026-10-15"}, "sys": {"baseType": "P10", "installN": 0, "buildingFloor": 2, "roofEx": 0, "actualHead": 112, "pumpDia": 100, "pumpEff": 60, "transType": "1", "pipeType": "SCH40", "lowHead": 0}, "segs": [{"e90": 3, "e45": 0, "teeB": 1, "teeS": 0, "gate": 2, "ball": 0, "angle": 0, "check": 1, "kind": "oth", "flow": 800, "dia": 100, "len": 40}, {"e90": 2, "e45": 0, "teeB": 0, "teeS": 2, "gate": 0, "ball": 0, "angle": 0, "check": 0, "kind": "oth", "flow": 800, "dia": 100, "len": 115}, {"e90": 2, "e45": 0, "teeB": 1, "teeS": 0, "gate": 0, "ball": 0, "angle": 0, "check": 0, "kind": "oth", "flow": 480, "dia": 65, "len": 12}, {"e90": 2, "e45": 0, "teeB": 0, "teeS": 0, "gate": 0, "ball": 0, "angle": 0, "check": 0, "kind": "br", "flow": 160, "dia": 32, "len": 10}]}, "C": {"proj": {"name": "○○ 판매시설(지상 2층) 신축공사", "designer": "김만민", "date": "2026-10-15"}, "sys": {"baseType": "S30", "installN": 24, "buildingFloor": 1, "roofEx": 1, "actualHead": 12, "pumpDia": 150, "pumpEff": 70, "transType": "1", "pipeType": "SCH10", "lowHead": 0}, "segs": [{"e90": 3, "e45": 0, "teeB": 1, "teeS": 0, "gate": 2, "ball": 0, "angle": 0, "check": 1, "kind": "oth", "flow": 1920, "dia": 150, "len": 40}, {"e90": 2, "e45": 0, "teeB": 1, "teeS": 0, "gate": 0, "ball": 0, "angle": 0, "check": 0, "kind": "oth", "flow": 960, "dia": 100, "len": 30}, {"e90": 1, "e45": 0, "teeB": 0, "teeS": 1, "gate": 0, "ball": 0, "angle": 0, "check": 0, "kind": "oth", "flow": 480, "dia": 65, "len": 15}, {"e90": 1, "e45": 0, "teeB": 0, "teeS": 0, "gate": 0, "ball": 0, "angle": 0, "check": 0, "kind": "br", "flow": 240, "dia": 25, "len": 5}]}};
const FREEZE=`(()=>{const T=new Date(2026,9,15,10,0,0).getTime();const D=Date;class F extends D{constructor(...a){if(a.length)super(...a);else super(T);}static now(){return T;}}window.Date=F;window.alert=()=>{};window.confirm=()=>true;try{localStorage.clear();localStorage.setItem('pwa-dismissed','1');}catch(e){}})()`;
const HIDE='#toast,.toast,#pwa-banner,#pwa-install-bar,#ios-guide-modal,.pwa-banner{display:none!important}';
const HELP=`window.__vis=e=>e&&e.getClientRects().length>0;
window.__box=t=>{const h=[...document.querySelectorAll('.box-header,.box-hd')].find(x=>x.textContent.includes(t)&&__vis(x));return h?h.parentElement:null;};
window.__lab=t=>{const l=[...document.querySelectorAll('label')].find(x=>x.textContent.trim().startsWith(t)&&__vis(x));return l?l.parentElement:null;};
window.__card=t=>{const sp=[...document.querySelectorAll('span')].find(x=>x.textContent.trim().startsWith(t)&&__vis(x));return sp?sp.parentElement.parentElement:null;};
window.__row=t=>{const td=[...document.querySelectorAll('#report-zone td')].find(x=>x.textContent.trim()===t&&__vis(x));return td?td.parentElement:null;};
window.__find=sel=>{if(sel.startsWith('box:'))return __box(sel.slice(4));if(sel.startsWith('lab:'))return __lab(sel.slice(4));if(sel.startsWith('card:'))return __card(sel.slice(5));if(sel.startsWith('row:'))return __row(sel.slice(4));
 if(sel.startsWith('nth:')){const [q,i]=sel.slice(4).split('|');return [...document.querySelectorAll(q)].filter(__vis)[+i]||null;}
 for(const s of sel.split(',')){const e=[...document.querySelectorAll(s)].find(__vis);if(e)return e;}return null;};
window.__EX=${JSON.stringify(EX)};
window.__run=(k,tab)=>{const e=__EX[k];__mmHyd.setShowFormula(false);__mmHyd.setProj(e.proj);__mmHyd.setSys(e.sys);__mmHyd.setSegs(e.segs);__mmHyd.setTab(tab||0);window.scrollTo(0,0);};
window.__ex=k=>{const e=__EX[k];const c=SPKENG.calc(e.sys,e.segs);const r={};['A','B','Clpm','D','R','Dt','roofEx','E','F','G','I','Jraw','J','M','N','K','Pkw','Php','waterVolPer','nInst','useInst','Pdis','hiPress','pipePressOK','hL','Plow','overHead','hStar','velOverN'].forEach(x=>r[x]=c[x]);r.btype=c.btype;
 r.seg=c.sdets.map(d=>({fric:d.fric,fl:d.fl,hl:d.hl,vel:d.vel,vlim:d.vlim,velOver:d.velOver}));return {in:e,R:r};};`;
const SHOTS=[
 {id:'s01_overview',pre:"__run('A',0)",clip:'viewport',m:[['.tab-bar-wrap','작업 탭 · 매뉴얼'],['.sum-bar','요약 바'],['box:Ⅰ-0','프로젝트 정보'],['box:Ⅰ-1','시스템 파라미터'],['.formula-fab','계산식 안내']]},
 {id:'s02_header',clip:'nth:.no-print|0',m:[['nth:.tab-bar-wrap button|0','① 데이터 입력'],['nth:.tab-bar-wrap button|1','② 계산 결과'],['nth:.tab-bar-wrap button|2','③ 계산서 출력'],['.tb-manual','📘 매뉴얼'],['.hdr-right','근거 · 공고 · 시행일']]},
 {id:'s03_project',clip:'box:Ⅰ-0',m:[['lab:공사명','공사명'],['lab:설계자','설계자'],['lab:작성일','작성일']]},
 {id:'s04_params',clip:'box:Ⅰ-1',m:[['lab:건축물 규모','고층건축물 여부 — 1.6 · 3.2 · 4.8 m³'],['lab:A. 기준개수','A. 기준개수 — 표 2.1.1.1 · 아파트등'],['lab:A-1. 설치개수','설치개수 — 적으면 설치개수'],['lab:옥상수조','옥상수조 1/3 · 단서 면제'],['lab:F. 실양정','실양정'],['lab:F-1. 최저층','최저층 헤드 높이 — 1.2 MPa 판정'],['lab:K. 펌프 토출구경','펌프 구경'],['lab:K-1. 펌프 효율','펌프 효율'],['lab:L. 동력 전달방식','전달방식'],['lab:배관 종류','배관 종류(C값)']]},
 {id:'s05_segments',clip:'box:Ⅰ-2',crop:1100,m:[['nth:.seg-kind|0','구분 — 가지 / 교차·주'],['nth:#root table tbody tr|0','1구간 — 펌프 토출 100A'],['nth:#root table tbody tr|3','4구간 — 가지배관 50A'],['nth:button|__ADD__','＋ 구간 추가']]},
 {id:'s06_source',pre:"__mmHyd.setTab(1)",wait:800,clip:'box:Ⅱ-1',m:[['card:A. 기준개수','A. 기준개수 10개'],['card:B. 헤드','B. 80 L/min 이상'],['card:C. 펌프 토출량','C. 펌프 토출량'],['card:D. 수원 용량','D. 유효수량 10 × 1.6 m³'],['card:R. 옥상수조','R. 옥상수조 1/3'],['card:총 저수량','총 저수량 D + R']]},
 {id:'s07_head',clip:'box:Ⅱ-2',m:[['card:E. 실양정','h₁ 실양정'],['card:F. 배관 마찰손실','h₂ 배관 마찰손실'],['card:G. 헤드','h₃ 헤드 10 m'],['card:I. 안전율','안전율 10 %'],['nth:.g-2 > div|1','소계 · 안전율 · 전양정'],['card:S. 토출압력','S 토출압력 — 배관 사용압력'],['card:T. 최저층','T 최저층 헤드 방수압']]},
 {id:'s08_power',clip:'box:Ⅱ-3',m:[['card:M. 토출량','Q 토출량'],['card:J. 전양정','H 전양정'],['card:O. 전달계수','K 전달계수'],['card:N. 펌프 효율','η 펌프 효율'],['card:P. 이론 출력','P 이론 출력'],['card:Q. 선정 출력','표준 HP']]},
 {id:'s09_b_source',pre:"__run('B',1)",wait:900,clip:'box:Ⅱ-1',m:[['card:A. 기준개수','아파트등 10개(NFTC 608)'],['card:D. 수원 용량','고층 10 × 3.2 m³'],['card:R. 옥상수조','옥상수조 1/3']]},
 {id:'s10_b_head',clip:'box:Ⅱ-2',m:[['nth:.g-2 > div|1','전양정'],['card:S. 토출압력','1.2 MPa 이상 — KS D 3562'],['card:T. 최저층','1.2 MPa 초과'],['.mm-prv-note','감압 검토 높이']]},
 {id:'s11_c_seg',pre:"__run('C',0)",wait:900,clip:'box:Ⅰ-2',crop:1100,m:[['nth:#root table tbody tr|3','가지 25A — 유속 초과'],['nth:#root table tbody tr|0','1구간 150A']]},
 {id:'s11b_c_source',pre:"__mmHyd.setTab(1)",wait:900,clip:'box:Ⅱ-1',m:[['card:A. 기준개수','설치개수 24개 적용'],['card:R. 옥상수조','옥상수조 면제'],['card:총 저수량','총 저수량']]},
 {id:'s12_formula',pre:"__run('A',0);setTimeout(()=>__mmHyd.setShowFormula(true),50)",wait:900,fixed:true,clip:'.fml-box',m:[]},
 {id:'s13_formula_src',pre:"[...document.querySelectorAll('.fml-itab')][1].click()",wait:500,fixed:true,clip:'.fml-box',m:[]},
 {id:'s14_formula_head',pre:"[...document.querySelectorAll('.fml-itab')][2].click()",wait:500,fixed:true,clip:'.fml-box',post:"__mmHyd.setShowFormula(false)",m:[]},
 {id:'s15_a4',pre:"__run('A',2)",wait:1500,clip:'viewport',m:[['#btn-jpg','JPG 저장'],['.mm-btn-pdf','인쇄 · PDF'],['#report-zone','A4 계산서']]},
 {id:'s16_a4page',clip:'#report-zone',crop:2600,m:[['row:A','Ⅱ-1 수원 — A ~ D+R'],['row:E','Ⅱ-2 양정 — E ~ I'],['row:S','S · T 압력 판정'],['row:J','Ⅱ-3 동력 — J ~ P']]},
];

(async()=>{
 const s=await server(repo,PORT);const b=await chromium.launch({args:['--lang=ko-KR'],env:{...process.env,LANG:'ko_KR.UTF-8',LANGUAGE:'ko',LC_ALL:'ko_KR.UTF-8'}});
 const ctx=await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:DSF,serviceWorkers:'block',locale:'ko-KR'});await setup(ctx);
 const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript(FREEZE);
 await pg.goto(`http://127.0.0.1:${PORT}/index.html`);await pg.waitForFunction(()=>window.__mmHyd&&window.SPKENG,null,{timeout:20000});await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(1500);
 await pg.addStyleTag({content:HIDE});await pg.evaluate(HELP);
 const addIdx=await pg.evaluate(()=>[...document.querySelectorAll('button')].filter(__vis).findIndex(x=>x.textContent.includes('구간 추가')));
 SHOTS.forEach(S=>S.m.forEach(m=>{m[0]=m[0].replace('__ADD__',addIdx);}));
 const ex={};const meta={};
 for(const S of SHOTS){
  if(S.pre){try{await pg.evaluate(S.pre);}catch(e){errs.push(S.id+' pre '+e.message);}}
  await pg.waitForTimeout(S.wait||700);
  if(S.clip!=='viewport'&&!S.fixed){await pg.evaluate(c=>{const e=__find(c);if(e){window.scrollTo(0,e.getBoundingClientRect().top+scrollY-40);}},S.clip);await pg.waitForTimeout(500);}
  if(S.id==='s01_overview')ex.A=await pg.evaluate("__ex('A')");
  if(S.id==='s09_b_source')ex.B=await pg.evaluate("__ex('B')");
  if(S.id==='s11_c_seg')ex.C=await pg.evaluate("__ex('C')");
  if(S.id==='s16_a4page')ex.A_a4=await pg.evaluate(()=>document.getElementById('report-zone').innerText.replace(/\s+/g,' '));
  if(S.id==='s06_source')ex.A_ui=await pg.evaluate(()=>document.querySelector('.sum-bar').innerText.replace(/\s+/g,' '));
  const info=await pg.evaluate(({S,VW,VH})=>{
   const abs=e=>{const r=e.getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height};};
   let clip;
   if(S.clip==='viewport'){clip={x:0,y:scrollY,width:VW,height:VH};}
   else{const el=__find(S.clip);if(!el)return {err:'clip '+S.clip};const a=abs(el);clip={x:a.x,y:a.y,width:a.w,height:a.h};
     const P=12;clip={x:Math.max(0,clip.x-P),y:Math.max(0,clip.y-P),width:clip.width+2*P,height:clip.height+2*P};
     if(S.crop&&clip.height>S.crop)clip.height=S.crop;}
   const marks=[];(S.m||[]).forEach(([sel,label],i)=>{const e=__find(sel);if(!e){marks.push({n:i+1,label,miss:sel});return;}const a=abs(e);
     marks.push({n:i+1,label,x:+((a.x-clip.x)/clip.width*100).toFixed(2),y:+((a.y-clip.y)/clip.height*100).toFixed(2),w:+(Math.min(a.w,clip.x+clip.width-a.x)/clip.width*100).toFixed(2),h:+(Math.min(a.h,clip.y+clip.height-a.y)/clip.height*100).toFixed(2)});});
   return {clip,marks};},{S,VW,VH});
  if(info.err){errs.push(S.id+' '+info.err);continue;}
  const c=info.clip;const cl={x:Math.max(0,c.x),y:Math.max(0,c.y),width:Math.min(c.width,VW-Math.max(0,c.x)),height:c.height};
  if(S.clip==='viewport'){await pg.screenshot({path:path.join(out,S.id+'.png'),clip:{x:0,y:0,width:VW,height:VH}});}
  else if(S.fixed){const sx=await pg.evaluate(()=>scrollX),sy=await pg.evaluate(()=>scrollY);await pg.screenshot({path:path.join(out,S.id+'.png'),clip:{x:Math.max(0,c.x-sx),y:Math.max(0,c.y-sy),width:Math.min(c.width,VW),height:Math.min(c.height,VH-Math.max(0,c.y-sy))}});}
  else{try{await pg.screenshot({path:path.join(out,S.id+'.png'),clip:cl,fullPage:true});}catch(e){errs.push(S.id+' shot '+JSON.stringify(cl));continue;}}
  meta[S.id]={w:Math.round(cl.width),h:Math.round(Math.min(cl.height,S.fixed?VH:1e9)),marks:info.marks};
  if(S.post){try{await pg.evaluate(S.post);}catch(e){errs.push(S.id+' post '+e.message);}await pg.waitForTimeout(400);}
 }
 const mctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block',isMobile:true,hasTouch:true,locale:'ko-KR'});await setup(mctx);
 const mp=await mctx.newPage();await mp.addInitScript(FREEZE);
 await mp.goto(`http://127.0.0.1:${PORT}/index.html`);await mp.waitForFunction(()=>window.__mmHyd,null,{timeout:20000});await mp.waitForTimeout(1500);
 await mp.addStyleTag({content:HIDE});await mp.evaluate(HELP);await mp.evaluate("__run('A',0)");await mp.waitForTimeout(800);
 await mp.evaluate(()=>{const e=__box('Ⅰ-1');window.scrollTo(0,e.getBoundingClientRect().top+scrollY-12);});await mp.waitForTimeout(600);
 await mp.screenshot({path:path.join(out,'s17_mobile_main.png')});meta['s17_mobile_main']={w:390,h:844,marks:[]};
 await mp.evaluate(()=>{__mmHyd.setTab(1);window.scrollTo(0,0);});await mp.waitForTimeout(900);
 await mp.screenshot({path:path.join(out,'s18_mobile_result.png')});meta['s18_mobile_result']={w:390,h:844,marks:[]};
 await mp.evaluate(()=>{__mmHyd.setTab(2);window.scrollTo(0,0);});await mp.waitForTimeout(1500);
 await mp.screenshot({path:path.join(out,'s19_mobile_a4.png')});meta['s19_mobile_a4']={w:390,h:844,marks:[]};
 ex.mobile=await mp.evaluate(()=>({page:document.documentElement.scrollWidth,vw:innerWidth}));
 fs.writeFileSync(path.join(out,'_marks.json'),JSON.stringify(meta,null,1));fs.writeFileSync(path.join(out,'_example.json'),JSON.stringify(ex,null,1));
 const miss=[];Object.entries(meta).forEach(([k,v])=>v.marks.forEach(m=>{if(m.miss)miss.push(k+':'+m.miss);else if(m.x<0||m.y<0||m.x+m.w>100.5||m.y+m.h>100.5||m.w<=0||m.h<=0)miss.push(k+':OUT '+m.label+' '+m.x+','+m.y+','+m.w+','+m.h);}));
 const sh=o=>o&&{A:o.R.A,Q:o.R.Clpm,D:o.R.D,R:o.R.R,Dt:o.R.Dt,F:o.R.F,J:o.R.J,P:o.R.Pkw,HP:o.R.Php,S:o.R.Pdis,T:o.R.Plow,over:o.R.overHead,hs:o.R.hStar,vo:o.R.velOverN};
 console.log(JSON.stringify({A:sh(ex.A),B:sh(ex.B),C:sh(ex.C),mobile:ex.mobile,sizes:Object.fromEntries(Object.entries(meta).map(([k,v])=>[k,v.w+'x'+v.h])),miss,errs:errs.slice(0,15)},null,1));
 await b.close();s.close();
})();
