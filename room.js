// Pure helpers for multi-device rooms: codes, seat ownership, net-worth ranking and validation of guest messages.
// Networking (PeerJS) lives in app.js; everything here is deterministic so it can be unit tested.
import {companyPosition} from './engine.js';
// v2: rooms with the company lobby; pages from before it cannot join (and break) these rooms.
export const ROOM_PREFIX='econboard-v3-';
const ROOM_ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH=5;
const MAX_PLAYERS=8,NAME_LENGTH=16;
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

// Before a game starts the room is a lobby: each device types a name and picks its own company,
// a company belongs to one device only, and the host can start as soon as two devices have picked.
export function cleanPlayerName(raw){return String(raw??'').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,NAME_LENGTH)}
export function pickRole(lobby,clientId,roleId,name,roleIds){
  if(!roleIds.includes(roleId))throw Error('沒有這家企業。');
  if(lobby.some(e=>e.roleId===roleId&&e.clientId!==clientId))throw Error('這家企業已經有人選了。');
  const entry={clientId,name:cleanPlayerName(name),roleId},i=lobby.findIndex(e=>e.clientId===clientId);
  if(i<0&&lobby.length>=MAX_PLAYERS)throw Error(`最多 ${MAX_PLAYERS} 位玩家。`);
  return i<0?[...lobby,entry]:lobby.map((e,j)=>j===i?entry:e);
}
export function leaveLobby(lobby,clientId){return lobby.filter(e=>e.clientId!==clientId)}
// Players for createGame in pick order; blank names get a default and repeated names a number, since the engine needs unique names.
export function lobbyPlayers(lobby){
  if(lobby.length<2)throw Error('至少要 2 位玩家選好企業才能開始。');
  const used=new Set();
  return lobby.map((e,i)=>{
    const base=e.name||`玩家 ${i+1}`;let name=base,n=2;
    while(used.has(name))name=`${base} ${n++}`;
    used.add(name);
    return {name,roleId:e.roleId};
  });
}
// After createGame, each device is seated at the player made from its pick, so nobody has to choose a seat again.
export function lobbySeats(game,lobby){return Object.fromEntries(game.players.map((p,i)=>[p.id,lobby[i].clientId]))}

// Net worth is computed in one place so a later rule (for example a player owning several companies) only changes this.
export function netWorthRanking(game){
  const rows=game.players.map(player=>({player,netWorth:companyPosition(game,player.roleId).netWorth}));
  return rows.map(row=>({...row,rank:1+rows.filter(r=>r.netWorth>row.netWorth).length})).sort((a,b)=>a.rank-b.rank);
}

const safeId=v=>typeof v==='string'&&/^[\w-]{1,64}$/.test(v)?v:null;
// Guest messages are untrusted: only a fixed set of shapes gets through.
export function parseGuestMessage(raw){
  if(!raw||typeof raw!=='object')return null;
  if(raw.t==='investment'){
    if(typeof raw.turn!=='string'||raw.turn.length>100)return null;
    if(raw.action==='buy'&&typeof raw.targetRole==='string'&&/^[a-z]{1,32}$/.test(raw.targetRole))return {t:'investment',action:'buy',targetRole:raw.targetRole,turn:raw.turn};
    if(raw.action==='sell'&&Number.isSafeInteger(raw.cardId)&&raw.cardId>0)return {t:'investment',action:'sell',cardId:raw.cardId,turn:raw.turn};
    return null;
  }
  if(raw.t==='auction-bid'){return typeof raw.auctionId==='string'&&raw.auctionId.length<=150&&Number.isSafeInteger(raw.amount)&&raw.amount>=0?{t:'auction-bid',auctionId:raw.auctionId,amount:raw.amount}:null;}
  if(raw.t==='hello'){const clientId=safeId(raw.clientId);return clientId?{t:'hello',clientId}:null}
  if(raw.t==='claim'){const playerId=safeId(raw.playerId);return playerId?{t:'claim',playerId}:null}
  if(raw.t==='pick'){const roleId=safeId(raw.roleId);return roleId&&(raw.name===undefined||typeof raw.name==='string')?{t:'pick',roleId,name:cleanPlayerName(raw.name)}:null}
  if(raw.t==='unpick')return {t:'unpick'};
  if(raw.t==='action'&&GUEST_ACTIONS.includes(raw.action)){
    if(!AMOUNT_ACTIONS.includes(raw.action))return {t:'action',action:raw.action};
    const amount=Number(raw.amount);
    return Number.isFinite(amount)&&Math.abs(amount)<=1e9?{t:'action',action:raw.action,amount}:null;
  }
  return null;
}
