## 通知濾盒 FilterBox Webhook 功能指南

通知濾盒從 2.0.0 版開始新增 Webhook 功能，可以建立規則，將您需要的通知內容傳送到指定的 URL。

注意：通知內容可能包含隱私資訊，請務必選擇您信賴的伺服器。

### 自訂內容

- Request method: 目前支援 `GET` 和 `POST`
- 可以自訂 URL、body、和 header。
自訂 URL 和 body 中支援使用通知的各項屬性欄位，完整支援的欄位請點開通知列表中最近的 20 則通知，並選擇「偵錯資訊」以查看。

以下為部分常用欄位：

- `{android.title}` 通知標題
- `{android.text}` 通知內容
- `{filterbox.field.APP_NAME}` App 名稱
- `{filterbox.field.PACKAGE_NAME}` App 套件名稱
- `{filterbox.field.WHEN}` 通知的傳送時間

URL 語法舉例：
```
https://example.com/notification?title={android.title}&message={android.text}&app={filterbox.field.APP_NAME}
```
body 語法舉例：
```
{
	"title": "{android.title}",
	"text": "{android.text}",
	"app": "{filterbox.field.PACKAGE_NAME}",
	"some_other_field": "some other field here"
}
```
當 body 格式為 JSON 時，header 建議填寫為 `Content-Type: application/json`

如有疑問或更多功能需求，歡迎使用 App 內意見回饋功能寄信聯絡作者。


### 用法舉例：轉寄備用機簡訊驗證碼到各類聊天軟體

#### 到微信（使用 Server 醬）

1. 在 Server 醬官網註冊並設定 https://sct.ftqq.com/
2. 在通知濾盒中開啟並建立 Webhook 規則，方法為 `GET`，URL 為 
```
https://sctapi.ftqq.com/#Server醬SendKey#.send?title={android.title}&desp={android.message}
```

#### 到 telegram

1. 確保您的裝置可以順利連上 telegram
2. 在 https://t.me/botfather 中輸入指令 `/newbot` 並依照提示建立機器人，取得 token
3. 從 https://t.me/userinfobot 取得你的 ID
4. 在通知濾盒中開啟並建立 Webhook 規則，方法為 `GET`，URL 為 
```
https://api.telegram.org/bot#機器人token#/sendmessage?text={android.title}%0A{android.text}&chat_id=#你的ID#
```
