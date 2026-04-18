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

let hydratePromise = null

function buildApiErrorMessage(error, fallbackMessage = 'Prisma indisponible. Verifie que l API tourne bien.') {
  const message = cleanText(error?.message)
  return message || fallbackMessage
}

async function requestProjectsApi(path, { method = 'GET', body } = {}) {
  const response = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const contentType = response.headers.get('content-type') || ''
  let payload = null

  if (contentType.includes('application/json')) {
    payload = await response.json()
  }
  else {
    const text = await response.text()
    payload = text ? { error: text } : null
  }

  if (!response.ok) {
    throw new Error(cleanText(payload?.error) || 'La requete Prisma a echoue.')
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

  hydratePromise = requestProjectsApi('/api/projects')
    .then((payload) => {
      projectStorageError.value = ''
      return replaceProjectsInStore(payload?.projects || [])
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

  void loadProjectsFromApi()
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
    return upsertProjectInStore(normalizeProject(payload.project, payload.project))
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
    return upsertProjectInStore(normalizeProject(payload.project, payload.project), originalId)
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
    return replaceProjectsInStore(payload?.projects || normalizedProjects)
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