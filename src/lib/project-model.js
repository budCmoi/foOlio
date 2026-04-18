export function cleanText(value = '') {
  return String(value ?? '').trim()
}

export function normalizeAccent(value) {
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

export function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => cleanText(entry)).filter(Boolean)
  }

  return cleanText(value)
    .split(/\r?\n|,/) 
    .map((entry) => cleanText(entry))
    .filter(Boolean)
}

export function normalizeImages(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => cleanText(entry)).filter(Boolean)
  }

  return cleanText(value)
    .split(/\r?\n/)
    .map((entry) => cleanText(entry))
    .filter(Boolean)
}

export function sortProjects(entries) {
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

export function normalizeProject(input, fallback = {}) {
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

export function normalizeProjectCollection(
  entries,
  { reservedIds = [], allowReservedConflicts = false } = {},
) {
  const blockedIds = new Set(reservedIds.map((entry) => createProjectSlug(entry)).filter(Boolean))
  const seenIds = new Set()
  const normalizedProjects = []

  entries.forEach((entry) => {
    const project = normalizeProject(entry, entry)

    if (seenIds.has(project.id)) {
      throw new Error(`L'identifiant ${project.id} est en double dans l'import.`)
    }

    if (!allowReservedConflicts && blockedIds.has(project.id)) {
      throw new Error(`L'identifiant ${project.id} existe deja dans les projets publics.`)
    }

    seenIds.add(project.id)
    normalizedProjects.push(project)
  })

  return sortProjects(normalizedProjects)
}

export function parseJsonList(value) {
  try {
    const parsed = JSON.parse(cleanText(value) || '[]')
    return Array.isArray(parsed)
      ? parsed.map((entry) => cleanText(entry)).filter(Boolean)
      : []
  }
  catch {
    return []
  }
}