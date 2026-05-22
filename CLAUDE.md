# CLAUDE.md — mamdoo-app

## Project Overview

React Native + Expo ride-sharing app (Uber-like). Single codebase, two roles: **client** (passenger) and **partner** (driver). See [docs/architecture.md](docs/architecture.md) for full details.

---

## Tech Stack Quick Reference

- React Native 0.81 + Expo 54, React 19
- React Navigation v6 (native-stack, bottom-tabs)
- Custom Redux-like store: `useReducer` + Context (no Redux library)
- react-native-paper for UI components
- socket.io-client for real-time events
- i18n-js + expo-localization (EN/FR)
- Path aliases: `_hooks`, `_scenes`, `_components`, `_atoms`, `_molecules`, `_organisms`, `_navigations`, `_styles`, `_store`, `_utils`, `_api`, `_assets`

---

## Code Style

### Imports

Always use path aliases, never relative paths deeper than one level:

```js
// Good
import { useUser } from '_hooks';
import Button from '_atoms/Button';
import { colors } from '_styles';

// Bad
import { useUser } from '../../hooks';
import Button from '../../../components/atoms/Button';
```

### Component structure

Keep components focused: one concern per file. Separate UI from logic.

```js
// Scene: consumes hooks, renders UI only
const HomeScene = () => {
  const { user } = useUser();
  const { step, newRide, searchRide } = useRide();
  // ...JSX only, no business logic here
};

// Hook: owns business logic and API calls
const useRide = () => {
  const { state, dispatch } = useStore();
  const searchRide = async (pickup, dropoff) => { /* ... */ };
  return { step, newRide, searchRide };
};
```

### Naming conventions

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `RideRequest.js` |
| Hooks | camelCase with `use` prefix | `useRide.js` |
| Constants | SCREAMING_SNAKE_CASE | `RIDE_ACCEPTED` |
| Store action types | SCREAMING_SNAKE_CASE | `SET_RIDE` |
| Files | PascalCase for components, camelCase for hooks/utils | — |
| Folders | camelCase | `scenes/client/home/` |

### Styling

Use styles from `_styles` — never inline raw numbers:

```js
// Good
import { spacing, colors, typography, mixins } from '_styles';
const styles = StyleSheet.create({
  container: { padding: spacing.md, backgroundColor: colors.background }
});

// Bad
const styles = StyleSheet.create({ container: { padding: 16, backgroundColor: '#fff' } });
```

For dark mode, consume `isDarkMode` from the store and use `colors.light` / `colors.dark` palettes.

---

## State Management

### Adding to the store

1. Add action type to `src/store/types.js`
2. Add to `initialState.js`
3. Handle in the appropriate reducer (`main.js`, `auth.js`, or `ride.js`)
4. Add action creator in `src/store/actions/`
5. Expose via the relevant hook (don't access `dispatch` directly from scenes)

### Persistence

Auth state (user/partner tokens) is persisted to AsyncStorage in the `auth` reducer. Theme is persisted in `useTheme`. Do not persist ephemeral ride state.

---

## Hooks Rules

- One hook per domain: `useUser`, `useRide`, `usePartner`, `useLocation`, etc.
- Hooks own API calls and dispatch — scenes never call `fetch` or `dispatch` directly.
- Partner-specific hooks live in `src/hooks/partner/`.
- Hooks return stable references (use `useCallback`/`useMemo` where relevant to avoid re-renders).

---

## Navigation

- Never navigate imperatively with `ref` from inside a hook unless using `RootNavigation.js`.
- Pass navigation props down from screens, or use `useNavigation()` from React Navigation.
- New screens go into the correct stack under `src/navigations/client/stacks/` or `src/navigations/partner/stacks/`.
- After adding a screen, register it in the appropriate `index.js` navigator.

---

## Internationalization

All user-facing strings must use the `t()` or `t2()` functions from `_utils/lang`:

```js
import { t } from '_utils/lang';

// In component
<Text>{t('home.searchPlaceholder')}</Text>
```

Translation keys go in:
- `src/utils/lang/client/en/index.js` and `fr/index.js`
- `src/utils/lang/partner/en/index.js` and `fr/index.js`

Never hardcode English strings in JSX.

---

## API Calls

All HTTP calls go through `src/api/index.js` (`useApi` hook). Never call `fetch` directly:

```js
const { getRequest } = useApi();
const data = await getRequest({ method: 'POST', endpoint: '/rides/newRequest', params: body });
```

For proxy calls, use `useProxy` (client) or `usePartnerProxy` (partner).

---

## Component Hierarchy

Follow the Atomic Design layers — don't skip levels:

```
atoms      → single-purpose primitives (Button, TextInput, Image)
molecules  → combinations of atoms (Modal, Rating, Info)
organisms  → full feature blocks (BottomSheet, ErrorBoundary, OfflineNotice)
scenes     → full screens, consume organisms + hooks
```

Never import a scene into another scene. Never import an organism into an atom.

---

## Environment & Config

- Env variables are prefixed with `EXPO_PUBLIC_` (Expo requirement for client-side exposure).
- App identifiers, Google Maps keys, and push cert environments are set via `app.config.js` based on `EXPO_PUBLIC_ENV_NAME`.
- Never hardcode production URLs or API keys in source files.

---

## Platform — iOS & Android

This app ships on both iOS and Android. Every change must work on both.

- **Safe area**: always use `useSafeAreaInsets()` or `SafeAreaView` from `react-native-safe-area-context`. Never hardcode status bar or nav bar heights.
- **Shadows**: iOS uses `shadowColor / shadowOpacity / shadowRadius / shadowOffset`; Android uses `elevation`. Apply both when adding shadows.
- **Navigation gestures**: `gestureEnabled: false` is set on driver screens intentionally — don't remove it without checking Android back-gesture behaviour.
- **StatusBar**: use `expo-status-bar`'s `<StatusBar />` already in `App.js`. Don't add a second one.

## Client vs Partner UI

The app has two separate UIs in one codebase: **client** (passenger) and **partner** (driver).

- Before deleting any component, screen, hook, style, or translation key — verify it is not used by the other side (`grep -r "Name" src/`).
- When modifying a shared atom/molecule/organism — check that the change looks correct in both the client and partner context.
- Translation keys are fully separate: `utils/lang/client/` and `utils/lang/partner/`. There are no shared translation keys.

## What to Avoid

- Do not introduce Redux, MobX, Zustand, or any other state library — use the existing custom store.
- Do not use class components — use functional components + hooks.
- Do not add inline styles with raw pixel values — use `_styles` constants.
- Do not add new navigation libraries — stay with React Navigation v6.
- Do not hardcode strings in JSX — always use `t()`.
- Do not call APIs directly from scenes — always through a hook.
- Do not add `console.log` statements to committed code.
- Do not add comments explaining what code does — write self-explanatory code. Only add a comment when explaining a non-obvious constraint or workaround.
