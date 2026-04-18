const GITHUB_API_BASE = 'https://api.github.com'
const MICROLINK_API_BASE = 'https://api.microlink.io'

const techPriority = [
  'Vue 3',
  'Vue Router',
  'GSAP',
  'ScrollTrigger',
  'Lenis',
  'SplitType',
  'SCSS',
  'Vite',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Express',
  'React',
  'Next.js',
  'Nuxt',
  'Tailwind CSS',
  'Pinia',
  'Supabase',
  'Prisma',
]

const dependencyTechMap = {
  vue: 'Vue 3',
  'vue-router': 'Vue Router',
  gsap: 'GSAP',
  'split-type': 'SplitType',
  '@studio-freight/lenis': 'Lenis',
  vite: 'Vite',
  sass: 'SCSS',
  scss: 'SCSS',
  typescript: 'TypeScript',
  react: 'React',
  next: 'Next.js',
  nuxt: 'Nuxt',
  tailwindcss: 'Tailwind CSS',
  pinia: 'Pinia',
  express: 'Express',
  prisma: 'Prisma',
  '@prisma/client': 'Prisma',
  '@supabase/supabase-js': 'Supabase',
}

const languageTechMap = {
  Vue: 'Vue 3',
  JavaScript: 'JavaScript',
  TypeScript: 'TypeScript',
  CSS: 'CSS',
  HTML: 'HTML',
  Sass: 'SCSS',
  SCSS: 'SCSS',
}

const topicTechMap = {
  vue: 'Vue 3',
  'vue-router': 'Vue Router',
  vite: 'Vite',
  gsap: 'GSAP',
  scrolltrigger: 'ScrollTrigger',
  lenis: 'Lenis',
  splittype: 'SplitType',
  scss: 'SCSS',
  typescript: 'TypeScript',
  react: 'React',
  nextjs: 'Next.js',
  nuxt: 'Nuxt',
  prisma: 'Prisma',
}

const textSniffMap = [
  ['scrolltrigger', 'ScrollTrigger'],
  ['splittype', 'SplitType'],
  ['split-type', 'SplitType'],
  ['lenis', 'Lenis'],
  ['gsap', 'GSAP'],
  ['vue-router', 'Vue Router'],
  ['vue router', 'Vue Router'],
  ['vue 3', 'Vue 3'],
  ['vite', 'Vite'],
  ['scss', 'SCSS'],
  ['sass', 'SCSS'],
  ['typescript', 'TypeScript'],
  ['tailwind', 'Tailwind CSS'],
  ['react', 'React'],
  ['next.js', 'Next.js'],
  ['prisma', 'Prisma'],
]

function cleanText(value = '') {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))]
}

function finalizeSentence(value = '') {
  const text = cleanText(value).replace(/[\s.!?;:,]+$/g, '')
  return text ? `${text}.` : ''
}

function limitText(value = '', maxLength = 190) {
  const text = cleanText(value)

  if (!text) {
    return ''
  }

  if (text.length <= maxLength) {
    return finalizeSentence(text)
  }

  const truncated = text.slice(0, maxLength).replace(/\s+\S*$/, '')
  return finalizeSentence(truncated)
}

function normalizeUrlCandidate(value = '') {
  const rawValue = cleanText(value)

  if (!rawValue) {
    return ''
  }

  try {
    return new URL(rawValue).toString()
  }
  catch {
    try {
      return new URL(`https://${rawValue}`).toString()
    }
    catch {
      return ''
    }
  }
}

function parseSourceUrl(value = '') {
  const normalizedValue = normalizeUrlCandidate(value)

  if (!normalizedValue) {
    return null
  }

  try {
    return new URL(normalizedValue)
  }
  catch {
    return null
  }
}

function prettifyProjectTitle(value = '') {
  const text = cleanText(value)

  if (!text) {
    return ''
  }

  return text
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function sanitizeMarkdown(value = '') {
  return String(value ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/[\*_~]/g, ' ')
}

function extractLeadParagraph(value = '') {
  const paragraphs = sanitizeMarkdown(value)
    .split(/\n{2,}/)
    .map((entry) => cleanText(entry))
    .filter(Boolean)

  return paragraphs.find((entry) => entry.length > 48) || ''
}

function decodeBase64Utf8(content = '') {
  const binary = atob(String(content ?? '').replace(/\n/g, ''))
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))

  return new TextDecoder().decode(bytes)
}

