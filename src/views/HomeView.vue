<script setup>
import { onMounted, ref } from 'vue'
import AboutSection from '@/components/AboutSection.vue'
import ContactPanel from '@/components/ContactPanel.vue'
import HeroSection from '@/components/HeroSection.vue'
import HorizontalShowcase from '@/components/HorizontalShowcase.vue'
import MagneticLink from '@/components/MagneticLink.vue'
import ProjectCard from '@/components/ProjectCard.vue'
import { siteProfile } from '@/data/projects'
import { createRevealTrigger, gsap, useGSAPContext } from '@/composables/useGSAP'
import { useProjects } from '@/composables/useProjects'

const root = ref(null)
const { add } = useGSAPContext(root)
const { projects } = useProjects()

onMounted(() => {
  add(() => {
    gsap.from('.work-section__heading > *', {
      y: 34,
      autoAlpha: 0,
      stagger: 0.08,
      duration: 0.72,
      ease: 'power3.out',
      scrollTrigger: createRevealTrigger('.work-section__heading'),
    })

    gsap.from('.work-list > *', {
      y: 62,
      autoAlpha: 0,
      stagger: 0.1,
      duration: 0.86,
      ease: 'power3.out',
      scrollTrigger: createRevealTrigger('.work-list', { start: 'top 78%' }),
    })

    gsap.from('.work-section__appendix > *', {
      y: 28,
      autoAlpha: 0,
      stagger: 0.08,
      duration: 0.62,
      ease: 'power3.out',
      scrollTrigger: createRevealTrigger('.work-section__appendix'),
    })
  })
})
</script>

<template>
  <main ref="root" class="page page--home">
    <HeroSection />
    <HorizontalShowcase />

    <section id="work" class="work-section page-block" data-page-intro>
      <div class="section-heading work-section__heading">
        <p class="section-tag">Projets choisis</p>

        <div>
          <h2>Projets</h2>
          <p>{{ siteProfile.workIntro }}</p>
        </div>
      </div>

      <div class="work-list">
        <ProjectCard
          v-for="(project, index) in projects"
          :key="project.id"
          :project="project"
          :index="index"
        />
      </div>

      <div class="work-section__appendix">
        <div>
          <p class="work-section__appendix-label">Vous voulez en voir plus ?</p>
          <p>{{ siteProfile.workAppendix }}</p>
        </div>

        <MagneticLink class="button button--ghost" :href="siteProfile.workCtaHref" cursor="Dossier">
          {{ siteProfile.workCtaLabel }}
        </MagneticLink>
      </div>
    </section>

    <AboutSection />
    <ContactPanel />
  </main>
</template>