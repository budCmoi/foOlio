<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
})

const paddedIndex = computed(() => String(props.index + 1).padStart(2, '0'))
const hasProjectImage = computed(() => Boolean(props.project.images?.[0]))
const projectCompany = computed(() => props.project.client || props.project.category || 'Projet')
const projectYear = computed(() => props.project.year || '')
const projectTags = computed(() => {
  if (Array.isArray(props.project.tags) && props.project.tags.length) {
    return props.project.tags.slice(0, 2)
  }

  return props.project.tech.slice(0, 2)
})
const projectMetrics = computed(() => {
  if (Array.isArray(props.project.metrics) && props.project.metrics.length) {
    return props.project.metrics.slice(0, 2)
  }

  return props.project.results.slice(0, 2).map((entry, index) => ({
    value: String(index + 1).padStart(2, '0'),
    label: entry,
  }))
})

const projectCardStyle = computed(() => ({
  '--project-accent': props.project.accent || '#ff5a36',
}))
</script>

<template>
  <RouterLink :to="`/project/${project.id}`" custom v-slot="{ href, navigate }">
    <a
      class="pcard"
      :href="href"
      :style="projectCardStyle"
      data-cursor="Ouvrir"
      data-cursor-theme="accent"
      @click="navigate"
    >
      <div class="pcard-inner">
        <div class="pcard-info">
          <div class="pcard-top">
            <span class="pnum">{{ paddedIndex }}</span>

            <div class="tags">
              <span v-for="tag in projectTags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>

          <div class="pcard-mid">
            <p class="pcompany">{{ projectCompany }}</p>
            <h3 class="pname">{{ project.title }}</h3>
            <p class="pyear">{{ projectYear }}</p>
          </div>

          <div class="pmetrics">
            <div v-for="metric in projectMetrics" :key="`${metric.value}-${metric.label}`" class="pmetric">
              <span class="pm-val">{{ metric.value }}</span>
              <span class="pm-label">{{ metric.label }}</span>
            </div>
          </div>
        </div>

        <div class="pcard-vis">
          <div class="pcard-bg"></div>

          <img
            v-if="hasProjectImage"
            class="pcard-img"
            :src="project.images[0]"
            :alt="project.imageDetails?.[0]?.alt || project.title"
            loading="lazy"
            decoding="async"
          />
          <div v-else class="pcard-placeholder" aria-hidden="true">
            <span>{{ project.category || 'Projet digital' }}</span>
            <strong>{{ project.title }}</strong>
          </div>

          <div class="pcard-img-overlay"></div>

          <div class="p-arrow" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 12L12 2M12 2H4M12 2V10" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </a>
  </RouterLink>
</template>