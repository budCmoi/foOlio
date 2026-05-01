import { createRouter, createWebHistory } from 'vue-router'
import { findProjectById, privateStudioPath } from '@/composables/useProjects'
import { siteProfile } from '@/data/projects'

const homeTitle = `${siteProfile.name} | Portfolio frontend motion premium`
let pendingScrollInstruction = null

export function consumePendingScrollInstruction() {
  const instruction = pendingScrollInstruction
  pendingScrollInstruction = null
  return instruction
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: {
        title: homeTitle,
      },
    },
    {
      path: '/project/:id',
      name: 'project',
      component: () => import('@/views/ProjectView.vue'),
      props: true,
      meta: {
        title: (route) => {
          const project = findProjectById(route.params.id)
          return project ? `${project.title} | ${siteProfile.name}` : `Projet | ${siteProfile.name}`
        },
      },
    },
    {
      path: privateStudioPath,
      name: 'studio-vault',
      component: () => import('@/views/StudioVaultView.vue'),
      meta: {
        title: `Atelier prive | ${siteProfile.name}`,
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: {
        title: `Introuvable | ${siteProfile.name}`,
      },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      pendingScrollInstruction = {
        top: savedPosition.top ?? 0,
        left: savedPosition.left ?? 0,
      }

      return false
    }

    if (to.hash) {
      pendingScrollInstruction = {
        hash: to.hash,
      }

      return false
    }

    pendingScrollInstruction = {
      top: 0,
    }

    return false
  },
})

router.afterEach((to) => {
  const title = typeof to.meta.title === 'function'
    ? to.meta.title(to)
    : to.meta.title

  document.title = title || homeTitle
})

export default router