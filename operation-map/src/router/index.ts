import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
  },
];

const router = createRouter({
  // 与 digital-map-cost 保持一致，静态部署时无需额外配置 History fallback。
  history: createWebHashHistory(),
  routes,
});

export default router;
