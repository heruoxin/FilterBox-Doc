## FilterBox Webhook Functionality Guide

Starting from version 2.0.0, Filter Box has added Webhook functionality, allowing you to create rules to send notification content to specified URLs.

Note: Notification content may contain private information. Please ensure you choose a server you trust.

### Custom Content

- Request method: Currently supports `GET` and `POST`
- You can customize URL, body, and headers.

The custom URL and body support various notification attribute fields. For a complete list of supported fields, check the "Debug Info" option in any of your 20 most recent notifications in the notification list.

Here are some commonly used fields:

- `{android.title}` Notification title
- `{android.text}` Notification content
- `{filterbox.field.APP_NAME}` App name
- `{filterbox.field.PACKAGE_NAME}` App package name
- `{filterbox.field.WHEN}` Notification send time

URL syntax example:
```
https://example.com/notification?title={android.title}&message={android.text}&app={filterbox.field.APP_NAME}
```
Body syntax example:
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
When using JSON format for the body, it's recommended to set the header as `Content-Type: application/json`

If you have questions or feature requests, please contact us using the feedback function within the App.

### Usage Example: Forward SMS Verification Codes to Telegram from Backup Device

1. Ensure your device can access Telegram successfully
2. Go to https://t.me/botfather, enter the command `/newbot` and follow the prompts to create a bot, obtaining its token
3. Get your ID from https://t.me/userinfobot
4. Enable and create a Webhook rule in Filter Box, with method `GET`, and URL as:
```
https://api.telegram.org/bot#YOUR_BOT_TOKEN#/sendmessage?text={android.title}%0A{android.text}&chat_id=#YOUR_ID#
```
