// Generated from data.js, engine.js, sync.js, room.js and app.js. Run node build.mjs after source edits.
'use strict';
const METRICS = ['revenue','labor','material','energy','import_tax','export_cost','interest','fixed','tax','investment'];
const METRIC_LABELS = {revenue:'營業收入',labor:'人力成本',material:'原物料／商品',energy:'能源／運輸',import_tax:'進口關稅',export_cost:'出口貿易',interest:'利息收支',fixed:'固定營運',tax:'稅金',investment:'投資損益',asset_value:'投資資產價值'};
const ROLES = [
  ['auto','汽車製造商','製造業',[1000,-200,-250,-100,0,-80,-20,-100,-50,0],150,'🚘'],
  ['electronics','電子製造商','製造業',[1200,-250,-300,-100,-60,-70,-30,-120,-70,30],140,'💻'],
  ['retail','百貨零售商','消費業',[900,-180,-400,-40,-60,0,-20,-120,-30,0],150,'🛍️'],
  ['bank','銀行','金融業',[250,-140,0,-10,0,0,450,-100,-70,40],70,'🏦'],
  ['investment','投資公司','金融業',[180,-100,0,-5,0,0,-30,-45,-60,500],30,'📈'],
  ['energy','能源公司','能源與運輸',[1100,-130,-350,-120,-20,-40,-70,-140,-70,0],85,'⚡'],
  ['logistics','物流運輸公司','能源與運輸',[850,-220,-30,-250,-10,-20,-30,-100,-25,0],110,'🚚'],
  ['property','房地產公司','民生業',[800,-80,-60,-40,0,0,-150,-170,-50,80],55,'🏙️'],
  ['agriculture','農業食品公司','民生業',[800,-180,-260,-120,-20,-20,-20,-90,-25,0],100,'🌾'],
  ['technology','科技服務公司','科技業',[900,-350,0,-40,0,-10,-20,-120,-65,20],60,'🧪']
].map(([id,name,sector,values,headcount,icon])=>({id,name,sector,base:Object.fromEntries(METRICS.map((m,i)=>[m,values[i]])),baseHeadcount:headcount,icon}));

const ALL='all';
const fx=(metric,pct,target=ALL)=>({metric,pct,target});
const GLOBAL_EVENTS = [
  {id:'E01',name:'海灣戰爭爆發',duration:5,decay:[1,.75,.5,.25,.125],effects:[fx('material',20),fx('energy',40),fx('export_cost',15),fx('revenue',25,'energy')]},
  {id:'E02',name:'全球金融海嘯',duration:6,decay:[1,.8,.6,.4,.2,.1],effects:[fx('revenue',-25),fx('asset_value',-35),fx('interest',15,'interest_negative'),fx('interest',-10,'bank')]},
  {id:'E03',name:'全球供應鏈中斷',duration:4,decay:[1,.7,.4,.1],effects:[fx('material',25),fx('energy',20),fx('revenue',-15,'electronics'),fx('revenue',-10,'agriculture')]},
  {id:'E04',name:'全球貿易戰',duration:6,decay:[1,.8,.6,.4,.2,.1],effects:[fx('import_tax',50),fx('export_cost',40),fx('material',15),fx('revenue',-10,'auto,electronics')]},
  {id:'E05',name:'AI 技術革命',duration:6,decay:[1,.8,.6,.4,.2,.1],effects:[fx('revenue',40,'technology'),fx('revenue',25,'electronics'),fx('labor',20,'technology'),fx('labor',-10,'except_technology')]},
  {id:'E06',name:'全球能源危機',duration:4,decay:[1,.7,.4,.1],effects:[fx('energy',60),fx('material',10),fx('revenue',40,'energy'),fx('revenue',-10,'logistics')]},
  {id:'E07',name:'全球疫情爆發',duration:6,decay:[1,.8,.6,.4,.2,.1],effects:[fx('revenue',-35,'retail'),fx('revenue',20,'logistics'),fx('revenue',25,'technology'),fx('labor',10),fx('energy',15)]},
  {id:'E08',name:'政府擴大基礎建設',duration:5,decay:[1,.75,.5,.25,.125],effects:[fx('revenue',25,'property'),fx('revenue',15,'auto,electronics'),fx('material',20),fx('revenue',20,'logistics')]},
  {id:'E09',name:'全球消費熱潮',duration:3,decay:[1,.5,.25],effects:[fx('revenue',35,'retail'),fx('revenue',25,'auto'),fx('revenue',20,'electronics'),fx('material',15),fx('revenue',15,'logistics')]},
  {id:'E10',name:'全球經濟衰退',duration:6,decay:[1,.8,.6,.4,.2,.1],effects:[fx('revenue',-20),fx('material',-20),fx('energy',-15),fx('asset_value',-20)]}
];
const PERSONAL_EVENTS = [
  {id:'P01',name:'關鍵客戶續約',duration:3,decay:[1,.65,.3],effects:[fx('revenue',25)]},
  {id:'P02',name:'設備故障維修',duration:2,decay:[1,.5],effects:[fx('fixed',35),fx('energy',15)]},
  {id:'P03',name:'管理效率提升',duration:3,decay:[1,.6,.3],effects:[fx('fixed',-25),fx('labor',-10)]},
  {id:'P04',name:'稅務補繳',duration:2,decay:[1,.5],effects:[fx('tax',40)]},
  {id:'P05',name:'市場行銷奏效',duration:3,decay:[1,.7,.4],effects:[fx('revenue',20),fx('fixed',10)]},
  {id:'P06',name:'投資判斷失準',duration:3,decay:[1,.6,.2],effects:[fx('investment',-30),fx('asset_value',-15)]}
];
const SECTOR_EVENTS = [
  {id:'S01',name:'製造業接單潮',sector:'製造業',duration:3,decay:[1,.65,.3],effects:[fx('revenue',20),fx('material',10)]},
  {id:'S02',name:'消費市場轉弱',sector:'消費業',duration:3,decay:[1,.6,.3],effects:[fx('revenue',-22)]},
  {id:'S03',name:'金融信用擴張',sector:'金融業',duration:3,decay:[1,.65,.3],effects:[fx('interest',20),fx('asset_value',12)]},
  {id:'S04',name:'運輸燃料補貼',sector:'能源與運輸',duration:3,decay:[1,.6,.3],effects:[fx('energy',-25)]},
  {id:'S05',name:'民生供應吃緊',sector:'民生業',duration:3,decay:[1,.6,.3],effects:[fx('material',30),fx('revenue',10)]},
  {id:'S06',name:'科技採購熱潮',sector:'科技業',duration:3,decay:[1,.65,.3],effects:[fx('revenue',30),fx('labor',15)]}
];
const ALL_EVENTS=[...GLOBAL_EVENTS,...PERSONAL_EVENTS,...SECTOR_EVENTS];
const FED_RULES=[
  {id:'F01',name:'惡性通膨',fields:['inflationPct'],formula:'π(t) ≥ 8%'},
  {id:'F02',name:'持續性通膨',fields:['inflationPct','previousInflationPct'],formula:'π(t) ≥ 4% 且 π(t−1) ≥ 4%'},
  {id:'F03',name:'停滯性通膨',fields:['inflationPct','growthPct'],formula:'π(t) ≥ 6% 且 g(t) ≤ −5%'},
  {id:'F04',name:'經濟嚴重衰退',fields:['growthPct','previousGrowthPct'],formula:'g(t) ≤ −10% 且 g(t−1) ≤ −10%'},
  {id:'F05',name:'失業率過高',fields:['unemploymentPct','previousUnemploymentPct'],formula:'u(t) ≥ 10% 且 u(t−1) ≥ 10%'},
  {id:'F06',name:'通貨緊縮',fields:['inflationPct','previousInflationPct'],formula:'π(t) ≤ −2% 且 π(t−1) ≤ −2%'},
  {id:'F07',name:'金融市場崩盤',fields:['stockReturn1Pct','growthPct'],formula:'股市單季 ≤ −25%；景氣 < 0% 才啟動 QE'},
  {id:'F08',name:'銀行流動性危機',fields:['liquidityPct','liquidAssets','shortTermLiabilities'],formula:'流動性 < 10%'},
  {id:'F09',name:'銀行系統性壞帳',fields:['nplPct','nonperformingLoans','totalLoans'],formula:'壞帳率 ≥ 8%'},
  {id:'F10',name:'資產泡沫過熱',fields:['stockReturn3Pct','loanGrowth3Pct','fedRatePct'],formula:'股市三季 ≥ 30% 且放款三季 ≥ 20%'}
];
const FED_PRIORITY=['F08','F09','F07','F03','F01','F06','F04','F02','F05','F10'];
const BOARD = Array.from({length:24},(_,i)=> i===0?{type:'start',label:'出發'}:{type:['global','personal','sector'][(i-1)%3],label:{global:'全球事件',personal:'個人事件',sector:'產業事件'}[['global','personal','sector'][(i-1)%3]]});



const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const round2=n=>Math.round((n+Number.EPSILON)*100)/100;
const div=(a,b)=>b===0||b==null?null:a/b;
const pct=(a,b)=>{const x=div(a,b);return x===null?null:100*(x-1)};
const roleById=id=>ROLES.find(r=>r.id===id);
const eventById=id=>ALL_EVENTS.find(e=>e.id===id);
const nextRandom=state=>{let x=state.rng|0;x^=x<<13;x^=x>>>17;x^=x<<5;state.rng=x|0;return (x>>>0)/4294967296};
const ghostSeed=seed=>((Number(seed)|0)^0x6d2b79f5)||1;
const nextGhostRandom=state=>{let x=state.ghostRng|0;x^=x<<13;x^=x>>>17;x^=x<<5;state.ghostRng=x|0;return (x>>>0)/4294967296};
function ensureGhostState(state){
  if(!Number.isInteger(state.ghostRng)||state.ghostRng===0)state.ghostRng=ghostSeed(state.seed);
  if(!Number.isInteger(state.ghostPosition)||state.ghostPosition<0||state.ghostPosition>=BOARD.length)state.ghostPosition=1+Math.floor(nextGhostRandom(state)*(BOARD.length-1));
  if(!Array.isArray(state.ghostTrail))state.ghostTrail=[];
  if(!Array.isArray(state.struckPlayerIds))state.struckPlayerIds=[];
}
function moveGhost(state){
  const steps=1+Math.floor(nextGhostRandom(state)*3),direction=nextGhostRandom(state)<.5?-1:1;
  const from=state.ghostPosition;
  state.ghostTrail=[from,...Array.from({length:steps},(_,i)=>(from+direction*(i+1)+BOARD.length)%BOARD.length)];
  state.ghostPosition=state.ghostTrail.at(-1);
}
const pick=(state,items)=>items[Math.floor(nextRandom(state)*items.length)];
const hasTarget=(effect,role)=>effect.target==='all'||effect.target==='interest_negative'&&role.base.interest<0||effect.target==='except_technology'&&role.id!=='technology'||effect.target.split(',').includes(role.id);
const eventAffects=(active,role,state)=>active.scope==='global'||active.scope==='sector'&&active.sector===role.sector||active.scope==='personal'&&state.players.some(p=>p.id===active.ownerId&&p.roleId===role.id);

function eventRemaining(active,round){const e=eventById(active.eventId);return e?Math.max(0,e.duration-(round-active.startedRound)):0}
function effectBreakdown(state,roleId,metric,round=state.round){
  const role=roleById(roleId);
  if(!role)return [];
  return state.activeEvents.flatMap(a=>{
    const e=eventById(a.eventId),age=round-a.startedRound;
    if(!e||age<0||age>=e.duration||!eventAffects(a,role,state))return [];
    return e.effects.filter(f=>f.metric===metric&&hasTarget(f,role)).map(f=>({eventId:e.id,name:e.name,pct:f.pct*e.decay[age],remaining:e.duration-age,scope:a.scope,instanceId:a.instanceId}));
  });
}
function metricPct(state,roleId,metric,round=state.round){return clamp(effectBreakdown(state,roleId,metric,round).reduce((n,x)=>n+x.pct,0),-60,100)}
function assetValue(state,roleId,round=state.round){const c=state.companies[roleId];return round2(c.assetReferenceValue*(1+metricPct(state,roleId,'asset_value',round)/100))}
function financials(state,roleId,round=state.round){
  const role=roleById(roleId),c=state.companies[roleId],flows={};
  const d=state.fedRatePercent-4;
  const program=state.monetaryProgram&&round>=state.monetaryProgram.startRound&&round<state.monetaryProgram.startRound+2?state.monetaryProgram.type:null;
  for(const m of METRICS){
    const base=role.base[m];
    if(!base){flows[m]=0;continue}
    let extra=0;
    if(m==='interest')extra=(base<0?40:roleId==='bank'?30:0)*d+(base<0?(program==='QE'?-10:program==='QT'?10:0):0);
    const headFactor=m==='labor'?c.headcount/role.baseHeadcount:1;
    flows[m]=round2(Math.sign(base)*Math.abs(base)*headFactor*Math.max(0,1+clamp(metricPct(state,roleId,m,round)+extra,-60,100)/100));
  }
  const ownerId=state.players.find(p=>p.roleId===roleId)?.id;
  if(round===state.round&&state.struckPlayerIds?.includes(ownerId))for(const m of METRICS)if(flows[m]>0)flows[m]=0;
  const revenue=flows.revenue,costs=Object.entries(flows).filter(([m,v])=>m!=='revenue'&&v<0).reduce((s,[,v])=>s+v,0),otherIncome=Object.entries(flows).filter(([m,v])=>m!=='revenue'&&v>0).reduce((s,[,v])=>s+v,0);
  return {flows,revenue,costs:round2(costs),otherIncome:round2(otherIncome),profit:round2(Object.values(flows).reduce((s,v)=>s+v,0)),assetValue:assetValue(state,roleId,round)};
}
function companyPosition(state,roleId){const c=state.companies[roleId];return {cash:c.cash,assetValue:assetValue(state,roleId),debt:c.debt,netWorth:c.cash+assetValue(state,roleId)-c.debt}}

function createGame({players,seed=Date.now(),targetWealth=5500,maxRounds=12}){
  if(!Array.isArray(players)||players.length<2||players.length>8)throw Error('請選擇 2 至 8 位玩家。');
  if(new Set(players.map(p=>p.roleId)).size!==players.length||players.some(p=>!roleById(p.roleId)))throw Error('每位玩家需要不同的企業角色。');
  const names=players.map(p=>String(p.name||'').trim());
  if(names.some(n=>!n)||new Set(names).size!==names.length)throw Error('玩家名稱不得空白或重複。');
  const n=Number(seed),goal=Number(targetWealth),limit=Number(maxRounds);
  if(!Number.isInteger(n)||!Number.isFinite(goal)||goal<2000||!Number.isInteger(limit)||limit<2||limit>50)throw Error('種子、目標或回合上限無效。');
  const state={version:1,round:1,turnIndex:0,phase:'roll',rng:n|0||1,seed:n,players:players.map((p,i)=>({id:`player-${i+1}`,name:names[i],roleId:p.roleId,position:0,color:i})),companies:Object.fromEntries(ROLES.map(r=>[r.id,{cash:1200,assetReferenceValue:800,headcount:r.baseHeadcount,debt:0}])),activeEvents:[],eventSerial:0,bank:{liquidAssets:300,shortTermLiabilities:1000,totalLoans:1000,nonperformingLoans:40,rescues:[],riskRestrictionUntil:0},initialStockIndex:100,initialTotalLoans:1000,fedRatePercent:4,lastRateDecisionRound:null,monetaryProgram:null,economicHistory:[],evaluations:[],decisions:[],log:[],dice:null,reels:null,lastDraw:null,targetWealth:goal,maxRounds:limit,status:'playing',winnerIds:[]};
  ensureGhostState(state);
  return state;
}

