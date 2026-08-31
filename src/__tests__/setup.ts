import '@testing-library/jest-dom';

process.env['NEXT_PUBLIC_API_BASE_URL'] =
  process.env['NEXT_PUBLIC_API_BASE_URL'] || 'https://phimapi.com';
process.env['NEXT_PUBLIC_FIREBASE_API_KEY'] =
  process.env['NEXT_PUBLIC_FIREBASE_API_KEY'] || 'test-key';
process.env['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'] =
  process.env['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'] || 'test.firebaseapp.com';
process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] =
  process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] || 'test-id';
process.env['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'] =
  process.env['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'] || 'test.appspot.com';
process.env['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'] =
  process.env['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'] || '123456';
process.env['NEXT_PUBLIC_FIREBASE_APP_ID'] =
  process.env['NEXT_PUBLIC_FIREBASE_APP_ID'] || '1:123456:web:123456';
process.env['NEXT_PUBLIC_FIREBASE_DATABASE_URL'] =
  process.env['NEXT_PUBLIC_FIREBASE_DATABASE_URL'] || 'https://test.firebaseio.com';
