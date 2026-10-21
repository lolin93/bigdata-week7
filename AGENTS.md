# AGENTS.md

## 專案目的

維持「經濟棋局」原有的多人財經桌遊玩法，透過小步驟完成課堂指定的兩項改良。

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

### 分支狀態
- 目前分支 `feature/my-improvement`。早先的兩項課堂改良（歷史 CSV 匯出 `c512663`、結束時淨資產排名 `46c52cc`）**不在這個分支的歷史上**，只留在標籤 `backup-csv-ranking`。要不要救回來，請先問使用者。

### 進行中：多裝置房間（用代碼加入）
使用者已決定：
- 連線用 **WebRTC 點對點（PeerJS）**，房主瀏覽器是唯一權威主機，可部署在 GitHub Pages。
- **每台裝置只控制自己認領的玩家**；沒人認領的座位由房主操作。

已完成（第一段）：
- `room.js`：`makeRoomCode`（5 碼，排除 0/O/1/I）、`normalizeRoomCode`、`roomPeerId`（前綴 `econboard-v1-`）、`seatController`、`canAct`、`claimSeat`、`releaseSeat`、`releaseClient`、`parseGuestMessage`（訪客訊息白名單：`hello`／`claim`／`release`／`action`，數量必須是有限數字）。
- `room.test.js`：7 個測試；全部 28 個測試通過。
- `app.js`：`run()` 改為回傳錯誤訊息字串（成功時回傳 `null`），讓房主之後能把錯誤回報給訪客。目前其他呼叫端都忽略回傳值，行為不變。
- `build.mjs` 已把 `room.js` 加入合併清單，`game.js` 已重新產生。

下一步（尚未開始）：
1. 動態載入 PeerJS：`https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js`，SRI 為 `sha384-nlUQ8ZqCbvStErob+biJNzSgltf6urV3VGqhfIfzhmg9RXmpeRm76ELw0pYnKlTR`（已實際下載計算）。只在使用房間時才載入，單機遊玩不依賴網路。
2. `app.js` 加入 `room` 狀態（`role: host|guest|null`、`code`、`peer`、連線清單、`seats`、`hostClientId`）。`clientId` 存在 `sessionStorage`，讓重新整理後能拿回座位。
3. 把 `#game` 點擊處理裡的動作邏輯抽成 `applyAction(action, amount, remote)`，本機點擊和遠端訊息共用。遠端動作不受本機「卡片未關閉」(`currentCard()`) 限制，只檢查 `phase==='draw'`。
4. 房主：`save()` 之後廣播 `{t:'state', game: JSON 字串（log 只留 60 筆）, seats, online, hostClientId}`；收到 `hello` 時回傳並標記 `welcome:true`。遠端動作要排進佇列逐一處理，並在**執行當下**才用 `canAct` 檢查（避免連點「交給下一位」跳過別人）。`gameId` 改變時清空座位。
5. 訪客：絕不寫 `localStorage`、不回應 `storage`／`BroadcastChannel`／focus 同步；收到 `welcome` 先把 `state` 設為 `null` 再採用房主狀態；斷線每 3 秒重連，最多 15 次。離開房間以重新載入頁面（去掉 `?room=`）回到本機對局。
6. 介面：頂端加「多裝置房間」按鈕與狀態標籤、房間對話框（建立／輸入代碼加入／座位清單：認領、離開、房主可收回）。支援 `?room=代碼` 連結自動帶入代碼。不是自己回合時停用 `#turn-content` 的按鈕和抽卡牌堆，並顯示「等待 X 操作」；訪客隱藏匯出、匯入、新遊戲、開啟同步頁籤。保留手機寬度可用。
7. 驗證：在瀏覽器開兩個頁籤，一個建房、一個用代碼加入，走完一回合；再更新 README 的限制說明。

## 交付規則

- 更新 README，說明新增功能、啟動方法及限制。
- 在 Commit 之前先列出修改的檔案，不自行 Push 或合併。
