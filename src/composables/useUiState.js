import { computed, ref } from 'vue'

const menuOpen = ref(false)
const loaderVisible = ref(true)
const cursorText = ref('')
const cursorTheme = ref('default')
const transitioning = ref(false)

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
  const isOverlayActive = computed(() => menuOpen.value || loaderVisible.value || transitioning.value)

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

  return {
    menuOpen,
    loaderVisible,
    cursorText,
    cursorTheme,
    transitioning,
    isOverlayActive,
    openMenu,
    closeMenu,
    toggleMenu,
    completeLoading,
    setCursor,
    clearCursor,
    setTransitioning,
  }
}