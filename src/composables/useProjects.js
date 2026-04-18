import { computed, readonly, ref, watch } from 'vue'
import { getApps, initializeApp } from 'firebase/app'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import {
  get,
  getDatabase,
  ref as databaseRef,
  remove as removeDatabaseValue,
  set as setDatabaseValue,
} from 'firebase/database'
import {
  getDownloadURL,
  getStorage,
  ref as storageRef,
  uploadString,
} from 'firebase/storage'
import { baseProjects } from '@/data/projects'
import {
  getFirebaseProjectStoreConfig,
  hydrateFirebaseProjectStoreConfig,
  useFirebaseProjectStoreConfig,
} from '@/composables/useFirebaseProjectStoreConfig'

export const privateStudioPath = '/atelier-prive-93f6c1'

const STORAGE_KEY = 'foolio.custom-projects.v1'
const REALTIME_DATABASE_IMAGE_ROOT = 'portfolioProjectImages'
const FIREBASE_STORAGE_FOLDER = 'portfolio-projects'
const FIRESTORE_IMAGE_CHUNKS_SUBCOLLECTION = 'imageChunks'
const REALTIME_DATABASE_IMAGE_REFERENCE_PREFIX = 'rtdb-image-ref-'
const FIRESTORE_IMAGE_REFERENCE_PREFIX = 'firestore-image-ref-'
const LEGACY_FIRESTORE_IMAGE_REFERENCE_PREFIX = 'firestore-image://'
const MAX_FIRESTORE_IMAGE_CHUNK_LENGTH = 240000
const MAX_FIRESTORE_BATCH_OPERATIONS = 450
const customProjects = ref([])
const projectStorageMode = ref('local')
const projectStorageError = ref('')
const projectStoragePending = ref(false)

let localHydrated = false
let firebaseUnsubscribe = null
let activeFirebaseConfigKey = ''
let firebaseSeedPromise = null
let lastFailedFirebaseConfigKey = ''

const firebaseConnections = new Map()
const firebaseStorageAvailability = new Map()
const { firebaseProjectStoreConfig } = useFirebaseProjectStoreConfig()

function cleanText(value = '') {
  return String(value ?? '').trim()
}

function normalizeAccent(value) {
  const accent = cleanText(value)
  return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(accent) ? accent : '#d7ff76'
}

export function createProjectSlug(value = '') {
  return cleanText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => cleanText(entry)).filter(Boolean)
  }

  return cleanText(value)
    .split(/\r?\n|,/)
    .map((entry) => cleanText(entry))
    .filter(Boolean)
}

function normalizeImages(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => cleanText(entry)).filter(Boolean)
  }

  return cleanText(value)
    .split(/\r?\n/)
    .map((entry) => cleanText(entry))
    .filter(Boolean)
}

function sortProjects(entries) {
  return [...entries].sort((left, right) => {
    const leftYear = Number.parseInt(left.year, 10) || 0
    const rightYear = Number.parseInt(right.year, 10) || 0

    if (rightYear !== leftYear) {
      return rightYear - leftYear
    }

    const leftCreatedAt = Date.parse(left.createdAt || '') || 0
    const rightCreatedAt = Date.parse(right.createdAt || '') || 0

    if (rightCreatedAt !== leftCreatedAt) {
      return rightCreatedAt - leftCreatedAt
    }

    return left.title.localeCompare(right.title, 'fr', { sensitivity: 'base' })
  })
}

