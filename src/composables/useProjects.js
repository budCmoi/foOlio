import { computed, readonly, ref, watch } from 'vue'
import { getApps, initializeApp } from 'firebase/app'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
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
const STORAGE_FOLDER = 'portfolio-projects'
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

  if (code === 'storage/unauthorized') {
    return 'Firebase Storage refuse l upload des images. Publie des regles Storage qui autorisent le dossier portfolio-projects pour les images du studio.'
  }

  if (code === 'storage/unknown') {
    return 'Firebase Storage ne repond pas correctement. Verifie que Storage est bien active dans le projet Firebase et que le bucket existe vraiment.'
  }

  if (message.includes('The value of property "array" is longer than')) {
    return 'Le document Firestore etait trop lourd. Les images locales doivent passer par Firebase Storage avant l enregistrement.'
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
  const collectionRef = collection(db, config.collectionPath)
  const storage = getStorage(app)
  const connection = { db, collectionRef, storage }

  firebaseConnections.set(signature, connection)

  return connection
}

function isDataUrlImage(value = '') {
  return /^data:image\//i.test(cleanText(value))
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

async function ensureFirebaseStorageAvailability(config) {
  const signature = buildFirebaseConfigSignature(config)

  if (firebaseStorageAvailability.has(signature)) {
    return firebaseStorageAvailability.get(signature)
  }

  const probePromise = fetch(
    `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(config.storageBucket)}/o?maxResults=1`,
  ).then(async (response) => {
    if (response.ok) {
      return true
    }

    if (response.status === 404) {
      throw new Error('Firebase Storage est configure dans le code, mais le bucket n existe pas encore. Active Storage dans la console Firebase puis publie les regles storage.rules.')
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error('Firebase Storage repond mais refuse l acces au bucket. Verifie les regles Storage et l activation du service.')
    }

    throw new Error(`Firebase Storage repond avec le statut ${response.status}.`)
  })

  firebaseStorageAvailability.set(signature, probePromise)

  try {
    return await probePromise
  }
  catch (error) {
    firebaseStorageAvailability.delete(signature)
    throw error
  }
}

async function uploadProjectImagesToFirebase(project, config) {
  const pendingUploads = project.images
    .map((image, index) => ({ image, index }))
    .filter(({ image }) => isDataUrlImage(image))

  if (!pendingUploads.length) {
    return project
  }

  await ensureFirebaseStorageAvailability(config)

  const { storage } = getFirebaseConnection(config)
  const nextImages = [...project.images]
  const uploadStamp = Date.now()

  await Promise.all(
    pendingUploads.map(async ({ image, index }) => {
      const extension = getImageExtensionFromDataUrl(image)
      const imageRef = storageRef(
        storage,
        `${STORAGE_FOLDER}/${createProjectSlug(project.id) || 'project'}/${uploadStamp}-${index}.${extension}`,
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

function loadLocalProjects() {
  customProjects.value = readLocalProjectsSnapshot()
  localHydrated = true
  projectStorageMode.value = 'local'
  projectStoragePending.value = false
}

async function saveProjectToFirebase(project, config) {
  const { collectionRef } = getFirebaseConnection(config)
  const projectWithHostedImages = await uploadProjectImagesToFirebase(project, config)

  await setDoc(doc(collectionRef, projectWithHostedImages.id), projectWithHostedImages)

  return projectWithHostedImages
}

async function deleteProjectFromFirebase(id, config) {
  const { collectionRef } = getFirebaseConnection(config)
  await deleteDoc(doc(collectionRef, id))
}

async function replaceProjectsInFirebase(entries, config) {
  const normalizedProjects = normalizeProjectCollection(entries)
  const projectsWithHostedImages = await Promise.all(
    normalizedProjects.map((project) => uploadProjectImagesToFirebase(project, config)),
  )
  const { db, collectionRef } = getFirebaseConnection(config)
  const existingProjects = await getDocs(collectionRef)
  const batch = writeBatch(db)

  existingProjects.forEach((entry) => {
    batch.delete(entry.ref)
  })

  projectsWithHostedImages.forEach((project) => {
    batch.set(doc(collectionRef, project.id), project)
  })

  await batch.commit()

  return projectsWithHostedImages
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

  projectStorageMode.value = 'firebase'
  projectStoragePending.value = true
  projectStorageError.value = ''
  activeFirebaseConfigKey = signature
  lastFailedFirebaseConfigKey = ''

  firebaseUnsubscribe = onSnapshot(
    collectionRef,
    (snapshot) => {
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
        customProjects.value = normalizeProjectCollection(snapshot.docs.map((entry) => entry.data()))
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