function sortTech(values = []) {
  const priorityIndex = (value) => {
    const index = techPriority.indexOf(value)
    return index === -1 ? Number.MAX_SAFE_INTEGER : index
  }

  return unique(values)
    .sort((left, right) => {
      const priorityDiff = priorityIndex(left) - priorityIndex(right)

      if (priorityDiff !== 0) {
        return priorityDiff
      }

      return left.localeCompare(right, 'en', { sensitivity: 'base' })
    })
    .slice(0, 6)
}

function inferProfile({ title, summary, tech = [], url = '' }) {
  const haystack = `${title} ${summary} ${tech.join(' ')} ${url}`.toLowerCase()

  if (/(portfolio|studio|agency|creative|showcase|designer|brand)/.test(haystack)) {
    return 'portfolio'
  }

  if (/(shop|store|e-commerce|ecommerce|checkout|cart|catalog|product page|product)/.test(haystack)) {
    return 'commerce'
  }

  if (/(editorial|media|magazine|blog|content|press|news|music|festival|artist|culture|podcast)/.test(haystack)) {
    return 'editorial'
  }

  if (/(dashboard|admin|analytics|saas|workspace|crm|backoffice|back-office|app|application)/.test(haystack)) {
    return 'product'
  }

  return 'default'
}

function hasMotionTech(tech = []) {
  return tech.some((entry) => ['GSAP', 'ScrollTrigger', 'Lenis', 'SplitType'].includes(entry))
}

function buildDescription({ title, summary, tech = [], profile }) {
  const summaryText = cleanText(summary)
  const motionFocused = hasMotionTech(tech)

  let focusText = 'une interface claire, une execution responsive propre et une base frontend facile a faire evoluer'

  if (motionFocused) {
    focusText = 'un rythme visuel maitrise, des transitions fluides et une base frontend propre a faire evoluer'
  }
  else if (profile === 'commerce') {
    focusText = 'une hierarchie de conversion claire, une execution responsive solide et un cadre technique lisible'
  }
  else if (profile === 'portfolio') {
    focusText = 'une presence forte, une narration claire et une base frontend facile a faire evoluer'
  }
  else if (profile === 'editorial') {
    focusText = 'un rythme de contenu lisible, une hierarchie nette et une execution frontend facile a faire vivre'
  }
  else if (profile === 'product') {
    focusText = 'une interface produit nette, des composants reutilisables et une base technique plus simple a maintenir'
  }

  if (summaryText) {
    const summarySentence = limitText(summaryText, 150).replace(/\.$/, '')
    return limitText(`${summarySentence}. Le tout reste cadre par ${focusText}.`, 215)
  }

  if (profile === 'portfolio') {
    return finalizeSentence(`Un portfolio studio pour ${title}, pense autour de ${focusText}`)
  }

  if (profile === 'commerce') {
    return finalizeSentence(`Une experience e-commerce pour ${title}, pensee autour de ${focusText}`)
  }

  if (profile === 'editorial') {
    return finalizeSentence(`Une plateforme editoriale pour ${title}, structuree autour de ${focusText}`)
  }

  if (profile === 'product') {
    return finalizeSentence(`Une interface produit pour ${title}, construite autour de ${focusText}`)
  }

  return finalizeSentence(`Une experience web pour ${title}, pensee autour de ${focusText}`)
}

function buildStatement({ tech = [], profile }) {
  if (profile === 'portfolio') {
    return 'Une presence qui parait sur-mesure sans devenir fragile.'
  }

  if (profile === 'commerce') {
    return 'Une interface qui garde du relief sans perdre la clarte du parcours.'
  }

  if (profile === 'editorial') {
    return 'Un rythme de contenu lisible, expressif et facile a faire durer.'
  }

  if (profile === 'product') {
    return hasMotionTech(tech)
      ? 'Une interface nette et fluide, deja pensee pour grandir sans se fragiliser.'
      : 'Une base produit claire, stable et prete a prendre plus d usage.'
  }

  return hasMotionTech(tech)
    ? 'Une base expressive, fluide et deja pensee pour durer.'
    : 'Un cadre web clair, propre et deja pense pour durer.'
}

