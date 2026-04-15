<script setup>
import MagneticLink from '@/components/MagneticLink.vue'
</script>

<template>
  <main class="page page--not-found">
    <section class="not-found page-block" data-page-intro>
      <p class="section-tag">404</p>
      <h1>Cette page est sortie du cadre.</h1>
      <p>
        La route demandée n'existe pas dans le portfolio. La page d'accueil reste entièrement accessible.
      </p>
      <MagneticLink class="button button--primary" to="/" cursor="Accueil">
        Retour à l'accueil
      </MagneticLink>
    </section>
  </main>
</template>