function drawForTile(state,tile,ownerId){
  let event,scope=tile.type,sector=null;
  if(scope==='global')event=pick(state,GLOBAL_EVENTS);
  else if(scope==='personal')event=pick(state,PERSONAL_EVENTS);
  else if(scope==='sector'){
    const sectors=['製造業','消費業','金融業','能源與運輸','民生業','科技業'];
    const index=Math.floor((BOARD.indexOf(tile)-3)/3);
    sector=sectors[((index%sectors.length)+sectors.length)%sectors.length];
    event=SECTOR_EVENTS.find(e=>e.sector===sector);
  } else return null;
  const active={instanceId:++state.eventSerial,eventId:event.id,scope,sector,ownerId:scope==='personal'?ownerId:null,startedRound:state.round};
  state.activeEvents.push(active);
  state.lastDraw=active;
  state.log.unshift(`第 ${state.round} 季｜${state.players.find(p=>p.id===ownerId)?.name||'玩家'}抽到「${event.name}」${scope==='global'?'，影響所有適用企業':scope==='sector'?`，影響${sector}`:'，只影響自己'}。`);
  return active;
}
function movementPath(from,steps,length=BOARD.length){
  if(!Number.isInteger(from)||!Number.isInteger(steps)||!Number.isInteger(length)||from<0||from>=length||steps<0||steps>length||length<2)throw Error('棋盤移動參數無效。');
  return Array.from({length:steps},(_,i)=>(from+i+1)%length);
}
function rollDice(state,forced){
  if(state.status!=='playing'||state.phase!=='roll')throw Error('現在無法啟動拉霸。');
  const player=state.players[state.turnIndex];
  const reels=forced??Array.from({length:2},()=>Math.floor(nextRandom(state)*7));
  if(!Array.isArray(reels)||reels.length!==2||reels.some(n=>!Number.isInteger(n)||n<0||n>6))throw Error('拉霸須有兩個 0–6 的數字。');
  const dice=reels.reduce((sum,n)=>sum+n,0),old=player.position,fullPath=movementPath(old,dice);
  const ghostStep=fullPath.indexOf(state.ghostPosition),struck=ghostStep!==-1;
  const path=struck?fullPath.slice(0,ghostStep+1):fullPath;
  player.position=path.at(-1)??old;
  state.lastDraw=null;
  state.log.unshift(`${player.name}拉出 ${reels.join(' + ')} = ${dice}，${dice===0?'停留原地':struck?`原預計前進 ${dice} 格，遇罷工實際前進 ${path.length} 格`:`前進 ${dice} 格`}。`);
  if(struck){state.struckPlayerIds.push(player.id);state.log.unshift(`${player.name}走到第 ${player.position} 格撞上罷工幽靈！剩餘步數作廢，本季收入歸零、支出照付，失去這次經營與抽卡機會。`)}
  if(old+dice>=BOARD.length&&!struck){state.companies[player.roleId].cash+=250;state.log.unshift(`${player.name}經過起點，獲得 250 遊戲幣。`)}
  state.dice=dice;state.reels=[...reels];
  const tile=BOARD[player.position];
  state.phase=struck?'strike':dice>0&&tile.type!=='start'?'draw':'manage';
  return {dice,reels:[...reels],tile,path,from:old,struck};
}
function drawEvent(state){
  if(state.status!=='playing'||state.phase!=='draw')throw Error('現在不需要抽卡。');
  const player=state.players[state.turnIndex],tile=BOARD[player.position];
  if(!state.dice||tile.type==='start')throw Error('目前停格沒有事件卡。');
  const active=drawForTile(state,tile,player.id);
  state.phase='manage';
  return active;
}
function adjustStaff(state,playerId,delta){
  if(state.status!=='playing'||state.phase!=='manage'||state.players[state.turnIndex].id!==playerId)throw Error('只能在自己的經營階段調整員工。');
  if(!Number.isInteger(delta)||delta===0)throw Error('請輸入非零整數人數。');
  const p=state.players[state.turnIndex],c=state.companies[p.roleId];
  const employed=Object.values(state.companies).reduce((s,x)=>s+x.headcount,0);
  if(c.headcount+delta<0||employed+delta>1000)throw Error('超出可聘僱或可裁員人數。');
  c.headcount+=delta;state.log.unshift(`${p.name}${delta>0?'聘僱':'裁員'} ${Math.abs(delta)} 人。`);
}
function issueLoan(state,playerId,amount){
  if(state.status!=='playing'||state.phase!=='manage'||state.players[state.turnIndex].id!==playerId)throw Error('只能在自己的經營階段借款。');
  if(!Number.isInteger(amount)||amount<=0||amount>state.bank.liquidAssets||state.bank.riskRestrictionUntil>=state.round)throw Error('借款金額超出銀行流動資產，或目前限制新增風險放款。');
  const c=state.companies[state.players[state.turnIndex].roleId];c.cash+=amount;c.debt+=amount;state.bank.liquidAssets-=amount;state.bank.totalLoans+=amount;state.log.unshift(`${state.players[state.turnIndex].name}借款 ${amount}；現金及負債同步增加。`);
}
function repayLoan(state,playerId,amount){
  if(state.status!=='playing'||state.phase!=='manage'||state.players[state.turnIndex].id!==playerId)throw Error('只能在自己的經營階段還款。');
  const c=state.companies[state.players[state.turnIndex].roleId];
  if(!Number.isInteger(amount)||amount<=0||amount>c.debt||amount>c.cash)throw Error('還款不能超過現金或未償債務。');
  c.cash-=amount;c.debt-=amount;state.bank.liquidAssets+=amount;state.bank.totalLoans-=amount;state.log.unshift(`${state.players[state.turnIndex].name}償還 ${amount} 借款。`);
}
function updateBadLoans(state,playerId,amount){
  const p=state.players[state.turnIndex];
  if(state.status!=='playing'||state.phase!=='manage'||p.id!==playerId||p.roleId!=='bank')throw Error('只有銀行玩家能在自己的回合調整壞帳。');
  if(!Number.isInteger(amount)||amount===0||state.bank.nonperformingLoans+amount<0||state.bank.nonperformingLoans+amount>state.bank.totalLoans)throw Error('壞帳調整超出範圍。');
  state.bank.nonperformingLoans+=amount;state.log.unshift(`銀行${amount>0?'認列':'收回'} ${Math.abs(amount)} 壞帳。`);
}

function marketShock(state,round){
  const sum=state.activeEvents.filter(a=>a.scope==='global').reduce((total,a)=>{
    const e=eventById(a.eventId),age=round-a.startedRound;
    return total+(e&&age>=0&&age<e.duration?e.effects.filter(f=>f.metric==='asset_value').reduce((s,f)=>s+f.pct*e.decay[age],0):0);
  },0);
  const program=state.monetaryProgram&&round>=state.monetaryProgram.startRound&&round<state.monetaryProgram.startRound+2?state.monetaryProgram.type:null;
  return clamp(sum+(program==='QE'?5:program==='QT'?-5:0),-60,100);
}
function makeSnapshot(state,round=state.round){
  const prev=state.economicHistory.at(-1)||null,ago3=state.economicHistory.find(x=>x.round===round-3)||null;
  const f=ROLES.map(r=>financials(state,r.id,round));
  const sumMetric=m=>f.reduce((s,x)=>s+Math.abs(x.flows[m]),0),sumBase=m=>ROLES.reduce((s,r)=>s+Math.abs(r.base[m]),0);
  const energyChangePct=pct(sumMetric('energy'),sumBase('energy'));
  const materialChangePct=pct(sumMetric('material'),sumBase('material'));
  const inflationPct=2+.08*energyChangePct+.06*materialChangePct;
  const revenueTotal=f.reduce((s,x)=>s+x.revenue,0),employed=Object.values(state.companies).reduce((s,c)=>s+c.headcount,0),unemployed=1000-employed;
  const stockIndex=100*(1+marketShock(state,round)/100);
  const priorStock=prev?.stockIndex??100;
  const program=state.monetaryProgram&&round>=state.monetaryProgram.startRound&&round<state.monetaryProgram.startRound+2?state.monetaryProgram.type:null;
  const cooldown=state.lastRateDecisionRound===null?0:Math.max(0,3-(round-state.lastRateDecisionRound));
  const stock3=ago3?.stockIndex??(round===3?state.initialStockIndex??100:null),loans3=ago3?.totalLoans??(round===3?state.initialTotalLoans??1000:null);
  return {round,inflationPct,previousInflationPct:prev?.inflationPct??null,energyChangePct,materialChangePct,revenueTotal,previousRevenueTotal:prev?.revenueTotal??null,growthPct:prev?pct(revenueTotal,prev.revenueTotal):null,previousGrowthPct:prev?.growthPct??null,laborForce:1000,employed,unemployed,unemploymentPct:unemployed/10,previousUnemploymentPct:prev?.unemploymentPct??null,stockIndex,previousStockIndex:priorStock,stockIndex3Ago:stock3,stockReturn1Pct:pct(stockIndex,priorStock),stockReturn3Pct:stock3===null?null:pct(stockIndex,stock3),totalLoans:state.bank.totalLoans,totalLoans3Ago:loans3,loanGrowth3Pct:loans3===null?null:pct(state.bank.totalLoans,loans3),liquidAssets:state.bank.liquidAssets,shortTermLiabilities:state.bank.shortTermLiabilities,liquidityPct:div(100*state.bank.liquidAssets,state.bank.shortTermLiabilities),nonperformingLoans:state.bank.nonperformingLoans,nplPct:div(100*state.bank.nonperformingLoans,state.bank.totalLoans),fedRatePct:state.fedRatePercent,rateCooldownRounds:cooldown,monetaryProgram:program,monetaryProgramRoundsLeft:program?state.monetaryProgram.startRound+2-round:0,dataWarnings:[]};
}
const cmp=(label,value,op,limit)=>`${label} ${value===null?'—':round2(value).toFixed(2)+'%'} ${op} ${limit}%（${value===null?'資料不足':op==='≥'?value>=limit?'是':'否':op==='≤'?value<=limit?'是':'否':value<limit?'是':'否'}）`;
function evaluateFed(snapshot,state){
  const tests={
    F01:{ok:snapshot.inflationPct>=8,comparisons:[cmp('π(t)',snapshot.inflationPct,'≥',8)]},
    F02:{ok:snapshot.inflationPct>=4&&snapshot.previousInflationPct>=4,comparisons:[cmp('π(t)',snapshot.inflationPct,'≥',4),cmp('π(t−1)',snapshot.previousInflationPct,'≥',4)]},
    F03:{ok:snapshot.inflationPct>=6&&snapshot.growthPct<=-5,comparisons:[cmp('π(t)',snapshot.inflationPct,'≥',6),cmp('g(t)',snapshot.growthPct,'≤',-5)]},
    F04:{ok:snapshot.growthPct<=-10&&snapshot.previousGrowthPct<=-10,comparisons:[cmp('g(t)',snapshot.growthPct,'≤',-10),cmp('g(t−1)',snapshot.previousGrowthPct,'≤',-10)]},
    F05:{ok:snapshot.unemploymentPct>=10&&snapshot.previousUnemploymentPct>=10,comparisons:[cmp('u(t)',snapshot.unemploymentPct,'≥',10),cmp('u(t−1)',snapshot.previousUnemploymentPct,'≥',10)]},
    F06:{ok:snapshot.inflationPct<=-2&&snapshot.previousInflationPct<=-2,comparisons:[cmp('π(t)',snapshot.inflationPct,'≤',-2),cmp('π(t−1)',snapshot.previousInflationPct,'≤',-2)]},
    F07:{ok:snapshot.stockReturn1Pct<=-25,comparisons:[cmp('股市單季',snapshot.stockReturn1Pct,'≤',-25),cmp('g(t)',snapshot.growthPct,'<',0)]},
    F08:{ok:snapshot.liquidityPct<10,comparisons:[cmp('流動性',snapshot.liquidityPct,'<',10)]},
    F09:{ok:snapshot.nplPct>=8,comparisons:[cmp('壞帳率',snapshot.nplPct,'≥',8)]},
    F10:{ok:snapshot.stockReturn3Pct>=30&&snapshot.loanGrowth3Pct>=20,comparisons:[cmp('股市三季',snapshot.stockReturn3Pct,'≥',30),cmp('放款三季',snapshot.loanGrowth3Pct,'≥',20)]}
  };
  const evaluations=FED_RULES.map(rule=>({ruleId:rule.id,name:rule.name,requiredMetricIds:rule.fields,comparisons:tests[rule.id].comparisons,status:rule.fields.some(k=>snapshot[k]===null||snapshot[k]===undefined)?'insufficient_data':tests[rule.id].ok?'matched':'not_matched',reason:'',proposedAction:null,nextEffectiveRound:null}));
  const selectedId=FED_PRIORITY.find(id=>evaluations.find(x=>x.ruleId===id).status==='matched')||null;
  for(const ev of evaluations){
    if(ev.status==='matched'&&ev.ruleId!==selectedId){ev.status='suppressed_by_priority';ev.reason=`優先序低於 ${selectedId}`}
  }
  const chosen=evaluations.find(x=>x.ruleId===selectedId);
  if(chosen){
    let action='維持利率與金融措施',kind='none',delta=0;
    switch(selectedId){
      case 'F01':kind='rate';delta=.75;action='升息 0.75 個百分點';break;
      case 'F02':kind='rate';delta=.25;action='升息 0.25 個百分點';break;
      case 'F03':action='維持利率，觀察金融風險';break;
      case 'F04':kind='rate';delta=-.5;action='降息 0.50 個百分點';break;
      case 'F05':kind='rate';delta=-.25;action='降息 0.25 個百分點';break;
      case 'F06':kind=snapshot.fedRatePct===0?'program':'rate';delta=-.5;action=kind==='program'?'啟動 QE 2 回合':'降息 0.50 個百分點';break;
      case 'F07':kind=snapshot.growthPct<0?'program':'none';action=kind==='program'?'啟動 QE 2 回合':'市場觀察公告：景氣尚未衰退';break;
      case 'F08':kind='rescue';action='緊急流動性融資補足至 15%';break;
      case 'F09':kind='restriction';action='停止高風險新增放款 2 回合';break;
      case 'F10':kind=snapshot.fedRatePct<6?'rate':'program';delta=.25;action=kind==='rate'?'升息 0.25 個百分點':'啟動 QT 2 回合';break;
    }
    if(kind==='rate'&&snapshot.rateCooldownRounds>0){chosen.status='rate_cooldown';chosen.reason=`利率冷卻尚餘 ${snapshot.rateCooldownRounds} 回合`;action='冷卻中，維持利率';kind='none'}
    else {chosen.status='selected';chosen.reason='依優先序採用'}
    chosen.proposedAction=action;chosen.nextEffectiveRound=snapshot.round+1;
    return {evaluations,decision:{round:snapshot.round,ruleId:selectedId,action,kind,delta,nextEffectiveRound:snapshot.round+1}};
  }
  return {evaluations,decision:{round:snapshot.round,ruleId:null,action:'維持利率與金融措施',kind:'none',delta:0,nextEffectiveRound:snapshot.round+1}};
}

