import { computed, unref } from 'vue'
import { findProjectById, useProjects } from '@/composables/useProjects'

export function useProjectLookup(projectId) {
  const { projects, projectsHydrated } = useProjects()

  const project = computed(() => findProjectById(unref(projectId)))
  const relatedProjects = computed(() => projects.value
    .filter((entry) => entry.id !== unref(projectId))
    .slice(0, 2))

  return {
    project,
    projectsHydrated,
    relatedProjects,
  }
}