<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import MagneticLink from '@/components/MagneticLink.vue'
import { RouterLink, useRoute } from 'vue-router'
import { siteProfile } from '@/data/projects'
import { useUiState } from '@/composables/useUiState'

const route = useRoute()
const ui = useUiState()
const compact = ref(false)
const menuOpen = ui.menuOpen
const isHomeRoute = computed(() => route.path === '/')
const isProjectRoute = computed(() => route.path.startsWith('/project/'))
const desktopNavLinks = [
  { label: 'Projets', to: { path: '/', hash: '#work' } },
  { label: 'A propos', to: { path: '/', hash: '#about' } },
  { label: 'Contact', to: { path: '/', hash: '#contact' } },
]

function syncCompactState() {
  compact.value = window.scrollY > 18
}

onMounted(() => {
  syncCompactState()
  window.addEventListener('scroll', syncCompactState, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', syncCompactState)
})
</script>

<template>
  <header class="app-header" :class="{ 'is-compact': compact, 'is-open': menuOpen, 'is-secondary': !isHomeRoute }">
    <div class="app-header__inner">
      <RouterLink class="app-header__brand" :to="{ path: '/', hash: '#hero' }" data-cursor="Accueil" @click="ui.closeMenu">
        <span class="app-header__brand-text">{{ isProjectRoute ? 'dvd' : siteProfile.handle }}</span>
      </RouterLink>

      <nav class="app-header__nav" aria-label="Navigation principale">
        <RouterLink
          v-for="link in desktopNavLinks"
          :key="link.label"
          class="app-header__nav-link"
          :to="link.to"
          :data-cursor="link.label"
          @click="ui.closeMenu"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="app-header__actions">
        <MagneticLink v-if="!isHomeRoute" class="app-header__back-link" :to="{ path: '/', hash: '#hero' }" cursor="Accueil">
          Retour a la maison
        </MagneticLink>

        <button class="theme-toggle" type="button" aria-label="Basculer le theme" data-cursor="Theme" @click="ui.toggleTheme">
          <span class="theme-toggle__icon" aria-hidden="true"></span>
          <span>{{ ui.themeLabel }}</span>
        </button>

        <button
          v-if="isHomeRoute"
          class="menu-button"
          type="button"
          :aria-expanded="menuOpen"
          aria-controls="fullscreen-menu"
          data-cursor="Menu"
          @click="ui.toggleMenu"
        >
          <span>{{ menuOpen ? 'Fermer' : 'Menu' }}</span>
          <span class="menu-button__icon" aria-hidden="true">
            <i></i>
            <i></i>
          </span>
        </button>
      </div>
    </div>
  </header>
</template>