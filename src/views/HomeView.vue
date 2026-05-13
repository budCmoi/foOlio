<script setup>
import { computed, onMounted, ref } from 'vue'
import AboutSection from '@/components/AboutSection.vue'
import ContactPanel from '@/components/ContactPanel.vue'
import HeroSection from '@/components/HeroSection.vue'
import HorizontalShowcase from '@/components/HorizontalShowcase.vue'
import ProjectCard from '@/components/ProjectCard.vue'
import { siteProfile } from '@/data/projects'
import { createRevealTrigger, gsap, useGSAPContext } from '@/composables/useGSAP'
import { useProjects } from '@/composables/useProjects'

const root = ref(null)
const { add } = useGSAPContext(root)
const { projects, projectsHydrated } = useProjects()
const hasProjects = computed(() => projects.value.length > 0)
const showEmptyProjectsState = computed(() => projectsHydrated.value && !hasProjects.value)

onMounted(() => {
  add(() => {
    const workList = root.value?.querySelector('.projects')
    const workListTargets = Array.from(workList?.children || [])
    const workEmpty = root.value?.querySelector('.work-empty')
    const workEmptyTargets = Array.from(workEmpty?.children || [])

    gsap.from('.work-section .s-header > *', {
      autoAlpha: 0,
      duration: 0.3,
      ease: 'power2.out',
      scrollTrigger: createRevealTrigger('.work-section .s-header'),
    })

    if (workListTargets.length) {
      gsap.from(workListTargets, {
        autoAlpha: 0,
        duration: 0.4,
        ease: 'power2.out',
        scrollTrigger: createRevealTrigger(workList, { start: 'top 80%' }),
      })
    }

    if (workEmptyTargets.length) {
      gsap.from(workEmptyTargets, {
        autoAlpha: 0,
        duration: 0.3,
        ease: 'power2.out',
        scrollTrigger: createRevealTrigger(workEmpty, { start: 'top 82%' }),
      })
    }
  })
})
</script>

<template>
  <main ref="root" class="page page--home">
    <HeroSection />
    <HorizontalShowcase />

    <section id="work" class="work-section page-block" data-page-intro>
      <div class="s-header">
        <div>
          <p class="s-label">Projets choisis</p>
          <h2 class="s-title"><span class="tl"><span>Work</span></span></h2>
        </div>
      </div>

      <p class="work-section__intro">{{ siteProfile.workIntro }}</p>

      <div v-if="hasProjects" class="projects">
        <ProjectCard
          v-for="(project, index) in projects"
          :key="project.id"
          :project="project"
          :index="index"
        />
      </div>

      <div v-else-if="showEmptyProjectsState" class="work-empty">
        <p class="work-empty__eyebrow">Collection publique</p>
        <h3>Aucun projet publie</h3>
        <p>Les projets apparaitront ici une fois publies depuis le studio prive.</p>
      </div>
    </section>

    <AboutSection />
    <ContactPanel />
  </main>
</template>