function normalizeProject(input, fallback = {}) {
  const title = cleanText(input.title)
  const id = createProjectSlug(cleanText(input.id) || title)
  const description = cleanText(input.description)
  const statement = cleanText(input.statement)
  const role = cleanText(input.role)
  const images = normalizeImages(input.images)
  const tech = normalizeList(input.tech)
  const results = normalizeList(input.results)

  if (!title || !id) {
    throw new Error('Le projet doit avoir un titre et un identifiant.')
  }

  if (!description) {
    throw new Error('Ajoute une description au projet.')
  }

  if (!statement) {
    throw new Error('Ajoute une phrase d\'accroche au projet.')
  }

  if (!role) {
    throw new Error('Ajoute ton role sur le projet.')
  }

  if (!images.length) {
    throw new Error('Ajoute au moins une image.')
  }

  return {
    id,
    title,
    description,
    images,
    tech: tech.length ? tech : ['Vue 3'],
    link: cleanText(input.link),
    year: cleanText(input.year) || String(new Date().getFullYear()),
    role,
    accent: normalizeAccent(input.accent),
    statement,
    results: results.length ? results : ['Projet ajoute depuis l\'interface privee'],
    createdAt: cleanText(input.createdAt) || cleanText(fallback.createdAt) || new Date().toISOString(),
    isCustom: true,
  }
}

function readLocalProjectsSnapshot() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY)

    if (!rawValue) {
      return []
    }

    const parsed = JSON.parse(rawValue)

    if (!Array.isArray(parsed)) {
      return []
    }

    return normalizeProjectCollection(parsed)
  }
  catch {
    return []
  }
}

function persistCustomProjects() {
  if (typeof window === 'undefined') {
    return
  }

  localHydrated = true
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customProjects.value))
}

function normalizeProjectCollection(entries, allowStaticConflicts = false) {
  const staticIds = new Set(baseProjects.map((project) => project.id))
  const seenIds = new Set()
  const normalizedProjects = []

  entries.forEach((entry) => {
    const project = normalizeProject(entry, entry)

    if (seenIds.has(project.id)) {
      throw new Error(`L'identifiant ${project.id} est en double dans l'import.`)
    }

    if (!allowStaticConflicts && staticIds.has(project.id)) {
      throw new Error(`L'identifiant ${project.id} existe deja dans les projets publics.`)
    }

    seenIds.add(project.id)
    normalizedProjects.push(project)
  })

  return sortProjects(normalizedProjects)
}

function buildFirebaseConfigSignature(config) {
  if (!config) {
    return ''
  }

  return JSON.stringify({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    databaseURL: config.databaseURL,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
    measurementId: config.measurementId,
    collectionPath: config.collectionPath,
  })
}

function buildFirebaseErrorMessage(error) {
  const code = cleanText(error?.code)
  const message = cleanText(error?.message)

  if (code === 'permission-denied' || code === 'PERMISSION_DENIED' || message.includes('Missing or insufficient permissions') || message.includes('Permission denied')) {
    return 'Firebase refuse l ecriture distante des projets ou des images. Publie les regles Firestore et Realtime Database puis reessaie.'
  }

  if (message.includes('The value of property "array" is longer than')) {
    return 'Le document Firestore etait trop lourd. Les images doivent etre decoupees dans des documents Firestore separes avant l enregistrement.'
  }

  if (message) {
    return `Firebase indisponible: ${message}`
  }

  return 'Firebase indisponible. Verifie la configuration web et les regles Firestore.'
}

function getAvailableFirebaseProjectStoreConfig() {
  const config = getFirebaseProjectStoreConfig()

  if (!config) {
    return null
  }

  if (lastFailedFirebaseConfigKey === buildFirebaseConfigSignature(config)) {
    return null
  }

  return config
}

