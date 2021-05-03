## Filter Box Webhook Function Guide

Webhook function requires Filter Box 2.0.0+. You can create rules to send the notification content you need to the specified URL.

Note: The notification content may contain your private information. Please be sure to use your trusted server.

### URL

The custom URL supports the use of various attribute fields of notifications. For complete support fields, please click on the 20 most recent notifications in the list and select "Debug Info" to view.

The following are some commonly used fields:

- `{android.title}` Notification title
- `{android.text}` Notification content
- `{filterbox.field.APP_NAME}` App name
- `{filterbox.field.PACKAGE_NAME}` App package name
- `{filterbox.field.WHEN}` Notification sending time

The final URL may look like:
```
https://example.com/notification?title={android.title}&message={android.text}&app={filterbox.field.APP_NAME}
```

### Request method

Currently, only two methods `GET` and `POST` are supported.

For the `GET` method the request body is empty;

For the `POST` method the request body is in JSON format and its content will be the same as the "debugging information".

### Example: Foward notifications to Telegram Bot

1. Visit https://t.me/botfather type `/newbot` and follow the instruction to create your own bot. Get the `token`.
2. Get your telegram ID from https://t.me/userinfobot .
3. Create Webhook rule in FilterBox and set the URL as below:
```
https://api.telegram.org/bot[your_token]/sendmessage?text={android.title}%0A{android.text}&chat_id=[your_id]
```
Replace `[your_token]` and `[your_id]` to the info you got above.


If any questions or more functional requirements please use the in-app feedback to contact us.

