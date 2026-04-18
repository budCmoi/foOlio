<script setup>
import { computed, ref } from 'vue'
import MagneticLink from '@/components/MagneticLink.vue'
import { siteProfile } from '@/data/projects'
import { generateProjectDraftFromSource } from '@/composables/useProjectDraftGenerator'
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

const currentYear = new Date().getFullYear()

function createEmptyForm() {
  return {
    title: '',
    id: '',
    description: '',
    statement: '',
    year: String(new Date().getFullYear()),
    role: '',
    accent: '#d7ff76',
    link: '',
    tech: '',
    results: '',
    images: [],
  }
}

function toMultiline(value = []) {
  return value.join('\n')
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error(`Impossible de lire ${file.name}.`))
    reader.readAsDataURL(file)
  })
}

const {
  customProjects,
  projectStorageError,
  projectStorageMode,
  projectStoragePending,
} = useProjects()

const form = ref(createEmptyForm())
const imageUrl = ref('')
const editingProjectId = ref('')
const feedback = ref({ type: '', text: '' })
const generationSource = ref('')
const isGeneratingDraft = ref(false)
const projectSearchQuery = ref('')

const isEditing = computed(() => Boolean(editingProjectId.value))
const suggestedSlug = computed(() => createProjectSlug(form.value.id || form.value.title))
const normalizedProjectSearchQuery = computed(() => projectSearchQuery.value.trim().toLowerCase())
const filteredProjects = computed(() => {
  const query = normalizedProjectSearchQuery.value

  if (!query) {
    return customProjects.value
  }

  return customProjects.value.filter((project) => {
    const haystack = [
      project.title,
      project.id,
      project.year,
      project.role,
      project.description,
      project.statement,
      project.link,
      ...project.tech,
      ...project.results,
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(query)
  })
})
const projectSearchSummary = computed(() => {
  const totalProjects = customProjects.value.length
  const visibleProjects = filteredProjects.value.length

  if (!totalProjects) {
    return 'Aucun projet personnalise pour l’instant.'
  }

  if (!normalizedProjectSearchQuery.value) {
    return `${totalProjects} projet(s) personnalise(s) disponible(s) dans le studio.`
  }

  return `${visibleProjects} resultat(s) sur ${totalProjects} projet(s).`
})
const storageStatusTone = computed(() => (projectStorageError.value ? 'is-error' : 'is-success'))
const storageStatusMessage = computed(() => {
  if (projectStorageError.value) {
    return `${projectStorageError.value} Les changements restent sauvegardés localement dans ce navigateur.`
  }

  if (projectStoragePending.value) {
    return 'Synchronisation Firebase en cours. Les projets personnalisés sont reliés à ta collection Firestore.'
  }

  if (projectStorageMode.value === 'firebase') {
    return 'Synchronisation Firebase active. Chaque ajout, modification ou suppression passe par ta collection Firestore projects.'
  }

  return 'Mode local actif. Les projets restent sauvegardés dans ce navigateur.'
})

function showFeedback(type, text) {
  feedback.value = { type, text }
}

function resetForm() {
  form.value = createEmptyForm()
  imageUrl.value = ''
  editingProjectId.value = ''
  generationSource.value = ''
  showFeedback('', '')
}

function projectToForm(project) {
  return {
    title: project.title,
    id: project.id,
    description: project.description,
    statement: project.statement,
    year: project.year,
    role: project.role,
    accent: project.accent,
    link: project.link,
    tech: toMultiline(project.tech),
    results: toMultiline(project.results),
    images: [...project.images],
  }
}

function editProject(project) {
  form.value = projectToForm(project)
  editingProjectId.value = project.id
  imageUrl.value = ''
  showFeedback('info', `Edition de ${project.title}.`)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function buildPayload() {
  return {
    ...form.value,
    id: form.value.id || suggestedSlug.value,
    tech: form.value.tech,
    results: form.value.results,
    images: form.value.images,
  }
}

function applyGeneratedDraft(draft) {
  form.value = {
    ...form.value,
    title: form.value.title || draft.title,
    description: draft.description || form.value.description,
    statement: draft.statement || form.value.statement,
    role: draft.role || form.value.role,
    link: form.value.link || draft.link,
    tech: draft.tech?.length ? toMultiline(draft.tech) : form.value.tech,
    results: draft.results?.length ? toMultiline(draft.results) : form.value.results,
  }
}

async function generateDraftFromSource() {
  const source = generationSource.value.trim() || form.value.link.trim()

  if (!source) {
    showFeedback('error', 'Ajoute un lien de site ou un repo GitHub public avant de lancer la generation.')
    return
  }

  isGeneratingDraft.value = true
  showFeedback('info', 'Analyse du lien en cours...')

  try {
    const draft = await generateProjectDraftFromSource(source)

    applyGeneratedDraft(draft)
    generationSource.value = source

    if (draft.sourceKind === 'github' && !draft.link) {
      showFeedback('success', 'Brouillon genere depuis GitHub. Ajoute seulement le lien live si le repo n expose pas de homepage et ajoute tes images manuellement.')
      return
    }

    if (draft.sourceKind === 'website' && !draft.tech.length) {
      showFeedback('success', 'Brouillon genere depuis le site. Verifie les technos manuellement si tu veux des tags plus precis.')
      return
    }

    showFeedback('success', 'Brouillon genere. Verifie les textes puis ajoute tes images avant d enregistrer.')
  }
  catch (error) {
    showFeedback('error', error instanceof Error ? error.message : 'Impossible de generer un brouillon depuis ce lien.')
  }
  finally {
    isGeneratingDraft.value = false
  }
}

async function submitForm() {
  try {
    const payload = buildPayload()
    const project = isEditing.value
      ? await updateCustomProject(editingProjectId.value, payload)
      : await addCustomProject(payload)

    resetForm()
    showFeedback(
      'success',
      `Projet enregistre. Il est maintenant visible sur le site et accessible sur /project/${project.id}.`,
    )
  }
  catch (error) {
    showFeedback('error', error instanceof Error ? error.message : 'Impossible d\'enregistrer le projet.')
  }
}

function addImageFromUrl() {
  const value = imageUrl.value.trim()

  if (!value) {
    return
  }

  form.value.images = [...form.value.images, value]
  imageUrl.value = ''
}

async function handleImageUpload(event) {
  const files = Array.from(event.target.files || [])

  if (!files.length) {
    return
  }

  try {
    const encodedFiles = await Promise.all(files.map((file) => readFileAsDataUrl(file)))
    form.value.images = [...form.value.images, ...encodedFiles]
    showFeedback('info', `${encodedFiles.length} image(s) ajoutee(s) au projet.`)
  }
  catch (error) {
    showFeedback('error', error instanceof Error ? error.message : 'Impossible d\'importer ces images.')
  }
  finally {
    event.target.value = ''
  }
}

function moveImage(index, direction) {
  const nextIndex = index + direction

  if (nextIndex < 0 || nextIndex >= form.value.images.length) {
    return
  }

  const images = [...form.value.images]
  const [image] = images.splice(index, 1)
  images.splice(nextIndex, 0, image)
  form.value.images = images
}

function removeImage(index) {
  form.value.images = form.value.images.filter((_, entryIndex) => entryIndex !== index)
}

async function deleteProject(project) {
  const confirmed = window.confirm(`Supprimer ${project.title} du studio ?`)

  if (!confirmed) {
    return
  }

  try {
    await removeCustomProject(project.id)
  }
  catch (error) {
    showFeedback('error', error instanceof Error ? error.message : 'Suppression impossible.')
    return
  }

  if (editingProjectId.value === project.id) {
    resetForm()
  }

  showFeedback('success', `${project.title} a ete supprime.`)
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
  anchor.download = 'foolio-projets-personnalises.json'
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
          <h1>Ajouter un projet depuis un studio prive, synchronise avec Firebase.</h1>
          <p>
            Cette page n'apparait nulle part dans la navigation publique. Chaque projet ajoute ici s'affiche ensuite sur l'accueil,
            possede sa propre page detail et reste synchronise via Firestore pour eviter de dependre uniquement du localStorage.
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

      <p class="studio-feedback" :class="storageStatusTone">
        {{ storageStatusMessage }}
      </p>
    </section>

    <section class="studio-grid page-block">
      <div class="studio-panel" data-page-intro>
        <div class="studio-panel__heading">
          <p class="section-tag">Formulaire</p>
          <div>
            <h2>{{ isEditing ? 'Modifier un projet personnalise' : 'Ajouter un nouveau projet' }}</h2>
            <p>
              Renseigne tout ce que le visiteur voit deja sur une page projet : titre, description, phrase d'accroche,
              technologies, resultats, images et lien live. Le contenu est ensuite synchronise dans Firebase.
            </p>
          </div>
        </div>

        <p v-if="feedback.text" class="studio-feedback" :class="`is-${feedback.type}`">
          {{ feedback.text }}
        </p>

        <form class="studio-form" @submit.prevent="submitForm">
          <div class="studio-form__grid">
            <label class="studio-field">
              <span>Titre</span>
              <input v-model.trim="form.title" type="text" placeholder="Nom du projet" required />
            </label>

            <label class="studio-field">
              <span>Identifiant / slug</span>
              <input v-model.trim="form.id" type="text" placeholder="laisse vide pour le generer automatiquement" />
              <small>Route generee : /project/{{ suggestedSlug || 'nouveau-projet' }}</small>
            </label>

            <label class="studio-field studio-field--full">
              <span>Description</span>
              <textarea v-model.trim="form.description" rows="4" placeholder="Resume du projet visible sur la carte et la page detail" required></textarea>
            </label>

            <label class="studio-field studio-field--full">
              <span>Phrase d'accroche</span>
              <textarea v-model.trim="form.statement" rows="3" placeholder="Texte hero de la page projet" required></textarea>
            </label>

            <label class="studio-field">
              <span>Annee</span>
              <input v-model.trim="form.year" type="text" placeholder="2026" />
            </label>

            <label class="studio-field">
              <span>Role</span>
              <input v-model.trim="form.role" type="text" placeholder="Full-stack / AI engineer" required />
            </label>

            <label class="studio-field">
              <span>Couleur accent</span>
              <div class="studio-color-field">
                <input v-model="form.accent" type="color" />
                <input v-model.trim="form.accent" type="text" placeholder="#d7ff76" />
              </div>
            </label>

            <label class="studio-field">
              <span>Lien live</span>
              <input v-model.trim="form.link" type="url" placeholder="https://..." />
              <small>Optionnel. Si tu le laisses vide, le bouton live disparaitra de la page projet.</small>
            </label>

            <div class="studio-field studio-field--full studio-field--generation">
              <span>Generation depuis un lien</span>
              <input
                v-model.trim="generationSource"
                type="url"
                placeholder="Colle un site live ou un repo GitHub public"
              />
              <small>
                Colle un lien live ou GitHub puis genere description, phrase d accroche, role et resultats. Avec GitHub,
                les technos sont aussi proposees. Les images restent manuelles.
              </small>
              <div class="studio-field__actions">
                <button
                  class="button button--secondary"
                  type="button"
                  :disabled="isGeneratingDraft || !(generationSource.trim() || form.link.trim())"
                  @click="generateDraftFromSource"
                >
                  {{ isGeneratingDraft ? 'Generation en cours...' : 'Generer un brouillon depuis ce lien' }}
                </button>
              </div>
            </div>

            <label class="studio-field studio-field--full">
              <span>Technologies</span>
              <textarea v-model="form.tech" rows="4" placeholder="Une technologie par ligne"></textarea>
            </label>

            <label class="studio-field studio-field--full">
              <span>Resultats / points cles</span>
              <textarea v-model="form.results" rows="4" placeholder="Un resultat par ligne"></textarea>
            </label>
          </div>

          <div class="studio-panel__heading studio-panel__heading--nested">
            <div>
              <h3>Images du projet</h3>
              <p>Ajoute autant d'images que tu veux. Quand Firebase est actif, les fichiers locaux sont envoyes dans Firebase Storage au moment de l'enregistrement.</p>
            </div>
          </div>

          <div class="studio-images__toolbar">
            <input v-model.trim="imageUrl" type="url" class="studio-images__url" placeholder="Coller l'URL d'une image" />
            <button class="button button--secondary" type="button" @click="addImageFromUrl">
              Ajouter l'URL
            </button>
            <label class="button button--ghost studio-upload">
              Importer des fichiers
              <input type="file" accept="image/*" multiple @change="handleImageUpload" />
            </label>
          </div>

          <div v-if="form.images.length" class="studio-image-list">
            <article v-for="(image, index) in form.images" :key="`${index}-${image.slice(0, 24)}`" class="studio-image-card">
              <div class="studio-image-card__preview">
                <img :src="image" :alt="`Image ${index + 1}`" />
              </div>

              <div class="studio-image-card__body">
                <span>Image {{ String(index + 1).padStart(2, '0') }}</span>
                <p>{{ image.startsWith('data:') ? 'Fichier local importe dans le navigateur' : image }}</p>
                <div class="studio-image-card__actions">
                  <button type="button" class="button button--ghost" @click="moveImage(index, -1)">Monter</button>
                  <button type="button" class="button button--ghost" @click="moveImage(index, 1)">Descendre</button>
                  <button type="button" class="button button--secondary" @click="removeImage(index)">Retirer</button>
                </div>
              </div>
            </article>
          </div>

          <p v-else class="studio-empty">
            Aucune image pour l'instant. Ajoute au moins une image pour activer la galerie du projet.
          </p>

          <div class="studio-form__actions">
            <button class="button button--primary" type="submit" :disabled="projectStoragePending">
              {{ isEditing ? 'Mettre a jour le projet' : 'Enregistrer le projet' }}
            </button>
            <button class="button button--ghost" type="button" @click="resetForm">
              {{ isEditing ? 'Annuler la modification' : 'Vider le formulaire' }}
            </button>
          </div>
        </form>
      </div>

      <aside class="studio-panel studio-panel--sidebar" data-page-intro>
        <div class="studio-panel__heading">
          <div>
            <h2>Choisir un projet existant</h2>
            <p>{{ projectSearchSummary }}</p>
          </div>
        </div>

        <div v-if="customProjects.length" class="studio-project-search">
          <input
            v-model="projectSearchQuery"
            type="search"
            class="studio-project-search__input"
            placeholder="Rechercher par titre, slug, annee, role ou techno"
          />
          <button
            v-if="projectSearchQuery"
            class="button button--ghost"
            type="button"
            @click="projectSearchQuery = ''"
          >
            Effacer
          </button>
        </div>

        <div v-if="filteredProjects.length" class="studio-project-list">
          <article
            v-for="project in filteredProjects"
            :key="project.id"
            class="studio-project-item"
            :class="{ 'is-editing': editingProjectId === project.id }"
          >
            <div class="studio-project-item__copy">
              <span>{{ project.year }} · {{ project.images.length }} image(s)</span>
              <strong v-if="editingProjectId === project.id" class="studio-project-item__state">Edition en cours</strong>
              <h3>{{ project.title }}</h3>
              <p>{{ project.description }}</p>
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

        <p v-else-if="customProjects.length" class="studio-empty">
          Aucun projet ne correspond a cette recherche. Essaie avec le titre, le slug, l annee, le role ou une techno.
        </p>

        <p v-else class="studio-empty">
          Quand tu ajoutes ton premier projet ici, il apparaitra automatiquement sur la page d'accueil et dans son URL detail.
        </p>

        <div class="studio-sidebar__footer">
          <p class="studio-sidebar__eyebrow">foOlio / Footer</p>
          <strong>{{ siteProfile.name }}</strong>
          <p>{{ siteProfile.role }} · {{ siteProfile.location }}</p>
          <a :href="`mailto:${siteProfile.email}`">{{ siteProfile.email }}</a>
          <span>© {{ currentYear }} foOlio</span>
        </div>
      </aside>
    </section>
  </main>
</template>