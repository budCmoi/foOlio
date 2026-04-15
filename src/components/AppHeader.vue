<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { siteProfile } from '@/data/projects'
import { useUiState } from '@/composables/useUiState'

const ui = useUiState()
const compact = ref(false)
const menuOpen = ui.menuOpen

function syncCompactState() {
  compact.value = window.scrollY > 24
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
  <header class="app-header" :class="{ 'is-compact': compact, 'is-open': menuOpen }">
    <RouterLink class="app-header__brand" to="/" data-cursor="Accueil" @click="ui.closeMenu">
      <span class="app-header__monogram">MA.</span>
      <span class="app-header__identity">
        <strong>{{ siteProfile.name }}</strong>
        <small>{{ siteProfile.role }}</small>
      </span>
    </RouterLink>

    <div class="app-header__info">
      <span class="app-header__availability">
        <i></i>
        {{ siteProfile.availability }}
      </span>

      <button
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
  </header>
</template>