function getFirebaseConnection(config) {
  const signature = buildFirebaseConfigSignature(config)

  if (firebaseConnections.has(signature)) {
    return firebaseConnections.get(signature)
  }

  const appName = `foolio-${config.projectId}-${config.collectionPath}`.replace(/[^a-z0-9-]+/gi, '-')
  let app = getApps().find((candidate) => candidate.name === appName)

  if (!app) {
    app = initializeApp(
      {
        apiKey: config.apiKey,
        authDomain: config.authDomain || undefined,
        databaseURL: config.databaseURL || undefined,
        projectId: config.projectId,
        storageBucket: config.storageBucket || undefined,
        messagingSenderId: config.messagingSenderId || undefined,
        appId: config.appId,
        measurementId: config.measurementId || undefined,
      },
      appName,
    )
  }

  const db = getFirestore(app)
  const realtimeDb = getDatabase(app)
  const collectionRef = collection(db, config.collectionPath)
  const storage = getStorage(app)
  const connection = { db, realtimeDb, collectionRef, storage }

  firebaseConnections.set(signature, connection)

  return connection
}

function isDataUrlImage(value = '') {
  return /^data:image\//i.test(cleanText(value))
}

function buildRealtimeDatabaseImageReference(index) {
  return `${REALTIME_DATABASE_IMAGE_REFERENCE_PREFIX}${String(index).padStart(2, '0')}`
}

function isRealtimeDatabaseImageReference(value = '') {
  return cleanText(value).startsWith(REALTIME_DATABASE_IMAGE_REFERENCE_PREFIX)
}

function buildRealtimeDatabaseProjectImagesPath(projectId) {
  return `${REALTIME_DATABASE_IMAGE_ROOT}/${projectId}`
}

function buildFirestoreImageReference(index) {
  return `${FIRESTORE_IMAGE_REFERENCE_PREFIX}${String(index).padStart(2, '0')}`
}

function isFirestoreImageReference(value = '') {
  const normalizedValue = cleanText(value)

  return normalizedValue.startsWith(FIRESTORE_IMAGE_REFERENCE_PREFIX)
    || normalizedValue.startsWith(LEGACY_FIRESTORE_IMAGE_REFERENCE_PREFIX)
}

function getImageExtensionFromDataUrl(value = '') {
  const normalizedValue = cleanText(value)
  const mimeMatch = normalizedValue.match(/^data:(image\/[a-z0-9.+-]+);base64,/i)
  const mimeType = mimeMatch?.[1]?.toLowerCase() || ''

  if (mimeType.includes('png')) {
    return 'png'
  }

  if (mimeType.includes('webp')) {
    return 'webp'
  }

  if (mimeType.includes('gif')) {
    return 'gif'
  }

  if (mimeType.includes('svg')) {
    return 'svg'
  }

  return 'jpg'
}

function splitFirestoreImageValue(value = '') {
  const normalizedValue = cleanText(value)

  if (!normalizedValue) {
    return []
  }

  const chunks = []

  for (let index = 0; index < normalizedValue.length; index += MAX_FIRESTORE_IMAGE_CHUNK_LENGTH) {
    chunks.push(normalizedValue.slice(index, index + MAX_FIRESTORE_IMAGE_CHUNK_LENGTH))
  }

  return chunks
}

async function commitFirestoreBatchOperations(db, operations) {
  if (!operations.length) {
    return
  }

  let batch = writeBatch(db)
  let batchSize = 0

  for (const operation of operations) {
    if (batchSize >= MAX_FIRESTORE_BATCH_OPERATIONS) {
      await batch.commit()
      batch = writeBatch(db)
      batchSize = 0
    }

    operation(batch)
    batchSize += 1
  }

  if (batchSize) {
    await batch.commit()
  }
}

function createFirestoreProjectPayload(project) {
  return {
    ...project,
    images: project.images.map((_, index) => buildFirestoreImageReference(index)),
  }
}

function createStorageProjectPayload(project) {
  return { ...project }
}

function createRealtimeDatabaseProjectPayload(project, imageIndexes) {
  const imageIndexSet = new Set(imageIndexes)

  return {
    ...project,
    images: project.images.map((image, index) => (imageIndexSet.has(index) ? buildRealtimeDatabaseImageReference(index) : image)),
  }
}

