# AGENTS.md

## 專案目的

維持「經濟棋局」原有的多人財經桌遊玩法，以小步驟加入新功能。目前的功能是「多裝置房間」：不同裝置用代碼加入同一局（見下方「目前進度」）。

## 專案結構

- `data.js`、`engine.js`、`sync.js`、`room.js`、`app.js` 是來源檔；`game.js` 由它們合併產生，`index.html` 實際載入的是 `game.js`。
- 修改來源檔後，必須執行 `node build.mjs` 更新 `game.js`，兩者要一起提交。
- 測試以 `node --test` 執行（`engine.test.js`、`sync.test.js`、`room.test.js`）。
- 這台電腦沒有 Node.js：建置改用 `python _harness/build.py . game.js`（與 `build.mjs` 輸出逐位元組相同，已用 HEAD 版 `game.js` 驗證）；測試用 `python -m http.server 4173` 後開 `http://127.0.0.1:4173/_harness/tests.html`。`_harness/` 已列在 `.git/info/exclude`，不會被提交。

## 修改規則

- 修改前先指出涉及的檔案及計畫。
- 優先保留原有結構，避免無關的大規模重構。
- 新增功能需有可操作的驗證方式，並補上對應的測試。
- 修改 UI 時保留基本的行動裝置可用性。
- 不建立或提交 API Key、密碼、個資或 .env 等敏感檔案。
- 每完成一個功能，摘要修改範圍與測試結果。

## 工作方式（使用者要求）

- 使用者回答設計問題不等於同意開工；要等使用者明確說「做」才動手改檔。
- 使用者明確要求時才 commit / push。

## 目前進度（2026-10-21）

### 線上展示
- GitHub Pages：<https://soymilk0211.github.io/bigdata-week7/>，由使用者在 GitHub 設定為「Deploy from a branch → `feature/my-improvement` / (root)」。每次 push 到這個分支都會自動重新部署（約 1～2 分鐘）。
- 2026-10-21 使用者同意把 `feature/my-improvement` 合併進 `main`（快轉，兩者內容相同）。GitHub Pages 仍從 `feature/my-improvement` 部署；之後新功能先在功能分支完成，合併進 `main` 前要問使用者。
- 這台電腦沒有 `gh`，內建瀏覽器也沒登入 GitHub；Repo 設定只能請使用者自己改。

### 多裝置房間（用代碼加入）— 已可使用
使用者已決定：
- 連線用 **WebRTC 點對點（PeerJS）**，房主瀏覽器是唯一權威主機，可部署在 GitHub Pages。
- **每台裝置只控制自己認領的玩家**。
- （2026-10-21 改）**每位玩家都要有一台裝置入座才能開始**，房主也只是其中一位玩家；原本「沒人認領的座位由房主操作」已取消，沒有裝置的人改用單機模式。
- （2026-10-21）**座位確認後鎖定**，裝置不能自己換位子或離開座位；選錯由房主按「收回」（`releaseSeat`）。
- （2026-10-21，與其他人討論後）**房間模式下玩家區只顯示自己的完整資料**，其他玩家只出現在「淨資產排行」（名次、玩家、公司、淨資產）。單機模式照舊顯示全部。只是不顯示，資料仍會傳到每台裝置。棋盤中央和回合面板仍會顯示目前回合玩家的內容（使用者沒有要求隱藏）。

第一段（commit `61375c7`）：
- `room.js`：`makeRoomCode`（5 碼，排除 0/O/1/I）、`normalizeRoomCode`、`roomPeerId`（前綴 `econboard-v1-`）、`seatController`、`canAct`、`claimSeat`、`releaseSeat`、`releaseClient`、`parseGuestMessage`（訪客訊息白名單：`hello`／`claim`／`release`／`action`，數量必須是有限數字）。`room.test.js` 有 7 個測試。
- `run()` 改為回傳錯誤訊息字串（成功時回傳 `null`）。