function applyDecision(state,decision){
  if(!decision)return;
  if(decision.kind==='rate')state.fedRatePercent=clamp(round2(state.fedRatePercent+decision.delta),0,10);
  if(decision.kind==='program'){
    const type=decision.action.includes('QE')?'QE':'QT';
    state.monetaryProgram={type,startRound:state.round};
  }
  if(decision.kind==='rescue'){
    const amount=Math.max(0,.15*state.bank.shortTermLiabilities-state.bank.liquidAssets);
    state.bank.liquidAssets+=amount;state.bank.shortTermLiabilities+=amount;
    if(amount)state.bank.rescues.push({amount,dueRound:state.round+3});
  }
  if(decision.kind==='restriction')state.bank.riskRestrictionUntil=state.round+1;
  if(decision.kind!=='none')state.log.unshift(`第 ${state.round} 季生效｜聯準會 ${decision.action}。`);
}
function endTurn(state){
  if(state.status!=='playing'||!['manage','strike'].includes(state.phase))throw Error('請先完成本回合。');
  moveGhost(state);
  if(state.turnIndex<state.players.length-1){state.turnIndex++;state.phase='roll';state.dice=null;state.reels=null;state.lastDraw=null;return null}
  const result=settleSeason(state);return result;
}
function settleSeason(state){
  if(state.status!=='playing')throw Error('遊戲已結束。');
  const round=state.round;
  const financialResults=Object.fromEntries(ROLES.map(r=>[r.id,financials(state,r.id,round)]));
  for(const r of ROLES)state.companies[r.id].cash=round2(state.companies[r.id].cash+financialResults[r.id].profit);
  const snapshot=makeSnapshot(state,round);
  state.economicHistory.push(snapshot);
  const {evaluations,decision}=evaluateFed(snapshot,state);
  state.evaluations.push({round,items:evaluations});state.decisions.push(decision);
  state.log.unshift(`第 ${round} 季結算完成｜總營收 ${Math.round(snapshot.revenueTotal).toLocaleString()}、通膨 ${round2(snapshot.inflationPct)}%、聯準會：${decision.action}。`);
  if(decision.kind==='rate')state.lastRateDecisionRound=round;
  const bankrupt=state.players.filter(p=>state.companies[p.roleId].cash+financialResults[p.roleId].assetValue-state.companies[p.roleId].debt<=0);
  const achievers=state.players.filter(p=>state.companies[p.roleId].cash+financialResults[p.roleId].assetValue-state.companies[p.roleId].debt>=state.targetWealth);
  if(bankrupt.length||achievers.length||round>=state.maxRounds){
    state.status=bankrupt.length?'bankruptcy':achievers.length?'goal':'round_limit';
    state.winnerIds=(achievers.length?achievers:state.players.filter(p=>!bankrupt.includes(p)).sort((a,b)=>companyPosition(state,b.roleId).netWorth-companyPosition(state,a.roleId).netWorth).slice(0,1)).map(p=>p.id);
    state.phase='finished';return {snapshot,decision,finished:true};
  }
  state.round++;
  state.struckPlayerIds=[];
  state.activeEvents=state.activeEvents.filter(a=>eventRemaining(a,state.round)>0);
  state.monetaryProgram=state.monetaryProgram&&state.round<state.monetaryProgram.startRound+2?state.monetaryProgram:null;
  for(const rescue of [...state.bank.rescues])if(rescue.dueRound<=state.round&&state.bank.liquidAssets>=rescue.amount){state.bank.liquidAssets-=rescue.amount;state.bank.shortTermLiabilities-=rescue.amount;state.bank.rescues.splice(state.bank.rescues.indexOf(rescue),1);state.log.unshift(`第 ${state.round} 季｜銀行償還緊急融資 ${rescue.amount}。`)}
  applyDecision(state,decision);
  state.turnIndex=0;state.phase='roll';state.dice=null;state.reels=null;state.lastDraw=null;
  return {snapshot,decision,finished:false};
}
function getEconomicSnapshot(state,round){return state.economicHistory.find(x=>x.round===round)||null}
function getEconomicHistory(state,from=1,to=state.round){return state.economicHistory.filter(x=>x.round>=from&&x.round<=to)}
function getFedRuleEvaluations(state,round){return state.evaluations.find(x=>x.round===round)?.items||null}
function getFedDecision(state,round){return state.decisions.find(x=>x.round===round)||null}
function exportGame(state){return JSON.stringify(state,null,2)}
function importGame(json){const s=JSON.parse(json);if(s.version!==1||!Array.isArray(s.players)||!Array.isArray(s.economicHistory)||!s.companies||!s.bank||!Array.isArray(s.activeEvents))throw Error('存檔格式不正確。');ensureGhostState(s);return s}


// Revision ordering is shared by every tab; page navigation stays local to each tab.
function syncInfo(game){
  if(!game)return null;
  return game.sync||{
    gameId:`legacy:${game.seed}:${game.players?.map(p=>p.name).join('|')}`,
    revision:0,
    updatedAt:0,
    writerId:''
  };
}

function isNewerGame(incoming,current){
  if(!incoming)return false;
  if(!current)return true;
  const a=syncInfo(incoming),b=syncInfo(current);
  if(a.gameId===b.gameId){
    if(a.revision!==b.revision)return a.revision>b.revision;
    if(a.updatedAt!==b.updatedAt)return a.updatedAt>b.updatedAt;
    return a.writerId>b.writerId;
  }
  if(a.updatedAt!==b.updatedAt)return a.updatedAt>b.updatedAt;
  return a.gameId>b.gameId;
}


// Pure helpers for multi-device rooms: codes, seat ownership, net-worth ranking and validation of guest messages.
// Networking (PeerJS) lives in app.js; everything here is deterministic so it can be unit tested.
const ROOM_PREFIX='econboard-v1-';
const ROOM_ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH=5;
const GUEST_ACTIONS=['roll','draw-card','end-turn','hire','layoff','loan','repay','mark-bad','recover-bad'];
const AMOUNT_ACTIONS=['hire','layoff','loan','repay','mark-bad','recover-bad'];

function makeRoomCode(random=Math.random){
  return Array.from({length:ROOM_CODE_LENGTH},()=>ROOM_ALPHABET[Math.floor(random()*ROOM_ALPHABET.length)]).join('');
}
function normalizeRoomCode(input){
  const code=String(input??'').toUpperCase().replace(/[\s-]+/g,'');
  return code.length===ROOM_CODE_LENGTH&&[...code].every(c=>ROOM_ALPHABET.includes(c))?code:null;
}
const roomPeerId=code=>`${ROOM_PREFIX}${code}`;

// Every player needs a device (the host included); play waits until all seats are taken,
// then only the device seated at the current player may act.
function emptySeats(seats,playerIds){return playerIds.filter(id=>!seats[id])}
function canAct(seats,game,clientId){
  if(!game||game.status!=='playing')return false;
  if(emptySeats(seats,game.players.map(p=>p.id)).length)return false;
  const player=game.players[game.turnIndex];
  return !!player&&seats[player.id]===clientId;
}
// A seat is locked once taken: a device cannot switch seats itself; only the host can free one (releaseSeat).
function claimSeat(seats,playerIds,playerId,clientId){
  if(!playerIds.includes(playerId))throw Error('沒有這位玩家。');
  const owner=seats[playerId];
  if(owner===clientId)return seats;
  if(owner)throw Error('這個座位已經有人坐了。');
  if(Object.values(seats).includes(clientId))throw Error('你已經選好座位了；要換位子請房主收回。');
  return {...seats,[playerId]:clientId};
}
function releaseSeat(seats,playerId){
  const next={...seats};delete next[playerId];return next;
}

// Net worth is computed in one place so a later rule (for example a player owning several companies) only changes this.
function netWorthRanking(game){
  const rows=game.players.map(player=>({player,netWorth:companyPosition(game,player.roleId).netWorth}));
  return rows.map(row=>({...row,rank:1+rows.filter(r=>r.netWorth>row.netWorth).length})).sort((a,b)=>a.rank-b.rank);
}

const safeId=v=>typeof v==='string'&&/^[\w-]{1,64}$/.test(v)?v:null;
// Guest messages are untrusted: only a fixed set of shapes gets through.
function parseGuestMessage(raw){
  if(!raw||typeof raw!=='object')return null;
  if(raw.t==='hello'){const clientId=safeId(raw.clientId);return clientId?{t:'hello',clientId}:null}
  if(raw.t==='claim'){const playerId=safeId(raw.playerId);return playerId?{t:'claim',playerId}:null}
  if(raw.t==='action'&&GUEST_ACTIONS.includes(raw.action)){
    if(!AMOUNT_ACTIONS.includes(raw.action))return {t:'action',action:raw.action};
    const amount=Number(raw.amount);
    return Number.isFinite(amount)&&Math.abs(amount)<=1e9?{t:'action',action:raw.action,amount}:null;
  }
  return null;
}



const $=s=>document.querySelector(s),h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>Math.round(n).toLocaleString('zh-TW'),decimal=(n,d=1)=>n===null||n===undefined?'—（資料不足）':Number(n).toFixed(d),signed=n=>`${n>=0?'+':'−'}${money(Math.abs(n))}`;
const colors=['#0f9688','#5979b0','#ce9460','#aa6b91','#c55d5d','#7e9541','#348da5','#7a60ad'];
const scopes={global:'全球事件',personal:'個人事件',sector:'產業事件'};
const scopeColor={global:'#cc6d61',personal:'#597bae',sector:'#ca9451'};
const twoColumnPlayerCards=window.matchMedia('(min-width:761px) and (max-width:1439px)');
const role=id=>ROLES.find(x=>x.id===id),event=id=>ALL_EVENTS.find(x=>x.id===id);
const roleStories={
  auto:'清晨六點，沖壓機的第一聲巨響傳遍廠房，經銷商已打來追問交車日期。你得讓產線不停，還要在原物料、電力和出口費上漲時守住利潤。',
  electronics:'海外客戶催著下一批產品出貨，採購單上的零件報價卻又變了。訂單金額不小，但材料、人力和關稅一項都不能漏算。',
  retail:'捲門一拉開，週末人潮就往百貨湧來。你得讓熱賣商品留在貨架上，同時控制補貨成本，才不會忙了一整天卻賺得很薄。',
  bank:'櫃檯前有人等著貸款，另一邊有人急著提款。利息收入撐起獲利，但每筆壞帳都在考驗銀行手上的現金。',
  investment:'開盤鐘聲一響，螢幕上的報價不停跳動。你盯著持有的資產等待機會，也知道市場一轉向，投資收益和資產價值都可能跟著變。',
  energy:'調度室電話響個不停，工廠和城市都在等你的供應。需求帶來訂單，你還得算清原料、日常營運和借款利息的壓力。',
  logistics:'天還沒亮，車隊已排在倉庫門口，客戶催問貨物何時送到。每趟運送都要用人、用能源；價格一變，這季利潤就跟著晃動。',
  property:'接待中心的燈亮著，買方正等著下一次看屋。成交能帶進營收，但銀行利息和案場營運費每季照樣到期，空等也有代價。',
  agriculture:'第一台貨車開進市場，司機等著你確認這批食品的去向。從原料到運輸都要算進成本，價格稍有變動，這季盈虧就可能改寫。',
  technology:'版本上線倒數，工程師還在修最後一個問題，客戶已打來確認交付時間。人才撐起服務收入，也讓人力成為每季最大的成本。'
};
const manageGuides={
  auto:['交車期限就在眼前，產線每多開一班，薪資和材料也跟著增加。','先看人力與原料成本，再決定要聘僱、裁員或借款周轉。'],
  electronics:['海外訂單催著出貨，零件、關稅與薪資正一項項吃掉利潤。','比較收入與材料成本，調整人手前先確認手上的現金。'],
  retail:['客人湧進店裡，缺貨會失單，備貨太多又會壓住現金。','留意商品和人力成本，再決定是否增員或借款備貨。'],
  bank:['櫃檯忙著放款和提款，每筆壞帳都考驗銀行的資金調度。','留意流動資產與壞帳，必要時認列或收回壞帳。'],
  investment:['開盤數字不停跳動，投資收益與資產價值可能一季內翻轉。','先看投資損益與現金，再決定是否借款度過波動。'],
  energy:['調度室亮到深夜，訂單增加，原料與能源支出也跟著升高。','比較收入與原料、能源成本，再安排人手和資金。'],
  logistics:['車隊等著發車，每趟運送都消耗人力與燃料。','留意能源成本，決定要增員、裁員或借款周轉。'],
  property:['買方還在看屋，利息和案場支出卻已照常到期。','先看現金與利息成本，再謹慎調整人手和借款。'],
  agriculture:['清晨的貨車已出發，原料與運輸漲價會吃掉每箱食品的利潤。','比較銷售與原料、能源成本，再決定人手與周轉。'],
  technology:['產品即將上線，工程師仍在處理最後的問題。','人才是關鍵，也最花錢；聘僱前先看收入與人力成本。']
};
const strikeStories={
  auto:['警報聲壓過沖壓機，整條產線突然停住。交車期限還在倒數，工資、廠房與原料帳單卻一張張送來。','車子一台也交不出去；守住現金，等下一回合重新開線。'],
  electronics:['無塵室外擠滿停工的人，出貨倒數歸零。晶片還鎖在產線裡，海外客戶的電話已經響個不停。','訂單收入歸零，零件、關稅與薪資照付；這回合只能看著貨櫃空等。'],
  retail:['開門前，員工把百貨大門拉下。顧客聚在門外，收銀機整天沒響，租金和備貨款卻準時到期。','沒有一筆成交，商品與人力成本仍在；先撐過這場停業。'],
  bank:['櫃檯一夜之間空了，提款人潮排到街角。放款與利息收入停擺，維持分行運作的費用仍不停流出。','收入歸零，壞帳與營運壓力還在；這回合無法調整放款與人手。'],
  investment:['開盤鐘響，交易室卻只剩閃爍的螢幕。分析師集體離席，機會從眼前滑過，辦公室帳單照常入帳。','投資與交易收入歸零，固定支出繼續扣；下一回合再追市場。'],
  energy:['調度中心的對講機突然沉默，機組停在半途。需求仍在飆升，原料、設備與能源費卻沒有跟著停。','供應收入歸零，原料與維護照付；先把資金撐到下一班。'],
  logistics:['司機把車鑰匙整排放在桌上，貨車堵滿月台。客戶催貨的訊息狂跳，油費、倉租與薪資仍持續累積。','一趟貨也送不出去，運輸成本照算；這回合只能停車等候。'],
  property:['工地吊臂停在半空，銷售中心也熄了燈。買方等著交屋，貸款利息和案場費用卻分秒不停。','成交收入歸零，利息與固定支出照付；等復工再推進案子。'],
  agriculture:['包裝線突然停轉，剛採下的作物堆在冷藏庫門口。通路催著上架，冷鏈和原料費每分鐘都在燒。','食品賣不出去，保存與運輸成本照付；先撐住這批貨。'],
  technology:['上線倒數最後一刻，工程師關上筆電離開。客戶仍盯著進度條，伺服器和人力帳單卻不會暫停。','服務收入歸零，維運與薪資照付；這回合無法再做經營調整。']
};
const storageKey='economy-board-v1';
const viewKey='economy-board-view-v1';
const tabId=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`;
const clientId=(()=>{try{let id=sessionStorage.getItem('economy-board-client-v1');if(!id){id=tabId.replace(/[^\w-]/g,'');sessionStorage.setItem('economy-board-client-v1',id)}return id}catch{return tabId.replace(/[^\w-]/g,'')}})();
// Multi-device room: the host's page owns the game; guests only send actions and render what the host broadcasts.
const room={role:null,code:'',peer:null,guests:new Set(),hostConn:null,seats:{},seatsGameId:null,online:[],hostClientId:'',status:'',error:'',retries:0,reconnectTimer:null,connectTimer:null,signalTimer:null,offline:false,seatPromptFor:null,synced:false,closed:false,prefill:'',queue:Promise.resolve()};
let channel=null;
try{if('BroadcastChannel' in globalThis)channel=new BroadcastChannel(storageKey)}catch{}
let state=null,page='home',tab='business',snapshotSelection='latest',setupPlayers=[{name:'玩家 1',roleId:'auto'},{name:'玩家 2',roleId:'electronics'}],toastTimer,resetAt=0;
let animation=null,animationSerial=0;
let dismissedCardKey=null;
const MOVE_MS=1000;
try{const view=JSON.parse(sessionStorage.getItem(viewKey));if(['business','events','dashboard','fed','history'].includes(view?.tab))tab=view.tab;if(typeof view?.snapshotSelection==='string')snapshotSelection=view.snapshotSelection}catch{}
function rememberView(){try{sessionStorage.setItem(viewKey,JSON.stringify({tab,snapshotSelection}))}catch{}}

function notify(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3200)}
function newGameId(){return globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`}
function prepareNewSession(game){const previous=syncInfo(state);game.sync={gameId:newGameId(),revision:0,updatedAt:Math.max(Date.now(),(previous?.updatedAt||0)+1,resetAt+1),writerId:tabId}}
function readStored(){try{const raw=localStorage.getItem(storageKey);return raw?importGame(raw):null}catch{return undefined}}
function cancelAnimation(){animationSerial++;animation=null}
function save(){
  if(!state||isGuest())return;
  if(!state.sync)prepareNewSession(state);
  state.sync.revision++;
  state.sync.updatedAt=Math.max(Date.now(),state.sync.updatedAt+1);
  state.sync.writerId=tabId;
  try{localStorage.setItem(storageKey,exportGame(state));$('#save-status').textContent='多頁籤已同步'}catch{$('#save-status').textContent=channel?'即時同步中；請匯出備份':'本機儲存不可用，請匯出備份'}
  try{channel?.postMessage({type:'state',writerId:tabId,game:state})}catch{}
  broadcastRoom();
}
function clearSave(){
  const updatedAt=Math.max(Date.now(),(syncInfo(state)?.updatedAt||0)+1,resetAt+1);
  resetAt=updatedAt;
  try{localStorage.removeItem(storageKey)}catch{}
  try{channel?.postMessage({type:'reset',updatedAt,writerId:tabId})}catch{}
}
function adoptShared(incoming){
  if(!isNewerGame(incoming,state))return false;
  const previous=state;
  const sharedRoll=previous&&syncInfo(previous).gameId===syncInfo(incoming).gameId&&previous.round===incoming.round&&previous.phase==='roll'&&['draw','manage','strike'].includes(incoming.phase)&&previous.turnIndex===incoming.turnIndex&&Number.isInteger(incoming.dice);
  const from=sharedRoll?previous.players[previous.turnIndex].position:null;
  cancelAnimation();state=incoming;render();
  $('#save-status').textContent='已從其他頁籤同步';
  if(sharedRoll)beginRollAnimation({playerId:incoming.players[incoming.turnIndex].id,from,dice:incoming.dice,reels:incoming.reels},false);
  broadcastRoom();
  return true;
}
function ensureFresh(){
  const stored=readStored();
  if(stored===null&&state){cancelAnimation();state=null;render();notify('其他頁籤已開始新遊戲，畫面已更新。');return false}
  if(stored&&isNewerGame(stored,state)){adoptShared(stored);notify('對局已由其他頁籤更新，請確認目前回合後再操作。');return false}
  return true;
}
async function withGameLock(work){
  if(globalThis.navigator?.locks?.request)return navigator.locks.request(`${storageKey}-write`,{mode:'exclusive'},work);
  return work();
}
const BUSY_MESSAGE='棋盤正在播放動畫，請稍候再試。';
// Resolves to an error message when the action did not go through, so a room host can report it to the guest.
async function run(fn){
  if(animation)return BUSY_MESSAGE;
  let error=null;
  try{await withGameLock(()=>{if(!ensureFresh()){error='對局已由其他頁籤更新，請確認後再操作。';return}fn();save();render()})}
  catch(e){error=e.message||'操作失敗';notify(error)}
  return error;
}