function getPersistedProjectImageBackend(project = null) {
  const images = normalizeImages(project?.images)

  if (images.some((image) => isRealtimeDatabaseImageReference(image))) {
    return 'realtime-db'
  }

  if (images.some((image) => isFirestoreImageReference(image))) {
    return 'firestore'
  }

  return 'storage'
}

async function ensureFirebaseStorageAvailability(config) {
  if (!cleanText(config.storageBucket)) {
    return false
  }

  const signature = buildFirebaseConfigSignature(config)

  if (firebaseStorageAvailability.has(signature)) {
    return firebaseStorageAvailability.get(signature)
  }

  const availabilityPromise = fetch(
    `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(config.storageBucket)}/o?maxResults=1`,
  )
    .then((response) => response.ok)
    .catch(() => false)

  firebaseStorageAvailability.set(signature, availabilityPromise)

  try {
    const isAvailable = await availabilityPromise

    if (!isAvailable) {
      firebaseStorageAvailability.delete(signature)
    }

    return isAvailable
  }
  catch {
    firebaseStorageAvailability.delete(signature)
    return false
  }
}

async function replaceProjectImagesInRealtimeDatabase(project, config) {
  const localImages = project.images
    .map((image, index) => ({ image, index }))
    .filter(({ image }) => isDataUrlImage(image))

  if (!localImages.length) {
    return null
  }

  const { realtimeDb } = getFirebaseConnection(config)
  const imageEntries = {}

  localImages.forEach(({ image, index }) => {
    imageEntries[buildRealtimeDatabaseImageReference(index)] = {
      order: index,
      value: image,
    }
  })

  await setDatabaseValue(
    databaseRef(realtimeDb, buildRealtimeDatabaseProjectImagesPath(project.id)),
    imageEntries,
  )

  return createRealtimeDatabaseProjectPayload(
    project,
    localImages.map(({ index }) => index),
  )
}

async function readProjectImagesFromRealtimeDatabase(project, config) {
  const normalizedImages = normalizeImages(project.images)
  const { realtimeDb } = getFirebaseConnection(config)
  const snapshot = await get(
    databaseRef(realtimeDb, buildRealtimeDatabaseProjectImagesPath(project.id)),
  )

  if (!snapshot.exists()) {
    return {
      ...project,
      images: normalizedImages.filter((image) => !isRealtimeDatabaseImageReference(image)),
    }
  }

  const nextImages = [...normalizedImages]
  const imageEntries = Object.values(snapshot.val() || {})
    .map((entry) => ({
      order: Number.isFinite(entry?.order) ? entry.order : Number.parseInt(entry?.order, 10) || 0,
      value: cleanText(entry?.value),
    }))
    .filter((entry) => entry.value)
    .sort((left, right) => left.order - right.order)

  imageEntries.forEach((entry) => {
    nextImages[entry.order] = entry.value
  })

  return {
    ...project,
    images: nextImages.filter(Boolean),
  }
}

async function deleteProjectImagesFromRealtimeDatabase(projectId, config) {
  const { realtimeDb } = getFirebaseConnection(config)

  await removeDatabaseValue(
    databaseRef(realtimeDb, buildRealtimeDatabaseProjectImagesPath(projectId)),
  )
}

async function uploadProjectImagesToFirebaseStorage(project, config) {
  const localImages = project.images
    .map((image, index) => ({ image, index }))
    .filter(({ image }) => isDataUrlImage(image))

  if (!localImages.length) {
    return project
  }

  const storageIsAvailable = await ensureFirebaseStorageAvailability(config)

  if (!storageIsAvailable) {
    return null
  }

  const { storage } = getFirebaseConnection(config)
  const nextImages = [...project.images]
  const uploadStamp = Date.now()

  try {
    await Promise.all(
      localImages.map(async ({ image, index }) => {
        const extension = getImageExtensionFromDataUrl(image)
        const imageRef = storageRef(
          storage,
          `${FIREBASE_STORAGE_FOLDER}/${createProjectSlug(project.id) || 'project'}/${uploadStamp}-${index}.${extension}`,
        )

        await uploadString(imageRef, image, 'data_url')
        nextImages[index] = await getDownloadURL(imageRef)
      }),
    )

    return {
      ...project,
      images: nextImages,
    }
  }
  catch {
    return null
  }
}

