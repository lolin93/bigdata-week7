import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,companyPosition} from './engine.js';
import {makeRoomCode,normalizeRoomCode,roomPeerId,emptySeats,canAct,claimSeat,releaseSeat,netWorthRanking,cleanPlayerName,pickRole,leaveLobby,lobbyPlayers,lobbySeats,parseGuestMessage} from './room.js';

const game=()=>createGame({players:[{name:'甲',roleId:'auto'},{name:'乙',roleId:'electronics'}]});
const ids=['player-1','player-2'];

test('房間代碼為 5 碼且不含易混淆字元',()=>{
  const code=makeRoomCode();
  assert.equal(code.length,5);
  assert.match(code,/^[A-HJ-NP-Z2-9]{5}$/);
  assert.equal(makeRoomCode(()=>0),'AAAAA');
});
test('輸入的代碼會轉大寫並略過空白與連字號，格式不符則回傳 null',()=>{
  assert.equal(normalizeRoomCode(' ab-c2d '),'ABC2D');
  assert.equal(normalizeRoomCode('ABCD'),null);
  assert.equal(normalizeRoomCode('ABCDEF'),null);
  assert.equal(normalizeRoomCode('ABCD0'),null);
  assert.equal(normalizeRoomCode(null),null);
  assert.equal(roomPeerId('ABC2D'),'econboard-v2-ABC2D');
});
test('還有空位時誰都不能操作，房主也不例外',()=>{
  const g=game();
  assert.deepEqual(emptySeats({},ids),ids);
  assert.deepEqual(emptySeats({'player-1':'host'},ids),['player-2']);
  assert.equal(canAct({'player-1':'host'},g,'host'),false);
  assert.equal(canAct({'player-2':'guest-a'},g,'host'),false);
});
test('坐滿之後只有坐在目前玩家的裝置能操作',()=>{
  const g=game(),seats={'player-1':'host','player-2':'guest-a'};
  assert.deepEqual(emptySeats(seats,ids),[]);
  assert.equal(canAct(seats,g,'host'),true);
  assert.equal(canAct(seats,g,'guest-a'),false);
  assert.equal(canAct(seats,g,'guest-b'),false);
  g.turnIndex=1;
  assert.equal(canAct(seats,g,'host'),false);
  assert.equal(canAct(seats,g,'guest-a'),true);
});
test('對局結束或尚未開局時沒有人可以操作',()=>{
  const g=game(),seats={'player-1':'host','player-2':'guest-a'};
  assert.equal(canAct(seats,null,'host'),false);
  g.status='goal';
  assert.equal(canAct(seats,g,'host'),false);
});
test('認領座位：已被占用會拒絕，坐下後不能自己換位子',()=>{
  const seats=claimSeat({},ids,'player-1','guest-a');
  assert.deepEqual(seats,{'player-1':'guest-a'});
  assert.throws(()=>claimSeat(seats,ids,'player-1','guest-b'),/已經有人/);
  assert.throws(()=>claimSeat(seats,ids,'player-9','guest-b'),/沒有這位玩家/);
  assert.equal(claimSeat(seats,ids,'player-1','guest-a'),seats);
  assert.throws(()=>claimSeat(seats,ids,'player-2','guest-a'),/已經選好座位/);
  assert.deepEqual(claimSeat(seats,ids,'player-2','guest-b'),{'player-1':'guest-a','player-2':'guest-b'});
});
test('房主收回座位後可以重新選，且不會改動原本的物件',()=>{
  const seats={'player-1':'guest-a','player-2':'guest-b'};
  const freed=releaseSeat(seats,'player-1');
  assert.deepEqual(freed,{'player-2':'guest-b'});
  assert.deepEqual(seats,{'player-1':'guest-a','player-2':'guest-b'});
  assert.deepEqual(claimSeat(freed,ids,'player-1','guest-c'),{'player-2':'guest-b','player-1':'guest-c'});
});
test('淨資產排行由高到低，同分同名次',()=>{
  const g=createGame({players:[{name:'甲',roleId:'auto'},{name:'乙',roleId:'electronics'},{name:'丙',roleId:'retail'}]});
  g.companies.electronics.cash+=5000;
  g.companies.retail.debt+=5000;
  const ranking=netWorthRanking(g);
  assert.deepEqual(ranking.map(r=>r.player.name),['乙','甲','丙']);
  assert.deepEqual(ranking.map(r=>r.rank),[1,2,3]);
  for(const r of ranking)assert.equal(r.netWorth,companyPosition(g,r.player.roleId).netWorth);
  const tie={...g,players:[g.players[0],{...g.players[1],roleId:g.players[0].roleId}]};
  assert.deepEqual(netWorthRanking(tie).map(r=>r.rank),[1,1]);
});
const roleIds=['auto','electronics','retail','bank'];
test('名字去掉控制字元與前後空白，最多 16 字',()=>{
  assert.equal(cleanPlayerName('  小明\n '),'小明');
  assert.equal(cleanPlayerName('一二三四五六七八九十一二三四五六七'),'一二三四五六七八九十一二三四五六');
  assert.equal(cleanPlayerName(null),'');
});
test('大廳：每家企業只能一台裝置選，換企業不改變順序',()=>{
  let lobby=pickRole([],'host','auto','房主',roleIds);
  lobby=pickRole(lobby,'guest-a','electronics','小明',roleIds);
  assert.throws(()=>pickRole(lobby,'guest-b','auto','小華',roleIds),/已經有人選/);
  assert.throws(()=>pickRole(lobby,'guest-b','oil','小華',roleIds),/沒有這家企業/);
  lobby=pickRole(lobby,'host','retail','房主',roleIds);
  assert.deepEqual(lobby.map(e=>[e.clientId,e.roleId]),[['host','retail'],['guest-a','electronics']]);
  assert.deepEqual(pickRole(lobby,'guest-a','electronics','阿明',roleIds)[1],{clientId:'guest-a',name:'阿明',roleId:'electronics'});
  assert.deepEqual(leaveLobby(lobby,'host').map(e=>e.clientId),['guest-a']);
});
test('大廳最多 8 位玩家',()=>{
  const ids=['auto','electronics','retail','bank','investment','energy','logistics','property','agriculture'];
  let lobby=[];
  for(let i=0;i<8;i++)lobby=pickRole(lobby,`c${i}`,ids[i],'',ids);
  assert.throws(()=>pickRole(lobby,'c8',ids[8],'',ids),/最多 8 位/);
  assert.equal(pickRole(lobby,'c0',ids[8],'',ids).length,8);
});
test('開始時依選擇順序建立玩家，補上空白名字並避開重名，座位直接對應',()=>{
  assert.throws(()=>lobbyPlayers([{clientId:'host',name:'甲',roleId:'auto'}]),/至少要 2 位/);
  const lobby=[{clientId:'host',name:'',roleId:'retail'},{clientId:'guest-a',name:'小明',roleId:'auto'},{clientId:'guest-b',name:'小明',roleId:'bank'}];
  const players=lobbyPlayers(lobby);
  assert.deepEqual(players,[{name:'玩家 1',roleId:'retail'},{name:'小明',roleId:'auto'},{name:'小明 2',roleId:'bank'}]);
  const g=createGame({players});
  const seats=lobbySeats(g,lobby);
  assert.deepEqual(seats,{[g.players[0].id]:'host',[g.players[1].id]:'guest-a',[g.players[2].id]:'guest-b'});
  assert.deepEqual(emptySeats(seats,g.players.map(p=>p.id)),[]);
  assert.equal(canAct(seats,g,'host'),true);
});
test('只接受白名單內的訪客訊息，數量必須是有限數字',()=>{
  assert.deepEqual(parseGuestMessage({t:'hello',clientId:'abc-123'}),{t:'hello',clientId:'abc-123'});
  assert.equal(parseGuestMessage({t:'hello',clientId:'bad id!'}),null);
  assert.deepEqual(parseGuestMessage({t:'claim',playerId:'player-2'}),{t:'claim',playerId:'player-2'});
  assert.equal(parseGuestMessage({t:'release'}),null);
  assert.deepEqual(parseGuestMessage({t:'pick',roleId:'auto',name:' 小明 '}),{t:'pick',roleId:'auto',name:'小明'});
  assert.deepEqual(parseGuestMessage({t:'pick',roleId:'auto'}),{t:'pick',roleId:'auto',name:''});
  assert.equal(parseGuestMessage({t:'pick',roleId:'bad id!',name:'x'}),null);
  assert.equal(parseGuestMessage({t:'pick',roleId:'auto',name:5}),null);
  assert.deepEqual(parseGuestMessage({t:'unpick',extra:1}),{t:'unpick'});
  assert.deepEqual(parseGuestMessage({t:'action',action:'roll',amount:5}),{t:'action',action:'roll'});
  assert.deepEqual(parseGuestMessage({t:'action',action:'hire',amount:'10'}),{t:'action',action:'hire',amount:10});
  assert.equal(parseGuestMessage({t:'action',action:'hire'}),null);
  assert.equal(parseGuestMessage({t:'action',action:'loan',amount:Infinity}),null);
  assert.equal(parseGuestMessage({t:'action',action:'loan',amount:'abc'}),null);
  assert.equal(parseGuestMessage({t:'action',action:'new-game'}),null);
  assert.equal(parseGuestMessage({t:'state',game:{}}),null);
  assert.equal(parseGuestMessage(null),null);
  assert.equal(parseGuestMessage('roll'),null);
});
