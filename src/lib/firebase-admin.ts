import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  initializeApp({
    projectId: "meu-ecossistema-d6b49",
  });
}

export const adminAuth = getAuth();
