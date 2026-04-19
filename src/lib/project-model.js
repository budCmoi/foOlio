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

function hasStructuredContent(value) {
  if (Array.isArray(value)) {
    return value.length > 0
  }

  if (value && typeof value === 'object') {
    return Object.keys(value).length > 0
  }

  return value !== null && value !== undefined && value !== ''
}

function normalizeStructuredContent(value) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => normalizeStructuredContent(entry))
      .filter((entry) => hasStructuredContent(entry))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, entry]) => [key, normalizeStructuredContent(entry)])
        .filter(([, entry]) => hasStructuredContent(entry)),
    )
  }

  if (typeof value === 'string') {
    return cleanText(value)
  }

  return value
}

function ensureSentence(value, fallback = '') {
  const text = cleanText(value) || cleanText(fallback)

  if (!text) {
    return ''
  }

  return /[.!?]$/.test(text) ? text : `${text}.`
}

function firstSentence(value = '') {
  const text = cleanText(value)

  if (!text) {
    return ''
  }

  const match = text.match(/.+?[.!?](?:\s|$)/)
  return cleanText(match ? match[0] : text)
}

function uniqueEntries(values = []) {
  return [...new Set(values.map((entry) => cleanText(entry)).filter(Boolean))]
}

function normalizeMetrics(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((entry, index) => {
      if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
        const nextEntry = {
          value: cleanText(entry.value) || String(index + 1).padStart(2, '0'),
          label: cleanText(entry.label),
        }

        return nextEntry.value && nextEntry.label ? nextEntry : null
      }

      const label = cleanText(entry)
      return label
        ? { value: String(index + 1).padStart(2, '0'), label }
        : null
    })
    .filter(Boolean)
}

function normalizeKeywords(value) {
  return uniqueEntries(normalizeList(value)).slice(0, 12)
}

function normalizeImageDetails(value, images = [], title = '') {
  const inputEntries = Array.isArray(value) ? value : []
  const normalizedEntries = inputEntries
    .map((entry) => {
      if (typeof entry === 'string') {
        return {
          url: cleanText(entry),
          alt: '',
          caption: '',
        }
      }

      if (entry && typeof entry === 'object') {
        return {
          url: cleanText(entry.url || entry.image),
          alt: cleanText(entry.alt),
          caption: cleanText(entry.caption),
        }
      }

      return null
    })
    .filter((entry) => entry?.url)

  return images.map((image, index) => {
    const matchedEntry = normalizedEntries.find((entry) => entry.url === image) || normalizedEntries[index] || null

    return {
      url: image,
      alt: cleanText(matchedEntry?.alt) || `${title} visuel ${index + 1}`,
      caption: cleanText(matchedEntry?.caption) || `Vue ${String(index + 1).padStart(2, '0')} du projet ${title}.`,
    }
  })
}

function createGeneratedStatement(title, brief, description) {
  const source = firstSentence(brief) || firstSentence(description)

  if (source) {
    return source
  }

  return `Une etude de cas construite pour expliquer clairement ${title.toLowerCase()}.`
}

function createGeneratedResults({ title, brief, tech }) {
  return uniqueEntries([
    cleanText(firstSentence(brief)).replace(/[.!?]$/, ''),
    tech.length ? `Mise en oeuvre avec ${tech.slice(0, 2).join(' et ')}` : '',
    `Structure de page prete a evoluer pour ${title}`,
  ]).slice(0, 3)
}

function createGeneratedMetrics(project) {
  if (project.metrics.length) {
    return project.metrics.slice(0, 3)
  }

  return project.results.slice(0, 3).map((label, index) => ({
    value: String(index + 1).padStart(2, '0'),
    label,
  }))
}

function createGeneratedWorkstreams(project) {
  const techEntries = project.tech.length ? project.tech : ['Vue 3', 'Narration', 'Production']

  return techEntries.slice(0, 3).map((entry, index) => ({
    title: entry,
    body: `Ce chantier ${String(index + 1).padStart(2, '0')} s appuie sur ${entry} pour garder une lecture stable, une execution propre et une page qui tient dans la duree.`,
  }))
}

function createGeneratedInterventions(project) {
  return project.results.slice(0, 3).map((entry, index) => ({
    code: `AXE ${String(index + 1).padStart(2, '0')}`,
    title: entry,
    body: `Cet axe formalise une decision visible dans la page et rappelle ce que le projet devait rendre clair pour le lecteur final.`,
  }))
}

