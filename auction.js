export const auctionCatalog=[
 {id:'traffic',icon:'🚦',title:'市政府更新智慧交通設備',story:'市政府徵求車輛、設備與系統供應商，公開招標年度合作案。',roles:['auto','electronics','logistics','technology'],kind:'income',amount:150,duration:2},
 {id:'partners',icon:'🤝',title:'大型企業招募年度合作夥伴',story:'一家跨國企業正在尋找長期合作夥伴，邀請各產業提出合作方案。',roles:null,kind:'income',amount:100,duration:2},
 {id:'schools',icon:'🏫',title:'學校更新電腦教室',story:'學校準備更新電腦、網路與教學系統，徵求設備及技術團隊。',roles:['electronics','technology'],kind:'income',amount:120,duration:2},
 {id:'festival',icon:'🎪',title:'城市嘉年華徵求服務商',story:'主辦單位公開徵求商品、餐飲、交通及活動支援服務。',roles:['retail','agriculture','logistics','technology'],kind:'income',amount:220,duration:1},
 {id:'delivery',icon:'📦',title:'電商平台擴大配送合作',story:'電商平台尋找配送與數位調度團隊，承接新一季的訂單。',roles:['logistics','technology'],kind:'income',amount:150,duration:2},
 {id:'energy',icon:'☀️',title:'工業園區招標節能改造',story:'園區要降低用電成本，徵求能源、設備與智慧管理方案。',roles:['energy','electronics','technology'],kind:'income',amount:130,duration:2},
 {id:'food',icon:'🥗',title:'連鎖餐廳徵求年度供應商',story:'餐飲集團公開招標食品供應與冷鏈配送服務。',roles:['agriculture','logistics','retail'],kind:'income',amount:120,duration:2},
 {id:'payroll',icon:'💳',title:'企業集團招標員工福利平台',story:'企業集團整合薪轉、理財與數位服務，徵求合作團隊。',roles:['bank','investment','technology'],kind:'income',amount:120,duration:2},
 {id:'housing',icon:'🏘️',title:'社區招標公共空間更新',story:'社區要更新公共空間與智慧設施，邀請企業提出改造方案。',roles:['property','electronics','technology'],kind:'income',amount:250,duration:1},
 {id:'bulk',icon:'🛒',title:'供應商釋出團購優惠合約',story:'供應商提供一份限量年度採購折扣，各家公司都能競標取得。',roles:null,kind:'saving',amount:100,duration:2},
 {id:'expo',icon:'🎤',title:'國際展覽徵求企業合作',story:'國際展覽開放一個企業合作名額，得標者可獲得新客戶訂單。',roles:null,kind:'income',amount:180,duration:2},
 {id:'upgrade',icon:'🧰',title:'顧問團隊釋出效率提升方案',story:'顧問團隊只有一組服務名額，協助企業減少日常營運支出。',roles:null,kind:'saving',amount:80,duration:3},
 {id:'export',icon:'🌏',title:'海外通路招募台灣供應商',story:'海外買家來台尋找商品與物流夥伴，提供短期合作訂單。',roles:['auto','electronics','agriculture','logistics','retail'],kind:'income',amount:140,duration:2},
 {id:'launch',icon:'🚀',title:'新創園區尋找開幕合作企業',story:'新創園區公開徵求開幕活動與營運支援合作夥伴。',roles:null,kind:'income',amount:200,duration:1}
];
export function auctionState(game){return game.auctionModule ||= {version:1,serial:0,active:null,effects:[],lastResult:null};}
export function auctionEligible(game,item){return game.players.filter(p=>!item.roles||item.roles.includes(p.roleId)).map(p=>p.id);}
export function auctionOpen(game){
 if(game.status!=='playing')throw Error('對局已結束。');const mod=auctionState(game);if(mod.active)throw Error('這場競標還沒結束。');
 let item,eligibleIds;
 for(let n=0;n<auctionCatalog.length;n++){const candidate=auctionCatalog[(mod.serial+n)%auctionCatalog.length],eligible=auctionEligible(game,candidate);if(eligible.length>=2){item=candidate;eligibleIds=eligible;mod.serial+=n+1;break;}}
 if(!item)throw Error('至少兩位符合資格的玩家才能競標。');
 const id=`${game.sync?.gameId||game.seed}:${mod.serial}:${game.round}`;
 mod.active={id,item:{...item},eligibleIds,submittedIds:[],round:game.round};mod.lastResult=null;
 game.log.unshift(`【商機】${item.title}，${eligibleIds.length} 位玩家可競標。`);return mod.active;
}
export function auctionSubmit(game,secret,playerId,amount,id){
 const a=auctionState(game).active;if(!a||a.id!==id)throw Error('這場競標已結束，請使用最新畫面。');
 if(!a.eligibleIds.includes(playerId))throw Error('你的企業不適用本次商機。');
 if(a.submittedIds.includes(playerId))throw Error('你已出價，不能重複或更改。');
 if(!Number.isSafeInteger(amount)||amount<0)throw Error('請輸入非負整數，0 表示放棄。');
 const p=game.players.find(p=>p.id===playerId);if(!p||amount>0&&amount>game.companies[p.roleId].cash)throw Error('出價超過目前現金。');
 secret[playerId]=amount;a.submittedIds.push(playerId);
 return a.submittedIds.length===a.eligibleIds.length;
}
export function auctionResolve(game,secret){
 const mod=auctionState(game),a=mod.active;if(!a||a.submittedIds.length!==a.eligibleIds.length)throw Error('仍有人尚未回應。');
 const bids=a.eligibleIds.map(id=>({playerId:id,amount:secret[id]}));if(bids.some(b=>!Number.isSafeInteger(b.amount)))throw Error('出價資料遺失，請重新競標。');
 const max=Math.max(...bids.map(b=>b.amount));const tied=bids.filter(b=>b.amount===max);let winner=null;
 if(max>0){let x=game.rng|0;x^=x<<13;x^=x>>>17;x^=x<<5;game.rng=x|0;winner=tied[Math.floor(((x>>>0)/4294967296)*tied.length)];
 const p=game.players.find(p=>p.id===winner.playerId);if(game.companies[p.roleId].cash<max)throw Error('得標者現金不足。');
 game.companies[p.roleId].cash-=max;
 mod.effects.push({id:a.id,ownerId:winner.playerId,item:a.item,startRound:game.round,endRound:game.round+a.item.duration-1});}
 mod.lastResult={id:a.id,item:a.item,bids,winnerId:winner?.playerId||null,price:max,tie:tied.length>1&&max>0};mod.active=null;
 game.log.unshift(winner?`【得標】${game.players.find(p=>p.id===winner.playerId).name} 以 ${max} 取得「${a.item.title}」${tied.length>1?'（同價抽籤）':''}`:`【流標】「${a.item.title}」無人出價。`);
 return mod.lastResult;
}
export function auctionBonus(game,roleId,round,base){
 const p=game.players.find(p=>p.roleId===roleId);if(!p)return 0;
 const active=auctionState(game).effects.filter(e=>e.ownerId===p.id&&e.startRound<=round&&round<=e.endRound);
 const income=active.filter(e=>e.item.kind==='income').reduce((n,e)=>n+e.item.amount,0);
 const savings=Math.min(-base.costs,active.filter(e=>e.item.kind==='saving').reduce((n,e)=>n+e.item.amount,0));
 return income+savings;
}
