<template>
  <div class="information-panel">
    <div class="network-tabs">
      <button
        v-for="tab in networkTabs"
        :key="tab"
        type="button"
        :class="['tab', { active: activeTab === tab }]"
        @click="changeTab(tab)"
      >
        {{ tab }}
      </button>
    </div>

    <div class="section-title">
      <span class="title-icon">✦</span>
      关键信息
    </div>

    <div class="metric-row">
      <div
        v-for="item in networkMetrics"
        :key="item.title"
        class="metric-card"
      >
        <div class="metric-title">{{ item.title }}</div>
        <div class="metric-items">
          <div class="metric-item">
            <span>{{ item.primaryLabel }}</span>
            <div>
              <strong>{{ item.primaryValue }}</strong>
              <em>环比 ▲{{ item.primaryTrend }}</em>
            </div>
          </div>
          <div class="metric-item">
            <span>{{ item.secondaryLabel }}</span>
            <div>
              <strong>{{ item.secondaryValue }}</strong>
              <em>环比 ▼{{ item.secondaryTrend }}</em>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { networkMetrics } from './staticData';

const activeTab = ref('Internet');
const networkTabs = ['Internet', '骨干网'];

function changeTab(tab) {
  activeTab.value = tab;
}
</script>

<style scoped lang="less">
.information-panel {
  min-width: 0;
  padding: 0 20px 20px;
  box-sizing: border-box;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 10px 26px rgba(60, 65, 118, 0.08);
}

.network-tabs {
  display: flex;
  align-items: center;
  gap: 0;
  height: 64px;
}

.tab {
  height: 48px;
  min-width: 118px;
  padding: 0 26px;
  border: 1px solid #e2e4f2;
  background: #f7f8fd;
  color: #34356f;
  cursor: pointer;
  font-size: 18px;
  font-weight: 700;
}

.tab:first-child {
  border-radius: 8px 0 0 8px;
}

.tab:last-child {
  border-radius: 0 8px 8px 0;
}

.tab.active {
  border-color: #3f3a9b;
  background: #3f3a9b;
  color: #fff;
}

.section-title {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #34356f;
  font-size: 17px;
  font-weight: 700;
}

.title-icon {
  color: #6262c6;
  font-size: 14px;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.metric-card {
  min-height: 148px;
  padding: 14px 18px;
  box-sizing: border-box;
  border: 1px solid #eef0f8;
  border-radius: 8px;
  background: #fff;
}

.metric-title {
  color: #34356f;
  font-size: 17px;
  font-weight: 700;
}

.metric-items {
  margin-top: 22px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.metric-item {
  min-width: 0;
}

.metric-item + .metric-item {
  padding-left: 20px;
  border-left: 1px solid #eef0f8;
}

.metric-item span,
.metric-item em {
  color: #77799e;
  font-size: 13px;
  font-style: normal;
}

.metric-item div {
  margin-top: 12px;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.metric-item strong {
  color: #333376;
  font-size: 30px;
  line-height: 1;
}
</style>
