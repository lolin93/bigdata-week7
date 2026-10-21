import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,rollDice,drawEvent,endTurn,companyPosition,exportGame,importGame} from './engine.js';
import {auctionState,auctionOpen,auctionSubmit,auctionResolve} from './auction.js';
import {investmentTiles,investmentTurn,investmentCards,investmentBuy,investmentSell} from './investment.js';
test('100 個不同亂數種子正常走完整局，投資與競標不破壞結算、存檔及勝負',()=>{
 let games=0,buys=0,sells=0,auctions=0,turns=0;
 for(let seed=1;seed<=100;seed++){
  const g=createGame({players:[{name:'甲',roleId:'auto'},{name:'乙',roleId:'electronics'}],seed,targetWealth:5500,maxRounds:12});
  while(g.status==='playing'){
   const p=g.players[g.turnIndex];rollDice(g);if(g.phase==='draw')drawEvent(g);
   if(g.phase==='manage'){
    const turn=investmentTurn(g);
    for(const c of [...investmentCards(g,p.id)])if(c.value!==c.cost){investmentSell(g,p.id,c.id,turn);sells++;}
    if(investmentTiles.includes(p.position)&&investmentCards(g,p.id).length<2&&g.companies[p.roleId].cash>=200){const old=companyPosition(g,p.roleId).netWorth;investmentBuy(g,p.id,g.players.find(x=>x.id!==p.id).roleId,turn);assert.equal(companyPosition(g,p.roleId).netWorth,old);buys++;}
   }
   const result=endTurn(g);turns++;assert.ok(turns<3000);
   if(result&&!result.finished&&result.snapshot.round%2===0){const a=auctionOpen(g),secret={};for(const id of a.eligibleIds){const owner=g.players.find(p=>p.id===id);auctionSubmit(g,secret,id,Math.max(0,Math.min(Math.floor(g.companies[owner.roleId].cash),id==='player-1'?180:130)),a.id);}auctionResolve(g,secret);auctions++;}
   for(const owner of g.players){const pos=companyPosition(g,owner.roleId);assert.ok(Number.isFinite(pos.netWorth));assert.equal(pos.netWorth,pos.cash+pos.assetValue-pos.debt);}
   for(const c of g.investmentModule?.cards||[])assert.ok(c.value>=0&&c.value<=400);
   const loaded=importGame(exportGame(g));for(const owner of g.players)assert.equal(companyPosition(loaded,owner.roleId).netWorth,companyPosition(g,owner.roleId).netWorth);
  }
  assert.ok(g.phase==='finished');assert.ok(g.round<=12);assert.ok(Array.isArray(g.winnerIds));assert.ok(g.winnerIds.every(id=>g.players.some(p=>p.id===id)));games++;
 }
 console.log(JSON.stringify({games,turns,buys,sells,auctions}));assert.ok(buys>0&&sells>0&&auctions>0);
});
