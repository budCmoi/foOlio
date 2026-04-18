import { computed, readonly, ref } from 'vue'
import { baseProjects } from '@/data/projects'
import {
  cleanText,
  createProjectSlug,
  normalizeProject,
  normalizeProjectCollection,
  sortProjects,
} from '@/lib/project-model'

export { createProjectSlug }

export const privateStudioPath = '/atelier-prive-93f6c1'

const customProjects = ref([])
const projectsHydrated = ref(false)
const projectStorageMode = ref('prisma')
const projectStorageError = ref('')
const projectStoragePending = ref(false)

const reservedProjectIds = baseProjects.map((project) => project.id)
const invalidProjectsListMessage = 'Reponse Prisma invalide. Le serveur n a pas renvoye la liste des projets.'

let hydratePromise = null

function buildApiErrorMessage(error, fallbackMessage = 'Prisma indisponible. Verifie que l API tourne bien.') {
  const message = cleanText(error?.message)
  return message || fallbackMessage
}

function buildApiResponseErrorMessage(response, payload) {
  const payloadMessage = cleanText(payload?.error)

  if (payloadMessage) {
    return payloadMessage
  }

  if ([502, 503, 504].includes(response.status)) {
    return 'Impossible de joindre l API Prisma. Verifie que le serveur Node tourne bien sur le port 3001.'
  }

  if (response.status >= 500) {
    return 'L API Prisma a renvoye une erreur serveur.'
  }

  return 'La requete Prisma a echoue.'
}

function looksLikeProjectPayload(payload) {
  return Boolean(
    payload
    && typeof payload === 'object'
    && cleanText(payload.id)
    && cleanText(payload.title),
  )
}

function extractProjectPayload(payload) {
  if (payload?.project) {
    return normalizeProject(payload.project, payload.project)
  }

  if (looksLikeProjectPayload(payload)) {
    return normalizeProject(payload, payload)
  }

  throw new Error('Reponse Prisma invalide. Le serveur n a pas renvoye de projet.')
}

function extractProjectsPayload(payload) {
  if (Array.isArray(payload?.projects)) {
    return payload.projects
  }

  if (Array.isArray(payload)) {
    return payload
  }

  throw new Error(invalidProjectsListMessage)
}

function resolveProjectsApiUrl(path) {
  if (typeof window === 'undefined' || !import.meta.env.DEV || !path.startsWith('/')) {
    return path
  }

  return `${window.location.protocol}//${window.location.hostname}:3001${path}`
}

