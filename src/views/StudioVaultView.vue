<script setup>
import { computed, ref } from 'vue'
import MagneticLink from '@/components/MagneticLink.vue'
import {
  buildGeneratedCaseStudyFromDraft,
  generateImageMetadataFromDraft,
} from '@/composables/useProjectBriefGenerator'
import { siteProfile } from '@/data/projects'
import {
  addCustomProject,
  createProjectSlug,
  exportCustomProjects,
  importCustomProjects,
  privateStudioPath,
  removeCustomProject,
  updateCustomProject,
  useProjects,
} from '@/composables/useProjects'

const SECTION_CONFIG = [
  { key: 'introduction', label: 'Introduction' },
  { key: 'problem', label: 'Probleme' },
  { key: 'solution', label: 'Solution' },
  { key: 'process', label: 'Process' },
  { key: 'technologies', label: 'Technologies utilisees' },
  { key: 'impact', label: 'Resultats / impact' },
  { key: 'conclusion', label: 'Conclusion' },
]

const CASE_STUDY_LABEL_MAP = {
  introduction: 'introduction',
  contexte: 'introduction',
  probleme: 'problem',
  problematique: 'problem',
  objectif: 'problem',
  solution: 'solution',
  approche: 'solution',
  process: 'process',
  processus: 'process',
  execution: 'process',
  technologies: 'technologies',
  impact: 'impact',
  resultats: 'impact',
  suite: 'conclusion',
  conclusion: 'conclusion',
}

const currentYear = new Date().getFullYear()

function cleanText(value = '') {
  return String(value ?? '').trim()
}

function splitLines(value = '') {
  return String(value ?? '')
    .split(/\r?\n/)
    .map((entry) => cleanText(entry))
    .filter(Boolean)
}

function toMultiline(value = []) {
  return Array.isArray(value) ? value.join('\n') : ''
}

function createEmptySections() {
  return Object.fromEntries(SECTION_CONFIG.map((entry) => [entry.key, '']))
}

function createEmptyDraft() {
  return {
    brief: '',
    title: '',
    id: '',
    shortDescription: '',
    fullDescription: '',
    statement: '',
    year: String(new Date().getFullYear()),
    role: '',
    accent: '#d7ff76',
    link: '',
    category: '',
    estimatedDuration: '',
    difficulty: '',
    tags: '',
    tech: '',
    results: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    sections: createEmptySections(),
    images: [],
    imageDetails: [],
    metrics: [],
  }
}

function metricsFromResults(results = []) {
  return results.slice(0, 3).map((label, index) => ({
    value: String(index + 1).padStart(2, '0'),
    label,
  }))
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error(`Impossible de lire ${file.name}.`))
    reader.readAsDataURL(file)
  })
}

function resolveStudioApiUrl(path) {
  if (typeof window === 'undefined' || !import.meta.env.DEV || !path.startsWith('/')) {
    return path
  }

  return `${window.location.protocol}//${window.location.hostname}:3001${path}`
}

