# Film

Nền tảng xem phim xây bằng **Next.js** (App Router), **React**, **TypeScript** và **Firebase**.

Demo: [film-project-beta.vercel.app](https://film-project-beta.vercel.app/)

## Tính năng

- Catalog phim (mới, bộ, lẻ, hoạt hình, TV, thể loại, quốc gia, tìm kiếm)
- Player HLS: đổi tập, resume qua URL (`?ep=` / `?t=`), autoplay / auto-next
- Continue watching & watchlist (Firebase Auth + Realtime Database)
- Watch Party: đồng bộ phát/seek/tập, chat, chuyển host khi host offline
- Theme sáng / tối, skeleton loading, responsive

## Tech stack

| Layer     | Công nghệ                                                   |
| --------- | ----------------------------------------------------------- |
| Framework | Next.js 16, React 19, TypeScript                            |
| UI        | Tailwind CSS, Radix UI, Framer Motion, Swiper               |
| Data      | TanStack Query, Axios, Zod, nuqs                            |
| State     | Zustand                                                     |
| Media     | HLS.js                                                      |
| Backend   | Firebase Auth, Realtime Database, Cloud Functions           |
| Quality   | Vitest, Playwright, ESLint, Prettier, Husky, GitHub Actions |

## Cấu trúc

```text
src/
├── app/                 # App Router (pages, layouts)
├── components/          # shared + ui
├── features/
│   ├── auth/
│   ├── film/
│   ├── player/
│   └── watch-party/
├── hooks/
├── lib/
├── providers/
├── services/
└── types/
```

Mỗi feature giữ riêng components, hooks, services, store và types.

## Bắt đầu

```bash
npm install
cp .env.example .env.local
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Biến môi trường

Copy từ `.env.example`:

```env
NEXT_PUBLIC_API_BASE_URL="https://phimapi.com/"
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
```

Giá trị Firebase lấy từ Firebase Console của project của bạn.

Static assets (logo, avatar, icon) đặt trong `public/images/` theo cấu trúc:

```text
public/images/
├── avatars/
├── icons/
├── img-loading-vertical.jpg
└── ...
```

Nếu thiếu file ảnh, app vẫn chạy nhưng một số icon/avatar có thể không hiển thị.

## Scripts

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run start        # Chạy bản build
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm run format       # Prettier
npm run test:run     # Unit tests (Vitest)
npm run test:e2e     # Smoke E2E (Playwright)
npm run coverage     # Coverage report
```

Firebase (optional):

```bash
npm run firebase:deploy:rules
npm run firebase:deploy:functions
```

## CI

Mỗi push / PR vào `main` hoặc `master` chạy:

1. Lint + typecheck + unit tests
2. Build + Playwright smoke (home → xem phim, auth gate watch-party)

## Ghi chú

- Catalog gọi API công khai [phimapi.com](https://phimapi.com/).
- Watch Party và continue watching cần Firebase đã cấu hình đúng rules / database URL.
- Branch `refactor` trên GitHub giữ bản React cũ (trước khi migrate Next.js).
