# Firebase — Deploy (Spark / free plan)

Watch Party chạy **đầy đủ trên gói free** — chỉ cần **Realtime Database rules**, không cần Cloud Functions.

## Cài đặt

```bash
npm install -g firebase-tools
firebase login
```

Sửa `.firebaserc` — project ID trùng `NEXT_PUBLIC_FIREBASE_PROJECT_ID` trong `.env`.

## Deploy (chỉ rules)

Từ thư mục `film-nextjs/`:

```bash
npm run firebase:deploy:rules
```

Hoặc:

```bash
firebase deploy --only database
```

## Client xử lý (không Functions)

| Tính năng                    | Cách hoạt động                                         |
| ---------------------------- | ------------------------------------------------------ |
| Tin hệ thống join/leave/kick | Client `sendSystemMessage` (member trong phòng)        |
| Host đóng tab                | `onDisconnect` → xóa member + chuyển host + sync lobby |
| Ghost host                   | Member tự `repairOrphanHost`                           |
| `memberCount` lobby          | Sync debounce khi members đổi                          |

## Cloud Functions (tùy chọn)

Thư mục `firebase/functions/` chỉ dùng khi nâng cấp **Blaze**. Không bắt buộc.

```bash
npm run firebase:deploy   # rules + functions (cần Blaze)
```
