# Optional — requires Blaze plan

Cloud Functions are **not required** for Watch Party on the free Spark plan.

The app uses client-side logic + RTDB rules instead. See `firebase/DEPLOY.md`.

Deploy only if you upgrade to Blaze:

```bash
npm run build
firebase deploy --only functions
```
