import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { hydrateProjectsStore } from '@/composables/useProjects'
import './assets/styles/main.scss'

hydrateProjectsStore()

createApp(App).use(router).mount('#app')
