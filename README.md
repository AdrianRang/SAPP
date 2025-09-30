# SAPP
The SPOT (Smart Pot) App.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

I recommend using expo go, i can assure it also works as a dev build for ios, i do not know if it works for android

Make sure to add an mqqt host, user, and password to .env

Example:
```
EXPO_PUBLIC_MQTT_HOST='host.hivemq.cloud'
EXPO_PUBLIC_MQTT_USER='client'
EXPO_PUBLIC_MQTT_PASS='pass'
```