第二段（連線與畫面）：
- PeerJS 只在使用房間時動態載入：`https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js`，SRI `sha384-nlUQ8ZqCbvStErob+biJNzSgltf6urV3VGqhfIfzhmg9RXmpeRm76ELw0pYnKlTR`。單機遊玩不依賴網路。
- `app.js` 的程式位置：`room` 狀態物件與 `clientId`（存在 `sessionStorage`）在檔案上方；連線程式在 `applyAction` 之後（`createRoom`／`openHostPeer`／`acceptGuest`／`onGuestMessage`／`joinRoom`／`connectToHost`／`onHostMessage`／座位操作／`renderRoom`）。
- 動作邏輯抽成 `applyAction(action, amount, remote)`，本機點擊和遠端訊息共用。遠端動作只檢查 `phase==='draw'`，不受房主本機「卡片未關閉」限制。
- 房主：`save()` 和 `adoptShared()` 結尾呼叫 `broadcastRoom()`，送出 `{t:'state', game: JSON 字串（log 只留 60 筆）, seats, online, hostClientId}`；回應 `hello` 時加上 `welcome:true`。遠端動作排進 `room.queue` 逐一處理，並在執行當下才用 `canAct` 檢查。`gameId` 改變時清空座位。關閉房間或關閉頁面時送 `{t:'closed'}`。
- 訪客：`save()` 不寫 `localStorage`，不回應 `storage`／`BroadcastChannel`／focus 同步；收到 `welcome` 先清掉本機 `state` 再採用房主狀態；斷線每 3 秒重連，最多 15 次。離開房間會重新載入頁面（去掉 `?room=`），回到本機對局。
- 畫面：頂端「多裝置房間」按鈕與狀態標籤（`#room-chip`）、房間對話框（`#room-modal`）、訪客等待開局畫面（`#room-wait`）。`renderBoard`／`renderTurn` 變成包裝函式，內容在 `renderBoardContent`／`renderTurnContent`，再由 `gateTurnControls()` 停用不是自己回合的按鈕並顯示提示。`host-only` 類別的按鈕在訪客端隱藏。支援 `?room=代碼` 邀請連結。

已驗證（瀏覽器兩個頁籤，經 PeerJS 公用伺服器實際連線）：建立房間 → 邀請連結加入 → 未選座位時無法操作 → 認領座位後拉霸、抽卡、聘僱、交棒並結算一季 → 連送兩次「交給下一位」第二次被擋 → 訪客重新整理後座位保留 → 房主關閉房間後訪客收到通知。375px 手機寬度無橫向溢出。28 個單元測試通過。

線上展示網址的連線測試（2026-10-21）：
- 房主建房成功（PeerJS 從 unpkg 載入、SRI 通過），訪客也連上配對伺服器並找到房主，但 WebRTC 點對點連線失敗（`connectionState: failed`）。
- 原因：在公開網址上，Chromium 的 host 候選位址是 mDNS（`xxxx.local`），只剩 srflx（學校對外 IP `163.25.119.118`），同一台電腦的兩個頁籤需要 NAT 迴流，學校網路不支援。在 `localhost` 上瀏覽器會給真實區網位址，所以本機測試能連上。
- 結論：要讓線上版穩定跨網路連線，技術上需要 TURN 中繼，但使用者決定不用（見下方）。

第三段（連線逾時，使用者選「只修逾時提示」，不加 TURN）：
- 原因：PeerJS 1.5.4 的 `DataConnection.close()` 在連線從未 `open` 時不會發出 `close`；ICE 失敗時只發 `error`，卡住時什麼都不發。舊程式忽略 `error`，所以訪客停在「正在連線…」。
- `app.js`：`CONNECT_TIMEOUT_MS=15000`。訪客在 `joinRoom` 和每次 `connectToHost` 呼叫 `armConnectTimeout()`；`open` 時清掉計時器。逾時、`open` 之前的 `error`、或 `close` 都走 `dropHostConn()`：已同步的訪客照舊 `scheduleReconnect()`（每次重連也有逾時，不會卡在同一次）；還沒同步的訪客呼叫 `failJoin()`，重設房間並打開對話框顯示 `P2P_FAILED`（建議改用手機熱點）或 `SIGNAL_FAILED`（配對伺服器沒回應）。代碼保留在輸入框。
- 房主：`acceptGuest` 15 秒後仍沒 `hello` 的連線會從 `room.guests` 移除；若連線從未 `open`，會跳提示。
- `styles.css`：`.room-card .form-error` 改成紅字底色框（原本被 `.modal-card p:not(.eyebrow)` 蓋成灰字）。
- 驗證：在 Chromium 用假的 `Peer`（模擬 1.5.4 的事件行為）加上 Playwright 假時鐘跑 8 個情境：只發 `error`、完全卡住、配對伺服器不回應、正常連線 60 秒不誤判、已加入的訪客重連卡住會繼續重試並在 15 次後顯示離線、房主清掉沒開成的連線。舊版 2/8 通過（重現「正在連線…」卡住），新版 8/8。375px 無橫向溢出。28 個單元測試通過。這個腳本需要 Playwright，沒有放進 repo。

