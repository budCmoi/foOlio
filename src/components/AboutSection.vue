<script setup>
import { onMounted, ref } from 'vue'
import { siteProfile } from '@/data/projects'
import { createRevealTrigger, gsap, useGSAPContext } from '@/composables/useGSAP'

const root = ref(null)
const { add } = useGSAPContext(root)

onMounted(() => {
  add(() => {
    gsap.from('.about-bio > *', {
      y: 32,
      autoAlpha: 0,
      stagger: 0.08,
      duration: 0.72,
      ease: 'power3.out',
      scrollTrigger: createRevealTrigger('.about-bio'),
    })

    gsap.from('.about-side > div', {
      y: 44,
      autoAlpha: 0,
      stagger: 0.1,
      duration: 0.76,
      ease: 'power3.out',
      scrollTrigger: createRevealTrigger('.about-side', { start: 'top 78%' }),
    })
  })
})
</script>

<template>
  <section id="about" ref="root" class="about-section page-block" data-page-intro>
    <div class="s-header">
      <div>
        <p class="s-label">Mon parcours</p>
        <h2 class="s-title"><span class="tl"><span>About</span></span></h2>
      </div>
    </div>

    <div class="about-grid">
      <div class="about-bio">
        <p v-for="paragraph in siteProfile.about.paragraphs" :key="paragraph">
          {{ paragraph }}
        </p>

        <a class="cv-btn" :href="`mailto:${siteProfile.contact.email}`" data-cursor="Contact">
          {{ siteProfile.contact.cta }}
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12L12 2M12 2H4M12 2V10"/>
          </svg>
        </a>
      </div>

      <div class="about-side">
        <div>
          <h3 class="detail-h">Experience</h3>

          <ul class="exp-list">
            <li v-for="entry in siteProfile.about.experience" :key="`${entry.company}-${entry.period}`" class="exp-item">
              <div class="ei-l">
                <span class="ei-co">{{ entry.company }}</span>
                <span class="ei-role">{{ entry.role }}</span>
              </div>
              <span class="ei-yr">{{ entry.period }}</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="detail-h">Reperes</h3>

          <ul class="awards-list">
            <li v-for="item in siteProfile.about.highlights" :key="`${item.title}-${item.note}`" class="award-item">
              <div class="aw-l">
                <span class="aw-title">{{ item.title }}</span>
                <span class="aw-issuer">{{ item.subtitle }}</span>
              </div>
              <span class="aw-yr">{{ item.note }}</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="detail-h">Competences</h3>

          <div class="skills-row">
            <span v-for="skill in siteProfile.about.skills" :key="skill" class="skill-pill">{{ skill }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>