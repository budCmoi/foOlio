<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { siteProfile } from '@/data/projects'
import { createRevealTrigger, gsap, useGSAPContext } from '@/composables/useGSAP'

const root = ref(null)
const { add } = useGSAPContext(root)
const copyState = ref('')
let resetCopyState = null

const contactLines = computed(() => [
  {
    key: 'overline',
    type: 'text',
    text: siteProfile.contact.overline,
  },
  {
    key: 'title-link',
    type: 'link',
    text: siteProfile.contact.titleLink,
    suffix: siteProfile.contact.titleSuffix || '',
  },
])

function copyEmail() {
  if (!navigator.clipboard?.writeText) {
    return
  }

  navigator.clipboard.writeText(siteProfile.contact.email).then(() => {
    copyState.value = 'copied'
    window.clearTimeout(resetCopyState)
    resetCopyState = window.setTimeout(() => {
      copyState.value = ''
    }, 1800)
  }).catch(() => {})
}

onMounted(() => {
  add(() => {
    gsap.timeline({
      scrollTrigger: createRevealTrigger(root.value),
    })
      .from('.contact-headline .tl span', {
        y: '110%',
        stagger: 0.1,
        duration: 0.9,
        ease: 'power3.out',
      })
      .from('[data-contact-item]', {
      y: 26,
      autoAlpha: 0,
      stagger: 0.08,
      duration: 0.72,
      ease: 'power3.out',
      }, 0.14)
  })
})

onBeforeUnmount(() => {
  window.clearTimeout(resetCopyState)
})
</script>

<template>
  <section id="contact" ref="root" class="contact-panel page-block" data-page-intro>
    <p class="s-label" data-contact-item>{{ siteProfile.contact.eyebrow }}</p>

    <div class="contact-headline">
      <span v-for="line in contactLines" :key="line.key" class="tl">
        <span v-if="line.type === 'text'">{{ line.text }}</span>
        <span v-else>
          <a :href="`mailto:${siteProfile.contact.email}`" data-cursor="Email" data-cursor-theme="accent">
            {{ line.text }}
          </a>{{ line.suffix }}
        </span>
      </span>
    </div>

    <div class="contact-footer" data-contact-item>
      <div class="cf-left">
        <div class="cf-email-row">
          <p>{{ siteProfile.contact.email }}</p>
          <button class="copy-btn" :class="{ copied: copyState === 'copied' }" type="button" aria-label="Copier l'email" data-cursor="Copier" @click="copyEmail">
            <svg v-if="copyState !== 'copied'" width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4.5" y="4.5" width="7" height="7" rx="1.2"/>
              <path d="M1.5 8.5V2.5a1 1 0 0 1 1-1h6"/>
            </svg>
            <svg v-else width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 7l3.5 3.5L11 3"/>
            </svg>
          </button>
        </div>
        <p>{{ siteProfile.location }}</p>
      </div>

      <div class="cf-right">
        <a v-for="link in siteProfile.contact.links" :key="link.href" :href="link.href" data-cursor="Link" data-cursor-theme="accent">
          {{ link.label }}
        </a>
      </div>
    </div>

    <p class="copy">© 2026 {{ siteProfile.name }} · {{ siteProfile.role }}</p>
  </section>
</template>