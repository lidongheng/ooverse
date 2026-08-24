<template>
  <div class="home-layout">
    <header class="home-overview">
      <slot name="overview" />
    </header>
    <section class="home-top">
      <slot name="top" />
    </section>
    <main class="home-main">
      <aside class="home-left">
        <slot name="left" />
      </aside>
      <section class="home-center">
        <slot name="center" />
      </section>
      <aside class="home-right">
        <slot name="right" />
      </aside>
    </main>
  </div>
</template>

<style lang="less" scoped>
.home-layout {
  height: calc(100vh - 64px);
  min-height: 0;
  padding: 16px;
  box-sizing: border-box;
  background: #eef2fb;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.home-overview,
.home-top,
.home-left,
.home-center,
.home-right {
  min-width: 0;
}

.home-top {
  flex-shrink: 0;
}

.home-main {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 448px minmax(0, 1fr) 448px;
  gap: 12px;
  overflow: hidden;
}

.home-left,
.home-center,
.home-right {
  min-height: 0;
}
</style>
