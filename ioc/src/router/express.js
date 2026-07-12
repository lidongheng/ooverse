import { createRouter, createWebHashHistory } from 'vue-router'
import EntryExampleView from '@/views/examples/EntryExampleView.vue'

const routes = [
  {
    path: '/',
    name: 'express-example',
    component: EntryExampleView,
    props: {
      title: 'IOC Express 入口示例',
      description: '这是 express.html 对应的独立入口。',
      entryFile: 'express.html'
    }
  },
  {
    path: '/detail',
    name: 'express-detail-example',
    component: () => import('@/views/examples/RouteDetailExampleView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
