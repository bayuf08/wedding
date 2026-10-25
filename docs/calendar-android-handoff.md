# Calendar handoff on Android

## Diagnosis and scope

The previous button sent every platform to the HTTPS Google Calendar TEMPLATE URL in a new tab. It contained the canonical event data, but did not control Android's app-link resolver. The reported Calendar home screen is consistent with an installed app intercepting this URL without honoring its template parameters. That device-specific behavior was not reproduced here.

Android now receives a user-activated VIEW intent explicitly targeting Chrome with the same HTTPS template and an encoded browser fallback. Desktop and iOS keep the existing HTTPS template. This deliberately opens a web draft rather than guessing a private Google Calendar activity. The only string extra is browser_fallback_url; no native INSERT extras are used. Native INSERT uses typed epoch-millisecond extras, but browser intents can invoke only BROWSABLE activities, so a native editor cannot be promised from this website.

The optional Android help explains review/Save and provides a copyable web URL. Clipboard denial exposes a selectable readonly URL. There is no timer, second automatic launch, calendar permission, account API, or save request. Chrome is an explicit Android dependency for the primary route. Other browsers, Chrome-disabled devices and app-link settings may require the manual copy/paste fallback; its presence does not prove native app compatibility.

## Sources

- https://developer.chrome.com/docs/android/intents (intent syntax, package, fallback, user gesture, BROWSABLE restriction)
- https://developer.android.com/guide/components/intents-common#Calendar (native INSERT editor contract)
- https://developer.android.com/reference/android/provider/CalendarContract (native beginTime/endTime types)
- https://support.google.com/calendar/answer/65923?hl=en (mobile web editing and explicit Save)

## Verification

- 94 unit tests, including canonical 26 December 2026 08:00–10:00 WIB, UTC conversion, encoding, route selection, fallback decoding, absent native INSERT extras, clipboard success/denial and unavailable data.
- Typecheck and production build passed.
- Three Google Chrome browser checks passed: desktop, Android UA/390px and iOS UA/390px. These verify link destinations, one keyboard activation, no automatic navigation, fallback visibility and no horizontal overflow. External navigation is deliberately prevented in these tests, so they do not prove Android intent resolution or an authenticated Google draft.
- Local screenshots: /tmp/wedding-calendar-android.png, /tmp/wedding-calendar-desktop.png, /tmp/wedding-calendar-ios.png. Existing button/typography retained; fallback uses existing text-action style. Impeccable/Anti Slop scope: existing wedding brand, no new visual motif or motion; controls have real actions, keyboard access and honest unavailable states. Real Android/iOS delivery remains unverified.
- No physical Android device is attached. Installed disposable emulator image is basic Android without Google Calendar. No Google account was accessed and no event created.
- Both supplied Library JPEGs resolved, but supported materialization failed with `download failed`, including the bounded retry; no pixels were inspected.

Publication was subsequently authorized with the device-validation limitation disclosed. Remaining device acceptance check: on the affected Android browser with Google Calendar installed, the primary action must show a prefilled web draft (possibly after sign-in), and only Save may create an event. Cancel without saving. Also verify Chrome-disabled fallback and iOS on real devices. Release status and deployment identity are reported separately; this document does not certify native-app behavior.
