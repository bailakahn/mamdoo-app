# mamdoo-app — Architecture

## Overview

Mamdoo is a two-sided ride-sharing mobile app built with **React Native + Expo**. A single codebase serves two distinct user roles:

- **Client (passenger)** — books rides, tracks drivers in real-time
- **Partner (driver)** — receives requests, accepts rides, tracks earnings

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile framework | React Native 0.81 + Expo 54 |
| React version | 19.1.0 |
| Navigation | React Navigation v6 (native-stack, bottom-tabs, drawer) |
| State management | Custom Redux-like (useReducer + Context) |
| UI components | react-native-paper (Material Design) |
| Maps & location | react-native-maps, expo-location |
| Real-time | socket.io-client v4 |
| HTTP | Fetch API with custom wrapper (`src/api/index.js`) |
| Animations | lottie-react-native, react-native-reanimated |
| Storage | @react-native-async-storage |
| Auth | Phone + PIN, JWT access tokens |
| Internationalization | i18n-js + expo-localization (EN/FR) |
| Push notifications | expo-notifications (Firebase) |
| Build system | Expo + EAS (CI/CD) |
| Platforms | iOS, Android, Web |

---

## Directory Structure

```
mamdoo-app/
├── App.js                  # Root: wraps StoreProvider, OfflineNotice, ErrorBoundary
├── app.config.js           # Dynamic Expo config (env-based identifiers)
├── app.json                # Static Expo manifest
├── eas.json                # Expo Application Services config
├── .babelrc                # Module resolver for path aliases
├── jsconfig.json           # Path alias definitions
├── assets/                 # Images, icons, Lottie animations
├── locales/                # i18n source (EN/FR)
└── src/
    ├── index.js            # Root scene dispatcher (client vs partner)
    ├── api/
    │   ├── index.js        # HTTP fetch wrapper with auth headers
    │   └── google.js       # Google Maps / Places API
    ├── components/
    │   ├── atoms/          # Primitive UI: Button, TextInput, Image, etc.
    │   ├── molecules/      # Composite: Modal, Rating, Info
    │   └── organisms/      # Full features: BottomSheet, ErrorBoundary, OfflineNotice
    ├── constants/
    │   ├── rideStatuses.js # Ride state enum
    │   └── settings.js
    ├── hooks/
    │   ├── useApp.js       # App settings, cab types, theme
    │   ├── useUser.js      # Client auth, profile, ride history
    │   ├── usePartner.js   # Driver auth, online status, earnings
    │   ├── useRide.js      # Ride booking flow + socket events
    │   ├── useRequest.js   # Partner-side ride request handling
    │   ├── useLocation.js  # GPS + permissions
    │   ├── useProxy.js     # Client API calls (proxy backend)
    │   ├── usePartnerProxy.js # Driver API calls (proxy backend)
    │   ├── useTheme.js     # Dark mode toggle + persistence
    │   ├── useNotifications.js # Push token + notification handling
    │   ├── useFeedback.js  # Ride rating/review
    │   ├── useLanguage.js  # i18n language switching
    │   └── partner/        # Partner-specific hooks (location, ride, upload, timeSpent)
    ├── navigations/
    │   ├── index.js        # Root navigator (permissions, maintenance, force-update gate)
    │   ├── RootNavigation.js
    │   ├── client/         # Passenger app stacks (Auth, Home, Account, Onboarding, Verification)
    │   └── partner/        # Driver app stacks (Auth, Home, Account, Upload, Pending)
    ├── scenes/
    │   ├── client/         # Passenger screens
    │   │   ├── auth/       # Login, register, verify, forgot password
    │   │   ├── home/       # Map, search ride, request, ride in-progress, review
    │   │   ├── account/    # Profile, rides history, feedback
    │   │   └── onboarding/
    │   └── partner/        # Driver screens
    │       ├── auth/
    │       ├── home/       # Ride acceptance, in-progress, summary
    │       ├── account/
    │       ├── upload/     # Document verification
    │       └── pending/
    ├── store/
    │   ├── index.js        # StoreProvider + useStore hook
    │   ├── types.js        # Action type constants
    │   ├── initialState.js # Default state shape
    │   ├── actions/        # Action creators (main, auth, ride)
    │   └── reducers/       # State reducers (main, auth, ride)
    ├── styles/
    │   ├── colors.js       # Light/dark theme palettes
    │   ├── typography.js
    │   ├── spacing.js
    │   ├── mixins.js       # Reusable style combos
    │   └── classes.js      # Named style groups
    └── utils/
        ├── helpers/        # compareVersions, date formatting, normalize, cache
        └── lang/           # t() and t2() i18n helpers + translation files
```

