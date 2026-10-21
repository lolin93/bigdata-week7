// Pure investment rules. The host owns mutations; guests send requests only.
export const investmentTiles=[5,11,17,23];
export const investmentRules={price:200,limit:2,min:0,max:400,step:50,majorStep:100,majorThreshold:150};
export function investmentState(game){return game.investmentModule ||= {version:1,serial:0,cards:[],boughtTurns:[],lastChanges:[]};}
export function investmentTurn(game){return `${game.round}:${game.players[game.turnIndex]?.id}`;}
export function investmentCards(game,ownerId){return investmentState(game).cards.filter(c=>c.ownerId===ownerId);}
export function investmentValue(game,roleId){const p=game.players.find(p=>p.roleId===roleId);return p?investmentCards(game,p.id).reduce((n,c)=>n+c.value,0):0;}
export function investmentCheck(game,playerId,turn){
 if(game.status!=='playing'||game.phase!=='manage'||game.players[game.turnIndex]?.id!==playerId)throw Error('只能在自己的經營回合交易。');
 if(game.auctionModule?.active)throw Error('請先完成商機競標。');
 if(turn!==investmentTurn(game))throw Error('這是上一回合的操作，請使用最新畫面。');
}
export function investmentBuy(game,playerId,targetRole,turn){
 investmentCheck(game,playerId,turn);const mod=investmentState(game),p=game.players.find(p=>p.id===playerId);
 if(!investmentTiles.includes(p.position))throw Error('停在投資格才能買入。');
 if(!game.players.some(p=>p.roleId===targetRole&&p.id!==playerId))throw Error('請投資其他玩家的企業。');
 if(mod.boughtTurns.includes(turn))throw Error('這回合已投資過一張。');
 if(investmentCards(game,playerId).length>=investmentRules.limit)throw Error('最多持有兩張，請先賣出。');
 const company=game.companies[p.roleId];if(company.cash<investmentRules.price)throw Error('現金不足 200。');
 company.cash-=investmentRules.price;const card={id:++mod.serial,ownerId:playerId,targetRole,cost:investmentRules.price,value:investmentRules.price,lastDelta:0};mod.cards.push(card);mod.boughtTurns.push(turn);
 game.log.unshift(`【投資】${p.name}支付 200 投資${game.players.find(p=>p.roleId===targetRole).name}的企業。`);return card;
}
export function investmentSell(game,playerId,cardId,turn){
 investmentCheck(game,playerId,turn);const mod=investmentState(game),i=mod.cards.findIndex(c=>c.id===cardId&&c.ownerId===playerId);if(i<0)throw Error('找不到自己的投資卡，可能已經賣出。');
 const [card]=mod.cards.splice(i,1),p=game.players.find(p=>p.id===playerId);game.companies[p.roleId].cash+=card.value;
 game.log.unshift(`【賣出】${p.name}收回 ${card.value}，投資損益 ${card.value-card.cost>=0?'+':''}${card.value-card.cost}。`);return card.value;
}
export function investmentEvent(game,before,after,eventName){
 const mod=investmentState(game);mod.lastChanges=[];
 for(const c of mod.cards){const impact=(after[c.targetRole]??0)-(before[c.targetRole]??0);if(Math.abs(impact)<.01)continue;
 const step=Math.sign(impact)*(Math.abs(impact)>=investmentRules.majorThreshold?investmentRules.majorStep:investmentRules.step),old=c.value;
 c.value=Math.min(investmentRules.max,Math.max(investmentRules.min,old+step));c.lastDelta=c.value-old;
 mod.lastChanges.push({id:c.id,ownerId:c.ownerId,targetRole:c.targetRole,from:old,to:c.value,delta:c.lastDelta,eventName});
 }
 if(mod.lastChanges.length)game.log.unshift(`【投資變動】${eventName}：${mod.lastChanges.map(c=>`${c.from} → ${c.to}`).join('、')}`);
}
