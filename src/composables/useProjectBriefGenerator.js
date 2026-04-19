import { createProjectSlug, normalizeAccent } from '../lib/project-model.js'

function wait(duration) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration)
  })
}

const TECH_DETECTORS = [
  { pattern: /\bhtml5?\b/i, label: 'HTML5' },
  { pattern: /\bcss3?\b/i, label: 'CSS3' },
  { pattern: /\bjavascript\b|\bjs\b/i, label: 'JavaScript' },
  { pattern: /\btypescript\b|\bts\b/i, label: 'TypeScript' },
  { pattern: /\bvue(?:\s*3)?\b/i, label: 'Vue 3' },
  { pattern: /\breact\b/i, label: 'React' },
  { pattern: /\bnext(?:\.js)?\b/i, label: 'Next.js' },
  { pattern: /\bnuxt\b/i, label: 'Nuxt' },
  { pattern: /\btailwind\b/i, label: 'Tailwind CSS' },
  { pattern: /\bscss\b|\bsass\b/i, label: 'SCSS' },
  { pattern: /\bgsap\b/i, label: 'GSAP' },
  { pattern: /\bscrolltrigger\b/i, label: 'ScrollTrigger' },
  { pattern: /\blenis\b/i, label: 'Lenis' },
  { pattern: /\bsplittype\b|\bsplit type\b|\bsplit-type\b/i, label: 'SplitType' },
  { pattern: /\bnode(?:\.js)?\b/i, label: 'Node.js' },
  { pattern: /\bexpress\b/i, label: 'Express' },
  { pattern: /\bprisma\b/i, label: 'Prisma' },
  { pattern: /\bshopify\b/i, label: 'Shopify' },
  { pattern: /\bstripe\b/i, label: 'Stripe' },
  { pattern: /\bframer\b/i, label: 'Framer Motion' },
  { pattern: /\bfigma\b/i, label: 'Figma' },
]

