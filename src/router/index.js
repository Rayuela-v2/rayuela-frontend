import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProjectDetails from "@/views/Admin/ProjectDetails.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/Admin/AdminView.vue')
    },
    {
      path: '/admin/project/:projectId/data',
      name: 'ProjectDetails',
      component: () => import('../views/Admin/ProjectDetails.vue'),
      props: true
    },
    {
      path: '/admin/project/:projectId/tasks',
      name: 'TaskManager',
      component: () => import('../views/Admin/TaskManager.vue'),
      props: true
    },
    {
      path: '/admin/project/:projectId/gamification/',
      name: 'GamificationConfig',
      component: () => import('../views/Admin/GamificationConfig.vue'),
      props: true
    },
    {
      path: '/admin/project/:projectId/gamification/badge/:id',
      name: 'BadgeConfig',
      component: () => import('../views/Admin/AddEditBadge.vue'),
      props: true
    },
    {
      path: '/admin/project/:projectId/gamification/score-rule/:id',
      name: 'ScoreRuleConfig',
      component: () => import('../views/Admin/AddEditScoreRule.vue'),
      props: true
    }
  ]
})


export default router
