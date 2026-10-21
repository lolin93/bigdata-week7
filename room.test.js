import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame} from './engine.js';
import {makeRoomCode,normalizeRoomCode,roomPeerId,seatController,canAct,claimSeat,releaseSeat,releaseClient,parseGuestMessage} from './room.js';

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
  assert.equal(roomPeerId('ABC2D'),'econboard-v1-ABC2D');
});
test('沒人認領的座位由房主操作，被認領的座位只有該裝置能操作',()=>{
  assert.equal(seatController({},'host','player-1'),'host');
  assert.equal(seatController({'player-1':'guest-a'},'host','player-1'),'guest-a');
  const g=game(),seats={'player-1':'guest-a'};
  assert.equal(canAct(seats,'host',g,'guest-a'),true);
  assert.equal(canAct(seats,'host',g,'host'),false);
  assert.equal(canAct(seats,'host',g,'guest-b'),false);
  g.turnIndex=1;
  assert.equal(canAct(seats,'host',g,'host'),true);
  assert.equal(canAct(seats,'host',g,'guest-a'),false);
});
test('對局結束或尚未開局時沒有人可以操作',()=>{
  const g=game();
  assert.equal(canAct({},'host',null,'host'),false);
  g.status='goal';
  assert.equal(canAct({},'host',g,'host'),false);
});
test('認領座位：已被占用會拒絕，同一裝置換座會釋出舊座位',()=>{
  const seats=claimSeat({},ids,'player-1','guest-a');
  assert.deepEqual(seats,{'player-1':'guest-a'});
  assert.throws(()=>claimSeat(seats,ids,'player-1','guest-b'),/已經有人/);
  assert.throws(()=>claimSeat(seats,ids,'player-9','guest-b'),/沒有這位玩家/);
  assert.deepEqual(claimSeat(seats,ids,'player-1','guest-a'),seats);
  assert.deepEqual(claimSeat(seats,ids,'player-2','guest-a'),{'player-2':'guest-a'});
});
test('釋出座位不會改動原本的物件',()=>{
  const seats={'player-1':'guest-a','player-2':'guest-b'};
  assert.deepEqual(releaseSeat(seats,'player-1'),{'player-2':'guest-b'});
  assert.deepEqual(releaseClient(seats,'guest-b'),{'player-1':'guest-a'});
  assert.deepEqual(seats,{'player-1':'guest-a','player-2':'guest-b'});
});
test('只接受白名單內的訪客訊息，數量必須是有限數字',()=>{
  assert.deepEqual(parseGuestMessage({t:'hello',clientId:'abc-123'}),{t:'hello',clientId:'abc-123'});
  assert.equal(parseGuestMessage({t:'hello',clientId:'bad id!'}),null);
  assert.deepEqual(parseGuestMessage({t:'claim',playerId:'player-2'}),{t:'claim',playerId:'player-2'});
  assert.deepEqual(parseGuestMessage({t:'release'}),{t:'release'});
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
