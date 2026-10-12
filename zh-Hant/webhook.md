# 通知濾盒 Webhook 功能指南

通知濾盒從 2.0.0 版開始提供 Webhook 功能，可以建立規則，把你需要的通知內容傳送到指定的網址。

注意：通知內容可能包含個人隱私資訊，請務必選擇你信任的伺服器，並盡量使用 HTTPS。

### 自訂內容

- 請求方法：目前支援 `GET` 與 `POST`。
- 可以自訂 URL、body 與 header。

URL 與 body 中可以使用通知的各項屬性欄位。完整的可用欄位，請在通知清單中點開最近的通知，選擇「偵錯資訊」查看。

以下是幾個常用欄位：

- `{android.title}` 通知標題
- `{android.text}` 通知內容
- `{filterbox.field.APP_NAME}` App 名稱
- `{filterbox.field.PACKAGE_NAME}` App 套件名稱
- `{filterbox.field.WHEN}` 通知的傳送時間

URL 範例：

```
https://example.com/notification?title={android.title}&message={android.text}&app={filterbox.field.APP_NAME}
```

body 範例：

```
{
  "title": "{android.title}",
  "text": "{android.text}",
  "app": "{filterbox.field.PACKAGE_NAME}",
  "some_other_field": "some other field here"
}
```

當 body 是 JSON 格式時，通知濾盒會自動把 header 設為 `Content-Type: application/json`。

如果有疑問或其他功能需求，歡迎使用 App 內的意見回饋功能寄信給開發者。

### 使用範例：把備用手機的簡訊驗證碼轉寄到 Telegram

1. 確認你的裝置可以正常連上 Telegram。
2. 在 <https://t.me/botfather> 輸入指令 `/newbot`，依照提示建立機器人並取得 token。
3. 從 <https://t.me/userinfobot> 取得你的 ID。
4. 在通知濾盒中建立 Webhook 規則，請求方法選擇 `GET`，URL 填入：

```
https://api.telegram.org/bot#機器人token#/sendmessage?text={android.title}%0A{android.text}&chat_id=#你的ID#
```

請把 `#機器人token#` 與 `#你的ID#` 換成你自己的資料（包含兩側的 `#` 符號）。
