<script setup>
import { onMounted, ref } from 'vue'
import { siteProfile } from '@/data/projects'
import { createRevealTrigger, gsap, useGSAPContext } from '@/composables/useGSAP'

const root = ref(null)
const { add } = useGSAPContext(root)

onMounted(() => {
  add(() => {
    gsap.from('.about-home__bio > *', {
      y: 32,
      autoAlpha: 0,
      stagger: 0.08,
      duration: 0.72,
      ease: 'power3.out',
      scrollTrigger: createRevealTrigger('.about-home__bio'),
    })

    gsap.from('.about-home__block', {
      y: 44,
      autoAlpha: 0,
      stagger: 0.1,
      duration: 0.76,
      ease: 'power3.out',
      scrollTrigger: createRevealTrigger('.about-home__side', { start: 'top 78%' }),
    })
  })
})
</script>

<template>
  <section id="about" ref="root" class="about-section page-block" data-page-intro>
    <div class="s-header about-home__header">
      <div>
        <p class="s-label">Mon parcours</p>
        <h2 class="s-title">A propos</h2>
      </div>
    </div>

    <div class="about-home__grid">
      <div class="about-home__bio">
        <p v-for="paragraph in siteProfile.about.paragraphs" :key="paragraph">
          {{ paragraph }}
        </p>
      </div>

      <div class="about-home__side">
        <section class="about-home__block">
          <h3 class="detail-h">Experience</h3>

          <ul class="about-home__list">
            <li v-for="entry in siteProfile.about.experience" :key="`${entry.company}-${entry.period}`" class="about-home__item">
              <div class="about-home__text">
                <strong class="about-home__title">{{ entry.company }}</strong>
                <span class="about-home__subtitle">{{ entry.role }}</span>
              </div>
              <span class="about-home__meta">{{ entry.period }}</span>
            </li>
          </ul>
        </section>

        <section class="about-home__block">
          <h3 class="detail-h">Reperes</h3>

          <ul class="about-home__list">
            <li v-for="item in siteProfile.about.highlights" :key="`${item.title}-${item.note}`" class="about-home__item">
              <div class="about-home__text">
                <strong class="about-home__title">{{ item.title }}</strong>
                <span class="about-home__subtitle">{{ item.subtitle }}</span>
              </div>
              <span class="about-home__meta">{{ item.note }}</span>
            </li>
          </ul>
        </section>

        <section class="about-home__block">
          <h3 class="detail-h">Competences</h3>

          <div class="about-home__skills">
            <span v-for="skill in siteProfile.about.skills" :key="skill" class="about-home__skill">{{ skill }}</span>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>