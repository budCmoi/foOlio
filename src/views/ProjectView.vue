<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import MagneticLink from '@/components/MagneticLink.vue'
import ProjectCard from '@/components/ProjectCard.vue'
import ProjectGallery from '@/components/ProjectGallery.vue'
import { createRevealTrigger, gsap, splitReveal, useGSAPContext } from '@/composables/useGSAP'
import { scrollToTarget } from '@/composables/useLenis'
import { useProjectLookup } from '@/composables/useProjectLookup'

const route = useRoute()
const root = ref(null)
const title = ref(null)
const { add } = useGSAPContext(root)
const cleanups = []

const projectId = computed(() => route.params.id)
const { project, relatedProjects } = useProjectLookup(projectId)
const caseStudy = computed(() => project.value?.caseStudy ?? null)
const hasCaseStudy = computed(() => Boolean(caseStudy.value))
const nextProject = computed(() => relatedProjects.value[0] ?? null)
const projectType = computed(() => {
  if (!project.value) {
    return 'Etude de cas'
  }

  const source = Array.isArray(project.value.tags) && project.value.tags.length
    ? project.value.tags
    : project.value.tech.slice(0, 2)

  return source.join(' · ')
})
const projectFacts = computed(() => {
  if (!project.value) {
    return []
  }

  return [
    { label: 'Client', value: project.value.client || project.value.title },
    { label: 'Annee', value: project.value.year || 'En cours' },
    { label: 'Type', value: projectType.value || 'Etude de cas' },
    { label: 'Role', value: project.value.role },
  ]
})
const projectMetrics = computed(() => {
  if (!project.value) {
    return []
  }

  if (Array.isArray(project.value.metrics) && project.value.metrics.length) {
    return project.value.metrics.slice(0, 2)
  }

  return project.value.results.slice(0, 2).map((item, index) => ({
    value: String(index + 1).padStart(2, '0'),
    label: item,
  }))
})

function scrollToCaseStudy() {
  scrollToTarget('#case-study-start', { offset: -96, force: true })
}

watch(projectId, () => {
  scrollToTarget(0, { immediate: true, force: true })
}, { immediate: true })

onMounted(() => {
  add(() => {
    if (!project.value) {
      return
    }

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
    cleanups.push(splitReveal(title.value, intro, { position: 0 }))

    intro.from('[data-project-intro]', {
      y: 24,
      autoAlpha: 0,
      stagger: 0.06,
      duration: 0.75,
    }, 0.14)

    if (hasCaseStudy.value) {
      gsap.utils.toArray('.project-case-intro, .case-study-section, .project-next').forEach((block) => {
        const targets = block.querySelectorAll('[data-case-reveal]')

        if (!targets.length) {
          return
        }

        gsap.from(targets, {
          y: 40,
          autoAlpha: 0,
          stagger: 0.07,
          duration: 0.76,
          ease: 'power3.out',
          scrollTrigger: createRevealTrigger(block, { start: 'top 80%' }),
        })
      })

      return
    }

    gsap.from('.project-summary__panel', {
      y: 46,
      autoAlpha: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: createRevealTrigger('.project-summary'),
    })

    gsap.from('.related-projects .section-heading, .related-projects .projects-grid > *', {
      y: 44,
      autoAlpha: 0,
      stagger: 0.08,
      duration: 0.78,
      ease: 'power3.out',
      scrollTrigger: createRevealTrigger('.related-projects'),
    })
  })
})

onBeforeUnmount(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup?.())
})
</script>

