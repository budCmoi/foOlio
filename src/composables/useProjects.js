import { computed, readonly, ref } from 'vue'
import { baseProjects } from '@/data/projects'

export const privateStudioPath = '/atelier-prive-93f6c1'

const STORAGE_KEY = 'foolio.custom-projects.v1'
const customProjects = ref([])

let hydrated = false

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

function persistCustomProjects() {
  if (typeof window === 'undefined') {
    return
  }

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

export function hydrateProjectsStore() {
  if (hydrated || typeof window === 'undefined') {
    return
  }

  hydrated = true

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY)

    if (!rawValue) {
      return
    }

    const parsed = JSON.parse(rawValue)

    if (!Array.isArray(parsed)) {
      customProjects.value = []
      return
    }

    customProjects.value = normalizeProjectCollection(parsed)
  }
  catch {
    customProjects.value = []
  }
}

export const projects = computed(() => {
  hydrateProjectsStore()
  return sortProjects([...baseProjects, ...customProjects.value])
})

export function findProjectById(id) {
  hydrateProjectsStore()
  return projects.value.find((project) => project.id === id) ?? null
}

export function addCustomProject(input) {
  hydrateProjectsStore()

  const project = normalizeProject(input)

  if (findProjectById(project.id)) {
    throw new Error('Un projet utilise deja cet identifiant.')
  }

  customProjects.value = sortProjects([project, ...customProjects.value])
  persistCustomProjects()

  return project
}

export function updateCustomProject(originalId, input) {
  hydrateProjectsStore()

  const currentProject = customProjects.value.find((project) => project.id === originalId)

  if (!currentProject) {
    throw new Error('Impossible de retrouver ce projet personnalise.')
  }

  const nextProject = normalizeProject(
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

  customProjects.value = sortProjects(
    customProjects.value.map((project) => (project.id === originalId ? nextProject : project)),
  )

  persistCustomProjects()

  return nextProject
}

export function removeCustomProject(id) {
  hydrateProjectsStore()
  customProjects.value = customProjects.value.filter((project) => project.id !== id)
  persistCustomProjects()
}

export function exportCustomProjects() {
  hydrateProjectsStore()
  return JSON.stringify(customProjects.value, null, 2)
}

export function importCustomProjects(jsonValue) {
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

  customProjects.value = normalizeProjectCollection(parsed)
  persistCustomProjects()

  return customProjects.value
}

export function useProjects() {
  hydrateProjectsStore()

  return {
    projects,
    customProjects: readonly(customProjects),
    addCustomProject,
    updateCustomProject,
    removeCustomProject,
    exportCustomProjects,
    importCustomProjects,
  }
}