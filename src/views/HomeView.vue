<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ContactPanel from '@/components/ContactPanel.vue'
import HeroSection from '@/components/HeroSection.vue'
import HorizontalShowcase from '@/components/HorizontalShowcase.vue'
import MagneticLink from '@/components/MagneticLink.vue'
import ProjectCard from '@/components/ProjectCard.vue'
import { createRevealTrigger, gsap, splitReveal, useGSAPContext } from '@/composables/useGSAP'
import { useProjects } from '@/composables/useProjects'

const root = ref(null)
const manifestTitle = ref(null)
const { add } = useGSAPContext(root)
const cleanups = []
const { projects } = useProjects()
const hasProjects = computed(() => projects.value.length > 0)
const featuredProject = computed(() => projects.value[0] ?? null)
const projectsSectionTag = computed(() => (hasProjects.value ? 'Cas réels' : 'Sélection confidentielle'))
const projectsSectionTitle = computed(() => (hasProjects.value
  ? 'Des solutions pilotées par la donnée, pensées pour évoluer sans friction.'
  : 'Une sélection réelle, publiée seulement quand elle mérite de l’être.'))
const projectsSectionLead = computed(() => (hasProjects.value
  ? 'J\'aime les bases où contenu, studio interne, automatisation et IA sont prévus dès le départ, pas greffés plus tard à la va-vite.'
  : 'Le site est prêt à publier chaque mission depuis le studio privé. En attendant, les références et démonstrations se partagent au bon moment, selon le contexte.'))

const manifestCards = [
  {
    index: '01',
    title: 'Transformer un besoin en solution claire',
    text: 'Je pars d\'un problème concret et je construis une réponse lisible, rapide et robuste côté interface comme côté usage.',
  },
  {
    index: '02',
    title: 'Assembler une stack qui tient',
    text: 'Frontend, backend, routes, données, admin, synchro et déploiement avancent ensemble pour produire quelque chose de fiable.',
  },
  {
    index: '03',
    title: 'IA partout dans la chaîne',
    text: 'Recherche, génération, automatisation, outils internes, contenu, QA et assistance : l\'IA fait partie de l\'architecture, pas d\'un module isolé.',
  },
]

onMounted(() => {
  add(() => {
    const intro = gsap.timeline({
      scrollTrigger: createRevealTrigger('.manifest'),
    })

    cleanups.push(splitReveal(manifestTitle.value, intro, { position: 0 }))

    intro.from('.manifest__copy > *', {
      y: 28,
      autoAlpha: 0,
      stagger: 0.08,
      duration: 0.72,
      ease: 'power3.out',
    }, 0.12)

    gsap.from('.manifest__card', {
      y: 42,
      autoAlpha: 0,
      stagger: 0.1,
      duration: 0.78,
      ease: 'power3.out',
      scrollTrigger: createRevealTrigger('.manifest__grid'),
    })

    gsap.from('.projects-section .section-heading, .projects-grid > *, .projects-section__empty', {
      y: 46,
      autoAlpha: 0,
      stagger: 0.09,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: createRevealTrigger('.projects-section'),
    })
  })
})

onBeforeUnmount(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup?.())
})
</script>

<template>
  <main ref="root" class="page page--home">
    <HeroSection />

    <section class="manifest page-block" data-page-intro>
      <div class="manifest__copy">
        <p class="section-tag">Approche</p>
        <h2 ref="manifestTitle">Je transforme une ambition, un besoin métier ou une idée brute en solution nette, performante et prête à monter en charge.</h2>
        <p>
          Direction produit, architecture, interface, data et orchestration IA : chaque couche est pensée ensemble pour éviter les rustines et garder une exécution haut de gamme.
        </p>
      </div>

      <div class="manifest__grid">
        <article v-for="card in manifestCards" :key="card.index" class="manifest__card">
          <span>{{ card.index }}</span>
          <h3>{{ card.title }}</h3>
          <p>{{ card.text }}</p>
        </article>
      </div>
    </section>

    <HorizontalShowcase />

    <section id="projects" class="projects-section page-block" data-page-intro>
      <div class="section-heading projects-section__heading" :class="{ 'projects-section__heading--solo': !featuredProject }">
        <div class="projects-section__intro">
          <p class="section-tag">{{ projectsSectionTag }}</p>
          <h2>{{ projectsSectionTitle }}</h2>
          <p>{{ projectsSectionLead }}</p>
        </div>

        <article
          v-if="featuredProject"
          class="projects-section__spotlight"
          :style="{ '--spotlight-accent': featuredProject.accent }"
        >
          <div class="projects-section__spotlight-frame">
            <img
              :src="featuredProject.images[0]"
              :alt="featuredProject.title"
              loading="lazy"
              decoding="async"
            />
            <span class="projects-section__spotlight-year">{{ featuredProject.year }}</span>
          </div>

          <div class="projects-section__spotlight-copy">
            <span class="projects-section__spotlight-label">Cas publié</span>
            <strong>{{ featuredProject.title }}</strong>
            <p>{{ featuredProject.statement }}</p>

            <ul class="projects-section__spotlight-tags">
              <li v-for="item in featuredProject.tech.slice(0, 3)" :key="item">{{ item }}</li>
            </ul>
          </div>
        </article>
      </div>

      <div v-if="hasProjects" class="projects-grid">
        <ProjectCard
          v-for="(project, index) in projects"
          :key="project.id"
          :project="project"
          :index="index"
        />
      </div>

      <article v-else class="projects-section__empty">
        <span class="projects-section__empty-label">Publication en cours</span>
        <h3>La prochaine publication sera un cas réel.</h3>
        <p>
          Chaque intervention peut maintenant être mise en ligne proprement, sans contenu de remplissage, dès qu\'elle doit devenir publique.
        </p>
        <div class="projects-section__empty-actions">
          <MagneticLink class="button button--primary" :to="{ path: '/', hash: '#contact' }" cursor="Contact">
            Discuter de votre projet
          </MagneticLink>
          <MagneticLink class="button button--ghost" :to="{ path: '/', hash: '#process' }" cursor="Approche">
            Voir l'approche
          </MagneticLink>
        </div>
      </article>
    </section>

    <ContactPanel />
  </main>
</template>