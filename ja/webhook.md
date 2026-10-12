# FilterBox Webhook ガイド

FilterBox はバージョン 2.0.0 から Webhook に対応しています。ルールを作成して、必要な通知の内容を指定した URL に送信できます。

注意：通知の内容には個人情報が含まれることがあります。信頼できるサーバーを選び、できるだけ HTTPS を使ってください。

### 送信内容のカスタマイズ

- リクエストメソッド：現在は `GET` と `POST` に対応しています。
- URL、body、header を自由に設定できます。

URL と body では、通知のさまざまな属性フィールドを使えます。使えるフィールドの一覧は、通知リストで最近の通知を開き、「デバッグ情報」を選ぶと確認できます。

よく使うフィールド：

- `{android.title}` 通知のタイトル
- `{android.text}` 通知の本文
- `{filterbox.field.APP_NAME}` アプリ名
- `{filterbox.field.PACKAGE_NAME}` アプリのパッケージ名
- `{filterbox.field.WHEN}` 通知の送信時刻

URL の例：

```
https://example.com/notification?title={android.title}&message={android.text}&app={filterbox.field.APP_NAME}
```

body の例：

```
{
  "title": "{android.title}",
  "text": "{android.text}",
  "app": "{filterbox.field.PACKAGE_NAME}",
  "some_other_field": "some other field here"
}
```

body が JSON 形式の場合、FilterBox は header を自動的に `Content-Type: application/json` に設定します。

ご質問や機能のご要望は、アプリ内のフィードバック機能から開発者にお送りください。

### 使用例：予備のスマホに届いた SMS の認証コードを Telegram に転送

1. お使いの端末から Telegram に接続できることを確認します。
2. <https://t.me/botfather> でコマンド `/newbot` を入力し、案内に従ってボットを作成してトークンを取得します。
3. <https://t.me/userinfobot> で自分の ID を確認します。
4. FilterBox で Webhook ルールを作成し、メソッドを `GET`、URL を次のように設定します。

```
https://api.telegram.org/bot#ボットのトークン#/sendmessage?text={android.title}%0A{android.text}&chat_id=#あなたのID#
```

`#ボットのトークン#` と `#あなたのID#` は、両側の `#` も含めてご自身の値に置き換えてください。
