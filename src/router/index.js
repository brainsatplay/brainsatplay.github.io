import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/gamelist',
    name: 'Game List',
    component: () => import(/* webpackChunkName: "about" */ '../views/GameList.vue')
  },
  {
    path: '/competition',
    name: 'Competition',
    component: () => import(/* webpackChunkName: "about" */ '../views/Competition.vue')
  },
  {
    path: '/inspiration',
    name: 'Inspiration',
    component: () => import(/* webpackChunkName: "about" */ '../views/Inspiration.vue')
  },
  {
    path: '/curriculum',
    name: 'Curriculum',
    component: () => import(/* webpackChunkName: "about" */ '../views/Curriculum.vue')
  },
  {
    path: '/rules',
    name: 'Rules',
    component: () => import(/* webpackChunkName: "about" */ '../views/Rules.vue')
  },
  {
    path: '/submit',
    name: 'Submit',
    component: () => import(/* webpackChunkName: "about" */ '../views/Submit.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
