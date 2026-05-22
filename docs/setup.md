# mamdoo-app — Setup

## Prerequisites

- Node.js 20.x
- Yarn or npm
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- iOS: Xcode 15+ (Mac only)
- Android: Android Studio + emulator

## Install dependencies

```bash
cd mamdoo-app
yarn install
```

## Environment variables

Copy and fill in `.env`:

```env
EXPO_PUBLIC_PROXY_URL=http://<local-ip>:3001
EXPO_PUBLIC_PROVIDER_URL=http://<local-ip>:3005/
EXPO_PUBLIC_ENV_NAME=localhost
```

Use your machine's LAN IP (not `localhost`) so physical devices can reach the backends.

## Running locally

```bash
# Start Expo dev server
yarn start

# iOS simulator
yarn ios

# Android emulator
yarn android
```

## Running with staging/prod backends

Set `EXPO_PUBLIC_ENV_NAME=staging` and point URLs to the remote staging servers.

## Building with EAS

```bash
# Development build
eas build --profile development --platform ios

# Staging build
eas build --profile staging --platform all

# Production build
eas build --profile production --platform all
```

## OTA updates

```bash
yarn eas-update
```

## Path aliases

Configured via `.babelrc` (babel-plugin-module-resolver) and `jsconfig.json`. Restart the bundler after changes:

```bash
yarn start --clear
```