---

## Path Aliases

Defined in `.babelrc` (module-resolver) and `jsconfig.json`. Use these in imports instead of relative paths:

| Alias | Maps to |
|---|---|
| `_api` | `src/api/` |
| `_components` | `src/components/` |
| `_atoms` | `src/components/atoms/` |
| `_molecules` | `src/components/molecules/` |
| `_organisms` | `src/components/organisms/` |
| `_navigations` | `src/navigations/` |
| `_scenes` | `src/scenes/` |
| `_styles` | `src/styles/` |
| `_utils` | `src/utils/` |
| `_store` | `src/store/` |
| `_hooks` | `src/hooks/` |
| `_assets` | `assets/` |

---

## State Management

Custom Redux-like store using React's `useReducer` + `Context`. No external Redux dependency.

### Store Shape

```js
{
  main: {
    app: "client" | "partner" | null,
    appLoaded: boolean,
    settings: { workingHours, phone, maintenanceMode, prelaunchMode, ... },
    isDarkMode: boolean,
    backgroundPermission: "granted" | "denied" | "notLoaded",
    cabTypes: [],
    googleMapsSessionToken: string
  },
  auth: {
    user: { accessToken, firstName, phoneNumber, verified, isAdmin, ... },
    partner: { accessToken, status, active, verified, ... },
    userLoaded: boolean,
    partnerLoaded: boolean,
    uploadDocuments: {}
  },
  ride: {
    step: 1–4,
    newRide: { pickUp, dropOff, price, cabTypeId },
    newRideDetails: { polyline, distance, duration },
    driver: { location, name, rating, phone },
    requestId: string,
    onGoingRide: boolean,
    nearByDrivers: number,
    ...
  }
}
```

### Accessing State

```js
const { state, dispatch } = useStore();
// or via dedicated hooks:
const { user, login, logout } = useUser();
```

---

## Navigation Architecture

```
NavigationRoot (src/navigations/index.js)
├── Loads: theme, permissions, app settings
├── Gates: force update → MaintenanceMode → LocationDenied
└── Routes:
    ├── app === null   → Main (client/partner selection)
    ├── app === "client" → ClientRoutes
    └── app === "partner" → PartnerRoutes

ClientRoutes:
├── AuthStack (login, register, verification, forgot password)
├── HomeStack (map, search ride, request, in-progress, review)
├── AccountStack (profile, history, feedback)
└── OnboardingStack (first-launch intro)

PartnerRoutes:
├── AuthStack
├── HomeStack (accept rides, in-progress, summary)
├── AccountStack (profile, earnings, history)
├── UploadStack (document verification)
└── PendingStack (account under review)
```

---

## API Integration

All HTTP calls go through `src/api/index.js`:

- Provider backend (`EXPO_PUBLIC_PROVIDER_URL`) for auth and data
- Proxy backend (`EXPO_PUBLIC_PROXY_URL`) for real-time ride operations

Headers attached automatically:
- `x-mamdoo-access-token` (JWT)
- `x-os-type` (ios/android)
- `x-application-version`

A 401/403 response auto-logs the user out.

---

## Real-Time Communication

Socket.io connects to `mamdoo-proxy`. Key events:

| Event | Direction | Description |
|---|---|---|
| `FOUND_DRIVER` | proxy → client | Driver matched to request |
| `DRIVER_ARRIVED` | proxy → client | Driver at pickup |
| `END_RIDE` | proxy → client | Ride completed |
| `NEW_REQUEST` | proxy → partner | New ride available |
| `CANCEL_REQUEST` | proxy → partner | Client cancelled |

---

## Environment Variables

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_PROXY_URL` | mamdoo-proxy base URL |
| `EXPO_PUBLIC_PROVIDER_URL` | mamdoo-provider base URL |
| `EXPO_PUBLIC_ENV_NAME` | `localhost` / `staging` / `prod` |

---

## Build Environments

Configured via `app.config.js` + `eas.json`:

| Env | Bundle ID | EAS Profile |
|---|---|---|
| Production | `com.mamdoo.app` | `production` |
| Staging | `com.mamdoo.app.staging` | `staging` |
| Development | `com.mamdoo.app.dev` | `development` |
