<template>
  <div class="customer-panel">
    <div class="panel-header">详细信息</div>
    <div class="panel-body">
      <div v-if="selectedRegion" class="detail-card">
        <div class="detail-name">{{ selectedRegion.name }}</div>
        <div
          class="detail-rate"
          :style="{ color: getMarkerColor(selectedRegion.rate) }"
        >
          销毛率：{{ formatRate(selectedRegion.rate) }}
        </div>
      </div>
      <div v-else class="info-placeholder">
        <p>点击地图标记查看详情</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHomeOverview } from "@/views/useHomeOverview";

const {
  selectedRegion,
  formatRate,
  getMarkerColor,
} = useHomeOverview();
</script>

<style lang="less" scoped>
.customer-panel {
  height: 100%;
  min-height: 0;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  border-bottom: 1px solid #e8ecf1;
  flex-shrink: 0;
}

.panel-body {
  flex: 1;
  min-height: 0;
  padding: 8px;
}

.detail-card {
  padding: 16px;
}

.detail-name {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 12px;
}

.detail-rate {
  font-size: 24px;
  font-weight: 700;
}

.info-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
  font-size: 14px;
}
</style>
