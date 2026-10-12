## 通知濾盒 Filter Box 進階過濾規則指南

通知濾盒從 1.0.0 版開始新增進階過濾，可以根據通知的任意屬性來進行自訂判斷過濾。可以實現如「清除音樂 App 除播放控制外的所有通知」這樣較複雜的功能。

進階過濾功能使用 JSON 語法。使用前請確保您知道如何撰寫 JSON，了解規則運算式。

### 範例

以下是實現音樂 App 保留播放控制列並去除廣告的設定範例：

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

在通知濾盒中新增一條規則，勾選你常用的音樂 App，選擇「進階比對模式」，複製並貼上上述 JSON 即可使用。

### 語法

逐行解釋：
```JSON
  "match": "NONE",
```
比對模式，目前支援 ALL、ANY、NONE 三種選項，均為大寫。

分別表示一則通知如果 **符合所有節點** / **符合任意一個節點** / **不符合任何節點** 就會被過濾。

```JSON
  "node": [],
```
比對節點陣列，數量不限。

```JSON
    {
      "field": "android.template",
      "regex": "MediaStyle"
    },
```
節點：每一個節點都需要 `field` 和 `regex` 兩個欄位。

`regex` 為規則運算式，滿足該規則運算式即被比對。

有哪些 `field` 欄位可用呢？請直接在通知濾盒時間軸內點開最近的 20 則通知（為節省記憶體，舊通知可能會被清除），選擇「偵錯資訊」即可看到所有可用的欄位。

![偵錯資訊介面](/img/screenshot_debug_zh.png)

上述欄位中，`filterbox.field.XXX` 是由通知濾盒實作填入的；其餘所有欄位都是讀取 `Notification#extras` 得到的。

為了便於處理，所有內容都被轉換為字串。

### TIPS

 - 為什麼上述規則用了兩個節點呢？
 
 大部分 App 開發者遵守 Android 開發規範，會使用 Android 原生的音樂通知實作，也就是 `MediaStyle`。

少部分 App 開發者繞開 Android 系統自行繪製介面，因此對它們使用 `filterbox.field.HAS_BIG_CONTENT_VIEW` （是否有自訂展開檢視）進行鑑別。

所以需要兩個節點都不滿足的通知，才會被過濾。

- 手寫 JSON 很容易出錯？

是的，推薦使用各種編輯器來避免漏逗號之類的語法錯誤。或許你可以試試這個線上的： <http://jsoneditoronline.org/>