<template>
  <main v-if="project" ref="root" class="page page--project">
    <section class="project-hero page-block">
      <div class="project-hero__shell">
        <div class="project-hero__content">
          <p class="section-tag" data-project-intro>Etude de cas</p>
          <h1 ref="title" class="project-hero__title">{{ project.title }}</h1>

          <div class="project-hero__facts" data-project-intro>
            <div v-for="fact in projectFacts" :key="fact.label" class="project-fact">
              <span class="project-fact__label">{{ fact.label }}</span>
              <strong>{{ fact.value }}</strong>
            </div>
          </div>

          <p class="project-hero__statement" data-project-intro>{{ project.statement }}</p>

          <div class="project-hero__actions" data-project-intro>
            <MagneticLink v-if="project.link" class="button button--primary" :href="project.link" external cursor="Ouvrir">
              Voir le site
            </MagneticLink>
            <MagneticLink class="button button--ghost" :to="{ path: '/', hash: '#work' }" cursor="Retour">
              Retour aux projets
            </MagneticLink>
          </div>
        </div>

        <button v-if="hasCaseStudy" class="project-hero__scroll" type="button" data-project-intro data-cursor="Defiler" @click="scrollToCaseStudy">
          <span class="project-hero__scroll-line" aria-hidden="true"></span>
          <span>Scroll</span>
        </button>
      </div>
    </section>

    <template v-if="hasCaseStudy && caseStudy">
      <section id="case-study-start" class="project-case-intro page-block">
        <p class="project-case-intro__text" data-case-reveal>
          {{ caseStudy.intro.before }}
          <strong>{{ caseStudy.intro.highlight }}</strong>
          {{ caseStudy.intro.after }}
        </p>
      </section>

      <section
        v-for="section in caseStudy.sections"
        :key="`${section.number}-${section.label}`"
        class="case-study-section page-block"
      >
        <div class="case-study-section__rail">
          <p class="case-study-section__index" data-case-reveal>{{ section.number }} - {{ section.label }}</p>
        </div>

        <div class="case-study-section__body">
          <h2 data-case-reveal>{{ section.title }}</h2>

          <p v-if="section.question" class="case-study-section__question" data-case-reveal>
            {{ section.question }}
          </p>

          <div v-if="section.paragraphs && section.paragraphs.length" class="case-study-section__copy">
            <p v-for="paragraph in section.paragraphs" :key="paragraph" data-case-reveal>{{ paragraph }}</p>
          </div>

          <div v-if="section.insight" class="case-study-card case-study-callout" data-case-reveal>
            <p class="case-study-card__eyebrow">{{ section.insight.eyebrow }}</p>
            <p class="case-study-callout__title">{{ section.insight.title }}</p>

            <div class="case-study-signal-list">
              <div v-for="item in section.insight.items" :key="`${item.value}-${item.label}`" class="case-study-signal">
                <strong>{{ item.value }}</strong>
                <span>{{ item.label }}</span>
              </div>
            </div>

            <p class="case-study-card__note">{{ section.insight.note }}</p>
          </div>

          <div v-if="section.callout" class="case-study-card case-study-callout" data-case-reveal>
            <p class="case-study-card__eyebrow">{{ section.callout.eyebrow }}</p>
            <p class="case-study-callout__title">{{ section.callout.title }}</p>
            <p class="case-study-card__note">{{ section.callout.note }}</p>
          </div>

          <div v-if="section.workstreams && section.workstreams.length" class="case-study-workstreams">
            <article
              v-for="item in section.workstreams"
              :key="item.title"
              class="case-study-card case-study-workstream"
              data-case-reveal
            >
              <p class="case-study-card__eyebrow">Chantier</p>
              <h3>{{ item.title }}</h3>
              <p>{{ item.body }}</p>
            </article>
          </div>

          <figure v-if="section.media" class="case-study-figure" data-case-reveal>
            <div class="case-study-figure__frame">
              <img :src="section.media.image" :alt="section.media.alt || section.media.caption" loading="lazy" decoding="async" />
            </div>
            <figcaption>
              <span>{{ section.media.eyebrow }}</span>
              <span>{{ section.media.caption }}</span>
            </figcaption>
          </figure>

          <div v-if="section.explorations" class="case-study-block">
            <p class="case-study-card__eyebrow" data-case-reveal>{{ section.explorations.eyebrow }}</p>
            <p class="case-study-block__copy" data-case-reveal>{{ section.explorations.description }}</p>

            <ul class="case-study-chip-list" data-case-reveal>
              <li v-for="chip in section.explorations.chips" :key="chip">{{ chip }}</li>
            </ul>

            <div class="case-study-gallery-grid">
              <figure
                v-for="entry in section.explorations.gallery"
                :key="`${entry.image}-${entry.caption}`"
                class="case-study-figure"
                data-case-reveal
              >
                <div class="case-study-figure__frame">
                  <img :src="entry.image" :alt="entry.alt || entry.caption" loading="lazy" decoding="async" />
                </div>
                <figcaption>{{ entry.caption }}</figcaption>
              </figure>
            </div>
          </div>

          <div v-if="section.solutionIntro && section.solutionIntro.length" class="case-study-section__copy">
            <p v-for="paragraph in section.solutionIntro" :key="paragraph" data-case-reveal>{{ paragraph }}</p>
          </div>

          <div v-if="section.interventions && section.interventions.length" class="case-study-number-grid">
            <article
              v-for="item in section.interventions"
              :key="item.code"
              class="case-study-card case-study-number-card"
              data-case-reveal
            >
              <div class="case-study-number-card__index">{{ item.code }}</div>
              <div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.body }}</p>
              </div>
            </article>
          </div>

          <div v-if="section.solutionGallery && section.solutionGallery.length" class="case-study-gallery-grid">
            <figure
              v-for="entry in section.solutionGallery"
              :key="`${entry.image}-${entry.caption}`"
              class="case-study-figure"
              data-case-reveal
            >
              <div class="case-study-figure__frame">
                <img :src="entry.image" :alt="entry.alt || entry.caption" loading="lazy" decoding="async" />
              </div>
              <figcaption>{{ entry.caption }}</figcaption>
            </figure>
          </div>

          <div v-if="section.resource" class="case-study-resource case-study-card" data-case-reveal>
            <div class="case-study-resource__copy">
              <p class="case-study-card__eyebrow">{{ section.resource.eyebrow }}</p>
              <h3>{{ section.resource.title }}</h3>
              <p>{{ section.resource.body }}</p>
              <MagneticLink class="button button--ghost" :href="section.resource.href" external cursor="Ouvrir">
                {{ section.resource.action }}
              </MagneticLink>
            </div>

            <figure class="case-study-figure">
              <div class="case-study-figure__frame">
                <img :src="section.resource.image" :alt="section.resource.caption" loading="lazy" decoding="async" />
              </div>
              <figcaption>{{ section.resource.caption }}</figcaption>
            </figure>
          </div>

          <div v-if="section.decisions && section.decisions.length" class="case-study-number-grid">
            <article
              v-for="item in section.decisions"
              :key="item.number"
              class="case-study-card case-study-number-card"
              data-case-reveal
            >
              <div class="case-study-number-card__index">{{ item.number }}</div>
              <div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.body }}</p>
              </div>
            </article>
          </div>

          <div v-if="section.sideStories && section.sideStories.length" class="case-study-side-stories">
            <article v-for="story in section.sideStories" :key="story.title" class="case-study-side-story">
              <div class="case-study-side-story__copy">
                <p class="case-study-card__eyebrow" data-case-reveal>{{ story.label }}</p>
                <h3 data-case-reveal>{{ story.title }}</h3>
                <p data-case-reveal>{{ story.description }}</p>
              </div>

              <div class="case-study-side-gallery">
                <figure
                  v-for="entry in story.gallery"
                  :key="`${entry.image}-${entry.caption}`"
                  class="case-study-figure"
                  data-case-reveal
                >
                  <div class="case-study-figure__frame">
                    <img :src="entry.image" :alt="entry.alt || entry.caption" loading="lazy" decoding="async" />
                  </div>
                  <figcaption>{{ entry.caption }}</figcaption>
                </figure>
              </div>
            </article>
          </div>

          <figure v-if="section.systemNote" class="case-study-system-note case-study-card" data-case-reveal>
            <div class="case-study-system-note__copy">
              <p class="case-study-card__eyebrow">{{ section.systemNote.label }}</p>
              <p>{{ section.systemNote.description }}</p>
            </div>
            <div class="case-study-figure__frame">
              <img :src="section.systemNote.image" :alt="section.systemNote.caption" loading="lazy" decoding="async" />
            </div>
            <figcaption>{{ section.systemNote.caption }}</figcaption>
          </figure>

          <div v-if="section.interactions" class="case-study-card" data-case-reveal>
            <p class="case-study-card__eyebrow">{{ section.interactions.label }}</p>
            <ul class="case-study-chip-list case-study-chip-list--quiet">
              <li v-for="item in section.interactions.items" :key="item">{{ item }}</li>
            </ul>
          </div>

          <div v-if="section.implementation && section.implementation.length" class="case-study-number-grid">
            <article
              v-for="item in section.implementation"
              :key="item.number"
              class="case-study-card case-study-number-card"
              data-case-reveal
            >
              <div class="case-study-number-card__index">{{ item.number }}</div>
              <div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.body }}</p>
              </div>
            </article>
          </div>

          <div v-if="section.metrics && section.metrics.length" class="case-study-metric-grid">
            <article v-for="item in section.metrics" :key="`${item.value}-${item.label}`" class="case-study-metric" data-case-reveal>
              <strong>{{ item.value }}</strong>
              <span>{{ item.label }}</span>
            </article>
          </div>

          <div v-if="section.lessons && section.lessons.length" class="case-study-number-grid">
            <article
              v-for="item in section.lessons"
              :key="item.number"
              class="case-study-card case-study-number-card"
              data-case-reveal
            >
              <div class="case-study-number-card__index">{{ item.number }}</div>
              <div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.body }}</p>
              </div>
            </article>
          </div>

          <div v-if="section.next && section.next.length" class="case-study-number-grid">
            <article
              v-for="item in section.next"
              :key="item.number"
              class="case-study-card case-study-number-card"
              data-case-reveal
            >
              <div class="case-study-number-card__index">{{ item.number }}</div>
              <div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.body }}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section v-if="nextProject" class="project-next page-block">
        <p class="section-tag" data-case-reveal>Projet suivant</p>

        <RouterLink class="project-next__card" :to="`/project/${nextProject.id}`" data-case-reveal>
          <div class="project-next__copy">
            <p class="project-next__status">A suivre</p>
            <h2>{{ nextProject.title }}</h2>
            <p>{{ nextProject.client }} / {{ nextProject.year }}</p>
          </div>

          <div class="project-next__media">
            <img v-if="nextProject.images.length" :src="nextProject.images[0]" :alt="nextProject.imageDetails?.[0]?.alt || nextProject.title" loading="lazy" decoding="async" />
            <div v-else class="project-media-placeholder" aria-hidden="true">
              <span>{{ nextProject.category || 'Projet digital' }}</span>
              <strong>{{ nextProject.title }}</strong>
            </div>
          </div>
        </RouterLink>
      </section>
    </template>

    <template v-else>
      <section class="project-summary page-block">
        <div class="project-summary__panel">
          <p class="project-summary__lead">{{ project.description }}</p>
          <div class="project-summary__columns">
            <div>
              <span class="project-summary__label">Stack technique</span>
              <ul class="project-summary__chips">
                <li v-for="item in project.tech" :key="item">{{ item }}</li>
              </ul>
            </div>

            <div>
              <span class="project-summary__label">Ce qui a guide le projet</span>
              <ul class="project-summary__results">
                <li v-for="item in project.results" :key="item">{{ item }}</li>
              </ul>
            </div>

            <div>
              <span class="project-summary__label">Impact</span>
              <ul class="project-summary__results project-summary__results--metrics">
                <li v-for="metric in projectMetrics" :key="`${metric.value}-${metric.label}`">
                  <strong>{{ metric.value }}</strong>
                  <span>{{ metric.label }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <ProjectGallery v-if="project.images.length" :images="project.images" :image-details="project.imageDetails || []" :title="project.title" />

      <section class="related-projects page-block">
        <div class="section-heading">
          <p class="section-tag">Continuer</p>
          <div>
            <h2>Autres projets.</h2>
            <p>
              La meme structure pilote chaque route projet et garde le portfolio simple a etendre dans le temps.
            </p>
          </div>
        </div>

        <div class="projects-grid projects-grid--compact">
          <ProjectCard
            v-for="(entry, index) in relatedProjects"
            :key="entry.id"
            :project="entry"
            :index="index"
          />
        </div>
      </section>
    </template>
  </main>

  <main v-else class="page page--not-found">
    <section class="not-found page-block" data-page-intro>
      <p class="section-tag">Projet introuvable</p>
      <h1>Cette etude de cas n'existe pas.</h1>
      <p>
        Ajoutez le projet dans la source de donnees partagee et la page detail apparaitra automatiquement.
      </p>
      <MagneticLink class="button button--primary" to="/" cursor="Accueil">
        Retour a l'accueil
      </MagneticLink>
    </section>
  </main>
</template>