async function persistProjectMediaToFirebase(project, config) {
  try {
    const realtimeDatabasePayload = await replaceProjectImagesInRealtimeDatabase(project, config)

    if (realtimeDatabasePayload) {
      return {
        backend: 'realtime-db',
        project,
        payload: realtimeDatabasePayload,
      }
    }
  }
  catch {
  }

  const storageReadyProject = await uploadProjectImagesToFirebaseStorage(project, config)

  if (storageReadyProject) {
    return {
      backend: 'storage',
      project: storageReadyProject,
      payload: createStorageProjectPayload(storageReadyProject),
    }
  }

  await replaceProjectImagesInFirebase(project, config)

  return {
    backend: 'firestore',
    project,
    payload: createFirestoreProjectPayload(project),
  }
}

async function readProjectImagesFromFirebase(project, config) {
  const normalizedImages = normalizeImages(project.images)
  const imageBackend = getPersistedProjectImageBackend(project)

  if (imageBackend === 'realtime-db') {
    return readProjectImagesFromRealtimeDatabase(project, config)
  }

  if (imageBackend !== 'firestore') {
    return {
      ...project,
      images: normalizedImages,
    }
  }

  const fallbackImages = normalizedImages.filter((image) => !isFirestoreImageReference(image))

  const { db } = getFirebaseConnection(config)
  const imageChunksRef = collection(db, config.collectionPath, project.id, FIRESTORE_IMAGE_CHUNKS_SUBCOLLECTION)
  const imageChunksSnapshot = await getDocs(imageChunksRef)

  if (imageChunksSnapshot.empty) {
    return {
      ...project,
      images: fallbackImages.length ? fallbackImages : normalizeImages(project.images),
    }
  }

  const imageGroups = new Map()

  imageChunksSnapshot.forEach((entry) => {
    const data = entry.data()
    const imageId = cleanText(data.imageId)
    const order = Number.isFinite(data.order) ? data.order : Number.parseInt(data.order, 10) || 0
    const chunkIndex = Number.isFinite(data.chunkIndex) ? data.chunkIndex : Number.parseInt(data.chunkIndex, 10) || 0
    const value = cleanText(data.value)

    if (!imageId || !value) {
      return
    }

    if (!imageGroups.has(imageId)) {
      imageGroups.set(imageId, {
        order,
        chunks: [],
      })
    }

    imageGroups.get(imageId).chunks.push({ chunkIndex, value })
  })

  const images = [...imageGroups.values()]
    .sort((left, right) => left.order - right.order)
    .map((group) => group.chunks
      .sort((left, right) => left.chunkIndex - right.chunkIndex)
      .map((chunk) => chunk.value)
      .join(''))
    .filter(Boolean)

  return {
    ...project,
    images: images.length ? images : fallbackImages,
  }
}

async function replaceProjectImagesInFirebase(project, config) {
  const { db } = getFirebaseConnection(config)
  const imageChunksRef = collection(db, config.collectionPath, project.id, FIRESTORE_IMAGE_CHUNKS_SUBCOLLECTION)
  const existingImageChunks = await getDocs(imageChunksRef)
  const operations = []

  existingImageChunks.forEach((entry) => {
    operations.push((batch) => {
      batch.delete(entry.ref)
    })
  })

  project.images.forEach((image, imageIndex) => {
    const chunks = splitFirestoreImageValue(image)
    const imageId = buildFirestoreImageReference(imageIndex)

    chunks.forEach((chunkValue, chunkIndex) => {
      const chunkRef = doc(imageChunksRef, `${imageId}--${String(chunkIndex).padStart(4, '0')}`)

      operations.push((batch) => {
        batch.set(chunkRef, {
          imageId,
          order: imageIndex,
          chunkIndex,
          value: chunkValue,
        })
      })
    })
  })

  await commitFirestoreBatchOperations(db, operations)
}

