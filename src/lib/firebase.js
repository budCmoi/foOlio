import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'

export const firebaseWebConfig = {
  apiKey: 'AIzaSyAMbLiRzqEEkFp1cKM7MC-Wp5dRVxqET2s',
  authDomain: 'compta-b4e23.firebaseapp.com',
  databaseURL: 'https://compta-b4e23-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'compta-b4e23',
  storageBucket: 'compta-b4e23.firebasestorage.app',
  messagingSenderId: '467150472454',
  appId: '1:467150472454:web:b365788cc1108a39b24a87',
  measurementId: 'G-Y8ZR2RBB44',
}

export const firebaseProjectCollectionPath = 'projects'

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseWebConfig)
export const firebaseDb = getFirestore(firebaseApp)

let analyticsPromise = null

export function ensureFirebaseAnalytics() {
  if (typeof window === 'undefined') {
    return Promise.resolve(null)
  }

  if (!analyticsPromise) {
    analyticsPromise = isSupported()
      .then((supported) => (supported ? getAnalytics(firebaseApp) : null))
      .catch(() => null)
  }

  return analyticsPromise
}

if (typeof window !== 'undefined') {
  void ensureFirebaseAnalytics()
}