function createGeneratedLessons(project) {
  const sources = project.tech.length ? project.tech : project.results

  return sources.slice(0, 3).map((entry, index) => ({
    number: String(index + 1).padStart(2, '0'),
    title: entry,
    body: `La structure textuelle reste assez souple pour integrer ${entry} sans casser le rythme general de la case study.`,
  }))
}

function createGeneratedNext(project) {
  return project.results.slice(0, 3).map((entry, index) => ({
    number: String(index + 1).padStart(2, '0'),
    title: entry,
    body: `Ce point peut etre detaille ensuite avec plus de preuves, davantage de captures ou un niveau de precision supplementaire si le projet grandit.`,
  }))
}

function createGeneratedCaseStudy(project) {
  const client = cleanText(project.client) || project.title
  const brief = cleanText(project.brief) || cleanText(project.description) || cleanText(project.statement)
  const firstImage = project.imageDetails?.[0] || null
  const gallery = (project.imageDetails?.length
    ? project.imageDetails
    : project.images.slice(0, 2).map((image, index) => ({
        url: image,
        alt: `${client} visuel ${index + 1}`,
        caption: `Vue ${String(index + 1).padStart(2, '0')} du projet ${client}.`,
      })))
    .slice(0, 2)
    .map((entry) => ({
      image: entry.url,
      caption: entry.caption,
      alt: entry.alt,
    }))

  return {
    intro: {
      before: `${client} avait besoin d une page capable de raconter le projet de facon lisible, sans noyer l essentiel dans les effets.`,
      highlight: brief || project.statement,
      after: 'La structure ci-dessous detaille le contexte, l approche, l execution et les points d impact a retenir.',
    },
    sections: [
      {
        number: '01',
        label: 'Contexte',
        title: `Poser clairement le cadre de ${client}.`,
        paragraphs: [
          ensureSentence(project.description),
          `Le point de depart tenait en une intention simple : ${ensureSentence(project.statement)}`,
          'Le travail a ensuite ete organise pour garder une lecture nette, du cadrage initial jusqu aux elements de preuve.',
        ],
      },
      {
        number: '02',
        label: 'Objectif',
        title: 'Transformer un brief court en recit complet.',
        question: 'Comment faire comprendre la valeur du projet en quelques ecrans, tout en gardant assez de matiere pour une vraie etude de cas ?',
        paragraphs: [
          ensureSentence(brief || project.description),
          `Le role couvre ${project.role.toLowerCase()} et la mise en forme d un recit capable de tenir aussi bien sur desktop que sur mobile.`,
          'L objectif n est pas seulement de montrer le projet, mais d expliquer pourquoi les choix faits ici comptent vraiment.',
        ],
        callout: {
          eyebrow: 'Fil directeur',
          title: ensureSentence(project.statement),
          note: 'Quand un brief est saisi dans le studio, cette structure textuelle est regeneree automatiquement a partir du resume, des images et des champs deja connus du projet.',
        },
      },
      {
        number: '03',
        label: 'Approche',
        title: 'Une structure editoriale qui reste lisible dans le detail.',
        paragraphs: [
          `La base technique mobilisee ici s appuie sur ${project.tech.join(', ')}.`,
          'Chaque bloc a un role clair : poser le contexte, isoler les decisions, montrer les supports visuels et finir sur des points d impact directement exploitables.',
          'Cette logique permet de garder la page dense en contenu sans la rendre lourde a parcourir.',
        ],
        workstreams: createGeneratedWorkstreams(project),
        media: firstImage
          ? {
              eyebrow: 'Support visuel',
              image: firstImage.url,
              caption: cleanText(firstImage.caption) || `Le premier visuel sert de repere principal pour installer l univers de ${client}.`,
              alt: cleanText(firstImage.alt) || `Support visuel du projet ${client}`,
            }
          : undefined,
      },
      {
        number: '04',
        label: 'Execution',
        title: 'Ce qui structure concretement la page projet.',
        solutionIntro: [
          `La narration finale s appuie sur ${project.results.length} axes visibles, chacun pense pour faire avancer la lecture sans repetition inutile.`,
          'Le contenu long reste donc modulaire : il peut grandir, accueillir de nouvelles images et absorber des precisions sans casser la structure globale.',
        ],
        interventions: createGeneratedInterventions(project),
        solutionGallery: gallery,
      },
      {
        number: '05',
        label: 'Impact',
        title: 'Les points a retenir en sortie de lecture.',
        paragraphs: [
          'La page doit laisser une impression simple : le projet est compris, ses choix sont visibles et son execution parait maitrisee.',
          'Ces reperes servent de resume rapide pour un lecteur qui veut saisir l essentiel sans relire toute la case study.',
        ],
        metrics: createGeneratedMetrics(project),
      },
      {
        number: '06',
        label: 'Suite',
        title: 'Une base deja prete a evoluer.',
        paragraphs: [
          'Cette structure textuelle peut maintenant etre enrichie avec d autres preuves, davantage de sections ou de nouveaux visuels sans repartir de zero.',
          'La page reste donc utile autant pour publier vite un nouveau projet que pour densifier une etude de cas deja en ligne.',
        ],
        lessons: createGeneratedLessons(project),
        next: createGeneratedNext(project),
      },
    ],
  }
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
  const brief = cleanText(input.brief) || cleanText(fallback.brief)
  const shortDescription = cleanText(input.shortDescription) || cleanText(input.description) || cleanText(fallback.shortDescription) || cleanText(fallback.description) || brief || `Etude de cas autour de ${title}.`
  const description = shortDescription
  const fullDescription = cleanText(input.fullDescription) || cleanText(fallback.fullDescription) || [shortDescription, cleanText(input.statement), cleanText(fallback.statement)].filter(Boolean).join(' ')
  const statement = cleanText(input.statement) || createGeneratedStatement(title, brief, description)
  const role = cleanText(input.role) || cleanText(fallback.role) || 'Conception / Livraison'
  const images = normalizeImages(input.images ?? fallback.images)
  const tech = normalizeList(input.tech ?? fallback.tech)
  const resultsInput = normalizeList(input.results ?? fallback.results)
  const results = resultsInput.length
    ? resultsInput
    : createGeneratedResults({ title, brief, tech })
  const tagsInput = normalizeList(input.tags ?? fallback.tags)
  const tags = tagsInput.length ? tagsInput : uniqueEntries([tech[0], tech[1], results[0]]).slice(0, 4)
  const metricsInput = normalizeMetrics(input.metrics ?? fallback.metrics)
  const metrics = metricsInput.length ? metricsInput : createGeneratedMetrics({ metrics: [], results })
  const imageDetails = normalizeImageDetails(input.imageDetails ?? fallback.imageDetails, images, title)
  const metaTitle = cleanText(input.metaTitle) || cleanText(fallback.metaTitle) || `${title} | Etude de cas`
  const metaDescription = cleanText(input.metaDescription) || cleanText(fallback.metaDescription) || firstSentence(fullDescription || description)
  const keywords = normalizeKeywords(input.keywords ?? fallback.keywords)
  const category = cleanText(input.category) || cleanText(fallback.category) || cleanText(tags[0]) || 'Projet digital'
  const estimatedDuration = cleanText(input.estimatedDuration) || cleanText(fallback.estimatedDuration)
  const difficulty = cleanText(input.difficulty) || cleanText(fallback.difficulty)
  const explicitCaseStudy = normalizeStructuredContent(input.caseStudy ?? fallback.caseStudy)

  if (!title || !id) {
    throw new Error('Le projet doit avoir un titre et un identifiant.')
  }

  const normalizedProject = {
    id,
    title,
    client: cleanText(input.client) || cleanText(fallback.client) || title,
    brief,
    shortDescription,
    description,
    fullDescription,
    images,
    imageDetails,
    tech: tech.length ? tech : ['Vue 3'],
    tags,
    metrics,
    category,
    estimatedDuration,
    difficulty,
    link: cleanText(input.link),
    year: cleanText(input.year) || String(new Date().getFullYear()),
    role,
    accent: normalizeAccent(input.accent),
    statement,
    results,
    metaTitle,
    metaDescription,
    keywords,
    createdAt: cleanText(input.createdAt) || cleanText(fallback.createdAt) || new Date().toISOString(),
    isCustom: Boolean(input.isCustom ?? fallback.isCustom),
  }

  return {
    ...normalizedProject,
    caseStudy: hasStructuredContent(explicitCaseStudy)
      ? explicitCaseStudy
      : createGeneratedCaseStudy(normalizedProject),
  }
}

export function toProjectViewModel(input, fallback = {}) {
  return normalizeProject(
    {
      ...fallback,
      ...input,
      createdAt: cleanText(input?.createdAt) || cleanText(fallback?.createdAt) || '1970-01-01T00:00:00.000Z',
      isCustom: Boolean(input?.isCustom ?? fallback?.isCustom),
    },
    fallback,
  )
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

export function parseJsonValue(value, fallback = null) {
  try {
    const parsed = JSON.parse(cleanText(value) || 'null')
    return parsed ?? fallback
  }
  catch {
    return fallback
  }
}