import { setupLayouts } from '@/layouts';
import { createRouter, createWebHistory } from 'vue-router';

export const router = createRouter({
  history: createWebHistory(),

  routes: setupLayouts([
    {
      path: '/',
      component: () => import('@/views/Index.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ]),
});
