## 通知滤盒 Filter Box Webhook 功能指南

通知滤盒从 2.0.0 版开始新增 Webhook 功能，可以创建规则，将您需要的通知内容发送到指定的 URL。

注意：由于通知内容可能包含您的隐私信息，请务必使用您信赖的服务端。

### URL

自定义 URL 中支持使用通知的各项属性字段，完整支持字段请点开通知列表中最近的 20 条通知，并选择「调试信息」以查看。

以下为部分常用字段：

- `{android.title}` 通知标题
- `{android.text}` 通知内容
- `{filterbox.field.APP_NAME}` App 名称
- `{filterbox.field.PACKAGE_NAME}` App 包名
- `{filterbox.field.WHEN}` 通知的发送时间

最后拼出来的 URL 可能看起来像：
```
https://example.com/notification?title={android.title}&message={android.text}&app={filterbox.field.APP_NAME}
```

### Request method

目前仅支持 `GET` 和 `POST` 两种方法。

选择 `GET` 方法时，请求的 body 为空；

选择 `POST` 方法时，body 为 JSON 格式，内容与「调试信息」相同。

如有疑问或更多功能需求，欢迎使用 App 内反馈功能给作者发邮件。
