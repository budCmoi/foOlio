<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ContactPanel from '@/components/ContactPanel.vue'
import HeroSection from '@/components/HeroSection.vue'
import HorizontalShowcase from '@/components/HorizontalShowcase.vue'
import ProjectCard from '@/components/ProjectCard.vue'
import { createRevealTrigger, gsap, splitReveal, useGSAPContext } from '@/composables/useGSAP'
import { useProjects } from '@/composables/useProjects'

const root = ref(null)
const manifestTitle = ref(null)
const { add } = useGSAPContext(root)
const cleanups = []
const { projects } = useProjects()
const featuredProject = computed(() => projects.value[0] ?? null)

const manifestCards = [
  {
    index: '01',
    title: 'Frontend net, pensé pour durer',
    text: 'Je construis des interfaces lisibles, rapides et maintenables, avec une attention forte aux états, aux transitions et à la qualité d\'intégration.',
  },
  {
    index: '02',
    title: 'Produit full-stack cohérent',
    text: 'Le frontend, la donnée, les routes et l\'admin doivent évoluer ensemble. J\'aime les systèmes simples à relire, rapides à faire bouger et faciles à faire grandir.',
  },
  {
    index: '03',
    title: 'IA utile, cadrée par le produit',
    text: 'J\'ajoute de l\'automatisation, de la génération ou de l\'assistance IA quand cela réduit vraiment la friction côté équipe ou côté utilisateur.',
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

    gsap.from('.projects-section .section-heading, .projects-grid > *', {
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
        <h2 ref="manifestTitle">Je construis des produits web où l'interface, la donnée et l'IA travaillent comme un seul système.</h2>
        <p>
          Mon terrain de jeu : apps Vue, interfaces d\'admin, expériences produit premium, synchro Firebase et automatisations IA qui servent le business au lieu d\'ajouter du bruit.
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
      <div class="section-heading projects-section__heading">
        <div class="projects-section__intro">
          <p class="section-tag">Sélection</p>
          <h2>Des produits pilotés par la donnée, conçus pour évoluer sans se casser.</h2>
          <p>
            J\'aime les bases qui restent propres quand le contenu change, qu\'un studio interne apparaît ou qu\'une couche IA doit se brancher plus tard sans tout réécrire.
          </p>
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
            <span class="projects-section__spotlight-label">Projet en focus</span>
            <strong>{{ featuredProject.title }}</strong>
            <p>{{ featuredProject.statement }}</p>

            <ul class="projects-section__spotlight-tags">
              <li v-for="item in featuredProject.tech.slice(0, 3)" :key="item">{{ item }}</li>
            </ul>
          </div>
        </article>
      </div>

      <div class="projects-grid">
        <ProjectCard
          v-for="(project, index) in projects"
          :key="project.id"
          :project="project"
          :index="index"
        />
      </div>
    </section>

    <ContactPanel />
  </main>
</template>