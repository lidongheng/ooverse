import { createRouter, createWebHashHistory } from 'vue-router'
import EntryExampleView from '@/views/examples/EntryExampleView.vue'

const routes = [
  {
    path: '/',
    name: 'cost-example',
    component: EntryExampleView,
    props: {
      title: 'IOC Cost 入口示例',
      description: '这是 cost.html 对应的独立入口。',
      entryFile: 'cost.html'
    }
  },
  {
    path: '/detail',
    name: 'cost-detail-example',
    component: () => import('@/views/examples/RouteDetailExampleView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
