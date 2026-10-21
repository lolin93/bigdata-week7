// Pure helpers for multi-device rooms: codes, seat ownership and validation of guest messages.
// Networking (PeerJS) lives in app.js; everything here is deterministic so it can be unit tested.
export const ROOM_PREFIX='econboard-v1-';
const ROOM_ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH=5;
const GUEST_ACTIONS=['roll','draw-card','end-turn','hire','layoff','loan','repay','mark-bad','recover-bad'];
const AMOUNT_ACTIONS=['hire','layoff','loan','repay','mark-bad','recover-bad'];

export function makeRoomCode(random=Math.random){
  return Array.from({length:ROOM_CODE_LENGTH},()=>ROOM_ALPHABET[Math.floor(random()*ROOM_ALPHABET.length)]).join('');
}
export function normalizeRoomCode(input){
  const code=String(input??'').toUpperCase().replace(/[\s-]+/g,'');
  return code.length===ROOM_CODE_LENGTH&&[...code].every(c=>ROOM_ALPHABET.includes(c))?code:null;
}
export const roomPeerId=code=>`${ROOM_PREFIX}${code}`;

// A seat held by a device is operated only by that device; seats nobody took stay with the host.
export function seatController(seats,hostClientId,playerId){return seats[playerId]||hostClientId}
export function canAct(seats,hostClientId,game,clientId){
  if(!game||game.status!=='playing')return false;
  const player=game.players[game.turnIndex];
  return !!player&&seatController(seats,hostClientId,player.id)===clientId;
}
export function claimSeat(seats,playerIds,playerId,clientId){
  if(!playerIds.includes(playerId))throw Error('沒有這位玩家。');
  const owner=seats[playerId];
  if(owner&&owner!==clientId)throw Error('這個座位已經有人坐了。');
  const next=Object.fromEntries(Object.entries(seats).filter(([,id])=>id!==clientId));
  next[playerId]=clientId;
  return next;
}
export function releaseSeat(seats,playerId){
  const next={...seats};delete next[playerId];return next;
}
export function releaseClient(seats,clientId){
  return Object.fromEntries(Object.entries(seats).filter(([,id])=>id!==clientId));
}

const safeId=v=>typeof v==='string'&&/^[\w-]{1,64}$/.test(v)?v:null;
// Guest messages are untrusted: only a fixed set of shapes gets through.
export function parseGuestMessage(raw){
  if(!raw||typeof raw!=='object')return null;
  if(raw.t==='hello'){const clientId=safeId(raw.clientId);return clientId?{t:'hello',clientId}:null}
  if(raw.t==='claim'){const playerId=safeId(raw.playerId);return playerId?{t:'claim',playerId}:null}
  if(raw.t==='release')return {t:'release'};
  if(raw.t==='action'&&GUEST_ACTIONS.includes(raw.action)){
    if(!AMOUNT_ACTIONS.includes(raw.action))return {t:'action',action:raw.action};
    const amount=Number(raw.amount);
    return Number.isFinite(amount)&&Math.abs(amount)<=1e9?{t:'action',action:raw.action,amount}:null;
  }
  return null;
}
