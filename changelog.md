## FilterBox changelog

### Official download

[Google Play](https://play.google.com/store/apps/details?id=com.catchingnow.np)

[Direct APK Download](https://filterbox.catchingnow.com/latest.apk)

3.4.4
- Fixed an issue that could cause data loss for some users.
- Updated machine learning support libraries.

3.4.3
- Upgraded target API to Android 16.
- Minor bug fixes.

3.4.2
- Added support for exporting notification history as a CSV file, making it easier to process data in apps like Excel, WPS, etc.

3.4.0
- Optimized the "Restore Notifications" feature.
- Switched the main interface to a bottom navigation layout.
- Added support for automatic daylight saving time adjustments.

3.3.10
- Optimized app startup speed and stability.
- After providing data, model training will now run while the phone is charging to save battery. You can also start the training manually by tapping the button.
- Webhook now automatically sets the header to `Content-Type: application/json` when the request body is in JSON format.

3.3.7
- **Attention for users upgrading to Android 15:**
Starting with Android 15, Google restricts reading notifications that contain verification codes. However, the implementation is quite crude. SMS messages from your carrier (e.g., 10086) and various push notifications with monetary values (e.g., a discount of 9998) may be incorrectly identified as verification codes.
If you see a message saying "Sensitive content hidden," it means the notification was hidden by the Android system, not by FilterBox.

**Solutions:**
1.  (Easiest) Go to **System Settings -> Notifications -> Enhanced notifications** and turn it off.
2.  Execute the ADB command: `adb shell appops set com.catchingnow.np RECEIVE_SENSITIVE_NOTIFICATIONS allow`
3.  Use an AppOps tool to grant the `RECEIVE_SENSITIVE_NOTIFICATIONS` permission to FilterBox.

You only need to choose one of the three options.

3.3.6
- Switch from Microsoft AppCenter to Google Firebase
- Enable AAB format for Google Play flavor

3.3.5
- Captcha extraction support user specific apps.
- Free access to the key features like notification history, even after your free trial ends.

3.3.2
- Now, notification history can be stored for up to 90 days (8GB RAM device) or 120 days (12GB RAM device).

3.2.7
- Support Android 14 back gesture animation.
- Bug fixes and performance improvements

3.2.1
- Bug fixes and performance improvements

3.1.5
- Updated AI model data and added multi-language support.
- Added an option for automatically hiding the captcha code when the device is locked.
- Added a new custom rule operation: Open notifications directly.

3.1.4
- New feature: Offline AI filter: Use machine learning AI to intelligently filter spam notifications
- The AI is completely offline and works only on your phone
- According to your feeding, it will continue to learn your usage habits and evolve. The more you use it, the better it gets

3.1.0
- Bug fixes and performance improvements

3.0.0
- New feature: Machine learning filtering spam (Currently Chinese only, other language materials are being accumulated)

2.9.0
- Support multi selection for rule actions.

2.8.0
- Rule list can be sort and filtered.
- Support use IceBox to open the frozen apps.

2.7.0
- New feature: Read the notifications by voice.
- Bug fixes.

2.6.0
- Supports Android 13 features: Themed icon, predictive back gesture.
- New widgets

2.5.0
- Redesign with Material Design 3
- New search page

2.4.0
- Supports showing media album on notification list
- Supports custom the Webhook POST Body content
- Charging rules can now be set separately for wired and wireless charging
- Other bug fixes and performance optimizations

2.3.0
- New feature: Incoming call style notify: Repost the important notifcations as incoming call so you won't miss it
- Adapt to Android 13 notification permissions
- Bug fixes

2.1.2
- UI improvements
- Bug fixes and performance improvements

2.1.1
- Support storing notification images
- Search interface revamp
- Support Android 11 keyboard animation, Android 12 dynamic theme

2.0.3
- Bug fixes and performance improvements
- Support MessagingStyle notification

2.0.2
- Notification history can be kept for 60 days

2.0.0
- Settings page UI change
- New notification operation: modify ringtone (Android 10+)
- Notification content matching now supports: \[include/exclude\]+\[any/all\] text
- Add new recommendation rules page
- Add notification enhancers:

1. Notification dismissal recall: A recall button will be displayed for a few seconds after swipe to dismiss notifications on the system notification bar
2. Smart mute: When an App plays multiple notification sounds in a short time the phone will be temporarily muted
3. SMS captcha code extraction: If your device does not have this function
4. Webhook: Create rules to send specific notification content to the web server

1.9.1
- Fix: merge rules do not work
- UI tweak

1.9.0
- New text filter: "Contains A and not contains B"
- New action replace notification content
- Swipe to dissmissed notification history can be recovered from settings
- Support drag to select in app-picker

1.8.1
- Fix the problem caused by the compilation tool in version 1.8.0

1.8.0
- New App picker
- Some UI tweak

1.7.0
- Filter rule support weekday and screen on/off settings
- Some UI tweak

1.6.0
- Update target API to Android 11
- Redesign edit rule page
- New feature: Rule test

1.5.0
- New feature: Support notification actions such as "mark as read" of SMS, "archive" of Gmail
- New feature: Online rule suggestions. It is still empty. Welcome to share your rules: https://github.com/heruoxin/FilterBox-Share-Rules/issues/new?template=submit-a-new-rule.md

1.4.5
- Add item detail in analytics screen
- Bug fixes and performance improvements

1.4.0
- Support some notification actions
- Bug fixes and performance improvements

1.3.0
- New feature: "Undo" on system notification bar
- Bug fixes and performance improvements

1.2.5
- UI tweak
- Postpone notification now supports multiple times
- Long press to share image in media and big picture style notification previews

1.2.0
- Rewrite splash screen
- Bug fixes and performance improvements

1.1.0
- New feature: Postpone notifications
- Bug fixes

1.0.0
- New feature: Advanced filter
- New feature: Notification preview
- Bug fixes and UI improvements

0.9.9
- New feature: Filter by time
- New feature: Widget
- Support bigText (Gmail can now store full text of messages)

0.9.8
- Fix some detail bugs
- Adjust UI and add some animations

0.9.7-fix
- Fix: "Dismiss notify" not work

0.9.7
- New featrue: Timeline mode
- First version on Google Play, support Play purchase

0.9.0
- New feature: Analytics notification history

0.8.1
- New feature: import/export rules
- Support Alipay purchase

0.5.0 - 0.7.0
- UI improvements

0.4.0
- New feature: restore recent notifications（Android 8.0+）
- New featrue: dismiss notify

0.1.0 - 0.3.0
- Bug fixes and UI improvements

0.0.1
- Init version
