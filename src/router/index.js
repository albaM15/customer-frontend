import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/discover',
      name: 'home',
      component: () => import('../views/Home.vue'),
    },
    {
      path: '/guest-profile',
      name: 'guest-profile',
      component: () => import('../views/GuestProfile.vue'),
    },
    {
      path: '/call',
      name: 'call',
      component: () => import('../views/Call.vue'),
    },
    {
      path: '/',
      name: 'sign-in',
      component: () => import('../views/SignIn.vue'),
    },
    {
      path: '/sign-up',
      name: 'sign-up',
      component: () => import('../views/SignUp.vue'),
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/ForgotPassword.vue'),
    },
    {
      path: '/verify-code',
      name: 'verify-code',
      component: () => import('../views/VerifyCode.vue'),
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/ResetPassword.vue'),
    },
    {
      path: '/create-profile',
      name: 'create-profile',
      component: () => import('../views/CreateProfile.vue'),
    }
  ],
})

export default router