實機測試（2026-10-21，使用者回報）：
- 同一支手機開兩個頁籤（一個房主、一個訪客）會失敗，訪客看到「找不到這個房間」：手機切到訪客頁籤時，房主頁籤被暫停，房間從配對伺服器上消失。
- **兩支手機、不同網路可以連上並遊玩。**

第四段（房主暫時離線，使用者說「做」）：
- 讀 PeerJS 1.5.4 原始碼（npm 版與 unpkg 版 SRI 相同）發現：房主和配對伺服器斷線後，舊程式會立刻 `reconnect()`；重連失敗時 `error` 發生在 `peer.open===false`，舊程式就 `resetRoom()`，整個房間被拆掉（已加入的訪客也斷線）。重連時伺服器若還佔著舊 ID，回 `unavailable-id`，舊程式會換新代碼並斷開所有人。另外 PeerJS 每次重連失敗都會再發一次 `disconnected`，立刻重連會變成連續重試。
- `app.js`：房主的 peer 曾經 `open` 之後（`opened`），`error` 一律忽略，交給 `disconnected` 處理 → `hostSignalLost()`：`room.offline=true`、提示「房間暫時離線」、狀態文字變琥珀色、頂端標籤顯示「暫時離線」，每 `SIGNAL_RETRY_MS=5000` 用同一個 ID `reconnect()`（`scheduleSignalRetry`／`retrySignal`）。重新 `open` 時提示「房間恢復連線」。訪客的 `disconnected` 也改成間隔重試。頁面回到前景（`visibilitychange`）或網路恢復（`online`）時立刻重試。
- 訪客「找不到這個房間」改成 `ROOM_NOT_FOUND`，說明房主頁面要開在最前面、重新整理會換代碼。
- 驗證：用 npm 的 `peerjs@1.5.4`（與線上同一個檔案）加本機 PeerServer（`peer@1.0.2`，綁 127.0.0.1:9000），在 Chromium 實際連線後停掉、重啟伺服器。舊版 2/9 通過（房間被拆掉、訪客斷線、恢復後代碼失效）；新版 9/9：伺服器停 20 秒房主保留房間和代碼、已加入的訪客不斷線、房主和訪客各只重試 4 次、伺服器回來 5 秒內恢復同一代碼、新裝置可用同一代碼加入、找不到房間的訊息正確。另外 3 個情境：伺服器仍佔著舊 ID 時房主維持離線不換代碼、ID 釋出後拿回同一代碼、`visibilitychange` 立刻重連（24 ms）。第三段的 8 個逾時情境仍全數通過，28 個單元測試通過，375px 無橫向溢出。腳本需要 Playwright 和網路下載套件，沒有放進 repo。

第五段（座位鎖定、全員入座、只看自己的資料，使用者說「做」）：
- `room.js`：移除 `seatController`、`releaseClient`；新增 `emptySeats(seats, playerIds)`。`canAct(seats, game, clientId)`（不再傳房主 ID）在還有空位時一律回傳 `false`。`claimSeat` 在裝置已經有座位時丟出「你已經選好座位了…」。`parseGuestMessage` 不再接受 `release`。新增 `netWorthRanking(game)`（由高到低，同分同名次），淨資產只在這裡算給排行用。
- `app.js`：`mySeat()`／`missingSeats()`；`claimSeatHere` 先 `confirm`；座位清單在房主端對所有已入座的座位顯示「收回」，訪客自己的座位顯示「已鎖定」，已入座的裝置看不到其他「坐這裡」。`promptSeat()`（在 `renderRoom` 開頭）每個 `gameId` 對沒座位的裝置自動打開座位清單一次。`turnWho()` 讓「輪到你」只對可操作的裝置顯示，其他人看到「輪到「玩家 1」」；`roomTurnNote()` 顯示「等待入座：還差…」或「現在輪到…，你是…」。`renderPlayers` 在房間模式只畫自己的卡（`.mine`、「你」標記）加 `rankingMarkup()`。頂端標籤：訪客顯示「你：玩家 2」或「還沒選座位」。
- `index.html`：訪客等待畫面文字改成「會跳出座位清單」。`styles.css`：`.net-ranking`、`.you-badge`、`.room-seat-locked`。
- 驗證：30 個單元測試（`room.test.js` 改寫座位測試並加排行測試）。Chromium＋真的 PeerJS＋本機 PeerServer 13 個情境全過：房主開局後訪客和房主都自動跳出座位清單；有空位時房主強制按拉霸也被擋並提示還差誰；入座後鎖定；改過程式的訪客送 `claim` 另一個空位或 `release` 都被房主拒絕；訪客畫面寫「輪到「玩家 1」」；坐滿後輪到的人能拉霸；房主和訪客都只看到自己的卡和兩人排行；不開房間時照舊。390／1000／1500px 版面正常、無橫向溢出。第三、四段的 8＋9＋3 個連線情境重跑仍全過。

