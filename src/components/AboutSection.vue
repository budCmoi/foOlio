<script setup>
import { onMounted, ref } from 'vue'
import { siteProfile } from '@/data/projects'
import { createRevealTrigger, gsap, useGSAPContext } from '@/composables/useGSAP'

const root = ref(null)
const { add } = useGSAPContext(root)

onMounted(() => {
  add(() => {
    gsap.from('.about-section__intro > *', {
      y: 32,
      autoAlpha: 0,
      stagger: 0.08,
      duration: 0.72,
      ease: 'power3.out',
      scrollTrigger: createRevealTrigger('.about-section__intro'),
    })

    gsap.from('.about-card', {
      y: 44,
      autoAlpha: 0,
      stagger: 0.1,
      duration: 0.76,
      ease: 'power3.out',
      scrollTrigger: createRevealTrigger('.about-section__grid', { start: 'top 78%' }),
    })
  })
})
</script>

<template>
  <section id="about" ref="root" class="about-section page-block" data-page-intro>
    <div class="section-heading about-section__heading">
      <p class="section-tag">Mon parcours</p>

      <div>
        <h2>A propos</h2>
      </div>
    </div>

    <div class="about-section__layout">
      <div class="about-section__intro">
        <p v-for="paragraph in siteProfile.about.paragraphs" :key="paragraph">
          {{ paragraph }}
        </p>
      </div>

      <div class="about-section__grid">
        <article class="about-card">
          <h3>Experience</h3>

          <ul class="about-list">
            <li v-for="entry in siteProfile.about.experience" :key="`${entry.company}-${entry.period}`">
              <div>
                <strong>{{ entry.company }}</strong>
                <span>{{ entry.role }}</span>
              </div>
              <span>{{ entry.period }}</span>
            </li>
          </ul>
        </article>

        <article class="about-card">
          <h3>Reperes</h3>

          <ul class="about-list">
            <li v-for="item in siteProfile.about.highlights" :key="`${item.title}-${item.note}`">
              <div>
                <strong>{{ item.title }}</strong>
                <span>{{ item.subtitle }}</span>
              </div>
              <span>{{ item.note }}</span>
            </li>
          </ul>
        </article>

        <article class="about-card">
          <h3>Competences</h3>

          <div class="about-skills">
            <span v-for="skill in siteProfile.about.skills" :key="skill">{{ skill }}</span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>