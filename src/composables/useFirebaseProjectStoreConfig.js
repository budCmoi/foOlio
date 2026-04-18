import { computed, readonly, ref } from 'vue'
import { firebaseProjectCollectionPath, firebaseWebConfig } from '@/lib/firebase'

const FIREBASE_PROJECT_STORE_KEY = 'foolio.firebase-project-store.v1'

function cleanText(value = '') {
  return String(value ?? '').trim()
}

export function createEmptyFirebaseProjectStoreConfig() {
  return {
    apiKey: firebaseWebConfig.apiKey,
    authDomain: firebaseWebConfig.authDomain,
    databaseURL: firebaseWebConfig.databaseURL,
    projectId: firebaseWebConfig.projectId,
    storageBucket: firebaseWebConfig.storageBucket,
    messagingSenderId: firebaseWebConfig.messagingSenderId,
    appId: firebaseWebConfig.appId,
    measurementId: firebaseWebConfig.measurementId,
    collectionPath: firebaseProjectCollectionPath,
  }
}

function normalizeFirebaseProjectStoreConfig(input = {}) {
  const defaults = createEmptyFirebaseProjectStoreConfig()

  return {
    apiKey: cleanText(input.apiKey) || defaults.apiKey,
    authDomain: cleanText(input.authDomain) || defaults.authDomain,
    databaseURL: cleanText(input.databaseURL) || defaults.databaseURL,
    projectId: cleanText(input.projectId) || defaults.projectId,
    storageBucket: cleanText(input.storageBucket) || defaults.storageBucket,
    messagingSenderId: cleanText(input.messagingSenderId) || defaults.messagingSenderId,
    appId: cleanText(input.appId) || defaults.appId,
    measurementId: cleanText(input.measurementId) || defaults.measurementId,
    collectionPath: cleanText(input.collectionPath) || defaults.collectionPath,
  }
}

function isFirebaseProjectStoreUsable(config) {
  return Boolean(config.apiKey && config.projectId && config.appId)
}

const firebaseProjectStoreConfigState = ref(createEmptyFirebaseProjectStoreConfig())
let hydrated = false

function persistFirebaseProjectStoreConfig() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    FIREBASE_PROJECT_STORE_KEY,
    JSON.stringify(firebaseProjectStoreConfigState.value),
  )
}

export function hydrateFirebaseProjectStoreConfig() {
  if (hydrated || typeof window === 'undefined') {
    return
  }

  hydrated = true

  try {
    const rawValue = window.localStorage.getItem(FIREBASE_PROJECT_STORE_KEY)

    if (!rawValue) {
      firebaseProjectStoreConfigState.value = createEmptyFirebaseProjectStoreConfig()
      return
    }

    firebaseProjectStoreConfigState.value = normalizeFirebaseProjectStoreConfig(JSON.parse(rawValue))
  }
  catch {
    firebaseProjectStoreConfigState.value = createEmptyFirebaseProjectStoreConfig()
  }
}

export function getFirebaseProjectStoreConfig() {
  hydrateFirebaseProjectStoreConfig()

  return isFirebaseProjectStoreUsable(firebaseProjectStoreConfigState.value)
    ? { ...firebaseProjectStoreConfigState.value }
    : null
}

export function saveFirebaseProjectStoreConfig(input) {
  const config = normalizeFirebaseProjectStoreConfig(input)

  if (!isFirebaseProjectStoreUsable(config)) {
    throw new Error('La config Firebase doit au minimum contenir apiKey, projectId et appId.')
  }

  firebaseProjectStoreConfigState.value = config
  persistFirebaseProjectStoreConfig()

  return { ...config }
}

export function clearFirebaseProjectStoreConfig() {
  firebaseProjectStoreConfigState.value = createEmptyFirebaseProjectStoreConfig()

  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(FIREBASE_PROJECT_STORE_KEY)
  }
}

export function useFirebaseProjectStoreConfig() {
  hydrateFirebaseProjectStoreConfig()

  return {
    firebaseProjectStoreConfig: readonly(firebaseProjectStoreConfigState),
    hasFirebaseProjectStoreConfig: computed(() => isFirebaseProjectStoreUsable(firebaseProjectStoreConfigState.value)),
    saveFirebaseProjectStoreConfig,
    clearFirebaseProjectStoreConfig,
  }
}