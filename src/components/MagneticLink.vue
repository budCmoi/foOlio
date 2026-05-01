<script setup>
import { computed, useAttrs } from 'vue'
import { RouterLink } from 'vue-router'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  as: {
    type: String,
    default: 'button',
  },
  to: {
    type: [String, Object],
    default: null,
  },
  href: {
    type: String,
    default: '',
  },
  cursor: {
    type: String,
    default: 'Ouvrir',
  },
  external: {
    type: Boolean,
    default: false,
  },
  relaxed: {
    type: Boolean,
    default: false,
  },
})

const attrs = useAttrs()

const componentTag = computed(() => {
  if (props.href) {
    return 'a'
  }

  return props.as
})

const componentProps = computed(() => {
  if (props.href) {
    return {
      href: props.href,
      target: props.external ? '_blank' : undefined,
      rel: props.external ? 'noreferrer' : undefined,
    }
  }

  return {
    type: 'button',
  }
})
</script>

<template>
  <RouterLink v-if="props.to" :to="props.to" custom v-slot="{ href, navigate }">
    <a
      class="magnetic-link"
      :href="href"
      :data-cursor="cursor"
      v-bind="attrs"
      @click="navigate"
    >
      <span class="magnetic-link__inner">
        <slot />
      </span>
    </a>
  </RouterLink>

  <component
    :is="componentTag"
    v-else
    class="magnetic-link"
    :data-cursor="cursor"
    v-bind="{ ...componentProps, ...attrs }"
  >
    <span class="magnetic-link__inner">
      <slot />
    </span>
  </component>
</template>