function buildRole({ tech = [], profile, sourceKind }) {
  if (profile === 'portfolio' || profile === 'commerce') {
    return hasMotionTech(tech) ? 'Direction creative / Frontend motion' : 'Direction creative / Frontend'
  }

  if (profile === 'editorial') {
    return hasMotionTech(tech) ? 'Frontend / Experience editoriale' : 'Frontend / Architecture de contenu'
  }

  if (profile === 'product') {
    return hasMotionTech(tech) ? 'Frontend / Motion UI' : 'Frontend / Architecture produit'
  }

  if (sourceKind === 'github' && tech.some((entry) => entry === 'Express' || entry === 'Node.js')) {
    return 'Frontend / Full-stack UI'
  }

  return 'Frontend / UI engineering'
}

function buildResults({ tech = [], profile }) {
  const results = []

  if (profile === 'portfolio') {
    results.push('Presence de marque plus nette')
    results.push('Narration de projet plus claire')
    results.push('Architecture de contenu plus simple a faire evoluer')
  }
  else if (profile === 'commerce') {
    results.push('Parcours principal plus lisible')
    results.push('Execution responsive plus propre')
    results.push('Base UI plus simple a faire evoluer')
  }
  else if (profile === 'editorial') {
    results.push('Lecture et navigation plus fluides')
    results.push('Cadre de contenu plus modulable')
    results.push('Execution frontend plus propre et durable')
  }
  else if (profile === 'product') {
    results.push('Interface produit plus claire')
    results.push('Base de composants plus reutilisable')
    results.push('Architecture technique plus simple a maintenir')
  }
  else {
    results.push('Interface plus claire')
    results.push('Execution responsive plus propre')
    results.push('Architecture frontend plus simple a faire evoluer')
  }

  if (hasMotionTech(tech)) {
    results.unshift('Motion et transitions plus maitrises')
  }

  if (tech.some((entry) => entry === 'Vue 3' || entry === 'React')) {
    results.push('Base de composants plus coherente')
  }

  if (tech.some((entry) => entry === 'Vite' || entry === 'TypeScript')) {
    results.push('Base frontend plus simple a maintenir')
  }

  return unique(results).slice(0, 3)
}

function collectTextTech(value = '') {
  const haystack = cleanText(value).toLowerCase()

  return textSniffMap
    .filter(([needle]) => haystack.includes(needle))
    .map(([, label]) => label)
}

function collectGithubTech({ repo, packageJson, languages, readmeText }) {
  const detectedTech = []
  const packageDependencies = {
    ...(packageJson?.dependencies || {}),
    ...(packageJson?.devDependencies || {}),
  }

  Object.keys(packageDependencies).forEach((dependencyName) => {
    const mappedLabel = dependencyTechMap[dependencyName]

    if (mappedLabel) {
      detectedTech.push(mappedLabel)
    }
  })

  Object.keys(languages || {}).forEach((languageName) => {
    const mappedLabel = languageTechMap[languageName]

    if (mappedLabel) {
      detectedTech.push(mappedLabel)
    }
  })

  ;(repo.topics || []).forEach((topic) => {
    const mappedLabel = topicTechMap[String(topic).toLowerCase()]

    if (mappedLabel) {
      detectedTech.push(mappedLabel)
    }
  })

  detectedTech.push(...collectTextTech(`${repo.description || ''} ${readmeText}`))

  if (repo.language) {
    const languageLabel = languageTechMap[repo.language]

    if (languageLabel) {
      detectedTech.push(languageLabel)
    }
  }

  return sortTech(detectedTech)
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options)

  if (!response.ok) {
    const payload = await response.text().catch(() => '')
    throw new Error(`${response.status} ${payload}`.trim())
  }

  return response.json()
}

function isGithubRepoUrl(url) {
  const sourceUrl = parseSourceUrl(url)

  if (!sourceUrl) {
    return false
  }

  return /(^|\.)github\.com$/i.test(sourceUrl.hostname)
}

function extractGithubTarget(url) {
  const sourceUrl = parseSourceUrl(url)

  if (!sourceUrl) {
    return null
  }

  const pathSegments = sourceUrl.pathname.split('/').filter(Boolean)

  if (pathSegments.length < 2) {
    return null
  }

  return {
    owner: pathSegments[0],
    repo: pathSegments[1].replace(/\.git$/, ''),
    sourceUrl: sourceUrl.toString(),
  }
}

