# Film-NextJS

A movie streaming platform built with Next.js 16, React 19, TypeScript, and Firebase.

> For the full architectural blueprint see [`docs/ENTERPRISE_ARCHITECTURE.md`](../docs/ENTERPRISE_ARCHITECTURE.md).

---

## Quick Start

```bash
npm install
cp .env.example .env.local   # fill in Firebase + API credentials
npm run dev
```

---

## Folder & Naming Conventions (Phase 1 deep-refactor)

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── shared/             # Cross-feature layout components (Header, Footer, ErrorBoundary)
│   │   └── index.ts        # barrel — always import from here
│   └── ui/                 # Stateless UI primitives (Button, Modal, Skeleton, …)
│       └── index.ts        # barrel — always import from here
├── features/
│   ├── auth/
│   │   ├── lib/            # auth-persistence.ts — cookie & localStorage helpers
│   │   ├── providers/      # auth-provider.tsx — Firebase listener orchestration
│   │   ├── store/          # Zustand auth store
│   │   └── types/
│   ├── film/
│   │   ├── components/
│   │   ├── hooks/          # useCategoryFilm, useSearchPageFilm, …
│   │   ├── services/       # film.service.ts  ← authoritative location
│   │   ├── store/          # preview-film-store.ts
│   │   └── types/
│   ├── player/
│   │   ├── components/PlayerContainer/
│   │   │   ├── VideoPlayer/
│   │   │   ├── EpisodesPlayer/
│   │   │   └── DetailFilmPlayer/
│   │   ├── hooks/          # useHlsPlayer, useVideoFullScreen, useContinueWatchingTracker, useVisibilityDisconnect
│   │   ├── store/          # video-player-store.ts
│   │   └── types/
│   └── watch-party/
│       ├── components/
│       │   └── Room/       # RoomDesktopLayout, RoomMobileView, ChatPanel, RoomHeader, …
│       ├── hooks/          # useRoomSync, useMemberNotifications, useWatchPartyLobby, …
│       ├── services/
│       └── types/
├── hooks/                  # camelCase global hooks (useFetchData, useDebounce, …)
│   └── index.ts            # barrel
├── lib/                    # logger, env, utils, error
├── providers/              # TanStack Query provider
├── services/               # api-client.ts, firebase-client.ts
└── types/                  # Shared API types
```

### Key Rules

| Rule                         | Example                                         |
| ---------------------------- | ----------------------------------------------- |
| Hook files use **camelCase** | `useFetchData.ts` ✅                            |
| Always import from barrel    | `import { Button } from "@/components/ui"` ✅   |
| Services **throw** on error  | No `catch (e) { return e }` ✅                  |
| Server data → TanStack Query | No `useEffect` + `useState` for fetching ✅     |
| Global UI state → Zustand    | `useVideoPlayerStore`, `usePreviewFilmStore` ✅ |

---

## Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
npm run format       # Prettier write
npm run test:run     # Vitest (single run)
npm run coverage     # Vitest coverage
```

---

## Environment Variables

See `.env.example` for the complete list. Required variables:

- `NEXT_PUBLIC_BASE_URL` — film API base URL
- `NEXT_PUBLIC_FIREBASE_*` — Firebase project config

---

## Architecture Decisions

- **Feature-Sliced Design** — each feature owns its components, hooks, services, store, and types.
- **TanStack Query** — all remote data fetching; no manual `useEffect`+`useState` fetch loops.
- **Zustand** — only for global UI state (player status, preview overlay).
- **Error contract** — service functions throw `AppError`; pages/consumers wrap in `try/catch` or rely on `error.tsx`.
- **Proxy (middleware)** — `src/proxy.ts` guards authenticated routes via the `is_logged_session` cookie.
