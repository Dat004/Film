import { signInWithPopup, signOut } from 'firebase/auth';
import { getDatabase, ref, update } from 'firebase/database';

import { auth, provider } from '@/services/firebase-client';

export async function loginWithGoogle(): Promise<void> {
  await signInWithPopup(auth, provider);
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function updateProfile(
  uid: string,
  updates: { displayName?: string; photoUrl?: string }
): Promise<void> {
  const db = getDatabase();
  await update(ref(db, `users/${uid}/currentUser`), updates);
}