async function buildGithubDraft(sourceUrl) {
  const githubTarget = extractGithubTarget(sourceUrl)

  if (!githubTarget) {
    throw new Error('Colle un lien GitHub public vers un repo complet.')
  }

  try {
    const repo = await fetchJson(`${GITHUB_API_BASE}/repos/${githubTarget.owner}/${githubTarget.repo}`, {
      headers: {
        accept: 'application/vnd.github+json',
      },
    })

    const [languagesResult, readmeResult, packageResult] = await Promise.allSettled([
      fetchJson(repo.languages_url, {
        headers: {
          accept: 'application/vnd.github+json',
        },
      }),
      fetchJson(`${GITHUB_API_BASE}/repos/${githubTarget.owner}/${githubTarget.repo}/readme`, {
        headers: {
          accept: 'application/vnd.github+json',
        },
      }),
      fetchJson(`${GITHUB_API_BASE}/repos/${githubTarget.owner}/${githubTarget.repo}/contents/package.json?ref=${repo.default_branch}`, {
        headers: {
          accept: 'application/vnd.github+json',
        },
      }),
    ])

    const readmeText = readmeResult.status === 'fulfilled'
      ? decodeBase64Utf8(readmeResult.value.content || '')
      : ''

    const packageJson = packageResult.status === 'fulfilled'
      ? JSON.parse(decodeBase64Utf8(packageResult.value.content || '{}') || '{}')
      : null

    const languages = languagesResult.status === 'fulfilled' ? languagesResult.value : {}
    const title = prettifyProjectTitle(repo.name)
    const summary = cleanText(repo.description) || extractLeadParagraph(readmeText)
    const tech = collectGithubTech({ repo, packageJson, languages, readmeText })
    const profile = inferProfile({ title, summary, tech, url: githubTarget.sourceUrl })
    const liveLink = normalizeUrlCandidate(repo.homepage || packageJson?.homepage || '')

    return {
      sourceKind: 'github',
      sourceLabel: `${githubTarget.owner}/${githubTarget.repo}`,
      title,
      description: buildDescription({ title, summary, tech, profile }),
      statement: buildStatement({ tech, profile }),
      role: buildRole({ tech, profile, sourceKind: 'github' }),
      results: buildResults({ tech, profile }),
      tech,
      link: liveLink,
    }
  }
  catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : ''

    if (message.includes('403') || message.includes('rate limit')) {
      throw new Error('GitHub refuse la requete pour le moment. Reessaie plus tard ou colle le lien live du site.')
    }

    throw new Error('Impossible d analyser ce repo GitHub. Verifie que le lien pointe vers un repo public.')
  }
}

async function fetchWebsiteMetadata(sourceUrl) {
  try {
    const response = await fetchJson(`${MICROLINK_API_BASE}?url=${encodeURIComponent(sourceUrl)}&screenshot=false&audio=false&video=false`)
    return response?.data || {}
  }
  catch {
    return {}
  }
}

async function buildWebsiteDraft(sourceUrl) {
  const parsedUrl = parseSourceUrl(sourceUrl)

  if (!parsedUrl) {
    throw new Error('Colle une URL valide de site ou de repo GitHub.')
  }

  const metadata = await fetchWebsiteMetadata(parsedUrl.toString())
  const hostname = parsedUrl.hostname.replace(/^www\./, '')
  const title = cleanText(metadata.title) || prettifyProjectTitle(hostname.split('.')[0])
  const summary = cleanText(metadata.description) || `${title} en ligne avec une presence claire et un cadre frontend propre.`
  const profile = inferProfile({ title, summary, tech: [], url: parsedUrl.toString() })

  return {
    sourceKind: 'website',
    sourceLabel: hostname,
    title,
    description: buildDescription({ title, summary, tech: [], profile }),
    statement: buildStatement({ tech: [], profile }),
    role: buildRole({ tech: [], profile, sourceKind: 'website' }),
    results: buildResults({ tech: [], profile }),
    tech: [],
    link: parsedUrl.toString(),
  }
}

export async function generateProjectDraftFromSource(sourceValue) {
  const normalizedSource = normalizeUrlCandidate(sourceValue)

  if (!normalizedSource) {
    throw new Error('Colle un lien valide de site ou de repo GitHub.')
  }

  if (isGithubRepoUrl(normalizedSource)) {
    return buildGithubDraft(normalizedSource)
  }

  return buildWebsiteDraft(normalizedSource)
}