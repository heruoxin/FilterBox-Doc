# How to block spam & annoying notifications on Android

Shopping deals, game reminders, "you might like" videos, news you never asked for: many apps mix promotions into the same notifications as the messages you actually care about. This guide covers three ways to take back control, from Android's built-in switches to keyword rules and an offline AI filter.

> **Quick answer:** to silence a whole app, long-press one of its notifications and turn notifications off. To block only the spammy notifications while keeping the useful ones, use a notification filter such as [FilterBox](https://filterbox.catchingnow.com/): create a keyword rule (for example "coupon", "sale", "% off") or turn on its offline AI spam filter.

## Method 1: Android's built-in notification settings

Android lets you turn off notifications per app, and on Android 8.0 and later per **notification category** (also called a channel).

1. Long-press a notification in the notification shade and tap the settings (gear) icon, or open **Settings → Apps → [the app] → Notifications**.
2. Turn off **All notifications** for that app, or turn off only the categories you don't want, such as "Promotions" or "Recommendations".
3. To pause a notification temporarily, swipe it slightly and tap the snooze (clock) icon, if your phone shows it.

**When it falls short:** these switches are all-or-nothing. Many apps send promotions through the same category as order updates or chat messages, so turning the category off hides everything. Android also cannot filter by what a notification says.

## Method 2: Filter by keywords with FilterBox

FilterBox reads notifications through Android's notification access permission (no root needed) and acts on each one according to your rules.

1. Install FilterBox from [Google Play](https://play.google.com/store/apps/details?id=com.catchingnow.np) or download the [APK](https://filterbox.catchingnow.com/latest.apk), then grant **notification access** and allow it to run in the background.
2. Go to **Intelligence → Custom** and tap **+** to create a rule.
3. Under **Apps**, pick the apps that send spam. Under **Keywords**, choose **Contains any** and add words like `coupon`, `sale`, `% off` or `live now`.
4. Under **Action**, choose **Dismiss**. You could also **Mute** them, **Snooze** them to the evening, or **Replace** their text.
5. Tap **Run test** to see how many notifications in your history the rule would have caught, then save.

Useful variations:

- **Contains A and not B** — dismiss notifications containing "deal" unless they also contain "order".
- **Time and date** — mute work apps from 19:00 to 09:00, or only on weekends.
- **Screen state** — only filter while the screen is off.
- **Regular expressions** and [advanced JSON rules](https://filterbox.catchingnow.com/advanced_filter_rule_guide) for any notification field.
- Browse [rules shared by other users](https://github.com/heruoxin/FilterBox-Share-Rules) for ideas.

## Method 3: Let the offline AI filter spam

Writing keywords for every app gets tedious. FilterBox's AI filter scores each notification on your phone and filters the ones that look like spam.

1. Go to **Intelligence → AI** and turn on the AI filter. (The AI tab appears on Android 10 and later; newer installs also need more than 6 GB of RAM.)
2. Optionally adjust the **threshold**. Notifications with a spam score at or above it are filtered; the default is 80%. Lower it to filter more aggressively.
3. Choose the **apps** the AI covers. Media controls, chats (other than SMS) and persistent notifications are not filtered by default.
4. Teach it: open any notification and tap **It is spam** or **It is normal**. FilterBox learns from your feedback while your phone is idle or charging, so it gets better the more you use it.

The model runs entirely offline. Your notifications are never uploaded for analysis.

## Nothing is lost

Blocked notifications are not deleted from FilterBox. They stay in your [notification history](https://filterbox.catchingnow.com/guide/notification-history), where you can search them and restore any that were filtered by mistake. A minimized **Filter notify** notification can show how many were filtered recently, and **Dismissal Recall** gives you 5 seconds to undo a swipe.

## Frequently asked questions

### Does blocking notifications stop the app from working?

No. FilterBox only dismisses or silences the notification. The app keeps running and you can still open it as usual.

### Does FilterBox need root?

No. It uses Android's standard notification access permission. Root or Shizuku are not required, although Shizuku can optionally help keep FilterBox running on very aggressive phones.

### Will the AI filter drain my battery?

No. The model is small, runs only when a notification arrives, and is unloaded by the system when idle. Learning happens while the phone is idle or charging.

### Why did my rules stop working?

Your phone's battery management has probably stopped FilterBox in the background. Allow it to run in the background and auto-start, and disable battery optimization for it. See the [FAQ](https://filterbox.catchingnow.com/FAQ) for details.

---

[Get FilterBox on Google Play](https://play.google.com/store/apps/details?id=com.catchingnow.np) · [Download the APK](https://filterbox.catchingnow.com/latest.apk) · [Help Center](https://filterbox.catchingnow.com/help/)