async function deleteProjectImagesFromFirebase(projectId, config) {
  const { db } = getFirebaseConnection(config)
  const imageChunksRef = collection(db, config.collectionPath, projectId, FIRESTORE_IMAGE_CHUNKS_SUBCOLLECTION)
  const existingImageChunks = await getDocs(imageChunksRef)
  const operations = []

  existingImageChunks.forEach((entry) => {
    operations.push((batch) => {
      batch.delete(entry.ref)
    })
  })

  await commitFirestoreBatchOperations(db, operations)
}

async function cleanupProjectMediaForBackend(projectId, config, backend) {
  if (backend === 'realtime-db') {
    await deleteProjectImagesFromRealtimeDatabase(projectId, config)
    return
  }

  if (backend === 'firestore') {
    await deleteProjectImagesFromFirebase(projectId, config)
  }
}

function loadLocalProjects() {
  customProjects.value = readLocalProjectsSnapshot()
  localHydrated = true
  projectStorageMode.value = 'local'
  projectStoragePending.value = false
}

async function saveProjectToFirebase(project, config) {
  const { collectionRef } = getFirebaseConnection(config)
  const projectRef = doc(collectionRef, project.id)
  const previousSnapshot = await getDoc(projectRef)
  const previousBackend = previousSnapshot.exists()
    ? getPersistedProjectImageBackend(previousSnapshot.data())
    : ''
  const { backend, project: persistedProject, payload } = await persistProjectMediaToFirebase(project, config)

  await setDoc(projectRef, payload)

  if (previousBackend && previousBackend !== backend) {
    await cleanupProjectMediaForBackend(project.id, config, previousBackend)
  }

  return persistedProject
}

async function deleteProjectFromFirebase(id, config) {
  const { collectionRef } = getFirebaseConnection(config)
  const projectRef = doc(collectionRef, id)
  const existingProjectSnapshot = await getDoc(projectRef)

  if (existingProjectSnapshot.exists()) {
    await cleanupProjectMediaForBackend(
      id,
      config,
      getPersistedProjectImageBackend(existingProjectSnapshot.data()),
    )
  }

  await deleteDoc(projectRef)
}

async function replaceProjectsInFirebase(entries, config) {
  const normalizedProjects = normalizeProjectCollection(entries)
  const { db, collectionRef } = getFirebaseConnection(config)
  const existingProjects = await getDocs(collectionRef)

  await Promise.all(
    existingProjects.docs.map((entry) => cleanupProjectMediaForBackend(
      entry.id,
      config,
      getPersistedProjectImageBackend(entry.data()),
    )),
  )

  const deleteOperations = []

  existingProjects.forEach((entry) => {
    deleteOperations.push((batch) => {
      batch.delete(entry.ref)
    })
  })

  await commitFirestoreBatchOperations(db, deleteOperations)

  const persistedProjects = await Promise.all(
    normalizedProjects.map((project) => persistProjectMediaToFirebase(project, config)),
  )

  const createOperations = []

  persistedProjects.forEach(({ payload }) => {
    createOperations.push((batch) => {
      batch.set(doc(collectionRef, payload.id), payload)
    })
  })

  await commitFirestoreBatchOperations(db, createOperations)

  return persistedProjects.map(({ project }) => project)
}

function stopFirebaseSync() {
  firebaseUnsubscribe?.()
  firebaseUnsubscribe = null
  activeFirebaseConfigKey = ''
  firebaseSeedPromise = null
}

