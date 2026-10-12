## Filter Box - 高度なフィルターガイド

高度なフィルターには Filter Box 1.0.0 以上が必要です。通知のあらゆるフィールドを使って通知をフィルタできます。

JSON と正規表現の構文を理解している方にのみ適しています。

### 例

音楽アプリの再生コントロールを残し、ほかの通知を消去する例です：

```JSON
{
  "match": "NONE",
  "node": [
    {
      "field": "android.template",
      "regex": "MediaStyle"
    },
    {
      "field": "filterbox.field.HAS_BIG_CONTENT_VIEW",
      "regex": "true"
    }
    ]
}
```
Filter Box で新しいルールを作成し、よく使う音楽アプリにチェックを入れて「高度なマッチルール」を選び、上の JSON をコピーして貼り付ければ使えます。

### 構文

```JSON
  "match": "NONE",
```
マッチモードです。現在は ALL、ANY、NONE に対応しています。すべて大文字です。


```JSON
  "node": [],
```
マッチするノードの配列で、数に制限はありません。

```JSON
    {
      "field": "android.template",
      "regex": "MediaStyle"
    },
```
ノード：

`regex` は正規表現です。正規表現にマッチすると、そのノードはマッチしたことになります。

`field` はどこで確認できますか？最近の 20 件の通知のいずれかを開き、「デバッグ」オプションをタップすると、利用できるすべてのフィールドが表示されます。

![デバッグ情報](/img/screenshot_debug_zh.png)

`filterbox.field` で始まるフィールドは Filter Box が設定したもので、それ以外は Android システム（`Notification#extras`）が設定したものです。

処理しやすいように、すべて文字列に変換されます。

### TIPS

スマホでの JSON の編集には、さまざまなオンライン JSON エディターが役立ちます：<http://jsoneditoronline.org/>