async function requestStudioApi(path, { method = 'GET', body } = {}) {
  const response = await fetch(resolveStudioApiUrl(path), {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : { error: await response.text() }

  if (!response.ok) {
    throw new Error(cleanText(payload?.error) || 'La requete de generation a echoue.')
  }

  return payload
}

function syncImageDetailsWithDraft(value) {
  const nextImageDetails = generateImageMetadataFromDraft(
    value.imageDetails.length ? value.imageDetails : value.images,
    {
      title: value.title || 'Projet portfolio',
      category: value.category || 'Projet digital',
    },
  )

  return {
    ...value,
    imageDetails: nextImageDetails,
    images: nextImageDetails.map((entry) => entry.url),
  }
}

function extractSectionTexts(caseStudy) {
  const sections = createEmptySections()
  const entries = Array.isArray(caseStudy?.sections) ? caseStudy.sections : []

  entries.forEach((entry, index) => {
    const labelKey = cleanText(entry?.label).toLowerCase()
    const sectionKey = CASE_STUDY_LABEL_MAP[labelKey] || SECTION_CONFIG[index]?.key

    if (!sectionKey) {
      return
    }

    const paragraphs = [
      ...(Array.isArray(entry?.paragraphs) ? entry.paragraphs : []),
      ...(Array.isArray(entry?.solutionIntro) ? entry.solutionIntro : []),
    ]

    sections[sectionKey] = paragraphs.map((paragraph) => cleanText(paragraph)).filter(Boolean).join('\n\n')
  })

  return sections
}

function draftFromProject(project) {
  const nextDraft = {
    brief: project.brief || '',
    title: project.title,
    id: project.id,
    shortDescription: project.shortDescription || project.description || '',
    fullDescription: project.fullDescription || '',
    statement: project.statement || '',
    year: project.year || String(new Date().getFullYear()),
    role: project.role || '',
    accent: project.accent || '#d7ff76',
    link: project.link || '',
    category: project.category || '',
    estimatedDuration: project.estimatedDuration || '',
    difficulty: project.difficulty || '',
    tags: toMultiline(project.tags),
    tech: toMultiline(project.tech),
    results: toMultiline(project.results),
    metaTitle: project.metaTitle || '',
    metaDescription: project.metaDescription || '',
    keywords: toMultiline(project.keywords),
    sections: extractSectionTexts(project.caseStudy),
    images: [...project.images],
    imageDetails: Array.isArray(project.imageDetails) ? [...project.imageDetails] : [],
    metrics: Array.isArray(project.metrics) ? [...project.metrics] : [],
  }

  return syncImageDetailsWithDraft(nextDraft)
}

const { customProjects } = useProjects()

const draft = ref(createEmptyDraft())
const imageUrl = ref('')
const editingProjectId = ref('')
const feedback = ref({ type: '', text: '' })
const generationPending = ref(false)
const savePending = ref(false)
const sectionPendingKey = ref('')
const generationProvider = ref('')
const generationIteration = ref(0)
const sectionIterations = ref({})

const isEditing = computed(() => Boolean(editingProjectId.value))
const suggestedSlug = computed(() => createProjectSlug(draft.value.id || draft.value.title))
const hasPreview = computed(() => {
  return Boolean(
    cleanText(draft.value.title)
    || cleanText(draft.value.shortDescription)
    || Object.values(draft.value.sections).some((entry) => cleanText(entry))
    || draft.value.images.length,
  )
})
const previewSections = computed(() => SECTION_CONFIG.map((entry) => ({
  ...entry,
  value: draft.value.sections[entry.key],
})))

function showFeedback(type, text) {
  feedback.value = { type, text }
}

function resetComposer() {
  draft.value = createEmptyDraft()
  imageUrl.value = ''
  editingProjectId.value = ''
  generationProvider.value = ''
  generationIteration.value = 0
  sectionIterations.value = {}
  showFeedback('', '')
}

function applyGeneratedDraft(nextDraft, { preserveId = false } = {}) {
  const currentId = draft.value.id
  const mergedDraft = {
    ...createEmptyDraft(),
    ...draft.value,
    ...nextDraft,
    id: preserveId && currentId ? currentId : cleanText(nextDraft.id || nextDraft.slug || draft.value.id),
    shortDescription: cleanText(nextDraft.shortDescription || nextDraft.description || draft.value.shortDescription),
    sections: {
      ...createEmptySections(),
      ...draft.value.sections,
      ...(nextDraft.sections || {}),
    },
    tags: Array.isArray(nextDraft.tags) ? toMultiline(nextDraft.tags) : cleanText(nextDraft.tags || draft.value.tags),
    tech: Array.isArray(nextDraft.tech) ? toMultiline(nextDraft.tech) : cleanText(nextDraft.tech || draft.value.tech),
    results: Array.isArray(nextDraft.results) ? toMultiline(nextDraft.results) : cleanText(nextDraft.results || draft.value.results),
    keywords: Array.isArray(nextDraft.keywords) ? toMultiline(nextDraft.keywords) : cleanText(nextDraft.keywords || draft.value.keywords),
    imageDetails: Array.isArray(nextDraft.imageDetails) ? [...nextDraft.imageDetails] : [...draft.value.imageDetails],
    images: Array.isArray(nextDraft.images) ? [...nextDraft.images] : [...draft.value.images],
    metrics: Array.isArray(nextDraft.metrics) ? [...nextDraft.metrics] : [...draft.value.metrics],
  }

  draft.value = syncImageDetailsWithDraft(mergedDraft)
}

function sectionLabel(key) {
  return SECTION_CONFIG.find((entry) => entry.key === key)?.label || key
}

function buildDraftPayload({ includeCaseStudy = true } = {}) {
  const tags = splitLines(draft.value.tags)
  const tech = splitLines(draft.value.tech)
  const results = splitLines(draft.value.results)
  const keywords = splitLines(draft.value.keywords)
  const imageDetails = draft.value.imageDetails
    .map((entry) => ({
      url: cleanText(entry.url),
      alt: cleanText(entry.alt),
      caption: cleanText(entry.caption),
    }))
    .filter((entry) => entry.url)

  const payload = {
    brief: cleanText(draft.value.brief),
    title: cleanText(draft.value.title),
    id: cleanText(draft.value.id) || suggestedSlug.value,
    shortDescription: cleanText(draft.value.shortDescription),
    description: cleanText(draft.value.shortDescription),
    fullDescription: cleanText(draft.value.fullDescription),
    statement: cleanText(draft.value.statement),
    year: cleanText(draft.value.year) || String(new Date().getFullYear()),
    role: cleanText(draft.value.role),
    accent: cleanText(draft.value.accent),
    link: cleanText(draft.value.link),
    category: cleanText(draft.value.category),
    estimatedDuration: cleanText(draft.value.estimatedDuration),
    difficulty: cleanText(draft.value.difficulty),
    tags,
    tech,
    results,
    metrics: draft.value.metrics.length ? draft.value.metrics : metricsFromResults(results),
    metaTitle: cleanText(draft.value.metaTitle),
    metaDescription: cleanText(draft.value.metaDescription),
    keywords,
    images: imageDetails.map((entry) => entry.url),
    imageDetails,
    sections: Object.fromEntries(
      SECTION_CONFIG.map((entry) => [entry.key, cleanText(draft.value.sections[entry.key])]),
    ),
  }

  return includeCaseStudy
    ? {
        ...payload,
        caseStudy: buildGeneratedCaseStudyFromDraft(payload),
      }
    : payload
}

async function generateProject(regenerate = false) {
  const brief = cleanText(draft.value.brief)

  if (!brief) {
    showFeedback('error', 'Renseigne d abord le champ projectBrief.')
    return
  }

  generationPending.value = true

  try {
    const variant = regenerate ? generationIteration.value + 1 : generationIteration.value
    const payload = await requestStudioApi('/api/project-drafts/generate', {
      method: 'POST',
      body: {
        brief,
        images: draft.value.imageDetails,
        variant,
      },
    })

    generationIteration.value = variant
    generationProvider.value = payload.provider || 'fallback'
    applyGeneratedDraft(payload.draft, { preserveId: isEditing.value })

    if (payload.warning) {
      showFeedback('info', `Generation terminee (${payload.provider === 'openai' ? 'GPT' : 'secours local'}). ${payload.warning}`)
      return
    }

    showFeedback('success', `Generation terminee via ${payload.provider === 'openai' ? 'GPT' : 'le generateur local'}.`)
  }
  catch (error) {
    showFeedback('error', error instanceof Error ? error.message : 'Impossible de generer ce projet.')
  }
  finally {
    generationPending.value = false
  }
}

async function improveSection(sectionKey) {
  sectionPendingKey.value = sectionKey

  try {
    const variant = Number(sectionIterations.value[sectionKey] || 0) + 1
    const payload = await requestStudioApi('/api/project-drafts/improve-section', {
      method: 'POST',
      body: {
        sectionKey,
        draft: buildDraftPayload({ includeCaseStudy: false }),
        variant,
      },
    })

    draft.value.sections[sectionKey] = cleanText(payload.text) || draft.value.sections[sectionKey]
    sectionIterations.value = {
      ...sectionIterations.value,
      [sectionKey]: variant,
    }

    if (payload.warning) {
      showFeedback('info', `Section ${sectionLabel(sectionKey)} amelioree en secours local. ${payload.warning}`)
      return
    }

    showFeedback('success', `Section ${sectionLabel(sectionKey)} amelioree via ${payload.provider === 'openai' ? 'GPT' : 'le generateur local'}.`)
  }
  catch (error) {
    showFeedback('error', error instanceof Error ? error.message : 'Impossible d ameliorer cette section.')
  }
  finally {
    sectionPendingKey.value = ''
  }
}

function addImageFromUrl() {
  const value = imageUrl.value.trim()

  if (!value) {
    return
  }

  draft.value.imageDetails = [
    ...draft.value.imageDetails,
    {
      url: value,
      alt: '',
      caption: '',
    },
  ]
  draft.value = syncImageDetailsWithDraft({ ...draft.value })
  imageUrl.value = ''
}

async function handleImageUpload(event) {
  const files = Array.from(event.target.files || [])

  if (!files.length) {
    return
  }

  try {
    const encodedFiles = await Promise.all(files.map((file) => readFileAsDataUrl(file)))

    draft.value.imageDetails = [
      ...draft.value.imageDetails,
      ...encodedFiles.map((url) => ({
        url,
        alt: '',
        caption: '',
      })),
    ]

    draft.value = syncImageDetailsWithDraft({ ...draft.value })
    showFeedback('info', `${encodedFiles.length} image(s) ajoutee(s). Tu peux relancer Generate Project pour raffiner les captions.`)
  }
  catch (error) {
    showFeedback('error', error instanceof Error ? error.message : 'Impossible d importer ces images.')
  }
  finally {
    event.target.value = ''
  }
}

function moveImage(index, direction) {
  const nextIndex = index + direction

  if (nextIndex < 0 || nextIndex >= draft.value.imageDetails.length) {
    return
  }

  const imageDetails = [...draft.value.imageDetails]
  const [entry] = imageDetails.splice(index, 1)
  imageDetails.splice(nextIndex, 0, entry)
  draft.value = syncImageDetailsWithDraft({
    ...draft.value,
    imageDetails,
  })
}

function removeImage(index) {
  draft.value = syncImageDetailsWithDraft({
    ...draft.value,
    imageDetails: draft.value.imageDetails.filter((_, entryIndex) => entryIndex !== index),
  })
}

function updateImageDetail(index, key, value) {
  draft.value.imageDetails = draft.value.imageDetails.map((entry, entryIndex) => {
    if (entryIndex !== index) {
      return entry
    }

    return {
      ...entry,
      [key]: value,
    }
  })
}

function editProject(project) {
  draft.value = draftFromProject(project)
  editingProjectId.value = project.id
  imageUrl.value = ''
  generationProvider.value = 'saved'
  showFeedback('info', `Edition de ${project.title}.`)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function submitForm() {
  if (!hasPreview.value) {
    showFeedback('error', 'Genere d abord un projet ou saisis un contenu a sauvegarder.')
    return
  }

  savePending.value = true

  try {
    const payload = buildDraftPayload()
    const project = isEditing.value
      ? await updateCustomProject(editingProjectId.value, payload)
      : await addCustomProject(payload)

    resetComposer()
    showFeedback('success', `Projet enregistre. Il est maintenant visible sur /project/${project.id}.`)
  }
  catch (error) {
    showFeedback('error', error instanceof Error ? error.message : 'Impossible d enregistrer le projet.')
  }
  finally {
    savePending.value = false
  }
}

async function deleteProject(project) {
  const confirmed = window.confirm(`Supprimer ${project.title} ?`)

  if (!confirmed) {
    return
  }

  try {
    await removeCustomProject(project.id)

    if (editingProjectId.value === project.id) {
      resetComposer()
    }

    showFeedback('success', `${project.title} a ete supprime.`)
  }
  catch (error) {
    showFeedback('error', error instanceof Error ? error.message : 'Suppression impossible.')
  }
}

async function copyPrivateLink() {
  try {
    await navigator.clipboard.writeText(`${window.location.origin}${privateStudioPath}`)
    showFeedback('success', 'Lien prive copie dans le presse-papiers.')
  }
  catch {
    showFeedback('error', 'Impossible de copier automatiquement le lien prive.')
  }
}

function downloadBackup() {
  const json = exportCustomProjects()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = 'mohamedali-custom-projects.json'
  anchor.click()

  URL.revokeObjectURL(url)
  showFeedback('success', 'Export JSON telecharge.')
}

async function handleImport(event) {
  const file = event.target.files?.[0]

  if (!file) {
    return
  }

  try {
    const json = await file.text()
    const importedProjects = await importCustomProjects(json)
    showFeedback('success', `${importedProjects.length} projet(s) personnalise(s) importe(s).`)
  }
  catch (error) {
    showFeedback('error', error instanceof Error ? error.message : 'Import impossible.')
  }
  finally {
    event.target.value = ''
  }
}
</script>

<template>
  <main class="page page--studio">
    <section class="studio-hero page-block" data-page-intro>
      <div class="section-heading">
        <p class="section-tag">Acces prive</p>
        <div>
          <h1>Un brief court, puis une case study complete generee automatiquement.</h1>
          <p>
            Ce studio prive transforme maintenant un simple projectBrief en projet complet: contenu long, sections detaillees,
            stack detectee, SEO, metadata image et page detail prete a etre publiee puis ajustee a la main.
          </p>
        </div>
      </div>

      <div class="studio-toolbar">
        <button class="button button--primary" type="button" @click="copyPrivateLink">
          Copier le lien prive
        </button>
        <button class="button button--secondary" type="button" @click="downloadBackup">
          Exporter mes projets
        </button>
        <label class="button button--ghost studio-upload">
          Importer un JSON
          <input type="file" accept="application/json" @change="handleImport" />
        </label>
      </div>
    </section>

    <section class="studio-grid page-block">
      <div class="studio-panel" data-page-intro>
        <div class="studio-panel__heading">
          <p class="section-tag">Generation AI</p>
          <div>
            <h2>{{ isEditing ? 'Modifier un projet genere' : 'Generer un nouveau projet' }}</h2>
            <p>
              L interface commence volontairement par un seul champ. Tu donnes le contexte, le type de projet, les technos,
              l intention, le style et l objectif. GPT genere ensuite une version complete, structuree et editable.
            </p>
          </div>
        </div>

        <p v-if="feedback.text" class="studio-feedback" :class="`is-${feedback.type}`">
          {{ feedback.text }}
        </p>

        <div class="studio-generator">
          <label class="studio-field studio-field--full">
            <span>projectBrief</span>
            <textarea
              v-model.trim="draft.brief"
              rows="6"
              placeholder="Describe the project briefly (type of project, technologies, purpose, style, etc.)"
            ></textarea>
            <small>
              Exemple: landing SaaS premium, Vue 3 + GSAP, objectif de clarification de l offre, ton editorial, conversion plus nette.
            </small>
          </label>

          <div class="studio-generator__actions">
            <button class="button button--primary" type="button" :disabled="generationPending" @click="generateProject(false)">
              {{ generationPending ? 'Generation GPT en cours...' : 'Generate Project' }}
            </button>
            <button v-if="hasPreview" class="button button--secondary" type="button" :disabled="generationPending" @click="generateProject(true)">
              Regenerate
            </button>
            <button v-if="isEditing || hasPreview" class="button button--ghost" type="button" @click="resetComposer">
              {{ isEditing ? 'Quitter l edition' : 'Reinitialiser' }}
            </button>
          </div>
        </div>

        <div class="studio-panel__heading studio-panel__heading--nested">
          <div>
            <h3>Images du projet</h3>
            <p>Upload manuel conserve. Les alt texts et captions sont ensuite proposes automatiquement puis restent editables.</p>
          </div>
        </div>

        <div class="studio-images__toolbar">
          <input v-model.trim="imageUrl" type="url" class="studio-images__url" placeholder="Coller l URL d une image" />
          <button class="button button--secondary" type="button" @click="addImageFromUrl">
            Ajouter l URL
          </button>
          <label class="button button--ghost studio-upload">
            Importer des fichiers
            <input type="file" accept="image/*" multiple @change="handleImageUpload" />
          </label>
        </div>

        <div v-if="draft.imageDetails.length" class="studio-image-list">
          <article v-for="(image, index) in draft.imageDetails" :key="`${index}-${image.url.slice(0, 24)}`" class="studio-image-card">
            <div class="studio-image-card__preview">
              <img :src="image.url" :alt="image.alt || `Image ${index + 1}`" />
            </div>

            <div class="studio-image-card__body">
              <span>Image {{ String(index + 1).padStart(2, '0') }}</span>
              <div class="studio-image-card__fields">
                <label class="studio-field studio-field--full">
                  <span>Alt text SEO</span>
                  <input :value="image.alt" type="text" @input="updateImageDetail(index, 'alt', $event.target.value)" />
                </label>
                <label class="studio-field studio-field--full">
                  <span>Caption</span>
                  <textarea :value="image.caption" rows="3" @input="updateImageDetail(index, 'caption', $event.target.value)"></textarea>
                </label>
              </div>
              <div class="studio-image-card__actions">
                <button type="button" class="button button--ghost" @click="moveImage(index, -1)">Monter</button>
                <button type="button" class="button button--ghost" @click="moveImage(index, 1)">Descendre</button>
                <button type="button" class="button button--secondary" @click="removeImage(index)">Retirer</button>
              </div>
            </div>
          </article>
        </div>

        <p v-else class="studio-empty">
          Aucune image pour l instant. Tu peux generer le texte sans image, puis en ajouter pour enrichir les captions et le SEO visuel.
        </p>

        <form v-if="hasPreview" class="studio-form studio-preview" @submit.prevent="submitForm">
          <div class="studio-panel__heading studio-panel__heading--nested">
            <div>
              <h3>Preview editable</h3>
              <p>
                Tous les champs generes restent modifiables: resume court, recit long, sections, metadata SEO, taxonomy et niveau de difficulte.
              </p>
            </div>
          </div>

          <div class="studio-form__grid">
            <label class="studio-field">
              <span>Titre</span>
              <input v-model.trim="draft.title" type="text" placeholder="Titre du projet" required />
            </label>

            <label class="studio-field">
              <span>Slug</span>
              <input v-model.trim="draft.id" type="text" placeholder="laisse vide pour le regenerer" />
              <small>Route generee : /project/{{ suggestedSlug || 'nouveau-projet' }}</small>
            </label>

            <label class="studio-field">
              <span>Categorie</span>
              <input v-model.trim="draft.category" type="text" placeholder="SaaS, E-commerce, Portfolio..." />
            </label>

            <label class="studio-field">
              <span>Annee</span>
              <input v-model.trim="draft.year" type="text" placeholder="2026" />
            </label>

            <label class="studio-field">
              <span>Role</span>
              <input v-model.trim="draft.role" type="text" placeholder="Direction creative / Frontend motion" />
            </label>

            <label class="studio-field">
              <span>Couleur accent</span>
              <div class="studio-color-field">
                <input v-model="draft.accent" type="color" />
                <input v-model.trim="draft.accent" type="text" placeholder="#d7ff76" />
              </div>
            </label>

            <label class="studio-field">
              <span>Duree estimee</span>
              <input v-model.trim="draft.estimatedDuration" type="text" placeholder="4 a 6 semaines" />
            </label>

            <label class="studio-field">
              <span>Niveau de difficulte</span>
              <input v-model.trim="draft.difficulty" type="text" placeholder="Avance" />
            </label>

            <label class="studio-field studio-field--full">
              <span>Lien live</span>
              <input v-model.trim="draft.link" type="url" placeholder="https://..." />
            </label>

            <label class="studio-field studio-field--full">
              <span>Short description</span>
              <textarea v-model.trim="draft.shortDescription" rows="4" placeholder="Resume court pour les cartes et le hero"></textarea>
            </label>

            <label class="studio-field studio-field--full">
              <span>Statement</span>
              <textarea v-model.trim="draft.statement" rows="3" placeholder="Accroche hero de la page projet"></textarea>
            </label>

            <label class="studio-field studio-field--full">
              <span>Full description</span>
              <textarea v-model.trim="draft.fullDescription" rows="8" placeholder="Recit long du projet"></textarea>
            </label>

            <label class="studio-field studio-field--full">
              <span>Tags</span>
              <textarea v-model.trim="draft.tags" rows="4" placeholder="Un tag par ligne"></textarea>
            </label>

            <label class="studio-field studio-field--full">
              <span>Tech stack</span>
              <textarea v-model.trim="draft.tech" rows="4" placeholder="Une technologie par ligne"></textarea>
            </label>

            <label class="studio-field studio-field--full">
              <span>Results / impact</span>
              <textarea v-model.trim="draft.results" rows="4" placeholder="Un resultat par ligne"></textarea>
            </label>

            <label class="studio-field studio-field--full">
              <span>Meta title</span>
              <input v-model.trim="draft.metaTitle" type="text" placeholder="Meta title SEO" />
            </label>

            <label class="studio-field studio-field--full">
              <span>Meta description</span>
              <textarea v-model.trim="draft.metaDescription" rows="4" placeholder="Meta description SEO"></textarea>
            </label>

            <label class="studio-field studio-field--full">
              <span>Keywords</span>
              <textarea v-model.trim="draft.keywords" rows="4" placeholder="Un mot-cle par ligne"></textarea>
            </label>
          </div>

          <div class="studio-preview__sections">
            <article v-for="section in previewSections" :key="section.key" class="studio-preview__section">
              <div class="studio-section-field__header">
                <div>
                  <p class="section-tag">Section</p>
                  <h3>{{ section.label }}</h3>
                </div>

                <button
                  class="button button--ghost"
                  type="button"
                  :disabled="sectionPendingKey === section.key"
                  @click="improveSection(section.key)"
                >
                  {{ sectionPendingKey === section.key ? 'Improvement...' : 'Improve text' }}
                </button>
              </div>

              <label class="studio-field studio-field--full">
                <span>{{ section.label }}</span>
                <textarea v-model.trim="draft.sections[section.key]" rows="8" :placeholder="`Contenu ${section.label.toLowerCase()}`"></textarea>
              </label>
            </article>
          </div>

          <div class="studio-form__actions">
            <button class="button button--primary" type="submit" :disabled="savePending">
              {{ savePending ? 'Enregistrement...' : (isEditing ? 'Mettre a jour le projet' : 'Enregistrer le projet') }}
            </button>
            <button class="button button--ghost" type="button" @click="generateProject(true)">
              Regenerate
            </button>
          </div>
        </form>
      </div>

      <aside class="studio-panel studio-panel--sidebar" data-page-intro>
        <div class="studio-panel__heading">
          <h2>Projets personnalises</h2>
          <p>{{ generationProvider === 'openai' ? 'Generation GPT active.' : 'Fallback local actif si la cle OpenAI est absente.' }}</p>
        </div>

        <div v-if="customProjects.length" class="studio-project-list">
          <article v-for="project in customProjects" :key="project.id" class="studio-project-item">
            <div class="studio-project-item__copy">
              <span>{{ project.year }} · {{ project.category || 'Projet digital' }}</span>
              <h3>{{ project.title }}</h3>
              <p>{{ project.shortDescription || project.description }}</p>
              <small>/project/{{ project.id }}</small>
            </div>

            <div class="studio-project-item__actions">
              <MagneticLink class="button button--ghost" :to="`/project/${project.id}`" cursor="Ouvrir">
                Voir la page
              </MagneticLink>
              <button class="button button--secondary" type="button" @click="editProject(project)">
                Modifier
              </button>
              <button class="button button--ghost" type="button" @click="deleteProject(project)">
                Supprimer
              </button>
            </div>
          </article>
        </div>

        <p v-else class="studio-empty">
          Quand tu ajoutes ton premier projet ici, il apparaitra automatiquement sur la page d accueil et dans son URL detail.
        </p>

        <div class="studio-sidebar__footer">
          <p class="studio-sidebar__eyebrow">Studio prive</p>
          <strong>{{ siteProfile.name }}</strong>
          <p>{{ siteProfile.role }} · {{ siteProfile.location }}</p>
          <a :href="`mailto:${siteProfile.contact.email}`">{{ siteProfile.contact.email }}</a>
          <span>© {{ currentYear }} Mohamed Ali</span>
        </div>
      </aside>
    </section>
  </main>
</template>