function homeFlowLabel(metric,value){
  if(metric==='interest')return value>0?'利息收入':'利息支出';
  if(metric==='investment')return value>0?'投資收益':'投資損失';
  if(metric==='export_cost')return '出口貿易費';
  if(metric==='fixed')return '固定營運費';
  return METRIC_LABELS[metric];
}
function renderHomeRoles(){
  $('#home-roles').innerHTML=ROLES.map(r=>{
    const income=METRICS.reduce((sum,m)=>sum+Math.max(0,r.base[m]),0);
    const expense=METRICS.reduce((sum,m)=>sum+Math.max(0,-r.base[m]),0);
    const flowList=positive=>METRICS.filter(m=>positive?r.base[m]>0:r.base[m]<0).map(m=>`<div><dt>${h(homeFlowLabel(m,r.base[m]))}</dt><dd>${money(Math.abs(r.base[m]))}</dd></div>`).join('');
    return `<article class="home-role"><div class="home-role-title"><span class="home-role-icon" aria-hidden="true">${r.icon}</span><div><span class="home-role-sector">${h(r.sector)} · 起始 ${r.baseHeadcount} 人</span><h3>${h(r.name)}</h3></div></div><p class="home-role-story">${h(roleStories[r.id])}</p><div class="home-role-totals"><div><span>基準收入</span><strong>+${money(income)}</strong></div><div><span>基準成本</span><strong>−${money(expense)}</strong></div><div><span>預估淨利</span><strong>${signed(income-expense)}</strong></div></div><div class="home-role-flows"><div><h4>收入來源</h4><dl>${flowList(true)}</dl></div><div><h4>成本與支出</h4><dl>${flowList(false)}</dl></div></div></article>`;
  }).join('');
}
function renderSetup(){
  $('#setup-players').innerHTML=setupPlayers.map((p,i)=>`<div class="setup-player"><span class="player-numeral">${i+1}</span><input data-setup-name="${i}" aria-label="玩家 ${i+1} 名稱" maxlength="16" value="${h(p.name)}"><select data-setup-role="${i}" aria-label="玩家 ${i+1} 企業">${ROLES.map(r=>`<option value="${r.id}" ${r.id===p.roleId?'selected':''}>${h(r.name)}</option>`).join('')}</select><button class="remove-player" data-remove-player="${i}" type="button" aria-label="移除玩家 ${i+1}" ${setupPlayers.length<=2?'disabled':''}>×</button></div>`).join('');
  $('#add-player').disabled=setupPlayers.length>=8;
}
function currentPlayer(){return state?.players[state.turnIndex]}
function boardCoords(i){if(i<=6)return [1,i+1];if(i<=12)return [i-5,7];if(i<=18)return [7,19-i];return [25-i,1]}
function sectorForTile(i){const sectors=['製造業','消費業','金融業','能源與運輸','民生業','科技業'];return sectors[((Math.floor((i-3)/3)%6)+6)%6]}
function tileName(tile,i){return tile.type==='sector'?sectorForTile(i):tile.label}
function currentCard(){
  if(state.phase!=='manage'||!state.lastDraw||!state.dice)return null;
  const card=state.lastDraw;
  if(card.startedRound!==state.round||card.ownerId&&card.ownerId!==currentPlayer().id)return null;
  const key=`${state.sync?.gameId||'local'}:${state.round}:${state.turnIndex}:${card.instanceId}`;
  return key===dismissedCardKey?null:{card,key,event:event(card.eventId)};
}
function cardCenter(){
  if(!animation&&state.phase==='draw'){
    const scope=BOARD[currentPlayer().position].type;
    return `<div class="card-scene scope-${scope}"><p class="card-hint">停在${scopes[scope]}格 · 輪到${turnWho()}抽卡</p><button class="draw-deck" type="button" data-action="draw-card" aria-label="點擊抽${scopes[scope]}卡"><span class="deck-shadow" aria-hidden="true"></span><span class="deck-back"><span>✦</span><strong>${scopes[scope]}</strong><small>點一下抽卡</small></span></button><p class="card-instruction">卡片正在洗牌，點擊卡背翻開結果</p></div>`;
  }
  const shown=!animation&&currentCard();
  if(shown){
    const {card,event:e}=shown;
    const target=card.scope==='global'?'所有適用企業':card.scope==='sector'?`${card.sector}所有企業`:'只有抽卡玩家';
    const effects=e.effects.map(x=>`<span class="effect-chip">${h(METRIC_LABELS[x.metric])} ${x.pct>=0?'+':''}${x.pct}%</span>`).join('');
    return `<div class="card-scene card-reveal" role="status"><p class="card-hint">${h(scopes[card.scope])} · ${h(e.id)}</p><div class="revealed-card"><span class="revealed-symbol">✦</span><h3>${h(e.name)}</h3><p>影響 ${h(target)} · 持續 ${e.duration} 季</p><div class="revealed-effects">${effects}</div></div><button class="card-continue" type="button" data-action="dismiss-card">繼續經營 →</button></div>`;
  }
  return null;
}
function effectiveFedNotice(){
  if(animation||state.status!=='playing'||state.phase!=='roll'||state.turnIndex!==0)return null;
  const decision=state.decisions.at(-1);
  return decision&&['rate','program','rescue','restriction'].includes(decision.kind)&&decision.nextEffectiveRound===state.round?decision:null;
}
function fedCenter(decision){
  if(!decision)return null;
  const theme=decision.kind==='rate'?decision.delta>0?'tighten':'ease':decision.kind;
  const icon={tighten:'↗',ease:'↘',program:'✦',rescue:'✚',restriction:'⛨'}[theme];
  const detail=decision.kind==='rate'?`目前政策利率 ${decimal(state.fedRatePercent,2)}%`:decision.kind==='program'?`${state.monetaryProgram?.type||'貨幣政策'} 已啟動`:decision.kind==='rescue'?'銀行流動性支援已生效':'高風險放款限制已生效';
  const headline=`聯準會政策更新　✦　${decision.action}　✦　第 ${state.round} 季生效　✦　`;
  return `<div class="fed-broadcast ${theme}" role="status" aria-live="polite"><div class="fed-broadcast-top"><span class="fed-live-dot"></span><span>FED LIVE · 第 ${state.round} 季</span><span class="fed-live-dot"></span></div><div class="fed-orbit" aria-hidden="true"><span>${icon}</span></div><h3>聯準會政策快報</h3><strong class="fed-action">${h(decision.action)}</strong><div class="fed-marquee" aria-hidden="true"><div class="fed-marquee-track"><span>${h(headline)}</span><span>${h(headline)}</span></div></div><p class="fed-detail">${h(detail)}</p><small>新一季已開始 · 可以啟動拉霸</small></div>`;
}
function manageCenter(){
  if(animation||state.status!=='playing'||state.phase!=='manage'||currentCard())return null;
  const p=currentPlayer(),r=role(p.roleId),[scene,tip]=manageGuides[p.roleId],f=financials(state,p.roleId),c=state.companies[p.roleId];
  return `<div class="manage-scene" role="status" style="--manage-accent:${colors[p.color]}"><div class="manage-label">第 ${state.round} 季 · ${h(p.name)} 的經營時間</div><div class="manage-icon" aria-hidden="true">${r.icon}</div><h3>${h(r.name)}</h3><p class="manage-story">${h(scene)}</p><p class="manage-tip"><strong>本回合怎麼做</strong>${h(tip)}</p><div class="manage-stats"><div><span>預估淨利</span><strong class="${f.profit<0?'negative':''}">${signed(f.profit)}</strong></div><div><span>目前現金</span><strong>${money(c.cash)}</strong></div></div><small>請在右側調整員工、借貸，完成後交給下一位玩家。</small></div>`;
}
function strikeCenter(){
  if(animation||state.status!=='playing'||state.phase!=='strike')return null;
  const p=currentPlayer(),r=role(p.roleId),[scene]=strikeStories[p.roleId],f=financials(state,p.roleId);
  return `<div class="strike-scene" role="status" aria-live="polite"><span class="strike-siren">罷工警報 · 第 ${state.round} 季</span><span class="strike-ghost" aria-hidden="true">👻</span><h3>${h(r.name)}全面停工</h3><p>${h(scene)}</p><div class="strike-effects"><span>本季收入 <strong>0</strong></span><span>支出照付 <strong>${money(-f.costs)}</strong></span></div><small>本回合不能抽事件卡，也不能聘僱、裁員或借貸。</small></div>`;
}
function slotMarkup(values){
  return `<div class="slot-machine" role="group" aria-label="兩個 0 到 6 的拉霸轉輪">${values.map((value,i)=>{
    const position=animation?.reelPositions?.[i]??value;
    const cells=Array.from({length:49},(_,cell)=>`<strong class="slot-cell">${cell%7}</strong>`).join('');
    return `<span class="slot-reel ${animation?.stage==='rolling'&&animation.spinning[i]?'spinning':''}" aria-label="第 ${i+1} 個轉輪：${value}"><span class="slot-strip" style="transform:translateY(-${position*100}%)">${cells}</span></span>`;
  }).join('')}</div>`;
}
// In a room only the device that controls the current player may press the draw deck or turn buttons.
function renderBoard(){renderBoardContent();if(room.role&&state?.status==='playing'&&!iCanAct())$('#board [data-action="draw-card"]')?.setAttribute('disabled','')}
function renderTurn(){renderTurnContent();gateTurnControls()}
function gateTurnControls(){
  if(!room.role||!state)return;
  const playing=state.status==='playing';
  if(playing?iCanAct():!isGuest())return;
  document.querySelectorAll('#turn-content button,#turn-content input').forEach(x=>{x.disabled=true});
  if(!playing)return;
  $('#turn-content').insertAdjacentHTML('beforeend',`<p class="room-wait-note">${h(roomTurnNote())}</p>`);
}
// Turn texts say "你" only to the device that may act; everyone else sees whose turn it is.
function turnWho(){return iCanAct()?'你':`「${h(currentPlayer().name)}」`}
function roomTurnNote(){
  const missing=missingSeats(),mine=mySeat(),pick='按右上角「多裝置房間」選一位玩家。';
  if(missing.length)return `等待入座：還差${missing.map(p=>`「${p.name}」`).join('、')}。每位玩家都有人坐之後才能開始。${mine?'':pick}`;
  if(!mine)return '所有座位都有人了，你目前只能觀看。';
  return `現在輪到「${currentPlayer().name}」。你是「${mine.name}」，輪到你時才能操作。`;
}
function renderBoardContent(){
  const pos=state.players.map(p=>({p,index:animation?.playerId===p.id?animation.position:p.position}));
  const tiles=BOARD.map((tile,i)=>{
    const [row,col]=boardCoords(i);
    const occupants=pos.filter(x=>x.index===i);
    const tokens=occupants.map(x=>`<span class="token ${animation?.playerId===x.p.id?'moving':''}" title="${h(x.p.name)}" style="background:${colors[x.p.color]}"></span>`).join('');
    return `<div class="tile ${tile.type} ${occupants.length>4?'crowded':''} ${state.ghostPosition===i?'ghost-tile':''} ${animation?.position===i?'tile-active':''} ${animation?.visited.has(i)?'tile-visited':''}" data-tile-index="${i}" style="grid-row:${row};grid-column:${col}" title="${h(tileName(tile,i))}"><span class="tile-number">${String(i).padStart(2,'0')}</span><span class="tile-type">${h(tileName(tile,i))}</span><span class="tile-icon">${tile.type==='global'?'◎':tile.type==='personal'?'◇':tile.type==='sector'?'▦':'↗'}</span><div class="tile-tokens">${tokens}</div></div>`;
  }).join('');
  const legacyRoll=state.dice!==null&&state.reels?.length===3&&!animation;
  const values=animation?.displayReels||(state.reels?.length===2?state.reels:[0,0]);
  const slotDisplay=legacyRoll?`<div class="legacy-roll">舊回合點數<br><strong>${state.reels.join(' + ')} = ${state.dice}</strong></div>`:slotMarkup(values);
  const total=animation?.stage==='rolling'?'數字跳動中…':state.dice===null?'啟動拉霸前進':state.dice===0?'原地停留':`前進 ${state.dice} 格`;
  const notice=fedCenter(effectiveFedNotice()),card=cardCenter(),manage=manageCenter(),strike=strikeCenter();
  const board=$('#board'),ghost=board.querySelector('.ghost-piece'),oldPosition=ghost?.dataset.position,oldRect=ghost?.getBoundingClientRect();
  ghost?.remove();
  board.innerHTML=tiles+`<div class="board-center ${notice?'fed-live':''} ${manage?'manage-mode':''} ${strike?'strike-mode':''}">${card||notice||manage||strike||`<div class="center-icon">⌁</div><h3>市場正在運轉</h3><p>兩輪拉霸 · 逐格前進 · 每季結算</p>${slotDisplay}<div class="slot-total">${total}</div><small>${animation?.stage==='rolling'?'兩個數字依序停下':animation?.stage==='result'?'結果已出現，稍後開始移動':state.dice===0?'本次停留原地，不抽事件卡':animation?.stage==='moving'?'棋子每秒前進一格':'經過起點可獲得 250 遊戲幣'}</small>`}</div>`;
  const piece=ghost||document.createElement('span');
  if(!ghost){piece.className='ghost-piece';piece.innerHTML='<span aria-hidden="true">👻</span>';piece.setAttribute('role','img')}
  piece.dataset.position=String(state.ghostPosition);
  piece.setAttribute('aria-label',`罷工幽靈位於第 ${state.ghostPosition} 格`);
  board.appendChild(piece);
  const tile=board.querySelector(`[data-tile-index="${state.ghostPosition}"]`),tileRect=tile.getBoundingClientRect(),boardRect=board.getBoundingClientRect();
  piece.style.left=`${tileRect.left-boardRect.left+tileRect.width*.72}px`;
  piece.style.top=`${tileRect.top-boardRect.top+tileRect.height*.38}px`;
  if(oldRect?.width&&boardRect.width&&oldPosition!==piece.dataset.position&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    const trail=state.ghostTrail?.[0]===Number(oldPosition)&&state.ghostTrail.at(-1)===state.ghostPosition?state.ghostTrail:null;
    const frames=trail?.map((position,i)=>{
      const r=board.querySelector(`[data-tile-index="${position}"]`).getBoundingClientRect();
      const dx=r.left-tileRect.left+(r.width-tileRect.width)*.72,dy=r.top-tileRect.top+(r.height-tileRect.height)*.38;
      return {transform:`translate(${dx}px,${dy}px) translate(-50%,-50%)`,offset:i/(trail.length-1)};
    })||[{transform:`translate(${oldRect.left-piece.getBoundingClientRect().left}px,${oldRect.top-piece.getBoundingClientRect().top}px) translate(-50%,-50%)`},{transform:'translate(-50%,-50%)'}];
    piece.animate(frames,{duration:trail?(trail.length-1)*360:850,easing:'ease-in-out'});
  }
}
function actionRow(id,buttons,min=1){return `<div class="action-row"><input id="${id}" type="number" min="${min}" step="1" value="${id==='staff-count'?10:100}" aria-label="${id==='staff-count'?'人數':'金額'}">${buttons.map(([label,action])=>`<button type="button" data-action="${action}">${label}</button>`).join('')}</div>`}
function renderTurnContent(){
  const p=currentPlayer(),r=role(p.roleId),done=state.phase==='manage',finished=state.status!=='playing';
  if(animation){$('#turn-content').innerHTML=`<h2 class="turn-name" style="color:${colors[p.color]}">${h(p.name)}</h2><p class="turn-role">${h(r.name)} · ${h(r.sector)}</p><div class="turn-steps"><span class="done"></span><span class="done"></span><span></span></div><p class="turn-meta">${animation.stage==='rolling'?'兩個數字正在跳動…':animation.stage==='result'?'結果已停定，稍後開始移動。':animation.dice===0?'拉出 0 + 0 = 0，棋子停留原地。':`拉出 ${animation.reels.join(' + ')} = ${animation.dice}，棋子每秒前進一格。`}</p><button class="primary" disabled>請稍候…</button>`;return}
  if(finished){
    const winners=state.players.filter(x=>state.winnerIds.includes(x.id)).map(x=>x.name).join('、');
    const cause=state.status==='bankruptcy'?'有玩家破產':state.status==='goal'?'有人達成淨資產目標':'到達季數上限';
    $('#turn-content').innerHTML=`<h2 class="turn-name">對局結束</h2><p class="turn-role">${cause}</p><p class="turn-meta">勝出：<strong>${h(winners||'無')}</strong></p><button class="secondary" data-action="new-game">再玩一局</button>`;
    return;
  }
  if(state.phase==='strike'){
    const [,tip]=strikeStories[p.roleId],f=financials(state,p.roleId);
    $('#turn-content').innerHTML=`<h2 class="turn-name strike-turn-name">${h(p.name)} 遇上罷工</h2><p class="turn-role">${h(r.name)} · ${h(r.sector)}</p><div class="turn-steps"><span class="done"></span><span class="done"></span><span></span></div><p class="turn-meta">拉出 ${state.dice} 格，走到第 ${p.position} 格時被幽靈攔下，剩餘步數作廢。</p><p class="turn-meta strike-turn-copy">${h(tip)}</p><div class="strike-turn-effect"><strong>收入歸零</strong><span>本季支出仍有 ${money(-f.costs)} 遊戲幣</span></div><p class="turn-meta">這回合不能抽事件卡，也無法聘僱、裁員或借貸。</p><button class="primary" data-action="end-turn">${state.turnIndex===state.players.length-1?'停工結算本季 →':'停工，交給下一位 →'}</button>`;
    return;
  }
  if(state.phase==='draw'||currentCard()){
    const waiting=state.phase==='draw';
    $('#turn-content').innerHTML=`<h2 class="turn-name" style="color:${colors[p.color]}">${h(p.name)}</h2><p class="turn-role">${h(r.name)} · ${h(r.sector)}</p><div class="turn-steps"><span class="done"></span><span class="done"></span><span></span></div><p class="turn-meta">拉出 <strong>${state.reels.join(' + ')} = ${state.dice}</strong>，停在「${h(tileName(BOARD[p.position],p.position))}」。${waiting?'請點棋盤中央流動的卡片，親手抽出事件。':'事件已翻開。看完卡片後，按「繼續經營」。'}</p>`;
    return;
  }
  $('#turn-content').innerHTML=`<h2 class="turn-name" style="color:${colors[p.color]}">${h(p.name)}</h2><p class="turn-role">${h(r.name)} · ${h(r.sector)}</p><div class="turn-steps"><span class="done"></span><span class="${done?'done':''}"></span><span></span></div>${!done?`<p class="turn-meta">輪到${turnWho()}啟動拉霸。兩個轉輪各顯示 0–6，相加就是前進格數。</p><button class="primary" data-action="roll">啟動拉霸　▦</button>`:`<p class="turn-meta">拉出 <strong>${state.reels?.join(' + ')||'舊回合'} = ${state.dice}</strong>，停在「${h(tileName(BOARD[p.position],p.position))}」。${state.dice===0?'本次原地停留，不抽事件卡。':'完成經營後交給下一位玩家。'}</p><div class="action-block"><h4>員工調整 · 目前 ${state.companies[p.roleId].headcount} 人</h4><p>聘僱與裁員會改變全市場失業率及本企業人力成本。</p>${actionRow('staff-count',[['聘僱','hire'],['裁員','layoff']])}</div><div class="action-block"><h4>銀行借貸 · 未償 ${money(state.companies[p.roleId].debt)}</h4><p>借款增加現金與負債，不計入收入。銀行流動資產 ${money(state.bank.liquidAssets)}。</p>${actionRow('loan-amount',[['借款','loan'],['還款','repay']])}</div>${p.roleId==='bank'?`<div class="action-block"><h4>銀行壞帳</h4><p>目前不良放款 ${money(state.bank.nonperformingLoans)}。</p>${actionRow('bad-amount',[['認列','mark-bad'],['收回','recover-bad']])}</div>`:''}<button class="secondary" style="margin-top:18px" data-action="end-turn">${state.turnIndex===state.players.length-1?'結算本季 →':'交給下一位 →'}</button>`}`;
}
function activeForPlayer(a,p){return a.scope==='global'||a.scope==='personal'&&a.ownerId===p.id||a.scope==='sector'&&a.sector===role(p.roleId).sector}
function effectTextForActive(a,roleId){
  const items=METRICS.concat('asset_value').filter(m=>m==='asset_value'||role(roleId).base[m]!==0).flatMap(m=>effectBreakdown(state,roleId,m).filter(x=>x.instanceId===a.instanceId).map(x=>`${METRIC_LABELS[m]} ${x.pct>=0?'+':''}${decimal(x.pct,1)}%`));
  return items.length?items.join(' · '):'本企業無直接數值影響';
}
function renderPlayers(){
  const played=state.players.slice(0,state.turnIndex),upcoming=state.players.slice(state.turnIndex+1);
  const narrowPair=twoColumnPlayerCards.matches;
  const ordered=state.status==='playing'?[state.players[state.turnIndex],...(narrowPair?played:upcoming),...(narrowPair?upcoming:played)]:state.players;
  // In a room each device shows only its own player in full; everyone appears in the net-worth ranking, which keeps this column short.
  const mine=room.role?mySeat():null,shown=room.role?(mine?[mine]:[]):ordered;
  $('#player-cards').innerHTML=shown.map(p=>{
    const r=role(p.roleId),f=financials(state,p.roleId),pos=companyPosition(state,p.roleId),c=state.companies[p.roleId];
    const events=state.activeEvents.filter(a=>activeForPlayer(a,p)&&eventRemaining(a,state.round)>0);
    const playerIndex=state.players.indexOf(p);
    const turnState=state.status==='playing'?(playerIndex===state.turnIndex?'current':playerIndex<state.turnIndex?'played':'waiting'):'';
    return `<article class="player-card ${turnState} ${p===mine?'mine':''}" style="--player-color:${colors[p.color]}"><div class="player-card-head"><div class="player-identity"><span class="role-icon">${r.icon}</span><div><h3>${h(p.name)}${p===mine?'<span class="you-badge">你</span>':''}</h3><small>${h(r.name)} · ${h(r.sector)}</small></div></div><span class="position-label">第 ${p.position} 格</span></div><div class="wealth-line"><span>目前淨資產</span><strong>${signed(pos.netWorth)}</strong></div><div class="finance-grid"><div class="finance-stat positive"><span>本季收入</span><strong>${signed(f.revenue+f.otherIncome)}</strong></div><div class="finance-stat negative"><span>本季成本</span><strong>${signed(f.costs)}</strong></div><div class="finance-stat ${f.profit>=0?'positive':'negative'}"><span>預估淨利</span><strong>${signed(f.profit)}</strong></div><div class="finance-stat"><span>現金</span><strong>${money(c.cash)}</strong></div><div class="finance-stat"><span>投資資產</span><strong>${money(pos.assetValue)}</strong></div><div class="finance-stat"><span>借款／員工</span><strong>${money(c.debt)} / ${c.headcount}</strong></div></div><div class="event-impact"><div class="event-impact-head"><span>作用中的事件與影響</span><span>${events.length} 張</span></div>${events.length?events.map(a=>`<div class="effect-entry"><i class="dot scope-dot ${a.scope}"></i><span><b>${h(event(a.eventId).name)}</b> · 剩 ${eventRemaining(a,state.round)} 季<br><em>${h(effectTextForActive(a,p.roleId))}</em></span></div>`).join(''):'<span class="no-events">目前沒有適用的事件</span>'}</div><details class="finance-details"><summary>查看十項收支與事件後數值</summary><table class="flow-table"><tbody>${METRICS.map(m=>`<tr><td>${METRIC_LABELS[m]}</td><td>${signed(f.flows[m])}</td></tr>`).join('')}</tbody></table></details></article>`;
  }).join('')+(room.role?rankingMarkup(mine):'');
}
function rankingMarkup(mine){
  const current=state.status==='playing'?currentPlayer():null;
  return `<section class="net-ranking" aria-labelledby="net-ranking-title"><h3 id="net-ranking-title">淨資產排行</h3><ol>${netWorthRanking(state).map(({player:p,netWorth,rank})=>`<li class="${p===mine?'mine':''} ${p===current?'current':''}"><span class="rank">${rank}</span><span class="rank-dot" style="background:${colors[p.color]}"></span><div><strong>${h(p.name)}${p===mine?'（你）':''}</strong><small>${h(role(p.roleId).name)}${p===current?' · 目前回合':''}</small></div><span class="rank-worth">${money(netWorth)}</span></li>`).join('')}</ol></section>`;
}
function renderMini(){const s=makeSnapshot(state);const fields=[['預估通膨',`${decimal(s.inflationPct,2)}%`],['預估成長',s.growthPct===null?'資料不足':`${decimal(s.growthPct,1)}%`],['失業率',`${decimal(s.unemploymentPct,1)}%`],['政策利率',`${decimal(s.fedRatePct,2)}%`]];$('#mini-economy').innerHTML=fields.map(([label,value])=>`<div class="mini-stat"><span>${label}</span><strong>${value}</strong></div>`).join('')}
function renderGoals(){
  $('#goal-copy').textContent=`淨資產達 ${money(state.targetWealth)}、任一玩家破產，或第 ${state.maxRounds} 季結束。`;
  $('#goal-progress').innerHTML=state.players.map(p=>{const wealth=companyPosition(state,p.roleId).netWorth;return `<div class="goal-person"><span>${h(p.name)}</span><span>${money(wealth)} / ${money(state.targetWealth)}</span></div><div class="goal-track"><i style="width:${Math.max(0,Math.min(100,wealth/state.targetWealth*100))}%"></i></div>`}).join('');
}
function renderEvents(){
  $('#active-events').innerHTML=state.activeEvents.length?state.activeEvents.map(a=>{
    const e=event(a.eventId),remaining=eventRemaining(a,state.round),age=state.round-a.startedRound;
    const target=a.scope==='global'?'全市場適用企業':a.scope==='personal'?`${state.players.find(p=>p.id===a.ownerId)?.name||'玩家'}本人`:`${a.sector}企業`;
    return `<article class="event-card" style="--event-color:${scopeColor[a.scope]}"><div class="event-head"><span class="eyebrow">${e.id} · ${scopes[a.scope]}</span><span class="remaining">剩 ${remaining} 季</span></div><h3>${h(e.name)}</h3><p>${h(target)} · 本季倍率 ${decimal(e.decay[age]*100,1)}%</p><div class="effect-list">${e.effects.map(x=>`<span class="effect-chip">${METRIC_LABELS[x.metric]} ${x.pct>=0?'+':''}${decimal(x.pct*e.decay[age],1)}%</span>`).join('')}</div></article>`;
  }).join(''):'<div class="empty-state">目前沒有作用中的事件。啟動拉霸並停在事件格即可抽卡。</div>';
  $('#event-library').innerHTML=[['全球事件',GLOBAL_EVENTS],['個人事件',PERSONAL_EVENTS],['產業事件',SECTOR_EVENTS]].flatMap(([category,items])=>items.map(e=>`<div class="library-item"><div><strong>${e.id} · ${h(e.name)}</strong><p>${category}${e.sector?` · ${h(e.sector)}`:''} · ${e.effects.map(x=>`${METRIC_LABELS[x.metric]} ${x.pct>=0?'+':''}${x.pct}%`).join('、')}</p></div><span>${e.duration} 季</span></div>`)).join('');
}

