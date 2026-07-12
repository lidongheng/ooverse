<template>
  <main class="entry-example">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>

    <dl>
      <dt>当前 HTML 入口</dt>
      <dd>{{ entryFile }}</dd>
      <dt>当前 Hash 路由</dt>
      <dd>{{ $route.path }}</dd>
    </dl>

    <router-link to="/detail">进入子路由示例</router-link>
  </main>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  entryFile: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.entry-example {
  width: min(720px, calc(100% - 48px));
  margin: 64px auto;
  padding: 32px;
  text-align: left;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
}

.entry-example dl {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 12px;
  margin: 24px 0;
}

.entry-example dd {
  margin: 0;
  font-family: monospace;
}
</style>
