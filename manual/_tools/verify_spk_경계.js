// 경계값 점검 — node verify_spk_경계.js ../../index.html
const fs=require('fs');const h=fs.readFileSync(process.argv[2]||'../../index.html','utf8');const a=h.indexOf('<script id="spk-engine">')+24;
var window=globalThis;eval(h.slice(a,h.indexOf('</script>',a)));
const seg=(o)=>Object.assign({kind:"oth",flow:800,dia:100,len:0,e90:0,e45:0,teeB:0,teeS:0,gate:0,ball:0,angle:0,check:0},o);
const base={baseType:"H10",installN:0,buildingFloor:1,roofEx:0,actualHead:50,pumpDia:100,pumpEff:60,transType:"1",pipeType:"SCH10",lowHead:0};
const T=[];const ck=(n,c)=>T.push([n,c?'✓':'✗']);
let c=spkCalc({...base,installN:9},[seg({})]);ck('설치개수 9 < 기준 10 → A=9',c.A===9&&c.useInst);
c=spkCalc({...base,installN:10},[seg({})]);ck('설치개수 10 = 기준 → A=10',c.A===10&&!c.useInst);
c=spkCalc({...base,baseType:"T30",installN:35},[seg({})]);ck('설치개수 35 > 기준 30 → A=30',c.A===30);
c=spkCalc({...base,buildingFloor:2,baseType:"P10"},[seg({})]);ck('고층 아파트 10 × 3.2 = 32 m³ · 옥상 10.667',Math.abs(c.D-32)<1e-9&&Math.abs(c.R-32/3)<1e-9);
// J 정수 경계: J=122 → 1.196 MPa(미만) / J=123 → 1.206 MPa(이상)
const fJ=J=>{for(let h=0;h<200;h+=0.01){const r=spkCalc({...base,actualHead:+h.toFixed(2)},[seg({flow:80,dia:200})]);if(r.J===J)return r;}};
let r=fJ(122);ck('J 122 → 1.196 MPa 1.2 미만 · SCH10 적합',!r.hiPress&&r.pipePressOK);
r=fJ(123);ck('J 123 → 1.206 MPa 1.2 이상 · SCH10 부적합',r.hiPress&&!r.pipePressOK);
r=spkCalc({...fJ(123),...base,actualHead:fJ(123).E,pipeType:"SCH40"},[seg({flow:80,dia:200})]);ck('J 123 · SCH40 → 적합',r.pipePressOK);
r=spkCalc({...base,actualHead:fJ(123).E,lowHead:1},[seg({flow:80,dia:200})]);ck('T = (123 − 1) × 0.0098 = 1.196 → 이하',!r.overHead);
r=spkCalc({...base,actualHead:fJ(123).E,lowHead:0},[seg({flow:80,dia:200})]);ck('T = 123 × 0.0098 = 1.206 → 초과',r.overHead);
// 유속: 가지 6 m/s 경계 — 25A(27.6) 215 L/min = 5.99 / 216 = 6.02
const v=q=>spkCalc(base,[seg({kind:"br",flow:q,dia:25})]).sdets[0];
ck('가지 25A 215 L/min '+v(215).vel.toFixed(3)+' m/s ≤ 6',!v(215).velOver);ck('가지 25A 216 L/min '+v(216).vel.toFixed(3)+' m/s > 6',v(216).velOver);
ck('교차·주 25A 216 L/min ≤ 10',!spkCalc(base,[seg({kind:"oth",flow:216,dia:25})]).sdets[0].velOver);
T.forEach(t=>console.log(t[1],t[0]));console.log(T.filter(t=>t[1]==='✓').length+' / '+T.length);