### 併吞／競標系統（其他人開發中）— 整合約定
使用者決定（2026-10-21）：**我們先把房間這邊做好並合併，再請對方把併吞系統接上來**。對方說會做成模組，不影響我們的合併。以下是接上時要注意的地方，給對方和下一個接手的人：

模組怎麼放才不會把遊戲弄壞：
- `index.html` 只載入 `game.js`，它由 `build.mjs` 把 `data.js`、`engine.js`、`sync.js`、`room.js`、`app.js` 依序接成一個檔。新模組要加進 `build.mjs` 的清單（用到引擎就放在 `engine.js` 後、`app.js` 前），只能用 `export function`／`export const` 和單行 `import … from './x.js'`。
- 所有檔案接起來後共用同一個範圍，頂層名稱不能和現有的重複（例如 `role`、`colors`、`money`、`state`），否則整個遊戲出錯打不開。建議一律加前綴，例如 `merger…`。
- 規則寫成只讀寫 `state` 的純函式（像 `engine.js` 的 `issueLoan(state, playerId, amount)`，不合法時 `throw Error('中文訊息')`），並在測試檔加測試。不要碰 DOM 或網路。房間裡只有房主執行規則，再把整份 `state` 廣播出去，所以純函式就會自動同步。`importGame` 只檢查基本欄位，新增欄位不會被擋。

接上時房間這邊要改的地方（等對方告訴我們名稱後由我們改）：
- **新動作**：加在 `app.js` 的 `applyAction`，並加進 `room.js` 的 `GUEST_ACTIONS`（有數量就也加進 `AMOUNT_ACTIONS`）。`parseGuestMessage` 目前只放行 `action` 和 `amount`；如果出價還要帶「哪家公司」等參數，要在這裡加驗證。
- **誰可以出價**：`canAct` 只允許坐在目前回合玩家的裝置。競標時其他人也要能出價，需要新的權限規則（例如競標階段裡，坐在未出局玩家、且不是被賣公司的裝置可以出價）。房主端的 `room.queue` 會把同時到達的出價逐一處理，引擎只要逐筆檢查即可。
- **淨資產**：目前一位玩家只有一個 `roleId`，淨資產在 `engine.js` 的 `endTurn`（破產、勝利判定）、`app.js` 的 `renderGoals`、`renderPlayers`，以及 `room.js` 的 `netWorthRanking` 用 `companyPosition(state, roleId)` 算。如果併吞後一位玩家可以擁有多家公司，這幾處要改成同一個函式（建議引擎加 `playerNetWorth(state, player)`），排行再改用它。
- **出局的玩家**：要有一個欄位標示（名稱待對方定）。`endTurn` 的輪流順序要跳過他；`emptySeats`／`canAct` 也要排除他，否則遊戲會一直等他的空位。他的裝置變成只能觀看。

中途有人要離開，討論過的三種做法：
- A. 換人接手：房主按「收回」，另一台裝置坐下接著玩，遊戲在等待期間暫停。**已經可以用。**
- B. 退出：玩家不再輪到、不參與勝負，公司像沒人選的企業一樣每季照樣結算（引擎本來就會結算全部十家公司）。尚未做。
- C. 競標併吞：由其他人開發。還沒定案的規則：底價怎麼算、輪流喊價或暗標、得標款付給誰（離開的人已不在，例如付給銀行）、併吞後是同時經營兩家公司還是只把淨資產併進來、勝利條件要不要調整。

尚未做／已知限制（下一步可考慮，修改前要先問使用者）：
- **使用者決定不使用 TURN 中繼（2026-10-21）。** 跨網路連線不保證成功，連不上時靠逾時提示引導改用手機熱點。除非使用者主動提起，不要再提議加入 TURN。
- 房主頁面被暫停太久時，已加入的訪客也可能斷線；訪客重連 15 次（約 2 分鐘）後會停在「房主已離線」，要重新加入。這部分沒有實機測過。
- 房主重新整理頁面會換一個新代碼，訪客要重新加入；房主的座位分配只存在記憶體。
- 房主端的 `applyAction`／連線流程沒有自動化測試（需要瀏覽器與網路），目前靠手動兩頁籤驗證。

## 交付規則

- 更新 README，說明新增功能、啟動方法及限制。
- 在 Commit 之前先列出修改的檔案，不自行 Push 或合併。
