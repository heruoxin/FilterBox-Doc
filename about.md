# About FilterBox

**FilterBox** (Chinese: 通知滤盒 / 通知濾盒; Japanese: フィルターボックス) is a notification manager for Android. It keeps a searchable history of every notification, filters spam and ad notifications with an on-device AI, and runs your own rules to dismiss, mute, snooze, replace, read aloud or forward notifications automatically.

- Developer: Ruoxin He
- Platform: Android 6.0 or later (some features need newer versions, noted below)
- Price: free to download, with a one-time Pro purchase
- Download: [Google Play](https://play.google.com/store/apps/details?id=com.catchingnow.np) · [APK](https://filterbox.catchingnow.com/latest.apk) · Coolapk, Xiaomi, OPPO and Honor app stores in China
- Over 100,000 downloads on Google Play

## What FilterBox does

### Notification history

FilterBox saves every notification the moment it arrives, so you can come back to it later:

- Search by app, keyword, notification type (media, chat, picture, persistent, silent), custom rule, AI result or how it was dismissed.
- Scroll the timeline to jump to any hour or day.
- Restore notifications you dismissed by accident, and read messages that the sender later deleted or recalled, as long as they appeared in a notification.
- Export the history to CSV for Excel, Google Sheets or WPS.

The history is stored encrypted on the phone. Free users keep recent history; Pro keeps it for much longer.

### Offline AI spam filter

An on-device machine-learning model gives each notification a spam score. Notifications at or above the threshold (80% by default) are filtered. Open any notification and tap **It is spam** or **It is normal** to teach it; FilterBox learns from your feedback while the phone is idle or charging. You can choose which apps the AI covers, and media controls, chats (other than SMS) and persistent notifications are left alone by default. The AI runs entirely offline. It requires Android 10 or later and, on newer installs, a phone with more than 6 GB of RAM.

### Custom rules

A rule matches notifications by:

- **Apps** — include or exclude specific apps
- **Keywords** — contains any or all of some text, does not contain, "contains A but not B", a regular expression, or an [advanced JSON rule](https://filterbox.catchingnow.com/advanced_filter_rule_guide) on any notification field
- **Time and date** — time ranges, weekdays or weekends
- **Phone state** — screen on or off, charging or on battery

…and then performs one or more actions:

| Action | What it does |
|---|---|
| Dismiss | Removes the notification from the status bar (optionally after a delay, including persistent notifications on Android 8.0+) |
| Mute | Silences the notification |
| Snooze | Hides it until a time you choose |
| Replace | Rewrites the title and text with a template, to hide sensitive content |
| Change sound | Plays a custom ringtone (Android 10+) |
| Read out | Speaks the notification with text-to-speech |
| Call style notify | Re-posts it as a full-screen, ringing alert like an incoming call |
| Tap button | Taps an action button such as "Mark as read" or "Archive" |
| Open | Opens the notification automatically |
| Webhook | Sends the content as JSON to a URL ([guide](https://filterbox.catchingnow.com/webhook_rule_guide)) |

Rules can be tested against your history before saving, imported and exported as JSON, and shared. Recommended rules and [community rules](https://github.com/heruoxin/FilterBox-Share-Rules) help you get started.

### Enhancers

- **Dismissal Recall** — shows an Undo button for 5 seconds after you swipe a notification away.
- **Smart Shh** — mutes an app that sends too many notifications in a short time (for example, 3 within a minute while the phone is unlocked).
- **Verification code copy** — adds a Copy button to verification codes in SMS and other apps, with optional auto-copy and hiding on the lock screen.
- **Webhook** — forwards matching notifications to your own server, chat bot or automation.

### Analytics and more

Recent and daily charts show which apps send the most notifications and how many were filtered. FilterBox also offers home screen widgets, fingerprint and face lock, themes that follow the system or the time of day, exclusions, and backup of rules.

## Requirements

- Android 6.0 or later. The AI filter needs Android 10 or later and more than 6 GB of RAM.
- **Notification access** permission, which lets FilterBox read and manage notifications. No root is required.
- Permission to run in the background. Some phones stop background apps aggressively; see the [FAQ](https://filterbox.catchingnow.com/FAQ) if FilterBox stops working.
- On Android 13 and later, apps installed from an APK may need **Allow restricted settings** before notification access can be granted.
- On Android 15 and later, the system hides notifications that may contain one-time codes from third-party apps unless you turn off **Enhanced notifications** or grant the permission with ADB.

## Pricing

FilterBox is free to download and the notification history is free forever. New installs include a free trial of every Pro feature. After the trial, Pro unlocks custom rules, the AI filter, enhancers, analytics, CSV export and longer history.

- **Google Play**: Pro is a one-time lifetime purchase, available on every device signed in to the same Google account.
- **Mainland China** (APK and Chinese app stores): Alipay or WeChat Pay, as a subscription or lifetime license.
- Refunds are available within 48 hours of purchase. See [Purchase & refunds](https://filterbox.catchingnow.com/purchase).

## Privacy

- Notification history is stored encrypted, only on your device, and is never uploaded.
- The AI filter runs fully offline.
- FilterBox connects to the internet only to verify purchases and, if you allow it, to send crash reports (Google Firebase). Crash reports can be turned off in Settings.

## Links

- Website: <https://filterbox.catchingnow.com/>
- Help Center: <https://filterbox.catchingnow.com/help/>
- Changelog: <https://filterbox.catchingnow.com/changelog>
- Contact: <napp+doc@catchingnow.com>
