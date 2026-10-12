## FilterBox Webhook 機能ガイド

バージョン 2.0.0 から、Filter Box に Webhook 機能が追加されました。ルールを作成して、通知の内容を指定した URL に送信できます。

注意：通知の内容には個人情報が含まれることがあります。信頼できるサーバーを選んでください。

### カスタム内容

- リクエストメソッド：現在は `GET` と `POST` に対応しています
- URL、body、header をカスタマイズできます。

カスタム URL と body では、通知のさまざまな属性フィールドを使えます。対応しているフィールドの一覧は、通知リストにある最近の 20 件の通知のいずれかで「デバッグ情報」オプションを確認してください。

よく使われるフィールドは次のとおりです：

- `{android.title}` 通知のタイトル
- `{android.text}` 通知の内容
- `{filterbox.field.APP_NAME}` アプリ名
- `{filterbox.field.PACKAGE_NAME}` アプリのパッケージ名
- `{filterbox.field.WHEN}` 通知の送信時刻

URL 構文の例：
```
https://example.com/notification?title={android.title}&message={android.text}&app={filterbox.field.APP_NAME}
```
body 構文の例：
```
{
  "title": "{android.title}",
  "text": "{android.text}",
  "app": "{filterbox.field.PACKAGE_NAME}",
  "some_other_field1": "some other field here",
  "some_other_field2": "some other field here",
  "some_other_field3": "some other field here"
}
```
body に JSON 形式を使う場合は、header を `Content-Type: application/json` に設定することをおすすめします。

ご質問や機能のご要望は、アプリ内のフィードバック機能からお問い合わせください。

### 使用例：予備の端末の SMS 認証コードを Telegram に転送する

1. お使いの端末から Telegram に正常に接続できることを確認します
2. https://t.me/botfather でコマンド `/newbot` を入力し、案内に従ってボットを作成してトークンを取得します
3. https://t.me/userinfobot で自分の ID を取得します
4. Filter Box で Webhook ルールを有効にして作成し、メソッドを `GET`、URL を次のように設定します：
```
https://api.telegram.org/bot#YOUR_BOT_TOKEN#/sendmessage?text={android.title}%0A{android.text}&chat_id=#YOUR_ID#
```