const dashboardGroups=[
  {title:'A · 景氣、物價與就業',items:[
    ['inflationPct','本季通膨率','%','2 + 0.08×能源漲幅 + 0.06×原料漲幅'],['previousInflationPct','上季通膨率','%','上一季快照'],['energyChangePct','全市場能源成本漲幅','%','Σ本季能源成本 / Σ基準能源成本 − 1'],['materialChangePct','全市場原物料成本漲幅','%','Σ本季原物料成本 / Σ基準原物料成本 − 1'],['revenueTotal','本季營收總額','幣','Σ企業調整後營收'],['previousRevenueTotal','上季營收總額','幣','上一季快照'],['growthPct','本季營收成長率','%','本季營收 / 上季營收 − 1'],['previousGrowthPct','上季營收成長率','%','上一季快照'],['laborForce','勞動人口','人','固定勞動人口 1,000'],['employed','就業人口','人','Σ企業員工人數'],['unemployed','失業人口','人','勞動人口 − 就業人口'],['unemploymentPct','本季失業率','%','失業人口 / 勞動人口'],['previousUnemploymentPct','上季失業率','%','上一季快照']]},
  {title:'B · 股市與信貸',items:[
    ['stockIndex','本季股市指數','點','100 × (1 + 全球市場事件與 QE/QT 衝擊)'],['previousStockIndex','上季股市指數','點','上一季快照；第 0 季基準 100'],['stockIndex3Ago','三季前股市指數','點','第 t−3 季快照'],['stockReturn1Pct','單季股市變化','%','本季指數 / 上季指數 − 1'],['stockReturn3Pct','三季股市變化','%','本季指數 / 三季前指數 − 1'],['totalLoans','本季總放款','幣','銀行放款存量'],['totalLoans3Ago','三季前總放款','幣','第 t−3 季快照'],['loanGrowth3Pct','三季放款成長','%','本季放款 / 三季前放款 − 1']]},
  {title:'C · 銀行風險',items:[
    ['liquidAssets','流動資產','幣','銀行流動資產存量'],['shortTermLiabilities','短期負債','幣','銀行短期負債存量'],['liquidityPct','流動性比率','%','流動資產 / 短期負債'],['nonperformingLoans','不良放款','幣','銀行壞帳存量'],['nplPct','不良放款率','%','不良放款 / 總放款']]},
  {title:'D · 聯準會政策',items:[
    ['fedRatePct','本季政策利率','%','基準 4%，政策變動為持久狀態'],['rateCooldownRounds','利率冷卻剩餘','季','利率決策後 t+1、t+2 季冷卻'],['monetaryProgram','QE / QT 狀態','','兩季估值與利息效果'],['monetaryProgramRoundsLeft','QE / QT 剩餘','季','方案生效兩季']]}
];
function selectedSnapshot(){if(snapshotSelection==='preview'||!state.economicHistory.length)return {snapshot:makeSnapshot(state),preview:true};const n=snapshotSelection==='latest'?state.economicHistory.at(-1).round:Number(snapshotSelection);return {snapshot:getEconomicSnapshot(state,n)||state.economicHistory.at(-1),preview:false}}
function metricValue(s,key,unit){const value=s[key];if(key==='monetaryProgram')return `<strong>${value||'無'}</strong>`;if(value===null||value===undefined)return '<strong class="missing">—（資料不足）</strong>';const d=unit==='%'?2:unit==='點'?1:0;return `<strong>${Number(value).toLocaleString('zh-TW',{minimumFractionDigits:d,maximumFractionDigits:d})}${unit?` <small>${unit}</small>`:''}</strong>`}
function renderDashboard(){
  const options=[`<option value="preview">第 ${state.round} 季 · 目前預估</option>`,...state.economicHistory.slice().reverse().map(s=>`<option value="${s.round}">第 ${s.round} 季 · 已結算</option>`)];
  $('#snapshot-select').innerHTML=options.join('');
  $('#snapshot-select').value=snapshotSelection==='latest'&&state.economicHistory.length?String(state.economicHistory.at(-1).round):snapshotSelection;
  if(!$('#snapshot-select').value){snapshotSelection='latest';$('#snapshot-select').value=state.economicHistory.length?String(state.economicHistory.at(-1).round):'preview'}
  const {snapshot:s,preview}=selectedSnapshot();
  const dateLabel=`第 ${s.round} 季${preview?' · 尚未結算的預估':' · 已結算快照'}`;
  $('#dashboard-body').innerHTML=`<div class="dashboard-banner">${dateLabel}｜${preview?'本季抽卡與經營調整會立即更新預估；聯準會只讀取結算後保存的快照。':'以下數值與 F01–F10 判斷來自同一份已儲存快照。'} 缺少歷史值時顯示「資料不足」。</div>${dashboardGroups.map(g=>`<section class="dashboard-section"><h3>${g.title}</h3><div class="metric-grid">${g.items.map(([key,name,unit,formula])=>`<article class="metric-card"><span class="metric-name">${name}</span>${metricValue(s,key,unit)}<small>來源：${dateLabel} · ${s[key]===null&&key!=='monetaryProgram'?'資料不足':preview?'預估':'已結算'}</small><div class="formula">${formula}</div></article>`).join('')}</div></section>`).join('')}<section class="dashboard-section"><h3>D · 十條規則雷達</h3>${preview?'<div class="empty-state">本季規則會在所有玩家完成行動後評估。</div>':renderRuleList(getFedRuleEvaluations(state,s.round))}</section>`;
}
const statusNames={selected:'已採用',matched:'符合',not_matched:'未符合',insufficient_data:'資料不足',suppressed_by_priority:'優先序覆蓋',rate_cooldown:'利率冷卻'};
function renderRuleList(items){if(!items)return '<div class="empty-state">尚無規則評估。</div>';return `<div class="rule-list">${FED_RULES.map(r=>{const x=items.find(e=>e.ruleId===r.id);return `<article class="rule-card"><div class="rule-top"><h3>${r.id} · ${r.name}</h3><span class="status-pill ${x.status}">${statusNames[x.status]}</span></div><p>${x.comparisons.map(h).join('<br>')}</p><p>${h(x.reason||r.formula)}</p><code>欄位：${r.fields.join('、')}</code></article>`}).join('')}</div>`}
function renderFed(){
  const latest=state.economicHistory.at(-1);
  if(!latest){$('#fed-body').innerHTML='<div class="empty-state">第 1 季結算後，這裡會列出十條規則的比較數值、優先序及政策決策。</div>';return}
  const decision=getFedDecision(state,latest.round),evals=getFedRuleEvaluations(state,latest.round);
  const rulesOpen=$('#fed-rules')?.open;
  $('#fed-body').innerHTML=`<div class="fed-hero"><div><span>第 ${latest.round} 季已生效利率</span><strong>${decimal(latest.fedRatePct,2)}%</strong></div><div><span>候選／採用規則</span><strong>${decision.ruleId||'無'}</strong></div><div><span>本季政策結論</span><strong>${h(decision.action)}</strong></div><div><span>生效季數／冷卻</span><strong>第 ${decision.nextEffectiveRound} 季 · ${latest.rateCooldownRounds} 季</strong></div></div><details id="fed-rules" class="disclosure-panel" ${rulesOpen?'open':''}><summary><span><small>RULE EVALUATION</small><strong>規則判斷</strong><em>優先序：F08 → F09 → F07 → F03 → F01 → F06 → F04 → F02 → F05 → F10</em></span><i aria-hidden="true">⌄</i></summary><div class="disclosure-content">${renderRuleList(evals)}</div></details>`;
}
function chart(data,key,title,color){if(!data.length)return `<div class="empty-state">${title}：等待第一季結算。</div>`;const values=data.map(x=>x[key]).filter(Number.isFinite),min=Math.min(...values),max=Math.max(...values),span=max-min||1;const points=data.map((s,i)=>`${35+(i/(Math.max(data.length-1,1)))*660},${165-((s[key]-min)/span)*125}`).join(' ');return `<div class="history-chart"><h3>${title}</h3><svg viewBox="0 0 730 190" role="img" aria-label="${title}歷史折線圖"><line x1="30" y1="165" x2="700" y2="165" stroke="#dfe8e3"/><polyline points="${points}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${data.map((s,i)=>{const x=35+(i/Math.max(data.length-1,1))*660,y=165-((s[key]-min)/span)*125;return `<circle cx="${x}" cy="${y}" r="4" fill="${color}"><title>第 ${s.round} 季：${decimal(s[key],1)}</title></circle><text x="${x}" y="185" text-anchor="middle" font-size="10" fill="#899b93">${s.round}</text>`}).join('')}</svg><div class="chart-legend"><span><i style="background:${color}"></i>${title} · 依已結算快照</span></div></div>`}
function renderHistory(){const data=state.economicHistory;$('#history-body').innerHTML=`<div class="history-layout"><div>${chart(data,'revenueTotal','全市場營收', '#0e9186')}${chart(data,'stockIndex','股市指數', '#597bae')}</div><div><div class="history-chart"><h3>各季數據</h3>${data.length?`<div style="overflow:auto"><table class="history-table"><thead><tr><th>季數</th><th>通膨</th><th>成長</th><th>失業</th><th>利率</th></tr></thead><tbody>${data.slice().reverse().map(s=>`<tr><td>${s.round}</td><td>${decimal(s.inflationPct,1)}%</td><td>${s.growthPct===null?'—':decimal(s.growthPct,1)+'%'}</td><td>${decimal(s.unemploymentPct,1)}%</td><td>${decimal(s.fedRatePct,2)}%</td></tr>`).join('')}</tbody></table></div>`:'<p class="muted">尚無已結算季數。</p>'}</div><div class="history-chart"><h3>遊戲動態</h3><div class="log-list">${state.log.length?state.log.slice(0,60).map(x=>`<div class="log-item">${h(x)}</div>`).join(''):'<div class="log-item">等待玩家啟動拉霸。</div>'}</div></div></div></div>`}
function render(){
  const onHome=page==='home',waitingForHost=isGuest()&&!state;
  renderRoom();
  $('#room-wait').hidden=onHome||!waitingForHost;
  $('#round-badge').hidden=onHome||!state;
  $('#home').hidden=!onHome;
  $('#home-btn').classList.toggle('active',onHome);
  if(onHome){
    $('#setup').hidden=true;$('#game').hidden=true;
    $('#home-play-btn').textContent=state?'返回對局 →':'設定玩家，開始遊戲 →';
    $('#home-status').textContent=state?`已有對局 · 第 ${state.round} 季，返回後可繼續遊玩。`:'一台電腦就能開始，大家輪流操作。';
    return;
  }
  if(!state){$('#setup').hidden=waitingForHost;$('#game').hidden=true;if(!waitingForHost)renderSetup();return}
  $('#setup').hidden=true;$('#game').hidden=false;
  $('#round-number').textContent=String(state.round).padStart(2,'0');$('#round-limit').textContent=`／${state.maxRounds} 季`;
  document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));document.querySelectorAll('.tab-page').forEach(p=>p.classList.toggle('active',p.id===`tab-${tab}`));
  renderBoard();renderTurn();renderMini();renderGoals();renderPlayers();renderEvents();renderDashboard();renderFed();renderHistory();
}
function showCard(active){if(!active)return;const e=event(active.eventId);$('#modal-kicker').textContent=`${scopes[active.scope]} · ${e.id}`;$('#modal-title').textContent=e.name;$('#modal-target').textContent=`作用 ${e.duration} 季；${active.scope==='global'?'所有適用企業同時受影響':active.scope==='sector'?`${active.sector}所有企業受影響`:'只影響抽卡玩家'}`;$('#modal-effects').innerHTML=e.effects.map(x=>`<span class="effect-chip">${METRIC_LABELS[x.metric]} ${x.pct>=0?'+':''}${x.pct}%</span>`).join('');$('#card-modal').hidden=false}
function closeCard(){$('#card-modal').hidden=true}
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function moveTokenStep(position){
  animation?.visited.add(position);
  const token=$('#board .token.moving'),destination=$(`#board [data-tile-index="${position}"] .tile-tokens`);
  if(!token||!destination||tab!=='business'||page!=='game')return;
  const from=token.getBoundingClientRect();
  $('#board .tile-active')?.classList.remove('tile-active');
  destination.closest('.tile').classList.add('tile-active','tile-visited');
  destination.appendChild(token);
  const to=token.getBoundingClientRect();
  token.style.transition='none';
  token.style.transform=`translate(${from.left-to.left}px, ${from.top-to.top}px)`;
  token.getBoundingClientRect();
  requestAnimationFrame(()=>{
    if(!token.isConnected)return;
    token.style.transition=`transform ${MOVE_MS-80}ms linear`;
    token.style.transform='translate(0,0)';
  });
}
function beginRollAnimation({playerId,from,dice,reels,path}){
  if(!state||state.players[state.turnIndex]?.id!==playerId||state.dice!==dice)return;
  if(document.hidden||tab!=='business'||page!=='game')return;
  cancelAnimation();
  const serial=animationSerial;
  const finalReels=Array.isArray(reels)&&reels.length===2?reels:[0,0];
  const fullRoute=path||movementPath(from,dice),ghostStep=state.phase==='strike'?fullRoute.indexOf(state.ghostPosition):-1;
  const route=ghostStep>=0?fullRoute.slice(0,ghostStep+1):fullRoute;
  animation={playerId,position:from,dice,reels:finalReels,path:route,displayReels:[0,0],reelPositions:[0,0],spinning:[true,true],visited:new Set(),stage:'rolling'};
  renderBoard();renderTurn();
  void (async()=>{
    const stopTicks=[10,17];
    for(let tick=0;tick<19;tick++){
      await pause(125);
      if(serial!==animationSerial)return;
      const windows=document.querySelectorAll('#board .slot-reel');
      for(let i=0;i<2;i++){
        if(!animation.spinning[i])continue;
        if(tick<stopTicks[i])animation.reelPositions[i]++;
        else {
          const difference=(finalReels[i]-animation.reelPositions[i]%7+7)%7;
          animation.reelPositions[i]+=difference||7;
          animation.spinning[i]=false;
        }
        animation.displayReels[i]=animation.reelPositions[i]%7;
        const reel=windows[i];if(!reel)continue;
        reel.querySelector('.slot-strip').style.transform=`translateY(-${animation.reelPositions[i]*100}%)`;
        reel.classList.toggle('spinning',animation.spinning[i]);
        reel.setAttribute('aria-label',`第 ${i+1} 個轉輪：${animation.displayReels[i]}`);
      }
    }
    if(serial!==animationSerial)return;
    animation.displayReels=[...finalReels];animation.spinning=[false,false];
    animation.stage='result';renderBoard();renderTurn();
    await pause(1000);
    if(serial!==animationSerial)return;
    animation.stage='moving';renderBoard();renderTurn();
    for(const position of animation.path){
      if(serial!==animationSerial)return;
      animation.position=position;moveTokenStep(position);
      await pause(MOVE_MS);
    }
    if(serial!==animationSerial)return;
    animation=null;renderBoard();renderTurn();
  })();
}

