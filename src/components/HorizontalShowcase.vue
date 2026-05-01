<script setup>
import { siteProfile } from '@/data/projects'
</script>

<template>
  <section class="marquee-strip page-block" data-page-intro aria-label="Bandeau expertise">
    <div class="marquee-strip__viewport">
      <div class="marquee-strip__track" aria-hidden="true">
        <span v-for="item in siteProfile.marquee" :key="item" class="marquee-strip__item">
          {{ item }}
          <i aria-hidden="true">✦</i>
        </span>
        <!-- Duplicate for seamless loop -->
        <span v-for="item in siteProfile.marquee" :key="'dup-' + item" class="marquee-strip__item">
          {{ item }}
          <i aria-hidden="true">✦</i>
        </span>
      </div>
    </div>
  </section>
</template>