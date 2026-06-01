import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomePage.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutPage.vue')
    },
    {
      path: '/works',
      name: 'works',
      component: () => import('@/views/WorksPage.vue')
    },
    {
      path: '/works/:id',
      name: 'work-detail',
      component: () => import('@/views/WorkDetail.vue')
    },
    {
      path: '/daily',
      name: 'daily',
      component: () => import('@/views/DailyPage.vue')
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('@/views/admin/LoginPage.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/admin/Dashboard.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'admin-projects',
          component: () => import('@/views/admin/ProjectList.vue')
        },
        {
          path: 'projects/new',
          name: 'admin-project-new',
          component: () => import('@/views/admin/ProjectEdit.vue')
        },
        {
          path: 'projects/:id/edit',
          name: 'admin-project-edit',
          component: () => import('@/views/admin/ProjectEdit.vue')
        },
        {
          path: 'personal',
          name: 'admin-personal',
          component: () => import('@/views/admin/PersonalEdit.vue')
        },
        {
          path: 'personal/basic',
          name: 'admin-personal-basic',
          component: () => import('@/views/admin/personal/BasicInfoEdit.vue')
        },
        {
          path: 'personal/experience',
          name: 'admin-personal-experience',
          component: () => import('@/views/admin/personal/ExperienceEdit.vue')
        },
        {
          path: 'personal/skills',
          name: 'admin-personal-skills',
          component: () => import('@/views/admin/personal/SkillsEdit.vue')
        },
        {
          path: 'personal/honors',
          name: 'admin-personal-honors',
          component: () => import('@/views/admin/personal/HonorsEdit.vue')
        },
        {
          path: 'daily',
          name: 'admin-daily',
          component: () => import('@/views/admin/DailyEdit.vue')
        }
      ]
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

// Navigation guard for admin routes
router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const token = localStorage.getItem('token')
    if (!token) {
      next({ name: 'admin-login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