async function rollWithAnimation(){
  if(animation)return BUSY_MESSAGE;
  let result=null,from=null,playerId=null,error=null;
  try{
    await withGameLock(()=>{
      if(!ensureFresh()){error='對局已由其他頁籤更新，請確認後再操作。';return}
      const player=currentPlayer();from=player.position;playerId=player.id;
      result=rollDice(state);save();render();
    });
    if(result)beginRollAnimation({playerId,from,dice:result.dice,reels:result.reels,path:result.path});
  }catch(e){error=e.message||'無法啟動拉霸';notify(error)}
  return error;
}
const AMOUNT_INPUTS={hire:'#staff-count',layoff:'#staff-count',loan:'#loan-amount',repay:'#loan-amount','mark-bad':'#bad-amount','recover-bad':'#bad-amount'};
// Shared by local clicks and actions a room host receives from guests; resolves to an error message or null.
async function applyAction(action,amount,remote=false){
  if(action==='roll')return rollWithAnimation();
  if(animation)return BUSY_MESSAGE;
  if(action==='draw-card')return run(()=>drawEvent(state));
  if(state.phase==='draw')return remote?'請先抽事件卡。':null;
  if(!remote&&currentCard())return null;
  if(action==='end-turn')return run(()=>{const result=endTurn(state);if(result){snapshotSelection='latest';rememberView();notify(result.finished?'對局結束，請查看勝負結果。':`第 ${result.snapshot.round} 季已結算。`)}});
  return run(()=>{const id=currentPlayer().id,n=amount;if(action==='hire')adjustStaff(state,id,n);else if(action==='layoff')adjustStaff(state,id,-n);else if(action==='loan')issueLoan(state,id,n);else if(action==='repay')repayLoan(state,id,n);else if(action==='mark-bad')updateBadLoans(state,id,n);else if(action==='recover-bad')updateBadLoans(state,id,-n)});
}

