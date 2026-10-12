# 通知濾盒進階過濾規則指南

通知濾盒從 1.0.0 版開始提供進階過濾，可以依照通知的任意屬性自訂判斷條件，做到像「清除音樂 App 除了播放控制以外的所有通知」這樣較複雜的功能。

進階過濾使用 JSON 語法。使用前請確認你會撰寫 JSON，並了解規則運算式（正規表示式）。

### 範例

以下設定可以讓音樂 App 保留播放控制列，同時清除其他廣告通知：

```json
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

在通知濾盒中新增一條規則，勾選你常用的音樂 App，選擇「進階比對模式」，複製並貼上上面的 JSON 即可使用。

### 語法

逐行說明：

```json
  "match": "NONE",
```

比對模式，目前支援 `ALL`、`ANY`、`NONE` 三種，皆為大寫。

分別代表一則通知如果**符合所有節點**、**符合任一節點**、**不符合任何節點**，就會被過濾。

```json
  "node": [],
```

比對節點陣列，數量不限。

```json
    {
      "field": "android.template",
      "regex": "MediaStyle"
    },
```

節點：每個節點都需要 `field` 與 `regex` 兩個欄位。

`regex` 是規則運算式，符合就代表這個節點比對成功。

有哪些 `field` 可以使用？請在通知濾盒的時間軸中點開最近的通知（為了節省記憶體，較舊的通知可能已被清除），選擇「偵錯資訊」，就能看到所有可用的欄位。

![偵錯資訊畫面](/img/screenshot_debug_zh.png)

其中 `filterbox.field.XXX` 由通知濾盒填入，其餘欄位都讀取自 `Notification#extras`。

為了方便處理，所有內容都會轉換成字串。

### 小提示

- **為什麼上面的規則要用兩個節點？**

  大部分 App 開發者遵守 Android 開發規範，使用 Android 原生的音樂通知實作，也就是 `MediaStyle`。少數 App 會繞過系統自行繪製介面，因此用 `filterbox.field.HAS_BIG_CONTENT_VIEW`（是否有自訂的展開檢視）來判斷。兩個節點都不符合的通知，才會被過濾。

- **手寫 JSON 很容易出錯？**

  沒錯，建議使用 JSON 編輯器來避免漏掉逗號之類的語法錯誤，例如線上的 <https://jsoneditoronline.org/>。
