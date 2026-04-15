<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
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

const manifestCards = [
  {
    index: '01',
    title: 'Interfaces guidées par la narration',
    text: 'Je compose les layouts comme des séquences : révélation, contraste, pause et relâchement. La structure porte le récit avant même le mouvement.',
  },
  {
    index: '02',
    title: 'Architecture de cas évolutive',
    text: 'Les projets vivent dans la donnée, les routes restent dynamiques, et les sections s\'étendent sans imposer de refonte à chaque changement de contenu.',
  },
  {
    index: '03',
    title: 'Sensation premium sous contraintes',
    text: 'L\'interface reste nette sur les appareils tactiles en réduisant les effets lourds tout en conservant la typographie, la hiérarchie et le rythme.',
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
        <h2 ref="manifestTitle">Les interfaces haut de gamme paraissent fluides parce que chaque couche sait exactement pourquoi elle bouge.</h2>
        <p>
          Le travail se place à l\'intersection de la théâtralité de marque et d\'une ingénierie frontend propre : typographie expressive, rythme maîtrisé et systèmes de motion capables d\'absorber du vrai contenu.
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
      <div class="section-heading">
        <div>
          <h2>Des projets alimentés par un système de données évolutif.</h2>
          <p>
            Chaque carte est générée depuis une source commune, routée dynamiquement et prête à s'étendre sans toucher à la structure de la page.
          </p>
        </div>
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