const CATEGORY_PROFILES = {
  saas: {
    label: 'SaaS',
    accent: '#b8ff63',
    tags: ['SaaS', 'Produit', 'Clarte'],
    titleTemplates: [
      'Clarifier une offre SaaS complexe sans aplatir son ambition.',
      'Donner a un produit SaaS une presence plus nette et plus convaincante.',
      'Transformer une promesse SaaS dense en parcours lisible et memorisable.',
    ],
    statementTemplates: [
      'Un cadre plus clair pour comprendre vite la valeur et passer a l action.',
      'Une narration produit qui simplifie la lecture sans perdre le niveau de detail utile.',
      'Une page capable d expliquer l offre, rassurer vite et guider naturellement vers la suite.',
    ],
    resultTemplates: [
      'Promesse produit rendue beaucoup plus lisible',
      'Parcours de lecture mieux cadence du hero au call to action',
      'Base frontend plus simple a faire evoluer avec le temps',
    ],
  },
  ecommerce: {
    label: 'E-commerce',
    accent: '#ffd36a',
    tags: ['E-commerce', 'Conversion', 'Produit'],
    titleTemplates: [
      'Mettre en scene le produit sans ralentir la conversion.',
      'Refondre une experience e-commerce pour vendre avec plus de clarte.',
      'Donner a une boutique en ligne plus de desirabilite sans brouiller le parcours.',
    ],
    statementTemplates: [
      'Une experience plus nette pour valoriser le produit et fluidifier la decision.',
      'Un cadre plus premium qui garde le cap sur la conversion.',
      'Une vitrine produit qui reste expressive, lisible et orientee vers l action.',
    ],
    resultTemplates: [
      'Parcours d achat plus lisible',
      'Mise en scene produit plus memorisable',
      'Architecture de contenu plus stable pour enrichir le catalogue',
    ],
  },
  portfolio: {
    label: 'Portfolio',
    accent: '#9fd8ff',
    tags: ['Portfolio', 'Editorial', 'Identite'],
    titleTemplates: [
      'Construire un portfolio qui impose une presence claire et durable.',
      'Donner a un portfolio une ecriture plus forte sans perdre en lisibilite.',
      'Transformer un portfolio en recit premium, net et memorisable.',
    ],
    statementTemplates: [
      'Une presence plus forte, une narration mieux tenue et une base qui reste flexible.',
      'Un portfolio qui raconte mieux le niveau d exigence sans surjouer les effets.',
      'Une structure editoriale capable de faire paraitre le travail plus net, plus dense et plus credible.',
    ],
    resultTemplates: [
      'Presence de marque plus nette',
      'Narration de projet plus convaincante',
      'Structure plus simple a faire vivre au fil des nouvelles publications',
    ],
  },
  editorial: {
    label: 'Editorial',
    accent: '#fcb7ff',
    tags: ['Editorial', 'Narration', 'Contenu'],
    titleTemplates: [
      'Donner a une experience editoriale un rythme plus lisible et plus fort.',
      'Refondre un support editorial pour mieux guider la lecture sans l appauvrir.',
      'Installer une narration editoriale dense qui reste fluide a parcourir.',
    ],
    statementTemplates: [
      'Un rythme de lecture plus net, plus pose et plus facile a tenir sur toute la page.',
      'Une architecture de contenu qui aide a lire vite sans perdre la richesse du sujet.',
      'Une page pensee comme un recit, pas comme une simple pile de blocs.',
    ],
    resultTemplates: [
      'Lecture plus fluide sur les sections longues',
      'Hierarchie de contenu plus nette',
      'Cadre editorial plus facile a enrichir ensuite',
    ],
  },
  landing: {
    label: 'Landing page',
    accent: '#d7ff76',
    tags: ['Landing', 'Conversion', 'Narration'],
    titleTemplates: [
      'Construire une landing page qui vend l idee avant de vendre l offre.',
      'Refondre une landing page pour donner plus de relief a la promesse centrale.',
      'Installer une page de lancement plus nette, plus credibile et plus efficace.',
    ],
    statementTemplates: [
      'Une page capable de faire comprendre, ressentir puis agir sans rupture.',
      'Une narration plus courte, plus juste et mieux guidee jusqu au point de conversion.',
      'Un hero et des preuves mieux articules pour garder l attention jusqu au bout.',
    ],
    resultTemplates: [
      'Promesse principale rendue plus claire',
      'Lecture plus cadencee entre hero, preuves et action',
      'Base de page plus simple a reutiliser pour de futures campagnes',
    ],
  },
  webapp: {
    label: 'Application web',
    accent: '#c0c7ff',
    tags: ['Application web', 'Interface', 'Structure'],
    titleTemplates: [
      'Structurer une application web plus claire, plus stable et plus simple a faire evoluer.',
      'Refondre une interface web pour mieux guider les usages sans perdre en souplesse.',
      'Donner a une application web une architecture plus nette et plus durable.',
    ],
    statementTemplates: [
      'Une interface plus claire, plus stable et plus simple a maintenir a mesure que le produit grandit.',
      'Un cadre UI plus lisible, pense pour absorber plus de contenu sans se fragiliser.',
      'Une base plus propre pour orchestrer contenu, composants et usage reel.',
    ],
    resultTemplates: [
      'Parcours utilisateur plus lisible',
      'Composants plus faciles a reutiliser',
      'Base technique plus stable dans le temps',
    ],
  },
}

const STYLE_PATTERNS = [
  { pattern: /premium|haut de gamme|luxury|luxe|elegant|editorial/i, label: 'premium' },
  { pattern: /minimal|sobre|clean|epure/i, label: 'minimal' },
  { pattern: /bold|fort|impactant|expressif/i, label: 'expressif' },
  { pattern: /motion|animation|scroll|immersif|immersive/i, label: 'motion' },
]