function fallbackToLocalProjects(projectList, error, config) {
  lastFailedFirebaseConfigKey = buildFirebaseConfigSignature(config)
  stopFirebaseSync()
  customProjects.value = sortProjects(projectList)
  projectStorageMode.value = 'local'
  projectStoragePending.value = false
  projectStorageError.value = buildFirebaseErrorMessage(error)
  persistCustomProjects()
}

function startFirebaseSync(config) {
  const signature = buildFirebaseConfigSignature(config)
  const initialLocalProjects = readLocalProjectsSnapshot()
  const { collectionRef } = getFirebaseConnection(config)
  let handledInitialSnapshot = false
  let snapshotVersion = 0

  projectStorageMode.value = 'firebase'
  projectStoragePending.value = true
  projectStorageError.value = ''
  activeFirebaseConfigKey = signature
  lastFailedFirebaseConfigKey = ''

  firebaseUnsubscribe = onSnapshot(
    collectionRef,
    async (snapshot) => {
      const currentSnapshotVersion = ++snapshotVersion

      if (activeFirebaseConfigKey !== signature) {
        return
      }

      if (snapshot.empty) {
        if (!handledInitialSnapshot && initialLocalProjects.length && !firebaseSeedPromise) {
          firebaseSeedPromise = replaceProjectsInFirebase(initialLocalProjects, config)
            .catch((error) => {
              fallbackToLocalProjects(initialLocalProjects, error, config)
            })
            .finally(() => {
              firebaseSeedPromise = null
            })

          customProjects.value = sortProjects(initialLocalProjects)
          persistCustomProjects()
        }
        else {
          customProjects.value = []
          persistCustomProjects()
        }

        handledInitialSnapshot = true
        projectStoragePending.value = false
        return
      }

      try {
        const hydratedProjects = await Promise.all(
          snapshot.docs.map((entry) => readProjectImagesFromFirebase(entry.data(), config)),
        )

        if (activeFirebaseConfigKey !== signature || currentSnapshotVersion !== snapshotVersion) {
          return
        }

        customProjects.value = normalizeProjectCollection(hydratedProjects)
        persistCustomProjects()
        handledInitialSnapshot = true
        projectStoragePending.value = false
        projectStorageError.value = ''
      }
      catch (error) {
        customProjects.value = []
        projectStoragePending.value = false
        projectStorageError.value = buildFirebaseErrorMessage(error)
      }
    },
    (error) => {
      lastFailedFirebaseConfigKey = signature
      stopFirebaseSync()
      projectStorageError.value = buildFirebaseErrorMessage(error)
      loadLocalProjects()
    },
  )
}

export function hydrateProjectsStore() {
  if (typeof window === 'undefined') {
    return
  }

  hydrateFirebaseProjectStoreConfig()

  const firebaseConfig = getFirebaseProjectStoreConfig()

  if (firebaseConfig) {
    const signature = buildFirebaseConfigSignature(firebaseConfig)

    if (lastFailedFirebaseConfigKey === signature) {
      loadLocalProjects()
      return
    }

    if (activeFirebaseConfigKey !== signature || !firebaseUnsubscribe) {
      stopFirebaseSync()
      startFirebaseSync(firebaseConfig)
    }

    return
  }

  stopFirebaseSync()

  if (!localHydrated || projectStorageMode.value !== 'local') {
    loadLocalProjects()
  }
}

watch(firebaseProjectStoreConfig, () => {
  hydrateProjectsStore()
}, { deep: true })

export const projects = computed(() => {
  hydrateProjectsStore()
  return sortProjects([...baseProjects, ...customProjects.value])
})

export function findProjectById(id) {
  hydrateProjectsStore()
  return projects.value.find((project) => project.id === id) ?? null
}

