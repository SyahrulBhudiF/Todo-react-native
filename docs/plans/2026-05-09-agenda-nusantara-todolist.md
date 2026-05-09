# Agenda Nusantara TodoList Implementation Plan

> **IMPORTANT**: Use plan-execute skill to implement this plan task-by-task.

**Goal:** Build Expo mobile app matching `Soal_Praktek_Mobile_TodoList_2026.pdf`: login, home stats, add important/normal tasks, task list completion, settings password change, local SQLite persistence.
**Architecture:** Replace starter tabs with Stack-based Expo Router screens. Put SQLiteProvider at root, use repository functions for tasks/settings, keep UI components small and mockup-faithful. No server/API; MySQL Docker only for optional local inspection/reference, not app storage because PDF requires phone-local SQLite.
**Tech Stack:** Expo SDK 54, React Native 0.81, Expo Router 6, NativeWind, Zustand optional for auth UI state, `expo-sqlite`, `@react-native-community/datetimepicker`, `@expo/vector-icons`, `zod`, `@tanstack/react-form`.
**User decisions:** Developer name `Syahrul Bhudi Ferdiansyah`, NIM `2241720167`, photo/avatar can be added later, storage is SQLite.

---

## Context

PDF: `Soal_Praktek_Mobile_TodoList_2026.pdf`

Core rules:

- Mobile app only.
- Data stored locally on phone in SQLite.
- Initial username/password: `user` / `user`.
- Username/password can be changed in Settings; spec only requires password change but says username/password initial can later be changed. Implement password change only unless asked.
- UI may differ, but target exact mockup for safer scoring.
- Required screens: Login, Beranda, Tambah Tugas Penting, Tambah Tugas Biasa, Daftar Tugas, Pengaturan.

Docker observed:

- `ocean_mysql` image `mysql`, port `3306->3306`.
- Not used by mobile app storage. SQLite is mandatory by the PDF and confirmed by the user.

Workflow chain complete via subagents: **researcher -> scout -> planner/updated-plan synthesis**. The subagent chain produced artifacts under `/tmp/pi-subagents-uid-1000/chain-runs/e6b5f7f2/`; the planner step timed out after researcher/scout completed, so the updated-plan synthesis below incorporates the completed researcher and scout outputs plus the already inspected plan requirements.

**Researcher**

- **Expo SQLite**: use `npx expo install expo-sqlite`; root should provide `SQLiteProvider`; screens/repositories can access the database with `useSQLiteContext`; initialize schema in `onInit`; use async CRUD helpers such as `runAsync`, `getAllAsync`, and `getFirstAsync`; use parameterized SQL values.
- **Expo Router**: file-based routes under `app/` are sufficient for the required login/home/add/list/settings flow; use a root `Stack` with hidden headers instead of the starter tab navigator.
- **DateTimePicker**: use `npx expo install @react-native-community/datetimepicker`; implement the due-date field with the native picker rather than a manually typed date.
- **TanStack Form**: `@tanstack/react-form` supports React 17/18/19, so it fits the current React 19 Expo project. It supports field-level and form-level validators and can use Standard Schema validators.
- **Zod**: current Zod v4 supports Standard Schema; TanStack Form docs list Zod as a supported schema validator and show schemas passed directly to validators such as `onChange` or submit-time validation.
- **TanStack Query research/decision**: React Query docs explicitly say it works out of the box with React Native, but the same React Native page focuses on extra setup for online status, app focus, and screen-focus refetching. Its package description is “Hooks for managing, caching and syncing asynchronous and remote data in React.” This app is small and local SQLite-only, so TanStack Query is **not needed initially**. Use direct repository calls plus `useFocusEffect`/local screen state. Add TanStack Query later only for complex shared cached local reads, optimistic workflows, pagination, background sync, or a remote API.
- **Router research/decision**: Expo docs define Expo Router as “a file-based router for React Native and web applications” and “an open-source routing library for Universal React Native applications built with Expo.” The same docs say routes are derived from the `app` directory and Expo Router is available in Expo CLI projects with Metro. Current project already uses `expo-router/entry`. TanStack Router package research shows `@tanstack/react-router` describes itself as “Modern and scalable routing for React applications” and has `react-dom` peer dependency, which points to React web usage rather than Expo-native navigation. Therefore use **Expo Router**, not TanStack Router.

