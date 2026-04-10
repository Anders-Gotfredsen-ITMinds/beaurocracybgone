# Beaurocracy B'Gone — Mobile

React Native app built with Expo.

## Prerequisites

- [Node.js](https://nodejs.org/)
- [Android Studio](https://developer.android.com/studio) (for Android SDK)
- Java 17 (e.g. `brew install --cask zulu@17`)
- An Android device with USB debugging enabled, or an emulator

## Local configuration

Create a `mobile/.env.local` file (gitignored) before building:

```
EXPO_PUBLIC_API_URL=http://<your-mac-ip>:8000
EXPO_PUBLIC_API_KEY=your-api-key-here
```

Find your Mac's local IP with `ipconfig getifaddr en0`.

These values are embedded at build time and used as defaults in the app's Settings screen. You can still override them in-app at any time.

## Running on Android

```bash
cd mobile
npx expo run:android
```

Make sure your device is connected via USB and authorised (`adb devices` should list it).
