<template>
  <div class="no-permission-test-page">
    403 跳转测试页
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchNoPermissionMock } from '@/api/noPermissionMock'

const router = useRouter()

onMounted(async () => {
  const res = await fetchNoPermissionMock()

  // mock 接口返回 403 时进入无权限指引页。
  if (res.status === 403) {
    router.replace('/noPermission')
  }
})
</script>

<style scoped lang="less">
.no-permission-test-page {
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1f2937;
  font-size: 16px;
}
</style>
