import { computed, ref } from 'vue'

const menuOpen = ref(false)
const loaderVisible = ref(true)
const cursorText = ref('')
const cursorTheme = ref('default')
const transitioning = ref(false)
const theme = ref('dark')

const THEME_STORAGE_KEY = 'foolio.theme.v1'
let themeHydrated = false

function resolvePreferredTheme() {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function applyTheme(nextTheme) {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.dataset.theme = nextTheme
  document.documentElement.style.colorScheme = nextTheme
}

function hydrateTheme() {
  if (themeHydrated) {
    applyTheme(theme.value)
    return
  }

  themeHydrated = true
  theme.value = resolvePreferredTheme()
  applyTheme(theme.value)
}

function moveFocusOutsideMenu() {
  if (typeof document === 'undefined') {
    return
  }

  const activeElement = document.activeElement
  if (!(activeElement instanceof HTMLElement)) {
    return
  }

  if (!activeElement.closest('#fullscreen-menu')) {
    return
  }

  const trigger = document.querySelector('[aria-controls="fullscreen-menu"]')
  if (trigger instanceof HTMLElement) {
    trigger.focus({ preventScroll: true })
    return
  }

  activeElement.blur()
}

export function useUiState() {
  hydrateTheme()

  const isOverlayActive = computed(() => menuOpen.value || loaderVisible.value || transitioning.value)
  const themeLabel = computed(() => (theme.value === 'dark' ? 'Sombre' : 'Clair'))

  function openMenu() {
    menuOpen.value = true
  }

  function closeMenu() {
    moveFocusOutsideMenu()
    menuOpen.value = false
  }

  function toggleMenu() {
    if (menuOpen.value) {
      moveFocusOutsideMenu()
    }

    menuOpen.value = !menuOpen.value
  }

  function completeLoading() {
    loaderVisible.value = false
  }

  function setCursor(text = '', theme = 'default') {
    cursorText.value = text
    cursorTheme.value = theme
  }

  function clearCursor() {
    cursorText.value = ''
    cursorTheme.value = 'default'
  }

  function setTransitioning(value) {
    transitioning.value = value
  }

  function setTheme(value) {
    const nextTheme = value === 'light' ? 'light' : 'dark'

    theme.value = nextTheme
    applyTheme(nextTheme)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    }
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  return {
    menuOpen,
    loaderVisible,
    cursorText,
    cursorTheme,
    transitioning,
    theme,
    themeLabel,
    isOverlayActive,
    openMenu,
    closeMenu,
    toggleMenu,
    completeLoading,
    setCursor,
    clearCursor,
    setTransitioning,
    setTheme,
    toggleTheme,
  }
}