**Scout**

- Current app uses Expo Router with `main: "expo-router/entry"`.
- NativeWind is configured and current example styling in `app/(tabs)/index.tsx` uses plain `View`, `Text`, `Pressable`, and `className`; follow this style instead of adding a UI kit.
- Root layout currently anchors `(tabs)` and registers `(tabs)` plus `modal`; final app should remove the tab anchor and use a hidden-header Stack wrapped by SQLite.
- Existing starter tab files can be deleted or ignored after root stack replacement: `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `app/(tabs)/explore.tsx`, `app/modal.tsx`.
- Existing Zustand store is only a counter demo. Do not use Zustand for task persistence; SQLite is the source of truth. Local state is enough for loaded rows/stats; TanStack Form owns form state.
- Project currently colocates small component prop types, but user requested app interfaces/types in `types.ts`. Put domain/form/repository types in root `types.ts`; keep only trivial component-only props local if needed.
- Use `@expo/vector-icons` directly for Agenda icons because current `IconSymbol` has only a small starter mapping.
- Tailwind content scans `app/` and `components/`; place UI there or update `tailwind.config.js` if adding styled files elsewhere.

**Updated Plan**

- Add dependencies: `expo-sqlite`, `@react-native-community/datetimepicker`, `zod`, `@tanstack/react-form`.
- Do **not** add `@tanstack/react-query` in first implementation; research says it works in React Native, but it is overkill for this local-only SQLite app and would require extra focus/online/cache setup.
- Do **not** add TanStack Router; research says Expo Router is the native Expo/React Native router already configured here, while TanStack Router is React/web-oriented and includes `react-dom` peer dependency.
- Add root `types.ts` for app/domain/form/repository types.
- Add `lib/validation.ts` for Zod schemas used by TanStack Form.
- Use TanStack Form for login, add-task, and password-change forms with React Native primitives (`TextInput`, `Pressable`), not web `<form>`/`<input>` elements.
- Implement Settings developer block with default avatar/initials, name `Syahrul Bhudi Ferdiansyah`, and `NIM: 2241720167`.

---

## Approach

Build a stack-based **Expo Router** app backed by local SQLite. Keep SQLite access behind small resource modules, use `types.ts` for domain/form/repository types, use Zod schemas in each resource module, and wire TanStack Form to React Native `TextInput`/`Pressable` components. Home and task screens will read SQLite directly on screen focus; TanStack Query is intentionally omitted because this is a local-only, small data app. TanStack Router is also omitted because Expo Router is already the correct mobile router for this project.

Database: `agenda_nusantara.db`

Tables:

The `users` table stores local login credentials explicitly, seeded as `username = user` and `password = user`, and later updates the password from the Settings screen. It is not a server table and is not MySQL; it lives inside the phone SQLite database.

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

The `tasks` table stores the todo/agenda items shown on Home and Daftar Tugas.

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  due_date TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('important', 'normal')),
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
```

Seed default user:

- `username = 'user'`
- `password = 'user'`

Date format:

- Store `YYYY-MM-DD`.
- Display `05 Mei 2026`.
- Home subtitle display sample: `Senin, 4 Mei 2026`.

Routes:

- `app/_layout.tsx`: SQLiteProvider + hidden-header Stack.
- `app/index.tsx`: Login.
- `app/home.tsx`: Beranda.
- `app/add-important.tsx`: Tambah Tugas Penting.
- `app/add-normal.tsx`: Tambah Tugas Biasa.
- `app/tasks.tsx`: Daftar Tugas.
- `app/settings.tsx`: Pengaturan.

UI direction:

- Follow current NativeWind/plain React Native example style: `View`, `Text`, `Pressable`, `TextInput`, `ScrollView`/`FlatList` with `className`.
- Use `@expo/vector-icons` directly for clipboard/check/plus/list/settings/calendar/avatar icons.
- Use the PDF colors and layout closely: teal login/home/settings, red important tasks, green normal tasks, blue task list card, white rounded cards, muted gray text.

