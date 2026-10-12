# FilterBox FAQ

### FilterBox stops working after a while. Why?

This is the most common problem: your phone's system is stopping FilterBox in the background. Please allow FilterBox to run in the background and start automatically, and turn off battery optimization for it. Locking FilterBox in the recent apps screen also helps on many phones. Visit [Don't kill my app!](https://dontkillmyapp.com/?app=FilterBox) for step-by-step instructions for your phone brand.

If notification access shows as enabled but nothing is recorded, turn FilterBox's notification access off and on again in system settings.

### Is the app safe? Will you upload my notifications?

No. All notification history is stored encrypted, only on your phone, and is never uploaded. The AI filter also runs fully offline.

FilterBox connects to the internet only to verify purchases and, if you allow it, to send crash reports through Google Firebase. You can turn crash reports off in Settings.

### How do I dismiss persistent (ongoing) notifications?

Dismissing persistent notifications, such as music controls or download progress, requires Android 8.0 or later. Turn on **Include fixed notifications** in a rule's **Dismiss** action. On some phones you also need to allow notification snoozing in system settings.

To bring dismissed persistent notifications back, delete the rule, set your phone's date one year ahead, wait about a minute, then set it back.

### Some notifications say "Sensitive notification content hidden"

Since Android 15, the system hides notifications that may contain one-time codes from third-party apps, and the detection can catch ordinary notifications that contain numbers. This is done by Android, not by FilterBox. Choose one of these fixes, then restart your phone:

1. Easiest: turn off **Settings → Notifications → Enhanced notifications**.
2. Run this ADB command: `adb shell appops set com.catchingnow.np RECEIVE_SENSITIVE_NOTIFICATIONS allow`
3. Grant the `RECEIVE_SENSITIVE_NOTIFICATIONS` permission to FilterBox with an AppOps tool.

### I installed the APK and can't turn on notification access

Android 13 and later restricts sideloaded apps. Open **Settings → Apps → FilterBox**, tap **⋮** in the top-right corner, choose **Allow restricted settings**, then turn on notification access again.

### How does the AI filter work, and why don't I see it?

The AI filter gives each notification a spam score on your phone and filters notifications at or above your threshold (80% by default). Open any notification and tap **It is spam** or **It is normal** to teach it; it learns while your phone is idle or charging.

The AI filter requires Android 10 or later. For installs after August 2024, it also requires a phone with more than 6 GB of RAM. If your phone doesn't meet these requirements, the AI tab is replaced by recommended rules.

### Can I read messages that were deleted or recalled?

Yes, if they appeared in a notification. FilterBox saves notifications as they arrive, so the original stays in your history even if the sender deletes or recalls the message later. FilterBox cannot see content that was never shown in a notification.

### How long is notification history kept?

You choose in **Settings → Storage**. Free users can keep recent history; longer periods require Pro.

### How do I move my rules to a new phone?

Go to **Settings → Import & export → Custom rules** and export your rules as a JSON file or to the clipboard, then import them on the new phone. Pro bought on Google Play can be restored on the new phone with the same Google account: tap **Already purchased?** and verify.

### Google Play version or APK?

The Google Play version uses Google Play for purchases and downloads its AI model through Google Play. If your phone has no Google Play services, install the [APK from this site](https://filterbox.catchingnow.com/latest.apk) instead of a Google Play version from a third-party mirror.

### What are the buying instructions?

Please [read them here](https://filterbox.catchingnow.com/purchase).

-----

If you have any other questions or suggestions, please send an email via the in-app feedback feature, or write to [napp+doc@catchingnow.com](mailto:napp+doc@catchingnow.com). Thank you for your understanding and support.