const PEERJS_URL='https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js',PEERJS_SRI='sha384-nlUQ8ZqCbvStErob+biJNzSgltf6urV3VGqhfIfzhmg9RXmpeRm76ELw0pYnKlTR';
let peerLoading=null;
// A WebRTC link that a network blocks can stall silently, so a connection that has not opened by then is given up.
const CONNECT_TIMEOUT_MS=15000;
const P2P_FAILED='連不上房主：房間有找到，但兩台裝置之間的直接連線沒有建立成功。學校或公司網路常會擋這種連線，建議所有裝置都改連同一個手機熱點後再試一次。';
const SIGNAL_FAILED='連線逾時：連不上配對伺服器，請確認網路後再試。';
const ROOM_NOT_FOUND='找不到這個房間。請確認代碼沒有打錯；如果沒錯，請房主確認遊戲頁面開在最前面：手機鎖螢幕、切到別的 App 或頁籤時，房間會暫時離線；房主重新整理頁面則會換新代碼。';
// PeerJS emits 'disconnected' again after every failed reconnect, so attempts are spaced out instead of looping.
const SIGNAL_RETRY_MS=5000;
// PeerJS is only fetched when a room is used, so single-device play never needs the network.
function loadPeerJs(){
  if(globalThis.Peer)return Promise.resolve();
  return peerLoading||=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=PEERJS_URL;s.integrity=PEERJS_SRI;s.crossOrigin='anonymous';s.onload=()=>resolve();s.onerror=()=>{peerLoading=null;s.remove();reject(Error('無法載入連線元件，請確認網路連線。'))};document.head.appendChild(s)});
}
function isHost(){return room.role==='host'}
function isGuest(){return room.role==='guest'}
function roomHostId(){return isHost()?clientId:room.hostClientId}
function syncSeats(){const gameId=state?syncInfo(state).gameId:null;if(room.seatsGameId!==gameId){room.seats={};room.seatsGameId=gameId}}
function iCanAct(){if(!room.role)return true;if(isHost())syncSeats();return canAct(room.seats,state,clientId)}
function mySeat(){if(isHost())syncSeats();const id=Object.keys(room.seats).find(k=>room.seats[k]===clientId);return state?.players.find(p=>p.id===id)||null}
function missingSeats(){if(isHost())syncSeats();return state?emptySeats(room.seats,state.players.map(p=>p.id)).map(id=>state.players.find(p=>p.id===id)):[]}
const SEATS_MISSING='還有玩家沒入座，大家都坐好後才能開始。';
function onlineClients(){return isHost()?[clientId,...[...room.guests].filter(g=>g.clientId&&g.conn.open).map(g=>g.clientId)]:room.online}
function sendSafe(conn,message){try{if(conn?.open)conn.send(message)}catch{}}
function roomSnapshot(welcome=false){
  syncSeats();
  return {t:'state',welcome,game:state?JSON.stringify({...state,log:state.log.slice(0,60)}):null,seats:room.seats,online:onlineClients(),hostClientId:clientId};
}
function broadcastRoom(){
  if(!isHost())return;
  const message=roomSnapshot();
  for(const g of room.guests)if(g.clientId)sendSafe(g.conn,message);
  renderRoom();
}
function resetRoom(extra={}){
  const peer=room.peer;
  clearTimeout(room.reconnectTimer);clearTimeout(room.connectTimer);clearTimeout(room.signalTimer);
  Object.assign(room,{role:null,code:'',peer:null,guests:new Set(),hostConn:null,seats:{},seatsGameId:null,online:[],hostClientId:'',status:'',error:'',retries:0,reconnectTimer:null,connectTimer:null,signalTimer:null,offline:false,seatPromptFor:null,synced:false},extra);
  setTimeout(()=>{try{peer?.destroy()}catch{}},300);
}

async function createRoom(){
  if(room.role)return;
  room.error='';room.status='正在建立房間…';renderRoom();
  try{await loadPeerJs()}catch(e){room.status='';room.error=e.message;renderRoom();return}
  openHostPeer(0);
}
function openHostPeer(attempt){
  const code=makeRoomCode(),peer=new Peer(roomPeerId(code));
  let opened=false;
  Object.assign(room,{role:'host',code,peer,closed:false,hostClientId:clientId,status:'正在建立房間…',error:'',offline:false});
  peer.on('open',()=>{
    if(room.peer!==peer)return;
    if(room.offline)notify('房間恢復連線，其他裝置可以再加入了。');
    opened=true;room.offline=false;room.status='房間已開啟，等待其他裝置加入';render();
  });
  peer.on('connection',conn=>{if(room.peer===peer)acceptGuest(conn)});
  peer.on('disconnected',()=>{if(room.peer===peer&&opened)hostSignalLost()});
  peer.on('error',err=>{
    if(room.peer!==peer)return;
    // Once the code is handed out, losing the matching server only ends in 'disconnected': the room, its code
    // and the guests already connected stay, and the same code is registered again when the server is back.
    if(opened)return;
    if(err.type==='unavailable-id'&&attempt<4){peer.destroy();openHostPeer(attempt+1);return}
    resetRoom({error:`無法建立房間（${err.type||'未知錯誤'}），請確認網路後再試。`});render();
  });
  render();
}
function hostSignalLost(){
  if(!room.offline)notify('房間暫時離線，新的裝置暫時加不進來；恢復後會通知你。');
  room.offline=true;room.status='房間暫時離線：已加入的裝置可以繼續玩，新的裝置要等恢復連線才能加入。正在自動重新連線…';
  scheduleSignalRetry();renderRoom();
}
function scheduleSignalRetry(){clearTimeout(room.signalTimer);room.signalTimer=setTimeout(retrySignal,SIGNAL_RETRY_MS)}
function retrySignal(){
  clearTimeout(room.signalTimer);room.signalTimer=null;
  const peer=room.peer;
  if(peer?.disconnected&&!peer.destroyed)try{peer.reconnect()}catch{}
}
function acceptGuest(conn){
  const guest={conn,clientId:null};
  room.guests.add(guest);
  conn.on('data',raw=>onGuestMessage(guest,raw));
  conn.on('close',()=>{if(room.guests.delete(guest))broadcastRoom()});
  conn.on('error',()=>{});
  // PeerJS never emits 'close' for a connection that failed before opening, so drop guests that never said hello.
  setTimeout(()=>{
    if(guest.clientId||!room.guests.delete(guest))return;
    if(!conn.open)notify('有一台裝置想連進房間，但連線沒有成功；對方可以改用手機熱點再試。');
    try{conn.close()}catch{}
  },CONNECT_TIMEOUT_MS);
}
function onGuestMessage(guest,raw){
  const msg=parseGuestMessage(raw);if(!msg)return;
  if(msg.t==='hello'){
    for(const other of room.guests)if(other!==guest&&other.clientId===msg.clientId){room.guests.delete(other);try{other.conn.close()}catch{}}
    const returning=Object.values(room.seats).includes(msg.clientId);
    guest.clientId=msg.clientId;
    sendSafe(guest.conn,roomSnapshot(true));
    broadcastRoom();render();notify(returning?'一台裝置重新連上房間。':'有一台裝置加入房間。');
    return;
  }
  if(!guest.clientId)return;
  const reject=message=>sendSafe(guest.conn,{t:'reject',message});
  if(msg.t==='claim'){
    if(!state){reject('房主還沒開始對局。');return}
    syncSeats();
    try{room.seats=claimSeat(room.seats,state.players.map(p=>p.id),msg.playerId,guest.clientId)}catch(e){reject(e.message);return}
    broadcastRoom();render();return;
  }
  // Actions run one at a time and the turn owner is checked when each one runs, so a double-clicked
  // "交給下一位" cannot end the next player's turn too.
  room.queue=room.queue.then(async()=>{
    syncSeats();
    if(!state||!canAct(room.seats,state,guest.clientId)){reject(missingSeats().length?SEATS_MISSING:'還沒輪到你操作。');return}
    const error=await applyAction(msg.action,msg.amount,true);
    if(error)reject(error);
  }).catch(()=>{});
}
function closeRoom(){
  for(const g of room.guests)sendSafe(g.conn,{t:'closed'});
  resetRoom({closed:true});render();
}