---

## Files to Modify

Add:

- `types.ts`
- `lib/db.ts`
- `modules/auth/validation.ts`
- `modules/auth/repository.ts`
- `modules/tasks/validation.ts`
- `modules/tasks/repository.ts`
- `lib/date.ts`
- `components/app-header.tsx`
- `components/primary-button.tsx`
- `components/form-field.tsx`
- `components/stat-card.tsx`
- `components/task-form-screen.tsx`
- `app/index.tsx`
- `app/home.tsx`
- `app/add-important.tsx`
- `app/add-normal.tsx`
- `app/tasks.tsx`
- `app/settings.tsx`

Modify:

- `package.json`
- `bun.lock`
- `app/_layout.tsx`

Remove or stop using:

- `app/(tabs)/_layout.tsx`
- `app/(tabs)/index.tsx`
- `app/(tabs)/explore.tsx`
- `app/modal.tsx`
- `stores/counter-store.ts` if no longer imported.
- `docs/plans/test.md` and `docs/plans/empty-test.md` scratch files from planning cleanup.

Possibly modify:

- `tailwind.config.js` only if styled files are placed outside scanned `app/` or `components/` paths.

---

## Reuse

- Reuse Expo Router `Stack` pattern from `app/_layout.tsx`, but remove tab anchor and wrap with SQLiteProvider.
- Reuse NativeWind/plain RN styling pattern from `app/(tabs)/index.tsx`: `View`, `Text`, `Pressable`, className strings, rounded cards, borders, active opacity.
- Reuse path alias `@/*` for imports.
- Reuse `@expo/vector-icons` already installed for icons.
- Reuse existing scripts: `bun run lint`, `bun start`, `bun run android`.

---

## Steps

**Phase 0: Safety**

- [ ] Confirm no code edits before user says proceed.
- [ ] Keep existing uncommitted changes; project already dirty.
- [ ] Use git/jj status before edits.

**Phase 1: Dependencies**

- [ ] Run `bunx expo install expo-sqlite @react-native-community/datetimepicker` or `npx expo install ...`.
- [ ] Add form/validation dependencies with package manager: `bun add zod @tanstack/react-form`.
- [ ] Do **not** add `@tanstack/react-query` for the first implementation.
- [ ] Verify `package.json` and lockfile updated.

**Phase 2: Types, Validation, and Database**

- [ ] Create root `types.ts` with `Task`, `TaskCategory`, `TaskRow`, `TaskStats`, `CompletedByDay`, `CreateTaskInput`, `LoginFormValues`, `TaskFormValues`, `PasswordFormValues`, and repository result types.
- [ ] Create `modules/auth/validation.ts` with `loginSchema` and `passwordChangeSchema`.
- [ ] Create `modules/tasks/validation.ts` with `taskFormSchema`.
- [ ] Avoid circular imports between `types.ts` and validation modules; if using `z.infer`, structure exports carefully.
- [ ] Create `lib/db.ts` with `DATABASE_NAME`, `migrateDbIfNeeded`, schema creation, indexes, and default user seed.
- [ ] Import app/domain types from `types.ts`; do not define domain types in repository files.

**Phase 3: Repositories and Utilities**

- [ ] Create `modules/auth/repository.ts` with `getUserByUsername`, `validateLogin`, and `changePassword`.
- [ ] Create `modules/tasks/repository.ts` with `createTask`, `listTasks`, `toggleTaskCompleted`, `getTaskStats`, and `getCompletedByDay`.
- [ ] Create `lib/date.ts` with Indonesian month/day arrays, `toISODate`, `formatIndonesianDate`, `formatTodayLong`, and `getLastSevenDays`.

**Phase 4: Root Layout and Routing**

- [ ] Edit `app/_layout.tsx`.
- [ ] Remove `unstable_settings.anchor = '(tabs)'`.
- [ ] Wrap Stack in `<SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded}>`.
- [ ] Hide headers globally with `screenOptions={{ headerShown: false }}`.
- [ ] Keep ThemeProvider, StatusBar, `react-native-reanimated`, and `global.css` imports.

