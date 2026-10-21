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
- `main` 沒有房間功能；如果之後改從 `main` 部署，要先把功能合併進去（合併前要問使用者）。
- 這台電腦沒有 `gh`，內建瀏覽器也沒登入 GitHub；Repo 設定只能請使用者自己改。

### 多裝置房間（用代碼加入）— 已可使用
使用者已決定：
- 連線用 **WebRTC 點對點（PeerJS）**，房主瀏覽器是唯一權威主機，可部署在 GitHub Pages。
- **每台裝置只控制自己認領的玩家**；沒人認領的座位由房主操作。

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
- 結論：要讓線上版穩定跨網路連線，需要 TURN 中繼。

尚未做／已知限制（下一步可考慮，修改前要先問使用者）：
- **Bug**：點對點連線失敗時，PeerJS 不一定會觸發 `close`/`error`，訪客會一直停在「正在連線…」。需要加連線逾時（例如 15 秒未 `open` 就提示並中止或重試），房主端也要清掉一直沒 `hello` 的連線。
- 沒有 TURN 伺服器。免費選項（例如 Metered、Cloudflare）多半要使用者自己註冊帳號取得金鑰，而且金鑰會出現在公開的前端程式裡；要不要用、用哪個，請先問使用者。
- 還沒用兩台實體裝置、不同網路測試過。
- 房主重新整理頁面會換一個新代碼，訪客要重新加入；房主的座位分配只存在記憶體。
- 房主端的 `applyAction`／連線流程沒有自動化測試（需要瀏覽器與網路），目前靠手動兩頁籤驗證。

## 交付規則

- 更新 README，說明新增功能、啟動方法及限制。
- 在 Commit 之前先列出修改的檔案，不自行 Push 或合併。
