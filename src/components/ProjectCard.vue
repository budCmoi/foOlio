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
const projectMeta = computed(() => `${props.project.client || props.project.title} / ${props.project.year}`)
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
</script>

<template>
  <RouterLink :to="`/project/${project.id}`" custom v-slot="{ href, navigate }">
    <a
      class="project-card work-card"
      :href="href"
      :style="{ '--project-accent': project.accent }"
      data-cursor="Ouvrir"
      @click="navigate"
    >
      <div class="work-card__copy">
        <div class="work-card__overview">
          <span class="work-card__index">{{ paddedIndex }}</span>

          <div class="work-card__headline">
            <p class="work-card__meta">{{ projectMeta }}</p>
            <h3>{{ project.title }}</h3>

            <div class="work-card__tags">
              <span v-for="tag in projectTags" :key="tag">{{ tag }}</span>
            </div>
          </div>
        </div>

        <div class="work-card__metrics">
          <div v-for="metric in projectMetrics" :key="`${metric.value}-${metric.label}`" class="work-card__metric">
            <strong>{{ metric.value }}</strong>
            <span>{{ metric.label }}</span>
          </div>
        </div>
      </div>

      <div class="work-card__media">
        <img
          v-if="hasProjectImage"
          :src="project.images[0]"
          :alt="project.imageDetails?.[0]?.alt || project.title"
          loading="lazy"
          decoding="async"
        />
        <div v-else class="work-card__placeholder" aria-hidden="true">
          <span>{{ project.category || 'Projet digital' }}</span>
          <strong>{{ project.title }}</strong>
        </div>

        <div class="work-card__overlay" aria-hidden="true">
          <span>Voir le projet</span>
          <span>↗</span>
        </div>
      </div>
    </a>
  </RouterLink>
</template>