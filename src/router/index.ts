import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'mainPage',
    component: () => import('../views/MainPage.vue')
  },
  {
    path: '/',
    name: 'mainPage',
    component: () => import('../views/MainPage.vue')
  },
  {
    path: '/fractals',
    name: 'fractals',
    component: () => import('../views/FractalsPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