const DURATION_MATRIX = {
  simple: '2 a 3 semaines',
  medium: '3 a 5 semaines',
  advanced: '5 a 7 semaines',
  expert: '7 a 10 semaines',
}

function cleanText(value = '') {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function splitParagraphs(value = '') {
  return String(value ?? '')
    .split(/\n\s*\n/)
    .map((entry) => cleanText(entry))
    .filter(Boolean)
}

function unique(values = []) {
  return [...new Set(values.map((entry) => cleanText(entry)).filter(Boolean))]
}

function ensureSentence(value = '') {
  const text = cleanText(value)
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

function pickVariant(values = [], variant = 0, fallback = '') {
  if (!values.length) {
    return fallback
  }

  return values[Math.abs(variant) % values.length]
}

function toTitleCase(value = '') {
  return cleanText(value)
    .toLowerCase()
    .replace(/(^|\s|-)([a-z])/g, (_match, prefix, letter) => `${prefix}${letter.toUpperCase()}`)
}

function estimateDifficultyLevel(brief, tech = [], categoryKey = 'webapp') {
  const haystack = cleanText(brief).toLowerCase()
  const techCount = tech.length
  const hasHeavyMotion = /motion|animation|scroll|three|3d|immersif|immersive/.test(haystack)
  const hasDataComplexity = /dashboard|analytics|data|filtre|workflow|multi-step|multi step|ai|auth|checkout|paiement|payment/.test(haystack)

  if ((hasHeavyMotion && hasDataComplexity) || techCount >= 6) {
    return 'Expert'
  }

  if (hasHeavyMotion || hasDataComplexity || ['saas', 'ecommerce'].includes(categoryKey)) {
    return 'Avance'
  }

  if (techCount >= 3 || categoryKey === 'editorial') {
    return 'Intermediaire'
  }

  return 'Accessible'
}

function estimateDuration(difficulty) {
  if (difficulty === 'Expert') {
    return DURATION_MATRIX.expert
  }

  if (difficulty === 'Avance') {
    return DURATION_MATRIX.advanced
  }

  if (difficulty === 'Intermediaire') {
    return DURATION_MATRIX.medium
  }

  return DURATION_MATRIX.simple
}

function detectTechnologies(brief) {
  const haystack = cleanText(brief)
  const detected = TECH_DETECTORS
    .filter((entry) => entry.pattern.test(haystack))
    .map((entry) => entry.label)

  if (!detected.length) {
    return ['HTML5', 'CSS3', 'JavaScript']
  }

  return unique(detected)
}

function detectStyle(brief) {
  const haystack = cleanText(brief)
  const matches = STYLE_PATTERNS.filter((entry) => entry.pattern.test(haystack)).map((entry) => entry.label)
  return matches[0] || 'premium'
}

function detectCategoryKey(brief) {
  const haystack = cleanText(brief).toLowerCase()

  if (/(saas|dashboard|workspace|crm|analytics|b2b|plateforme produit|product app)/.test(haystack)) {
    return 'saas'
  }

  if (/(e-commerce|ecommerce|shop|store|checkout|cart|catalogue|catalog|product page|boutique)/.test(haystack)) {
    return 'ecommerce'
  }

  if (/(portfolio|studio|agency|creative|designer|showcase|photographe|artist)/.test(haystack)) {
    return 'portfolio'
  }

  if (/(editorial|media|magazine|blog|press|festival|music|article|contenu)/.test(haystack)) {
    return 'editorial'
  }

  if (/(landing|launch|hero|campaign|conversion|acquisition|marketing|page de lancement)/.test(haystack)) {
    return 'landing'
  }

  return 'webapp'
}

function extractProjectName(brief) {
  const text = cleanText(brief)

  const quoted = text.match(/["'“”](.{3,50}?)["'“”]/)
  if (quoted) {
    return toTitleCase(quoted[1])
  }

  const forMatch = text.match(/(?:pour|for)\s+([A-Z][\w-]*(?:\s+[A-Z][\w-]*){0,2})/)
  if (forMatch) {
    return cleanText(forMatch[1])
  }

  return ''
}

function buildProjectTitle(context) {
  if (context.projectName) {
    return `${pickVariant(context.profile.titleTemplates, context.variant)} ${context.projectName}`
  }

  return pickVariant(context.profile.titleTemplates, context.variant)
}

function buildRole(context) {
  if (context.tech.includes('GSAP') || context.tech.includes('ScrollTrigger') || context.style === 'motion') {
    return 'Direction creative / Frontend motion'
  }

  if (context.categoryKey === 'saas' || context.categoryKey === 'webapp') {
    return 'Frontend / Architecture produit'
  }

  if (context.categoryKey === 'editorial') {
    return 'Frontend / Narration editoriale'
  }

  return 'Design UI / Frontend'
}

function buildShortDescription(context) {
  const categoryLabel = context.profile.label.toLowerCase()

  const firstParagraph = `Projet ${categoryLabel} construit a partir d un brief court pour transformer une intention encore floue en page de portfolio claire, dense et credible.`
  const secondParagraph = `Le travail se concentre sur ${context.focus}, avec une execution pensee pour ${context.tech.slice(0, 3).join(', ')} et une structure capable d absorber plus de contenu sans perdre sa tenue.`

  return `${ensureSentence(firstParagraph)} ${ensureSentence(secondParagraph)}`
}

function buildFullDescription(context) {
  const paragraphs = [
    `Le brief de depart pose un besoin simple en apparence, mais assez riche pour justifier une vraie etude de cas : ${ensureSentence(context.briefSummary)} Ici, l enjeu n est pas seulement de montrer un rendu final, mais de rendre visibles les decisions qui donnent au projet sa logique, son rythme et sa valeur percue.`,
    `La generation de contenu s appuie donc sur une lecture plus strategique du projet. Le recit articule le contexte, le probleme, la solution, le process, la pile technique et l impact attendu, avec un ton ajuste a une ${context.profile.label.toLowerCase()} ${context.style === 'premium' ? 'premium' : 'contemporaine'} qui doit paraitre professionnelle des le premier ecran.`,
    `Le resultat cherche a produire une base editoriale deja exploitable dans un portfolio haut de gamme : des paragraphes longs, une structure nette, des sections bien nommees, des points d impact concrets et une matiere suffisante pour que la page puisse etre relue, enrichie et affinee ensuite sans repartir de zero.`,
  ]

  return paragraphs.map((entry) => ensureSentence(entry)).join('\n\n')
}

function buildFocus(context) {
  if (context.categoryKey === 'ecommerce') {
    return 'la clarte de l offre, la mise en scene du produit et la fluidite du parcours'
  }

  if (context.categoryKey === 'saas') {
    return 'la promesse produit, la lisibilite de l interface et la credibilite du discours'
  }

  if (context.categoryKey === 'portfolio') {
    return 'la presence visuelle, la narration des projets et la coherence du systeme'
  }

  if (context.categoryKey === 'editorial') {
    return 'le rythme de lecture, la hierarchie des contenus et la tenue du recit'
  }

  if (context.categoryKey === 'landing') {
    return 'la promesse centrale, le rythme des preuves et la conversion finale'
  }

  return 'la clarte de l interface, le rythme general et la capacite du projet a grandir proprement'
}

function buildResults(context) {
  return unique([
    ...context.profile.resultTemplates,
    context.tech.length ? `Execution solide sur ${context.tech.slice(0, 2).join(' et ')}` : '',
  ]).slice(0, 3)
}

function buildMetrics(results = []) {
  return results.slice(0, 3).map((label, index) => ({
    value: String(index + 1).padStart(2, '0'),
    label,
  }))
}

function buildTags(context) {
  return unique([
    ...context.profile.tags,
    context.style === 'motion' ? 'Motion' : '',
    context.tech[0],
    context.tech[1],
  ]).slice(0, 4)
}

function buildKeywords(context) {
  return unique([
    context.profile.label,
    ...context.tech,
    'case study portfolio',
    'portfolio frontend',
    context.style === 'motion' ? 'motion design web' : 'design d interface',
  ]).slice(0, 8)
}

function buildMetaTitle(title, context) {
  return `${title} | ${context.profile.label} case study`
}

function buildMetaDescription(title, context, shortDescription) {
  const summary = cleanText(shortDescription).replace(/\.$/, '')
  return ensureSentence(`${title} : ${summary} Structuree comme une ${context.profile.label.toLowerCase()} detaillee avec ${context.tech.slice(0, 3).join(', ')}.`)
}

function buildSectionParagraphs(sectionKey, context, mode = 'base') {
  const stronger = mode === 'improved'
  const depth = stronger
    ? 'Le texte insiste davantage sur les arbitrages, les contraintes et les effets visibles sur la perception finale.'
    : 'Le texte garde un niveau de detail suffisant pour donner de la matiere sans noyer la lecture.'

  const sectionMap = {
    introduction: [
      `Le projet part d un brief volontairement court : ${ensureSentence(context.briefSummary)} Plutot que de le traduire en simple carte portfolio, la generation en fait un recit complet, avec assez de densite pour que la page paraisse deja pensee comme une veritable case study premium.`,
      `Cette introduction installe d abord le cadre: ${context.profile.label.toLowerCase()}, ton ${context.style}, priorite donnee a ${context.focus}. Elle pose aussi la promesse implicite de la page : offrir une lecture plus claire, plus mature et plus convaincante que celle d une fiche projet trop concise.`,
      depth,
    ],
    problem: [
      `Le probleme initial ne tient pas seulement a la forme. Dans ce type de projet, l enjeu le plus delicat consiste a faire percevoir rapidement la valeur, tout en gardant assez de nuances pour que la page semble credible a un lecteur exigeant, recruteur, client ou partenaire.`,
      `Sans structure editoriale forte, ce genre de brief produit souvent une page plate : trop peu de contexte pour comprendre les enjeux, trop peu de profondeur pour juger la methode, et pas assez de preuves pour sentir la qualite reelle du travail.`,
      `Ici, le probleme a donc ete reformule ainsi : comment transformer une intention courte en narration longue, sans tomber dans la repetition ni dans un discours generique ?`,
    ],
    solution: [
      `La solution retenue consiste a decomposer le projet en blocs de lecture tres nets : contexte, probleme, reponse, process, stack, impact et fermeture. Cette hierarchie donne au lecteur une progression logique, presque inevitable, qui aide a comprendre le projet sans devoir deviner son importance.`,
      `Chaque partie est ecrite pour porter une fonction precise. Certaines clarifient la decision, d autres installent la credibilite technique, d autres encore servent de preuve narrative pour que la page ne paraisse jamais purement decorative.`,
      `Le resultat est une page qui raconte autant la qualite de l execution que la qualite du jugement derriere cette execution.`,
    ],
    process: [
      `Le process s appuie sur une logique simple mais solide : relire le brief, isoler les signaux forts, identifier le bon niveau de detail, puis repartir la matiere dans un squelette de case study qui reste premium sans devenir rigide.`,
      `Cette etape permet de choisir ce qui doit etre dit tout de suite, ce qui merite une section dediee et ce qui doit plutot apparaitre comme preuve secondaire. C est ce tri qui donne ensuite au projet sa sensation de maitrise.`,
      stronger
        ? 'En version enrichie, le process insiste aussi sur la priorisation du rythme, la repartition des preuves et la facon dont chaque visuel soutient une idee plutot qu un simple remplissage.'
        : 'Le process garde aussi une place pour les ajustements manuels afin de rester utilisable en production, meme quand le projet doit encore evoluer apres generation.',
    ],
    technologies: [
      `La pile retenue repose ici sur ${context.tech.join(', ')}. Au lieu de lister ces technologies comme un inventaire, la page les rattache a leur role concret dans le projet : clarifier l interface, tenir le rythme, servir la narration ou stabiliser la mise en production.`,
      `Ce cadrage est important parce qu une stack n a de valeur dans un portfolio que si elle explique quelque chose du niveau d exigence. La section technique cherche donc moins a impressionner qu a rendre lisible la logique d implementation.`,
      `Dans ce projet, la technique soutient surtout ${context.focus}. Elle sert la tenue generale de la page, sa capacite a durer et la precision du rendu final.`,
    ],
    impact: [
      `L impact attendu se mesure d abord qualitativement : la page devient plus facile a lire, la promesse plus nette et la perception generale plus professionnelle. Ce gain de clarte est souvent ce qui fait la difference entre un projet simplement montre et un projet reellement compris.`,
      `Ensuite, la structure obtenue devient un outil reutilisable. Elle peut accueillir plus de visuels, plus de preuves, plus de sections ou un niveau de precision plus strategique sans devoir etre repensee integralement.`,
      `Enfin, le projet gagne en cohesion. Design, contenu, technique et narration avancent dans le meme sens, ce qui renforce la sensation de maturite du livrable final.`,
    ],
    conclusion: [
      `Cette conclusion ne cherche pas a redire tout le projet. Elle sert plutot a rappeler ce qui rend la page utile a long terme : une structure claire, des sections solides, un ton ajustable et une base assez souple pour accueillir des retouches manuelles sans casser la coherence generale.`,
      `Dans un portfolio haut de gamme, ce type de sortie compte autant que le rendu visuel. Il montre non seulement ce qui a ete produit, mais aussi comment la pensee a ete organisee pour rendre le projet convaincant, robuste et presentable.`,
      stronger
        ? 'La version amelioree renforce encore cette fermeture en explicitant le niveau de discernement, de priorisation et de narration qui soutient le resultat final.'
        : 'La page obtenue est donc deja exploitable telle quelle, puis ameliorable ensuite section par section selon le niveau de detail souhaite.',
    ],
  }

  return sectionMap[sectionKey] || []
}

function buildEditableSections(context, mode = 'base') {
  return {
    introduction: buildSectionParagraphs('introduction', context, mode).map((entry) => ensureSentence(entry)).join('\n\n'),
    problem: buildSectionParagraphs('problem', context, mode).map((entry) => ensureSentence(entry)).join('\n\n'),
    solution: buildSectionParagraphs('solution', context, mode).map((entry) => ensureSentence(entry)).join('\n\n'),
    process: buildSectionParagraphs('process', context, mode).map((entry) => ensureSentence(entry)).join('\n\n'),
    technologies: buildSectionParagraphs('technologies', context, mode).map((entry) => ensureSentence(entry)).join('\n\n'),
    impact: buildSectionParagraphs('impact', context, mode).map((entry) => ensureSentence(entry)).join('\n\n'),
    conclusion: buildSectionParagraphs('conclusion', context, mode).map((entry) => ensureSentence(entry)).join('\n\n'),
  }
}

function buildImageDescriptor(context, index) {
  const descriptors = [
    `hero principal de la ${context.profile.label.toLowerCase()}`,
    'mise en page detaillee de la solution retenue',
    'vue de la structure et des blocs de narration',
    'ecran de detail montrant la finesse du systeme visuel',
  ]

  return pickVariant(descriptors, index)
}

export function generateImageMetadataFromDraft(images = [], draft = {}) {
  const title = cleanText(draft.title) || 'projet portfolio'
  const category = cleanText(draft.category).toLowerCase() || 'projet digital'

  return images
    .map((entry, index) => {
      const url = typeof entry === 'string' ? cleanText(entry) : cleanText(entry?.url)

      if (!url) {
        return null
      }

      const descriptor = buildImageDescriptor({ profile: { label: category || 'projet digital' } }, index)
      const existingAlt = cleanText(entry?.alt)
      const existingCaption = cleanText(entry?.caption)

      return {
        url,
        alt: existingAlt || `Capture ${index + 1} du projet ${title}, ${descriptor}`,
        caption: existingCaption || `${title} - ${toTitleCase(descriptor)}`,
      }
    })
    .filter(Boolean)
}

function buildCaseStudyFromDraft(draft) {
  const imageDetails = generateImageMetadataFromDraft(draft.imageDetails || draft.images || [], draft)
  const paragraphsFrom = (value) => splitParagraphs(value).map((entry) => ensureSentence(entry))
  const solutionGallery = imageDetails.slice(0, 3).map((entry) => ({
    image: entry.url,
    caption: entry.caption,
    alt: entry.alt,
  }))

  return {
    intro: {
      before: 'Cette etude de cas part d un brief court mais suffisamment riche pour construire une page detaillee, lisible et credible.',
      highlight: draft.statement,
      after: 'La suite deroule les choix, les contraintes et les effets attendus sur la perception finale du projet.',
    },
    sections: [
      {
        number: '01',
        label: 'Introduction',
        title: 'Installer le cadre, le niveau d ambition et le point de depart.',
        paragraphs: paragraphsFrom(draft.sections.introduction),
        media: solutionGallery[0]
          ? {
              eyebrow: 'Ouverture',
              image: solutionGallery[0].image,
              caption: solutionGallery[0].caption,
              alt: solutionGallery[0].alt,
            }
          : undefined,
      },
      {
        number: '02',
        label: 'Probleme',
        title: 'Comprendre ce qui empechait le projet de paraitre vraiment convaincant.',
        question: 'Comment faire ressentir la valeur du projet tout en gardant une lecture dense, professionnelle et fluide ?',
        paragraphs: paragraphsFrom(draft.sections.problem),
      },
      {
        number: '03',
        label: 'Solution',
        title: 'Une reponse structuree pour clarifier la promesse et la tenir jusqu au bout.',
        paragraphs: paragraphsFrom(draft.sections.solution),
        interventions: draft.results.slice(0, 3).map((entry, index) => ({
          code: `AXE ${String(index + 1).padStart(2, '0')}`,
          title: entry,
          body: `Cet axe cristallise une decision visible dans la page et rappelle ce que la solution devait rendre immediatement comprenable.` ,
        })),
      },
      {
        number: '04',
        label: 'Process',
        title: 'La methode utilisee pour passer du brief a une case study exploitable.',
        paragraphs: paragraphsFrom(draft.sections.process),
        solutionGallery,
      },
      {
        number: '05',
        label: 'Technologies',
        title: 'Une pile technique choisie pour soutenir le rendu, pas pour l encombrer.',
        paragraphs: paragraphsFrom(draft.sections.technologies),
        workstreams: draft.tech.slice(0, 4).map((entry) => ({
          title: entry,
          body: `${entry} intervient ici comme un levier concret pour tenir le niveau de finition, la lisibilite et la capacite du projet a evoluer proprement.`,
        })),
      },
      {
        number: '06',
        label: 'Impact',
        title: 'Ce que la nouvelle structure change dans la perception et dans l usage.',
        paragraphs: paragraphsFrom(draft.sections.impact),
        metrics: draft.metrics,
      },
      {
        number: '07',
        label: 'Conclusion',
        title: 'Une base premium deja exploitable, mais encore facile a enrichir.',
        paragraphs: paragraphsFrom(draft.sections.conclusion),
        next: draft.results.slice(0, 3).map((entry, index) => ({
          number: String(index + 1).padStart(2, '0'),
          title: entry,
          body: 'Ce point peut etre densifie ensuite avec plus de captures, plus de preuves ou un niveau de precision plus strategique selon la suite du projet.',
        })),
      },
    ],
  }
}

function buildContext(brief, options = {}) {
  const briefText = cleanText(brief)
  const tech = unique(options.tech?.length ? options.tech : detectTechnologies(briefText))
  const categoryKey = options.categoryKey || detectCategoryKey(briefText)
  const profile = CATEGORY_PROFILES[categoryKey] || CATEGORY_PROFILES.webapp
  const style = options.style || detectStyle(briefText)
  const focus = options.focus || buildFocus({ categoryKey, profile, tech })
  const difficulty = options.difficulty || estimateDifficultyLevel(briefText, tech, categoryKey)
  const estimatedDuration = options.estimatedDuration || estimateDuration(difficulty)

  return {
    brief: briefText,
    briefSummary: firstSentence(briefText) || briefText || 'Brief projet a densifier dans le studio prive',
    tech,
    categoryKey,
    profile,
    style,
    focus,
    difficulty,
    estimatedDuration,
    variant: Number.isFinite(options.variant) ? options.variant : 0,
    projectName: options.projectName || extractProjectName(briefText),
  }
}

export async function generateProjectDraftFromBrief(brief, options = {}) {
  const context = buildContext(brief, options)
  const title = cleanText(options.title) || buildProjectTitle(context)
  const statement = cleanText(options.statement) || pickVariant(context.profile.statementTemplates, context.variant)
  const shortDescription = cleanText(options.shortDescription) || buildShortDescription(context)
  const fullDescription = cleanText(options.fullDescription) || buildFullDescription({ ...context, title, statement })
  const role = cleanText(options.role) || buildRole(context)
  const tags = unique(options.tags?.length ? options.tags : buildTags(context))
  const results = unique(options.results?.length ? options.results : buildResults(context))
  const metrics = Array.isArray(options.metrics) && options.metrics.length ? options.metrics : buildMetrics(results)
  const keywords = unique(options.keywords?.length ? options.keywords : buildKeywords(context))
  const sections = buildEditableSections({ ...context, title, statement }, options.improved ? 'improved' : 'base')
  const imageDetails = generateImageMetadataFromDraft(options.imageDetails || options.images || [], {
    title,
    category: context.profile.label,
  })

  const draft = {
    brief: context.brief,
    title,
    id: createProjectSlug(options.slug || title),
    shortDescription,
    description: shortDescription,
    fullDescription,
    statement,
    role,
    year: cleanText(options.year) || String(new Date().getFullYear()),
    accent: normalizeAccent(options.accent || context.profile.accent),
    link: cleanText(options.link),
    tags,
    tech: context.tech,
    category: context.profile.label,
    estimatedDuration: context.estimatedDuration,
    difficulty: context.difficulty,
    results,
    metrics,
    metaTitle: cleanText(options.metaTitle) || buildMetaTitle(title, context),
    metaDescription: cleanText(options.metaDescription) || buildMetaDescription(title, context, shortDescription),
    keywords,
    imageDetails,
    sections,
  }

  draft.caseStudy = buildCaseStudyFromDraft(draft)

  await wait(320)
  return draft
}

export async function improveGeneratedSection(sectionKey, draft, options = {}) {
  const context = buildContext(draft?.brief || '', {
    tech: draft?.tech || [],
    categoryKey: detectCategoryKey(draft?.category || draft?.brief || ''),
    difficulty: draft?.difficulty,
    estimatedDuration: draft?.estimatedDuration,
    variant: Number.isFinite(options.variant) ? options.variant : 1,
    projectName: extractProjectName(draft?.title || ''),
  })

  const sections = buildEditableSections({
    ...context,
    title: cleanText(draft?.title),
    statement: cleanText(draft?.statement),
  }, 'improved')

  await wait(220)
  return cleanText(sections[sectionKey]) ? sections[sectionKey] : ''
}

export function buildGeneratedCaseStudyFromDraft(draft) {
  return buildCaseStudyFromDraft(draft)
}