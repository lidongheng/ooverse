<template>
  <main class="route-detail-example">
    <h1>Hash 子路由示例</h1>
    <p>当前路由是 <code>{{ $route.path }}</code>，刷新页面不会切换 HTML 入口。</p>
    <router-link to="/">返回当前入口首页</router-link>
  </main>
</template>

<style scoped>
.route-detail-example {
  width: min(720px, calc(100% - 48px));
  margin: 64px auto;
  padding: 32px;
  text-align: left;
}
</style>
