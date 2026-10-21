import {investmentValue,investmentEvent} from './investment.js';
import {auctionBonus} from './auction.js';
import {METRICS,ROLES,GLOBAL_EVENTS,PERSONAL_EVENTS,SECTOR_EVENTS,ALL_EVENTS,FED_RULES,FED_PRIORITY,BOARD} from './data.js';

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

export function eventRemaining(active,round){const e=eventById(active.eventId);return e?Math.max(0,e.duration-(round-active.startedRound)):0}
export function effectBreakdown(state,roleId,metric,round=state.round){
  const role=roleById(roleId);
  if(!role)return [];
  return state.activeEvents.flatMap(a=>{
    const e=eventById(a.eventId),age=round-a.startedRound;
    if(!e||age<0||age>=e.duration||!eventAffects(a,role,state))return [];
    return e.effects.filter(f=>f.metric===metric&&hasTarget(f,role)).map(f=>({eventId:e.id,name:e.name,pct:f.pct*e.decay[age],remaining:e.duration-age,scope:a.scope,instanceId:a.instanceId}));
  });
}
export function metricPct(state,roleId,metric,round=state.round){return clamp(effectBreakdown(state,roleId,metric,round).reduce((n,x)=>n+x.pct,0),-60,100)}
export function assetValue(state,roleId,round=state.round){const c=state.companies[roleId];return round2(c.assetReferenceValue*(1+metricPct(state,roleId,'asset_value',round)/100))+investmentValue(state,roleId)}
export function financials(state,roleId,round=state.round){
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
  const bonus=round===state.round&&state.struckPlayerIds?.includes(ownerId)?0:auctionBonus(state,roleId,round,{costs});
  flows.investment=(flows.investment||0)+bonus;
  return {flows,revenue,costs:round2(costs),otherIncome:round2(otherIncome+bonus),profit:round2(Object.values(flows).reduce((s,v)=>s+v,0)),assetValue:assetValue(state,roleId,round)};
}
export function companyPosition(state,roleId){const c=state.companies[roleId];return {cash:c.cash,assetValue:assetValue(state,roleId),debt:c.debt,netWorth:c.cash+assetValue(state,roleId)-c.debt}}

export function createGame({players,seed=Date.now(),targetWealth=5500,maxRounds=12}){
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

export function drawForTile(state,tile,ownerId){
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
export function movementPath(from,steps,length=BOARD.length){
  if(!Number.isInteger(from)||!Number.isInteger(steps)||!Number.isInteger(length)||from<0||from>=length||steps<0||steps>length||length<2)throw Error('棋盤移動參數無效。');
  return Array.from({length:steps},(_,i)=>(from+i+1)%length);
}
export function rollDice(state,forced){
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
export function drawEvent(state){
  if(state.status!=='playing'||state.phase!=='draw')throw Error('現在不需要抽卡。');
  const player=state.players[state.turnIndex],tile=BOARD[player.position];
  if(!state.dice||tile.type==='start')throw Error('目前停格沒有事件卡。');
  const before=Object.fromEntries(state.players.map(p=>[p.roleId,financials(state,p.roleId).profit+assetValue(state,p.roleId)]));
  const active=drawForTile(state,tile,player.id);
  const after=Object.fromEntries(state.players.map(p=>[p.roleId,financials(state,p.roleId).profit+assetValue(state,p.roleId)]));
  investmentEvent(state,before,after,eventById(active.eventId)?.name||'市場事件');
  state.phase='manage';
  return active;
}
export function adjustStaff(state,playerId,delta){
  if(state.status!=='playing'||state.phase!=='manage'||state.players[state.turnIndex].id!==playerId)throw Error('只能在自己的經營階段調整員工。');
  if(!Number.isInteger(delta)||delta===0)throw Error('請輸入非零整數人數。');
  const p=state.players[state.turnIndex],c=state.companies[p.roleId];
  const employed=Object.values(state.companies).reduce((s,x)=>s+x.headcount,0);
  if(c.headcount+delta<0||employed+delta>1000)throw Error('超出可聘僱或可裁員人數。');
  c.headcount+=delta;state.log.unshift(`${p.name}${delta>0?'聘僱':'裁員'} ${Math.abs(delta)} 人。`);
}
export function issueLoan(state,playerId,amount){
  if(state.status!=='playing'||state.phase!=='manage'||state.players[state.turnIndex].id!==playerId)throw Error('只能在自己的經營階段借款。');
  if(!Number.isInteger(amount)||amount<=0||amount>state.bank.liquidAssets||state.bank.riskRestrictionUntil>=state.round)throw Error('借款金額超出銀行流動資產，或目前限制新增風險放款。');
  const c=state.companies[state.players[state.turnIndex].roleId];c.cash+=amount;c.debt+=amount;state.bank.liquidAssets-=amount;state.bank.totalLoans+=amount;state.log.unshift(`${state.players[state.turnIndex].name}借款 ${amount}；現金及負債同步增加。`);
}
export function repayLoan(state,playerId,amount){
  if(state.status!=='playing'||state.phase!=='manage'||state.players[state.turnIndex].id!==playerId)throw Error('只能在自己的經營階段還款。');
  const c=state.companies[state.players[state.turnIndex].roleId];
  if(!Number.isInteger(amount)||amount<=0||amount>c.debt||amount>c.cash)throw Error('還款不能超過現金或未償債務。');
  c.cash-=amount;c.debt-=amount;state.bank.liquidAssets+=amount;state.bank.totalLoans-=amount;state.log.unshift(`${state.players[state.turnIndex].name}償還 ${amount} 借款。`);
}
export function updateBadLoans(state,playerId,amount){
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
export function makeSnapshot(state,round=state.round){
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
export function evaluateFed(snapshot,state){
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
export function endTurn(state){
  if(state.status!=='playing'||!['manage','strike'].includes(state.phase))throw Error('請先完成本回合。');
  moveGhost(state);
  if(state.turnIndex<state.players.length-1){state.turnIndex++;state.phase='roll';state.dice=null;state.reels=null;state.lastDraw=null;return null}
  const result=settleSeason(state);return result;
}
export function settleSeason(state){
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
export function getEconomicSnapshot(state,round){return state.economicHistory.find(x=>x.round===round)||null}
export function getEconomicHistory(state,from=1,to=state.round){return state.economicHistory.filter(x=>x.round>=from&&x.round<=to)}
export function getFedRuleEvaluations(state,round){return state.evaluations.find(x=>x.round===round)?.items||null}
export function getFedDecision(state,round){return state.decisions.find(x=>x.round===round)||null}
export function exportGame(state){return JSON.stringify(state,null,2)}
export function importGame(json){const s=JSON.parse(json);if(s.version!==1||!Array.isArray(s.players)||!Array.isArray(s.economicHistory)||!s.companies||!s.bank||!Array.isArray(s.activeEvents))throw Error('存檔格式不正確。');ensureGhostState(s);return s}
