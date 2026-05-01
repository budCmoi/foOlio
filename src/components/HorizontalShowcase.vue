<script setup>
import { siteProfile } from '@/data/projects'
</script>

<template>
  <section class="marquee-wrap page-block" data-page-intro aria-label="Bandeau expertise">
    <div class="marquee-track" aria-hidden="true">
      <span v-for="item in siteProfile.marquee" :key="item" class="mq-item">
        {{ item }}
      </span>
      <span v-for="item in siteProfile.marquee" :key="`dup-${item}`" class="mq-item">
          {{ item }}
      </span>
    </div>
  </section>
</template>