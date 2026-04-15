<template>
  <footer class="site-footer">
    <div class="footer-content">
      <span>© 2026 foOlio. Tous droits réservés.</span>
    </div>
  </footer>
</template>

<script setup>
// Footer simple, aucun JS nécessaire
</script>

<style scoped>
.site-footer {
  width: 100%;
  background: var(--surface-dark, #151610);
  color: var(--text-inverse, #f7f2e9);
  text-align: center;
  padding: 1.2rem 0 1.2rem 0;
  font-size: 1rem;
  letter-spacing: 0.02em;
  margin-top: auto;
  flex-shrink: 0;
}
.footer-content {
  max-width: var(--content-max, 1320px);
  margin: 0 auto;
}
</style>