export async function addCustomProject(input) {
  hydrateProjectsStore()

  let project = normalizeProject(input)
  const firebaseConfig = getAvailableFirebaseProjectStoreConfig()

  if (findProjectById(project.id)) {
    throw new Error('Un projet utilise deja cet identifiant.')
  }

  if (firebaseConfig) {
    projectStoragePending.value = true

    try {
      project = await saveProjectToFirebase(project, firebaseConfig)
      projectStorageError.value = ''
    }
    catch (error) {
      fallbackToLocalProjects([project, ...customProjects.value], error, firebaseConfig)
    }
  }
  else {
    customProjects.value = sortProjects([project, ...customProjects.value])
    persistCustomProjects()
  }

  return project
}

export async function updateCustomProject(originalId, input) {
  hydrateProjectsStore()

  const currentProject = customProjects.value.find((project) => project.id === originalId)
  const firebaseConfig = getAvailableFirebaseProjectStoreConfig()

  if (!currentProject) {
    throw new Error('Impossible de retrouver ce projet personnalise.')
  }

  let nextProject = normalizeProject(
    {
      ...currentProject,
      ...input,
      createdAt: currentProject.createdAt,
    },
    currentProject,
  )

  const collidingProject = projects.value.find((project) => project.id === nextProject.id && project.id !== originalId)

  if (collidingProject) {
    throw new Error('Cet identifiant est deja utilise par un autre projet.')
  }

  if (firebaseConfig) {
    projectStoragePending.value = true

    try {
      nextProject = await saveProjectToFirebase(nextProject, firebaseConfig)

      if (nextProject.id !== originalId) {
        await deleteProjectFromFirebase(originalId, firebaseConfig)
      }

      projectStorageError.value = ''
    }
    catch (error) {
      fallbackToLocalProjects(
        customProjects.value.map((project) => (project.id === originalId ? nextProject : project)),
        error,
        firebaseConfig,
      )
    }
  }
  else {
    customProjects.value = sortProjects(
      customProjects.value.map((project) => (project.id === originalId ? nextProject : project)),
    )

    persistCustomProjects()
  }

  return nextProject
}

export async function removeCustomProject(id) {
  hydrateProjectsStore()

  const firebaseConfig = getAvailableFirebaseProjectStoreConfig()

  if (firebaseConfig) {
    projectStoragePending.value = true

    try {
      await deleteProjectFromFirebase(id, firebaseConfig)
      projectStorageError.value = ''
    }
    catch (error) {
      projectStoragePending.value = false
      throw new Error(buildFirebaseErrorMessage(error))
    }
  }
  else {
    customProjects.value = customProjects.value.filter((project) => project.id !== id)
    persistCustomProjects()
  }
}

export function exportCustomProjects() {
  hydrateProjectsStore()
  return JSON.stringify(customProjects.value, null, 2)
}

export async function importCustomProjects(jsonValue) {
  hydrateProjectsStore()

  let parsed = null

  try {
    parsed = JSON.parse(jsonValue)
  }
  catch {
    throw new Error('Le fichier importe n\'est pas un JSON valide.')
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Le fichier importe doit contenir un tableau de projets.')
  }

  const normalizedProjects = normalizeProjectCollection(parsed)
  const firebaseConfig = getAvailableFirebaseProjectStoreConfig()

  if (firebaseConfig) {
    projectStoragePending.value = true

    try {
      await replaceProjectsInFirebase(normalizedProjects, firebaseConfig)
      projectStorageError.value = ''
    }
    catch (error) {
      projectStoragePending.value = false
      throw new Error(buildFirebaseErrorMessage(error))
    }
  }
  else {
    customProjects.value = normalizedProjects
    persistCustomProjects()
  }

  return normalizedProjects
}

export function useProjects() {
  hydrateProjectsStore()

  return {
    projects,
    customProjects: readonly(customProjects),
    projectStorageMode: readonly(projectStorageMode),
    projectStorageError: readonly(projectStorageError),
    projectStoragePending: readonly(projectStoragePending),
    addCustomProject,
    updateCustomProject,
    removeCustomProject,
    exportCustomProjects,
    importCustomProjects,
  }
}