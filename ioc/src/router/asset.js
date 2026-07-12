import { createRouter, createWebHashHistory } from 'vue-router'
import EntryExampleView from '@/views/examples/EntryExampleView.vue'

const routes = [
  {
    path: '/',
    name: 'asset-example',
    component: EntryExampleView,
    props: {
      title: 'IOC Asset 入口示例',
      description: '这是 asset.html 对应的独立入口。',
      entryFile: 'asset.html'
    }
  },
  {
    path: '/detail',
    name: 'asset-detail-example',
    component: () => import('@/views/examples/RouteDetailExampleView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
