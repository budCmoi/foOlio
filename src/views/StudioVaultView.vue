<script setup>
import { computed, ref } from 'vue'
import MagneticLink from '@/components/MagneticLink.vue'
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

const { customProjects } = useProjects()

const form = ref(createEmptyForm())
const imageUrl = ref('')
const editingProjectId = ref('')
const feedback = ref({ type: '', text: '' })

const isEditing = computed(() => Boolean(editingProjectId.value))
const suggestedSlug = computed(() => createProjectSlug(form.value.id || form.value.title))

function showFeedback(type, text) {
  feedback.value = { type, text }
}

function resetForm() {
  form.value = createEmptyForm()
  imageUrl.value = ''
  editingProjectId.value = ''
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

function submitForm() {
  try {
    const payload = buildPayload()
    const project = isEditing.value
      ? updateCustomProject(editingProjectId.value, payload)
      : addCustomProject(payload)

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

function deleteProject(project) {
  const confirmed = window.confirm(`Supprimer ${project.title} du navigateur ?`)

  if (!confirmed) {
    return
  }

  removeCustomProject(project.id)

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
    const importedProjects = importCustomProjects(json)
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
          <h1>Ajouter un projet depuis une interface cachee, sans toucher au code.</h1>
          <p>
            Cette page n'apparait nulle part dans la navigation publique. Chaque projet ajoute ici s'affiche ensuite sur l'accueil,
            possede sa propre page detail et la galerie continue naturellement aussi longtemps qu'il y a des images a faire defiler.
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
          <p class="section-tag">Formulaire</p>
          <div>
            <h2>{{ isEditing ? 'Modifier un projet personnalise' : 'Ajouter un nouveau projet' }}</h2>
            <p>
              Renseigne tout ce que le visiteur voit deja sur une page projet : titre, description, phrase d'accroche,
              technologies, resultats, images et lien live si tu veux l'afficher.
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
              <input v-model.trim="form.role" type="text" placeholder="Direction creative / Motion frontend" required />
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
              <p>Ajoute autant d'images que tu veux. La page detail continuera a s'etendre automatiquement.</p>
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
            <button class="button button--primary" type="submit">
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
          <h2>Projets personnalisés</h2>
        </div>

        <div v-if="customProjects.length" class="studio-project-list">
          <article v-for="project in customProjects" :key="project.id" class="studio-project-item">
            <div class="studio-project-item__copy">
              <span>{{ project.year }} · {{ project.images.length }} image(s)</span>
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

        <p v-else class="studio-empty">
          Quand tu ajoutes ton premier projet ici, il apparaitra automatiquement sur la page d'accueil et dans son URL detail.
        </p>

        <div class="studio-sidebar__footer">
          <p class="studio-sidebar__eyebrow">foOlio / Footer</p>
          <strong>{{ siteProfile.name }}</strong>
          <p>{{ siteProfile.role }} · {{ siteProfile.location }}</p>
          <a href="mailto:hello@foolio.dev">hello@foolio.dev</a>
          <span>© {{ currentYear }} foOlio</span>
        </div>
      </aside>
    </section>
  </main>
</template>