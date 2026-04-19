<script setup>
import { computed, onMounted, ref } from 'vue'
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
const { projects, projectsHydrated } = useProjects()
const hasProjects = computed(() => projects.value.length > 0)
const showEmptyProjectsState = computed(() => projectsHydrated.value && !hasProjects.value)

onMounted(() => {
  add(() => {
    const workList = root.value?.querySelector('.work-list')
    const workListTargets = Array.from(workList?.children || [])
    const workEmpty = root.value?.querySelector('.work-empty')
    const workEmptyTargets = Array.from(workEmpty?.children || [])
    const workAppendix = root.value?.querySelector('.work-section__appendix')
    const workAppendixTargets = Array.from(workAppendix?.children || [])

    gsap.from('.work-section__heading > *', {
      y: 34,
      autoAlpha: 0,
      stagger: 0.08,
      duration: 0.72,
      ease: 'power3.out',
      scrollTrigger: createRevealTrigger('.work-section__heading'),
    })

    if (workListTargets.length) {
      gsap.from(workListTargets, {
        y: 62,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.86,
        ease: 'power3.out',
        scrollTrigger: createRevealTrigger(workList, { start: 'top 78%' }),
      })
    }

    if (workEmptyTargets.length) {
      gsap.from(workEmptyTargets, {
        y: 36,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 0.72,
        ease: 'power3.out',
        scrollTrigger: createRevealTrigger(workEmpty, { start: 'top 80%' }),
      })
    }

    if (workAppendixTargets.length) {
      gsap.from(workAppendixTargets, {
        y: 28,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 0.62,
        ease: 'power3.out',
        scrollTrigger: createRevealTrigger(workAppendix),
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
      <div class="section-heading work-section__heading">
        <p class="section-tag">Projets choisis</p>

        <div>
          <h2>Projets</h2>
          <p>{{ siteProfile.workIntro }}</p>
        </div>
      </div>

      <div v-if="hasProjects" class="work-list">
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

      <div v-if="hasProjects" class="work-section__appendix">
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