import { cleanText, createProjectSlug } from '../src/lib/project-model.js'
import {
  buildGeneratedCaseStudyFromDraft,
  generateImageMetadataFromDraft,
  generateProjectDraftFromBrief,
  improveGeneratedSection,
} from '../src/composables/useProjectBriefGenerator.js'

const OPENAI_API_BASE = cleanText(process.env.OPENAI_API_BASE) || 'https://api.openai.com/v1'
const OPENAI_API_KEY = cleanText(process.env.OPENAI_API_KEY)
const OPENAI_MODEL = cleanText(process.env.OPENAI_MODEL) || 'gpt-4.1-mini'
const SECTION_KEYS = ['introduction', 'problem', 'solution', 'process', 'technologies', 'impact', 'conclusion']

function unique(values = []) {
  return [...new Set(values.map((entry) => cleanText(entry)).filter(Boolean))]
}

function splitTextList(value) {
  if (Array.isArray(value)) {
    return unique(value)
  }

  return unique(
    cleanText(value)
      .split(/\r?\n|,|;/)
      .map((entry) => cleanText(entry))
      .filter(Boolean),
  )
}

function normalizeImageUrls(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((entry) => {
      if (typeof entry === 'string') {
        return cleanText(entry)
      }

      if (entry && typeof entry === 'object') {
        return cleanText(entry.url || entry.image)
      }

      return ''
    })
    .filter(Boolean)
}

function normalizeMetrics(value, results = []) {
  if (Array.isArray(value) && value.length) {
    return value
      .map((entry, index) => {
        if (entry && typeof entry === 'object') {
          const metricValue = cleanText(entry.value) || String(index + 1).padStart(2, '0')
          const metricLabel = cleanText(entry.label)

          return metricValue && metricLabel
            ? { value: metricValue, label: metricLabel }
            : null
        }

        const metricLabel = cleanText(entry)
        return metricLabel
          ? { value: String(index + 1).padStart(2, '0'), label: metricLabel }
          : null
      })
      .filter(Boolean)
      .slice(0, 3)
  }

  return results.slice(0, 3).map((label, index) => ({
    value: String(index + 1).padStart(2, '0'),
    label,
  }))
}

function normalizeSections(value, fallback = {}) {
  const source = value && typeof value === 'object' ? value : {}

  return Object.fromEntries(
    SECTION_KEYS.map((key) => [
      key,
      cleanText(source[key]) || cleanText(fallback[key]),
    ]),
  )
}

function normalizeDraftShape(input = {}, fallback = {}) {
  const brief = cleanText(input.brief) || cleanText(fallback.brief)
  const title = cleanText(input.title) || cleanText(fallback.title) || 'Nouveau projet'
  const id = createProjectSlug(cleanText(input.slug) || cleanText(input.id) || cleanText(fallback.id) || title)
  const shortDescription = cleanText(input.shortDescription) || cleanText(input.description) || cleanText(fallback.shortDescription) || cleanText(fallback.description)
  const fullDescription = cleanText(input.fullDescription) || cleanText(fallback.fullDescription)
  const statement = cleanText(input.statement) || cleanText(fallback.statement)
  const role = cleanText(input.role) || cleanText(fallback.role)
  const year = cleanText(input.year) || cleanText(fallback.year) || String(new Date().getFullYear())
  const accent = cleanText(input.accent) || cleanText(fallback.accent) || '#d7ff76'
  const link = cleanText(input.link) || cleanText(fallback.link)
  const category = cleanText(input.category) || cleanText(fallback.category) || 'Projet digital'
  const estimatedDuration = cleanText(input.estimatedDuration) || cleanText(fallback.estimatedDuration)
  const difficulty = cleanText(input.difficulty) || cleanText(fallback.difficulty)
  const tech = splitTextList(input.tech || input.techStack || fallback.tech)
  const tags = splitTextList(input.tags || fallback.tags)
  const results = splitTextList(input.results || input.impact || fallback.results)
  const keywords = splitTextList(input.keywords || fallback.keywords)
  const images = normalizeImageUrls(input.images || fallback.images)
  const imageDetails = generateImageMetadataFromDraft(
    input.imageDetails || fallback.imageDetails || images,
    { title, category },
  )
  const sections = normalizeSections(input.sections, fallback.sections)
  const metrics = normalizeMetrics(input.metrics || fallback.metrics, results)
  const metaTitle = cleanText(input.metaTitle) || cleanText(fallback.metaTitle) || `${title} | Etude de cas`
  const metaDescription = cleanText(input.metaDescription) || cleanText(fallback.metaDescription) || shortDescription

  const draft = {
    brief,
    title,
    id,
    shortDescription,
    description: shortDescription,
    fullDescription,
    statement,
    role,
    year,
    accent,
    link,
    category,
    estimatedDuration,
    difficulty,
    tags,
    tech,
    results,
    metrics,
    keywords,
    images: imageDetails.map((entry) => entry.url),
    imageDetails,
    metaTitle,
    metaDescription,
    sections,
  }

  return {
    ...draft,
    caseStudy: buildGeneratedCaseStudyFromDraft(draft),
  }
}