async function joinRoom(input){
  const code=normalizeRoomCode(input);
  if(!code){room.error='房間代碼是 5 個英文字母或數字。';renderRoom();return}
  if(room.role)return;
  room.prefill=code;room.error='';room.status='正在連線…';renderRoom();
  try{await loadPeerJs()}catch(e){room.status='';room.error=e.message;renderRoom();return}
  const peer=new Peer();
  Object.assign(room,{role:'guest',code,peer,closed:false,retries:0,synced:false,status:'正在連線…'});
  armConnectTimeout();
  peer.on('open',()=>{if(room.peer===peer)connectToHost()});
  peer.on('disconnected',()=>{if(room.peer===peer)scheduleSignalRetry()});
  peer.on('error',err=>{
    if(room.peer!==peer)return;
    if(room.synced){if(err.type==='peer-unavailable')scheduleReconnect();return}
    failJoin(err.type==='peer-unavailable'?ROOM_NOT_FOUND:`無法連線（${err.type||'未知錯誤'}），請確認網路後再試。`);
  });
  render();
}
function failJoin(error){resetRoom({error});$('#room-modal').hidden=false;render()}
function connectToHost(){
  const conn=room.peer.connect(roomPeerId(room.code),{reliable:true});
  room.hostConn=conn;
  armConnectTimeout();
  conn.on('open',()=>{if(room.hostConn!==conn)return;clearTimeout(room.connectTimer);room.connectTimer=null;room.retries=0;room.status='已連線';conn.send({t:'hello',clientId});renderRoom()});
  conn.on('data',msg=>{if(room.hostConn===conn)onHostMessage(msg)});
  conn.on('close',()=>{if(room.hostConn===conn&&isGuest()&&!room.closed)dropHostConn()});
  // A connection that fails before opening only emits 'error'; one that stalls emits nothing until the timeout.
  conn.on('error',()=>{if(room.hostConn===conn&&!conn.open&&isGuest()&&!room.closed)dropHostConn()});
}
function armConnectTimeout(){
  clearTimeout(room.connectTimer);
  room.connectTimer=setTimeout(()=>{room.connectTimer=null;if(isGuest()&&!room.closed&&!room.hostConn?.open)dropHostConn()},CONNECT_TIMEOUT_MS);
}
// A guest already in the game keeps retrying; one that never got in sees why and is back on the join form.
function dropHostConn(){
  clearTimeout(room.connectTimer);room.connectTimer=null;
  const conn=room.hostConn;room.hostConn=null;try{conn?.close()}catch{}
  if(room.synced){scheduleReconnect();return}
  failJoin(room.peer?.open?P2P_FAILED:SIGNAL_FAILED);
}
function scheduleReconnect(){
  if(room.reconnectTimer||room.closed)return;
  if(room.retries++>=15){room.status='房主已離線，房間無法使用。';renderRoom();return}
  room.status='與房主斷線，重新連線中…';renderRoom();
  room.reconnectTimer=setTimeout(()=>{room.reconnectTimer=null;if(isGuest()&&!room.closed&&room.peer&&!room.peer.destroyed)connectToHost()},3000);
}
function onHostMessage(msg){
  if(!msg||typeof msg!=='object')return;
  if(msg.t==='reject'){notify(String(msg.message||'房主沒有接受這個操作。').slice(0,120));return}
  if(msg.t==='closed'){room.closed=true;room.status='房主已關閉房間';try{room.hostConn?.close()}catch{}notify('房主已關閉房間，畫面停在最後的狀態。');render();return}
  if(msg.t!=='state')return;
  room.seats=msg.seats&&typeof msg.seats==='object'?Object.fromEntries(Object.entries(msg.seats).filter(([,v])=>typeof v==='string')):{};
  room.online=Array.isArray(msg.online)?msg.online.filter(x=>typeof x==='string'):[];
  room.hostClientId=typeof msg.hostClientId==='string'?msg.hostClientId:'';
  if(msg.welcome){room.synced=true;page='game'}
  if(typeof msg.game!=='string'){cancelAnimation();closeCard();state=null;render();return}
  let incoming;try{incoming=importGame(msg.game)}catch{return}
  const before=state&&!msg.welcome?{round:state.round,status:state.status}:null;
  if(msg.welcome){cancelAnimation();state=null}
  if(!adoptShared(incoming)){render();return}
  $('#save-status').textContent=`房間 ${room.code} 同步中`;
  if(before?.status==='playing'&&incoming.status!=='playing')notify('對局結束，請查看勝負結果。');
  else if(before&&incoming.round>before.round){snapshotSelection='latest';rememberView();notify(`第 ${before.round} 季已結算。`)}
}
function sendToHost(message){if(!room.hostConn?.open){notify('尚未連上房主，請稍候。');return}sendSafe(room.hostConn,message)}
function claimSeatHere(playerId){
  const player=state?.players.find(p=>p.id===playerId);
  if(!player||!confirm(`確定要當「${player.name}」嗎？確認後就不能自己換位子${isHost()?'；要換可以先收回自己的座位':'，選錯了請房主收回'}。`))return;
  if(isGuest()){sendToHost({t:'claim',playerId});return}
  if(!isHost()||!state)return;
  syncSeats();
  try{room.seats=claimSeat(room.seats,state.players.map(p=>p.id),playerId,clientId)}catch(e){notify(e.message);return}
  broadcastRoom();render();
}
function kickSeat(playerId){if(!isHost())return;room.seats=releaseSeat(room.seats,playerId);broadcastRoom();render()}
function leaveRoom(){
  if(isHost()){if(!confirm('關閉房間後，其他裝置會停止同步。要關閉嗎？'))return;closeRoom();notify('房間已關閉。');return}
  if(!isGuest())return;
  // Reloading without ?room= brings back this device's own saved game, which a guest never overwrote.
  room.closed=true;try{room.peer?.destroy()}catch{}
  const url=new URL(location.href);url.searchParams.delete('room');location.replace(url.href);
}
function roomLink(){const url=new URL(location.href);url.search='';url.hash='';url.searchParams.set('room',room.code);return url.href}
async function copyText(text,done){try{await navigator.clipboard.writeText(text);notify(done)}catch{notify(`無法自動複製，請手動記下：${text}`)}}
function seatListMarkup(){
  if(!state)return `<p class="room-note">${isHost()?'開始對局後':'房主開始對局後'}，這裡會列出每位玩家的座位。</p>`;
  const host=roomHostId(),online=onlineClients(),seated=!!mySeat();
  return `<ul class="room-seats">${state.players.map(p=>{
    const owner=room.seats[p.id],mine=owner===clientId;
    const who=mine?'你':!owner?'空位':owner===host?'房主':online.includes(owner)?'另一台裝置':'離線中的裝置';
    // Seats are locked once taken: only the host can free one; a seated device sees no other seat to take.
    const button=owner&&isHost()?`<button type="button" class="quiet" data-room="kick" data-player="${h(p.id)}">收回</button>`:mine?'<span class="room-seat-locked">已鎖定</span>':!owner&&!seated?`<button type="button" class="secondary" data-room="claim" data-player="${h(p.id)}">坐這裡</button>`:'';
    return `<li class="room-seat ${mine?'mine':''}"><span class="room-seat-dot" style="background:${colors[p.color]}"></span><div><strong>${h(p.name)}</strong><small>${h(role(p.roleId).name)} · ${who}</small></div>${button}</li>`;
  }).join('')}</ul>`;
}
function roomBodyMarkup(){
  const status=room.status?`<p class="room-status${room.offline?' offline':''}" role="status">${h(room.status)}</p>`:'';
  const error=room.error?`<p class="form-error" role="alert">${h(room.error)}</p>`:'';
  if(isHost())return `<p class="eyebrow">房主 · HOST</p><h2 id="room-title">房間代碼</h2><div class="room-code">${h(room.code)}</div>${status}<div class="room-share"><button type="button" class="secondary" data-room="copy-code">複製代碼</button><button type="button" class="secondary" data-room="copy-link">複製邀請連結</button></div><section class="room-section"><h3>座位</h3><p class="room-note">每台裝置各選一位玩家，這台也要選；選了就不能自己換。所有玩家都有人坐之後才能開始，選錯可以按「收回」。</p>${seatListMarkup()}</section><button type="button" class="quiet room-leave" data-room="leave">關閉房間</button>`;
  if(isGuest())return `<p class="eyebrow">訪客 · GUEST</p><h2 id="room-title">房間 ${h(room.code)}</h2>${status}<section class="room-section"><h3>選擇你的座位</h3><p class="room-note">選一位玩家當你自己，確認後不能自己換位子，選錯請房主收回。所有玩家都有人坐之後才能開始。</p>${seatListMarkup()}</section><button type="button" class="quiet room-leave" data-room="leave">離開房間</button>`;
  const typed=$('#room-code-input')?.value??room.prefill??'';
  const fileWarning=location.protocol==='file:'?'<p class="form-error">目前是直接開啟檔案。其他裝置需要用網址（例如 GitHub Pages）開啟同一個遊戲才能加入。</p>':'';
  return `<p class="eyebrow">MULTI-DEVICE ROOM</p><h2 id="room-title">多裝置房間</h2><p class="room-lead">一台裝置建立房間，其他裝置輸入代碼加入；每台裝置只操作自己認領的玩家。</p>${fileWarning}<section class="room-section"><h3>建立房間</h3><p class="room-note">這台裝置會當主機並保存對局，遊戲期間請保持這個頁面開著。</p><button type="button" class="primary" data-room="create">建立房間</button></section><section class="room-section"><h3>加入房間</h3><div class="room-join"><input id="room-code-input" maxlength="7" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="例如 K7P2Q" aria-label="房間代碼" value="${h(typed)}"><button type="button" class="secondary" data-room="join">加入</button></div><p class="room-note">加入後會顯示房主的對局；離開房間就回到這台裝置原本的對局。</p></section>${error}${status}`;
}
function renderRoom(){
  promptSeat();
  const chip=$('#room-chip'),mine=room.role&&state?mySeat():null;
  chip.hidden=!room.role;
  if(room.role)chip.textContent=`房間 ${room.code} · ${isHost()?(room.offline?'暫時離線':`${onlineClients().length} 台裝置`):room.status==='已連線'&&state?(mine?`你：${mine.name}`:'還沒選座位'):room.status}`;
  $('#room-btn').classList.toggle('active',!!room.role);
  document.body.classList.toggle('room-guest',isGuest());
  if(!$('#room-modal').hidden)$('#room-body').innerHTML=roomBodyMarkup();
}
// Anyone without a seat is shown the seat list once per game, even if they closed the room dialog before the host started.
function promptSeat(){
  if(!room.role||state?.status!=='playing'||isGuest()&&!room.synced)return;
  const gameId=syncInfo(state).gameId;
  if(room.seatPromptFor===gameId)return;
  room.seatPromptFor=gameId;
  if(!mySeat()&&missingSeats().length)$('#room-modal').hidden=false;
}
function openRoomModal(){$('#room-modal').hidden=false;renderRoom();$('#room-code-input')?.focus()}
function closeRoomModal(){$('#room-modal').hidden=true}

$('#add-player').addEventListener('click',()=>{if(setupPlayers.length<8){const used=new Set(setupPlayers.map(x=>x.roleId));let number=1;while(setupPlayers.some(x=>x.name===`玩家 ${number}`))number++;setupPlayers.push({name:`玩家 ${number}`,roleId:ROLES.find(x=>!used.has(x.id)).id});renderSetup()}});
$('#setup-players').addEventListener('input',e=>{if(e.target.dataset.setupName!==undefined)setupPlayers[Number(e.target.dataset.setupName)].name=e.target.value});
$('#setup-players').addEventListener('change',e=>{if(e.target.dataset.setupRole!==undefined)setupPlayers[Number(e.target.dataset.setupRole)].roleId=e.target.value});
$('#setup-players').addEventListener('click',e=>{const i=e.target.dataset.removePlayer;if(i!==undefined&&setupPlayers.length>2){setupPlayers.splice(Number(i),1);renderSetup()}});
$('#start-btn').addEventListener('click',async()=>{if(isGuest())return;try{await withGameLock(()=>{const saved=readStored();if(saved){adoptShared(saved);notify('已加入另一個頁籤的對局。');return}const next=createGame({players:setupPlayers,targetWealth:$('#target-input').value,maxRounds:$('#rounds-input').value});prepareNewSession(next);state=next;page='game';$('#setup-error').textContent='';tab='business';snapshotSelection='preview';rememberView();save();render()})}catch(e){$('#setup-error').textContent=e.message}});
$('.tabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;tab=b.dataset.tab;rememberView();render();window.scrollTo({top:0,behavior:'smooth'})});
$('#snapshot-select').addEventListener('change',e=>{snapshotSelection=e.target.value;rememberView();renderDashboard()});
$('#game').addEventListener('click',e=>{
  const a=e.target.closest('[data-action]');if(!a||!state)return;
  const action=a.dataset.action;
  if(action==='new-game'){void resetGame();return}
  if(action==='dismiss-card'){if(animation)return;dismissedCardKey=currentCard()?.key||null;renderBoard();renderTurn();return}
  if(!iCanAct()){notify(missingSeats().length?SEATS_MISSING:'還沒輪到你，請等待目前的玩家操作。');return}
  const amount=AMOUNT_INPUTS[action]?Number($(AMOUNT_INPUTS[action])?.value):undefined;
  if(isGuest()){
    if(animation)return;
    if(state.phase==='draw'&&action!=='draw-card'&&action!=='roll')return;
    if(action!=='roll'&&action!=='draw-card'&&currentCard())return;
    sendToHost({t:'action',action,amount});return;
  }
  void applyAction(action,amount);
});
document.querySelectorAll('[data-close-modal]').forEach(x=>x.addEventListener('click',closeCard));
twoColumnPlayerCards.addEventListener('change',()=>{if(state&&page==='game'&&tab==='business')renderPlayers()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeCard();closeRoomModal()}});
$('#room-btn').addEventListener('click',openRoomModal);
$('#room-chip').addEventListener('click',openRoomModal);
$('#room-modal').addEventListener('click',e=>{
  if(e.target.closest('[data-close-room]')){closeRoomModal();return}
  const b=e.target.closest('[data-room]');if(!b)return;
  const what=b.dataset.room;
  if(what==='create')void createRoom();
  else if(what==='join')void joinRoom($('#room-code-input')?.value);
  else if(what==='copy-code')void copyText(room.code,'已複製房間代碼。');
  else if(what==='copy-link')void copyText(roomLink(),'已複製邀請連結。');
  else if(what==='claim')claimSeatHere(b.dataset.player);
  else if(what==='kick')kickSeat(b.dataset.player);
  else if(what==='leave')leaveRoom();
});
$('#room-modal').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='room-code-input')void joinRoom(e.target.value)});
window.addEventListener('pagehide',()=>{if(isHost())for(const g of room.guests)sendSafe(g.conn,{t:'closed'})});
// A phone that unlocks or gets its network back reconnects to the matching server right away instead of waiting for the next retry.
window.addEventListener('online',retrySignal);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)retrySignal()});
async function resetGame(){
  if(isGuest()){notify('只有房主可以開始新遊戲。');return}
  if(state&&!confirm(`確定開始新遊戲？所有已開啟的頁籤${isHost()?'與房間裡的裝置':''}都會返回設定畫面，建議先匯出備份。`))return;
  await withGameLock(()=>{const stored=readStored();if(stored&&isNewerGame(stored,state))state=stored;clearSave();cancelAnimation();closeCard();state=null;page='game';tab='business';rememberView();render()});
  broadcastRoom();
}
$('#home-btn').addEventListener('click',()=>{page='home';closeCard();render();window.scrollTo({top:0,behavior:'smooth'})});
$('#home-play-btn').addEventListener('click',()=>{page='game';render();window.scrollTo({top:0,behavior:'smooth'})});
$('#new-game-btn').addEventListener('click',()=>{void resetGame()});
$('#open-tab-btn').addEventListener('click',()=>{window.open(location.href,'_blank','noopener')});
$('#export-btn').addEventListener('click',()=>{if(!state){notify('目前沒有可匯出的對局。');return}const blob=new Blob([exportGame(state)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`經濟棋局-第${state.round}季.json`;a.click();URL.revokeObjectURL(url)});
$('#import-file').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;if(isGuest()){notify('只有房主可以匯入存檔。');e.target.value='';return}try{const imported=importGame(await file.text());await withGameLock(()=>{const stored=readStored();if(stored&&isNewerGame(stored,state))state=stored;prepareNewSession(imported);cancelAnimation();state=imported;page='game';tab='business';snapshotSelection='latest';rememberView();save();render()});notify('存檔已載入，其他頁籤也已更新。')}catch(err){notify(err.message||'無法讀取存檔')}e.target.value=''});
window.addEventListener('storage',e=>{
  if(e.key!==storageKey||isGuest())return;
  if(e.newValue){try{adoptShared(importGame(e.newValue))}catch{}}
  else{const saved=readStored();if(saved)adoptShared(saved);else if(saved===null){resetAt=Math.max(resetAt,Date.now());cancelAnimation();closeCard();state=null;render()}}
});
if(channel)channel.onmessage=e=>{
  const message=e.data;if(!message||message.writerId===tabId||isGuest())return;
  if(message.type==='state'){try{adoptShared(importGame(JSON.stringify(message.game)))}catch{}}
  if(message.type==='reset'&&(!state||message.updatedAt>=syncInfo(state).updatedAt)){resetAt=Math.max(resetAt,message.updatedAt);cancelAnimation();closeCard();state=null;render()}
};
function syncOnFocus(){if(isGuest())return;const saved=readStored();if(saved)adoptShared(saved);else if(saved===null&&state){cancelAnimation();closeCard();state=null;render()}}
window.addEventListener('focus',syncOnFocus);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncOnFocus()});
const savedAtStart=readStored();if(savedAtStart){state=savedAtStart;snapshotSelection='latest'}
const invitedRoom=normalizeRoomCode(new URLSearchParams(location.search).get('room'));
if(invitedRoom){room.prefill=invitedRoom;$('#room-modal').hidden=false}
renderHomeRoles();
render();
