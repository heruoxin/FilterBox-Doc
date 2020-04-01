## Filter Box - Advanced Filter Guide

Advanced filter requires Filter Box 1.0.0+. It can help users to filter notification with any fileds of notifications.

It is only suitable for those who understand JSON and regex syntax.

### Example

Here is an example for music app to retains the play back control and remove other notifications:

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
Create a new rule in Filter Box, check your favorite music apps, select "Advanced Match Rule", copy and paste the above JSON to use.

### Syntax

```JSON
  "match": "NONE",
```
Matching mode, currently supports ALL, ANY, NONE. All capitalized.


```JSON
  "node": [],
```
the matching node array with an unlimited number.

```JSON
    {
      "field": "android.template",
      "regex": "MediaStyle"
    },
```
Node: 

`regex` is a regular expression. It will be matched if the regex matched.

Where to find `field`? Just open one of your recent 20 notifications and click "Debug" option to see all available fields.

![Debug Info](/img/screenshot_debug_zh.png)

Fields starting with `filterbox.field` was filled by Filter Box and the others were filled by Android System (the `Notification#extras`).

Everything is converted to strings for ease of processing.

### TIPS

You can use various online JSON editors to help edit JSON on phone: <http://jsoneditoronline.org/>


