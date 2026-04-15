<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
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
      <div class="project-hero__meta" data-page-intro>
        <p>{{ project.year }}</p>
        <p>{{ project.role }}</p>
      </div>

      <div class="project-hero__content">
        <p class="section-tag" data-project-intro>Détail du projet</p>
        <h1 ref="title" class="project-hero__title">{{ project.title }}</h1>
        <p class="project-hero__statement" data-project-intro>{{ project.statement }}</p>

        <div class="project-hero__actions" data-project-intro>
          <MagneticLink v-if="project.link" class="button button--primary" :href="project.link" external cursor="Ouvrir">
            Voir le site en ligne
          </MagneticLink>
          <MagneticLink class="button button--secondary" :to="{ path: '/', hash: '#projects' }" cursor="Retour">
            Retour aux projets
          </MagneticLink>
        </div>
      </div>
    </section>

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
            <span class="project-summary__label">Ce qui l'a façonné</span>
            <ul class="project-summary__results">
              <li v-for="item in project.results" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <ProjectGallery :images="project.images" :title="project.title" />

    <section class="related-projects page-block">
      <div class="section-heading">
        <p class="section-tag">Continuer l'exploration</p>
        <div>
          <h2>D'autres études de cas chargées dynamiquement.</h2>
          <p>
            La même structure pilotée par les données alimente chaque route projet et rend le portfolio facile à faire évoluer dans le temps.
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
  </main>

  <main v-else class="page page--not-found">
    <section class="not-found page-block" data-page-intro>
      <p class="section-tag">Projet introuvable</p>
      <h1>La route existe, mais cette étude de cas n'existe pas.</h1>
      <p>
        Ajoutez le projet à la source de données commune et la page détail apparaîtra automatiquement.
      </p>
      <MagneticLink class="button button--primary" to="/" cursor="Accueil">
        Retour à l'accueil
      </MagneticLink>
    </section>
  </main>
</template>