**Phase 5: Shared UI**

- [ ] Create `components/app-header.tsx` with color/title/back.
- [ ] Create `components/form-field.tsx` for label/input/error.
- [ ] Create `components/primary-button.tsx`.
- [ ] Create `components/stat-card.tsx`.
- [ ] Create `components/task-form-screen.tsx` for important/normal shared form.
- [ ] Keep components simple; avoid heavy UI libraries.

**Phase 6: Screens**

- [ ] Replace `app/index.tsx` with Login using `useSQLiteContext`, TanStack Form, `loginSchema`, and `router.replace('/home')` on valid credentials.
- [ ] Create `app/home.tsx` with header, greeting/date, stats, simple 7-day bar chart, and 2x2 navigation cards; reload data with `useFocusEffect`.
- [ ] Create `app/add-important.tsx` and `app/add-normal.tsx` using shared TanStack Form task screen, Zod validation, and DateTimePicker.
- [ ] Create `app/tasks.tsx` with focused reload, list cards, empty state, and complete toggle.
- [ ] Create `app/settings.tsx` with TanStack Form password change, Zod validation, repository current-password check, default avatar/initials, name `Syahrul Bhudi Ferdiansyah`, and `NIM: 2241720167`.

**Phase 7: Remove Starter Noise**

- [ ] Remove active `(tabs)` route usage.
- [ ] Optionally delete `app/(tabs)` files, `app/modal.tsx`, starter components if unused.
- [ ] Delete `stores/counter-store.ts` if unused.
- [ ] Delete `docs/plans/test.md` and `docs/plans/empty-test.md` scratch files created during planning.
- [ ] Keep assets unless app icon/photo replacement is added later.

---

## Verification

Automated checks:

- [ ] Run `bunx tsc --noEmit` if configured.
- [ ] Run `bun run lint`.
- [ ] Run `bun start` or `bun run android`.

Manual checks:

- [ ] App launches to Login, not tabs.
- [ ] NativeWind styling works on new screens.
- [ ] Login `user`/`user` works.
- [ ] Wrong password fails.
- [ ] Zod/TanStack Form errors render in React Native UI.
- [ ] Add important task with date picker.
- [ ] Add normal task with date picker.
- [ ] Home counts update on focus.
- [ ] Task list displays both categories.
- [ ] Red arrow for important, green for normal.
- [ ] Toggle completed updates strikethrough and home stats.
- [ ] Change password with wrong current fails.
- [ ] Change password with right current works.
- [ ] Login with new password after app reload works.
- [ ] Task data persists after app restart.
- [ ] Developer default avatar/initials, name, and NIM are visible.
- [ ] Inspect SQLite via Expo DevTools if needed (`shift+m`, open expo-sqlite inspector).

---

## Acceptance Criteria

- App launches directly to Login.
- Login initial credentials `user` / `user` stored in SQLite.
- No remote API required.
- Task data persists after app restart.
- Date field uses native date picker.
- Important task saved as important and styled red.
- Normal task saved as normal and styled green.
- Home shows total completed and not completed from database.
- Bonus chart visible.
- Task list scrolls and supports completion toggling.
- Settings changes password only when current password is correct.
- Developer default avatar/initials, name, and NIM visible.
- App/domain/form/repository types live in `types.ts`.
- Zod validation is used with TanStack Form.
- TanStack Query is not used in first implementation.
- Type/lint checks pass.

---

## Risks

- Existing project is dirty; avoid overwriting unrelated changes without confirmation.
- `expo-sqlite` version must match SDK 54, so use `expo install`, not arbitrary package version.
- DateTimePicker behavior differs Android/iOS; test on Android if target device Android.
- TanStack Form examples are often web-based; implementation must wire React Native `TextInput`/`Pressable` manually.
- Spec says SQLite, while user mentioned MySQL Docker. Do not use MySQL for app storage unless user explicitly overrides spec.
