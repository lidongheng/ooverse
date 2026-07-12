<script setup lang="ts">
import { ref } from 'vue';
import { getCookie } from '@shared/utils/cookie';

const title = ref('operationMap');
const sharedHelperName = getCookie.name;
</script>

<template>
  <main class="home">
    <h1>{{ title }}</h1>
    <p>Vite + Vue 3.5 项目已就绪，可以开始迁移 digitalMapCost 代码。</p>
    <p>
      当前项目支持 <code>.ts</code>、<code>.js</code>、<code>.vue</code> 共存。
    </p>
    <p>
      已通过 <code>@shared</code> 引用公共 JS 工具：<code>{{ sharedHelperName }}</code>
    </p>
    <pre>import { getCookie } from '@shared/utils/cookie'</pre>
  </main>
</template>

<style scoped>
.home {
  max-width: 800px;
  margin: 80px auto;
  padding: 0 24px;
  text-align: center;
}

h1 {
  margin: 0 0 16px;
  color: #42b883;
  font-size: 32px;
  font-weight: 600;
}

p {
  margin: 12px 0;
  color: #2c3e50;
  font-size: 16px;
  line-height: 1.7;
}

code,
pre {
  border-radius: 4px;
  background: #f4f4f4;
  font-size: 14px;
}

code {
  padding: 2px 8px;
}

pre {
  margin: 24px auto 0;
  padding: 16px;
  overflow-x: auto;
  text-align: left;
}
</style>
