<script setup>
import { siteProfile } from '@/data/projects'
</script>

<template>
  <section class="marquee-strip page-block" data-page-intro aria-label="Bandeau expertise">
    <div class="marquee-strip__viewport">
      <div class="marquee-strip__track">
        <span v-for="item in siteProfile.marquee" :key="item" class="marquee-strip__item">
          {{ item }}
          <i aria-hidden="true">✦</i>
        </span>
      </div>
    </div>
  </section>
</template>