async function requestProjectsApi(path, { method = 'GET', body } = {}) {
  let response = null

  try {
    response = await fetch(resolveProjectsApiUrl(path), {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  }
  catch {
    throw new Error('Impossible de joindre l API Prisma. Verifie que le serveur Node tourne bien sur le port 3001.')
  }

  const contentType = response.headers.get('content-type') || ''
  let payload = null

  if (contentType.includes('application/json')) {
    try {
      payload = await response.json()
    }
    catch {
      throw new Error('Reponse Prisma invalide. Le JSON renvoye par le serveur est illisible.')
    }
  }
  else {
    const text = await response.text()
    payload = text ? { error: text } : null
  }

  if (!response.ok) {
    throw new Error(buildApiResponseErrorMessage(response, payload))
  }

  return payload
}

function normalizeProjectsFromApi(entries = []) {
  return sortProjects(entries.map((entry) => normalizeProject(entry, entry)))
}

function replaceProjectsInStore(entries = []) {
  customProjects.value = normalizeProjectsFromApi(entries)
  projectsHydrated.value = true
  return customProjects.value
}

async function requestProjectsListFromApi() {
  try {
    const payload = await requestProjectsApi('/api/projects')
    return extractProjectsPayload(payload)
  }
  catch (error) {
    if (cleanText(error?.message) !== invalidProjectsListMessage) {
      throw error
    }

    const retryPayload = await requestProjectsApi('/api/projects')
    return extractProjectsPayload(retryPayload)
  }
}

function upsertProjectInStore(project, originalId = '') {
  customProjects.value = sortProjects([
    ...customProjects.value.filter((entry) => entry.id !== originalId && entry.id !== project.id),
    project,
  ])
  projectsHydrated.value = true
  return project
}

async function loadProjectsFromApi({ force = false } = {}) {
  if (hydratePromise && !force) {
    return hydratePromise
  }

  projectStoragePending.value = true
  projectStorageMode.value = 'prisma'

  hydratePromise = requestProjectsListFromApi()
    .then((entries) => {
      projectStorageError.value = ''
      return replaceProjectsInStore(entries)
    })
    .catch((error) => {
      projectsHydrated.value = true
      projectStorageError.value = buildApiErrorMessage(error)
      throw error
    })
    .finally(() => {
      projectStoragePending.value = false
      hydratePromise = null
    })

  return hydratePromise
}

async function ensureProjectsLoaded() {
  if (projectsHydrated.value) {
    return customProjects.value
  }

  return loadProjectsFromApi()
}

export function hydrateProjectsStore() {
  if (typeof window === 'undefined' || projectsHydrated.value || hydratePromise) {
    return
  }

  void loadProjectsFromApi().catch(() => {})
}

export const projects = computed(() => {
  hydrateProjectsStore()
  return sortProjects([...baseProjects, ...customProjects.value])
})

export function findProjectById(id) {
  hydrateProjectsStore()
  return projects.value.find((project) => project.id === id) ?? null
}

export async function addCustomProject(input) {
  await ensureProjectsLoaded()

  const project = normalizeProjectCollection([input], {
    reservedIds: reservedProjectIds,
  })[0]

  if (projects.value.some((entry) => entry.id === project.id)) {
    throw new Error('Un projet utilise deja cet identifiant.')
  }

  projectStoragePending.value = true

  try {
    const payload = await requestProjectsApi('/api/projects', {
      method: 'POST',
      body: project,
    })

    projectStorageError.value = ''
    return upsertProjectInStore(extractProjectPayload(payload))
  }
  finally {
    projectStoragePending.value = false
  }
}

export async function updateCustomProject(originalId, input) {
  await ensureProjectsLoaded()

  const currentProject = customProjects.value.find((project) => project.id === originalId)

  if (!currentProject) {
    throw new Error('Impossible de retrouver ce projet personnalise.')
  }

  const nextProject = normalizeProjectCollection([
    {
      ...currentProject,
      ...input,
      createdAt: currentProject.createdAt,
    },
  ], {
    reservedIds: reservedProjectIds,
    allowReservedConflicts: true,
  })[0]

  const collidingProject = projects.value.find((project) => project.id === nextProject.id && project.id !== originalId)

  if (collidingProject) {
    throw new Error('Cet identifiant est deja utilise par un autre projet.')
  }

  projectStoragePending.value = true

  try {
    const payload = await requestProjectsApi(`/api/projects/${originalId}`, {
      method: 'PUT',
      body: nextProject,
    })

    projectStorageError.value = ''
    return upsertProjectInStore(extractProjectPayload(payload), originalId)
  }
  finally {
    projectStoragePending.value = false
  }
}

export async function removeCustomProject(id) {
  await ensureProjectsLoaded()

  projectStoragePending.value = true

  try {
    await requestProjectsApi(`/api/projects/${id}`, {
      method: 'DELETE',
    })

    customProjects.value = customProjects.value.filter((project) => project.id !== id)
    projectStorageError.value = ''
  }
  finally {
    projectStoragePending.value = false
  }
}

export function exportCustomProjects() {
  hydrateProjectsStore()
  return JSON.stringify(customProjects.value, null, 2)
}

export async function importCustomProjects(jsonValue) {
  await ensureProjectsLoaded()

  let parsed = null

  try {
    parsed = JSON.parse(jsonValue)
  }
  catch {
    throw new Error('Le fichier importe n est pas un JSON valide.')
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Le fichier importe doit contenir un tableau de projets.')
  }

  const normalizedProjects = normalizeProjectCollection(parsed, {
    reservedIds: reservedProjectIds,
  })

  projectStoragePending.value = true

  try {
    const payload = await requestProjectsApi('/api/projects/import', {
      method: 'POST',
      body: {
        projects: normalizedProjects,
      },
    })

    projectStorageError.value = ''
    return replaceProjectsInStore(extractProjectsPayload(payload))
  }
  finally {
    projectStoragePending.value = false
  }
}

export function useProjects() {
  hydrateProjectsStore()

  return {
    projects,
    customProjects: readonly(customProjects),
    projectsHydrated: readonly(projectsHydrated),
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