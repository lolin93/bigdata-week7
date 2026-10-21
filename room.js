// Pure helpers for multi-device rooms: codes, seat ownership, net-worth ranking and validation of guest messages.
// Networking (PeerJS) lives in app.js; everything here is deterministic so it can be unit tested.
import {companyPosition} from './engine.js';
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

// Every player needs a device (the host included); play waits until all seats are taken,
// then only the device seated at the current player may act.
export function emptySeats(seats,playerIds){return playerIds.filter(id=>!seats[id])}
export function canAct(seats,game,clientId){
  if(!game||game.status!=='playing')return false;
  if(emptySeats(seats,game.players.map(p=>p.id)).length)return false;
  const player=game.players[game.turnIndex];
  return !!player&&seats[player.id]===clientId;
}
// A seat is locked once taken: a device cannot switch seats itself; only the host can free one (releaseSeat).
export function claimSeat(seats,playerIds,playerId,clientId){
  if(!playerIds.includes(playerId))throw Error('沒有這位玩家。');
  const owner=seats[playerId];
  if(owner===clientId)return seats;
  if(owner)throw Error('這個座位已經有人坐了。');
  if(Object.values(seats).includes(clientId))throw Error('你已經選好座位了；要換位子請房主收回。');
  return {...seats,[playerId]:clientId};
}
export function releaseSeat(seats,playerId){
  const next={...seats};delete next[playerId];return next;
}

// Net worth is computed in one place so a later rule (for example a player owning several companies) only changes this.
export function netWorthRanking(game){
  const rows=game.players.map(player=>({player,netWorth:companyPosition(game,player.roleId).netWorth}));
  return rows.map(row=>({...row,rank:1+rows.filter(r=>r.netWorth>row.netWorth).length})).sort((a,b)=>a.rank-b.rank);
}

const safeId=v=>typeof v==='string'&&/^[\w-]{1,64}$/.test(v)?v:null;
// Guest messages are untrusted: only a fixed set of shapes gets through.
export function parseGuestMessage(raw){
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