async function requestOpenAiJson({ systemPrompt, userPrompt }) {
  const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      response_format: { type: 'json_object' },
      temperature: 0.9,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  })

  if (!response.ok) {
    const payload = await response.text().catch(() => '')
    throw new Error(`OpenAI ${response.status}: ${payload}`.trim())
  }

  const payload = await response.json()
  const content = cleanText(payload?.choices?.[0]?.message?.content)

  if (!content) {
    throw new Error('OpenAI a renvoye une reponse vide.')
  }

  return JSON.parse(content)
}

function buildGenerationPrompt({ brief, seedDraft, imageCount = 0, variant = 0 }) {
  return [
    'Generate a premium portfolio project case study draft as strict JSON.',
    'Return content in French unless the brief is clearly written in another language.',
    'Do not return markdown. Do not wrap JSON in code fences.',
    'The output must feel professional, realistic, structured and non-generic.',
    'Make each section long-form with multiple rich paragraphs.',
    'Adapt the tone to the project type and technologies.',
    'Provide these top-level fields:',
    'title, slug, shortDescription, fullDescription, statement, role, year, accent, link, category, estimatedDuration, difficulty, tags, tech, results, metrics, metaTitle, metaDescription, keywords, sections.',
    'sections must be an object with: introduction, problem, solution, process, technologies, impact, conclusion.',
    'tags, tech, results, keywords must be arrays of strings.',
    'metrics must be an array of objects with { value, label }.',
    'Do not invent fake numbers that look like analytics percentages unless they are clearly qualitative labels. Prefer realistic impact statements.',
    'Use this brief as the main source:',
    brief,
    `There are ${imageCount} uploaded image(s); you should prepare text that can later support SEO alt text and captions for them.`,
    `Variation index: ${variant}. Produce a fresh version, not a lightly reworded duplicate.`,
    'Use this seed draft as a structural baseline and improve its quality substantially:',
    JSON.stringify(seedDraft),
  ].join('\n\n')
}

function buildImprovePrompt({ sectionKey, draft, fallbackText, variant = 1 }) {
  return [
    'Improve only one portfolio case study section and return strict JSON with a single field: text.',
    'Return the text in French unless the draft is clearly in another language.',
    'Make it richer, more specific, less generic, and more editorial.',
    'Keep it realistic and consistent with the project brief and category.',
    `Section to improve: ${sectionKey}`,
    `Variation index: ${variant}`,
    'Full draft context:',
    JSON.stringify(draft),
    'Current section baseline:',
    fallbackText,
  ].join('\n\n')
}

export function hasOpenAiGenerationSupport() {
  return Boolean(OPENAI_API_KEY)
}

export function getOpenAiGenerationMeta() {
  return {
    enabled: hasOpenAiGenerationSupport(),
    model: OPENAI_MODEL,
    provider: hasOpenAiGenerationSupport() ? 'openai' : 'fallback',
  }
}

export async function generateProjectDraftWithAi(brief, options = {}) {
  const seedDraft = await generateProjectDraftFromBrief(brief, options)

  if (!hasOpenAiGenerationSupport()) {
    return {
      draft: normalizeDraftShape(seedDraft, seedDraft),
      provider: 'fallback',
      warning: 'OPENAI_API_KEY manquante: generation locale utilisee en secours.',
    }
  }

  try {
    const aiDraft = await requestOpenAiJson({
      systemPrompt: 'You are an expert senior portfolio strategist and case study writer. You produce premium, realistic, structured JSON only.',
      userPrompt: buildGenerationPrompt({
        brief,
        seedDraft,
        imageCount: Array.isArray(options.images) ? options.images.length : 0,
        variant: options.variant || 0,
      }),
    })

    return {
      draft: normalizeDraftShape(aiDraft, seedDraft),
      provider: 'openai',
    }
  }
  catch (error) {
    return {
      draft: normalizeDraftShape(seedDraft, seedDraft),
      provider: 'fallback',
      warning: error instanceof Error ? error.message : 'Impossible de joindre OpenAI.',
    }
  }
}

export async function improveProjectSectionWithAi(sectionKey, draft, options = {}) {
  const fallbackText = await improveGeneratedSection(sectionKey, draft, options)

  if (!hasOpenAiGenerationSupport()) {
    return {
      text: fallbackText,
      provider: 'fallback',
      warning: 'OPENAI_API_KEY manquante: amelioration locale utilisee en secours.',
    }
  }

  try {
    const payload = await requestOpenAiJson({
      systemPrompt: 'You are a senior editorial case study writer. Return strict JSON only.',
      userPrompt: buildImprovePrompt({
        sectionKey,
        draft,
        fallbackText,
        variant: options.variant || 1,
      }),
    })

    const text = cleanText(payload?.text) || fallbackText

    return {
      text,
      provider: 'openai',
    }
  }
  catch (error) {
    return {
      text: fallbackText,
      provider: 'fallback',
      warning: error instanceof Error ? error.message : 'Impossible de joindre OpenAI.',
    }
  }
}

export function normalizeGeneratedDraftPayload(input = {}, fallback = {}) {
  return normalizeDraftShape(input, fallback)
}