<template>
  <aside class="ai-overview">
    <section class="summary-card">
      <div class="section-title">aiCompute经营概览</div>
      <div class="top-metrics">
        <div class="metric">
          <span class="metric-label">ST卡数</span>
          <span class="metric-value">**</span>
          <span class="metric-unit">万卡</span>
        </div>
        <div class="metric">
          <span class="metric-label">超节点</span>
          <span class="metric-value">**</span>
          <span class="metric-unit">个</span>
        </div>
        <div class="metric">
          <span class="metric-label">Token卡数</span>
          <span class="metric-value">**</span>
          <span class="metric-unit">万卡</span>
        </div>
      </div>
      <div class="finance-row">
        <div class="profit">
          <span class="profit-dot"></span>
          <span>盈</span>
          <strong>**</strong>
          <span>亿元</span>
          <small>**</small>
        </div>
        <div class="finance-item">
          <span>流水</span>
          <strong>**</strong>
          <span>亿元</span>
        </div>
        <div class="finance-item">
          <span>成本</span>
          <strong>**</strong>
          <span>亿元</span>
        </div>
      </div>
    </section>

    <section class="mode-grid">
      <button
        class="mode-card"
        :class="{ active: mode === 'token' }"
        type="button"
        @click="switchMode('token')"
      >
        <div class="mode-title">Token概览</div>
        <div class="mode-body token-body">
          <div v-for="item in tokenPreviewMetrics" :key="item.label" class="preview-metric">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <em>{{ item.unit }}</em>
          </div>
        </div>
      </button>

      <button
        class="mode-card"
        :class="{ active: mode === 'compute' }"
        type="button"
        @click="switchMode('compute')"
      >
        <div class="mode-title">算力模式概览</div>
        <div class="mode-body compute-body">
          <div v-for="item in computePreviewMetrics" :key="item.label" class="preview-metric">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <em>{{ item.unit }}</em>
          </div>
        </div>
      </button>
    </section>

    <section class="detail-card">
      <template v-if="mode === 'compute'">
        <div class="detail-summary">
          <div class="profit">
            <span class="profit-dot"></span>
            <span>盈</span>
            <strong>**</strong>
            <span>亿元</span>
            <small>**</small>
          </div>
          <div class="finance-item">
            <span>流水</span>
            <strong>**</strong>
            <span>亿元</span>
          </div>
          <div class="finance-item">
            <span>成本</span>
            <strong>**</strong>
            <span>亿元</span>
          </div>
        </div>
        <div class="list-area">
          <div class="vertical-stack">
            <button
              class="vertical-label vertical-button"
              :class="{ light: parentName !== '代次' }"
              type="button"
              @click="selectComputeGroup('代次')"
            >
              代次
            </button>
            <button
              class="vertical-label vertical-button"
              :class="{ light: parentName !== '客户' }"
              type="button"
              @click="selectComputeGroup('客户')"
            >
              客户
            </button>
          </div>
          <div class="table-list">
            <div class="table-head compute-head">
              <span>aiCompute卡数<br />（卡）</span>
              <span>分配率</span>
              <span>流水<br />（万元）</span>
              <span>成本<br />（万元）</span>
              <span>销毛率</span>
            </div>
            <button
              v-for="item in computeItems"
              :key="item.name"
              class="table-row"
              :class="{ active: parentName === '代次' && selectedResourceType === item.name }"
              type="button"
              @click="selectComputeGeneration(item.name)"
            >
              <span class="item-name">⌄ {{ item.name }}</span>
              <span>{{ item.cardNum }}</span>
              <span>{{ item.allocationRate }}</span>
              <span>{{ item.revenue }}</span>
              <span>{{ item.cost }}</span>
              <span>{{ item.margin }}</span>
            </button>
            <button
              v-for="item in computeCustomerItems"
              :key="item.name"
              class="table-row"
              :class="{ active: parentName === '客户' && selectedResourceType === item.name }"
              type="button"
              @click="selectComputeCustomer(item.name)"
            >
              <span class="item-name">⌄ {{ item.name }}</span>
              <span>{{ item.cardNum }}</span>
              <span>{{ item.allocationRate }}</span>
              <span>{{ item.revenue }}</span>
              <span>{{ item.cost }}</span>
              <span>{{ item.margin }}</span>
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="detail-summary token-summary">
          <div class="profit">
            <span class="profit-dot"></span>
            <span>盈</span>
            <strong>**</strong>
            <span>亿元</span>
            <small>**</small>
          </div>
          <div class="finance-item">
            <span>流水</span>
            <strong>**</strong>
            <span>亿元</span>
          </div>
          <div class="finance-item">
            <span>成本</span>
            <strong>**</strong>
            <span>亿元</span>
          </div>
          <div class="finance-item wide">
            <span>百万Token流水</span>
            <strong>**</strong>
            <span>MT/元</span>
          </div>
          <div class="finance-item wide">
            <span>百万Token成本</span>
            <strong>**</strong>
            <span>MT/元</span>
          </div>
        </div>
        <div class="list-area">
          <div class="vertical-stack">
            <button
              class="vertical-label vertical-button"
              :class="{ light: selectedTokenGroup !== 'model' }"
              type="button"
              @click="selectedTokenGroup = 'model'"
            >
              模型
            </button>
            <button
              class="vertical-label vertical-button"
              :class="{ light: selectedTokenGroup !== 'customer' }"
              type="button"
              @click="selectedTokenGroup = 'customer'"
            >
              客户
            </button>
          </div>
          <div class="table-list">
            <div class="table-head token-head">
              <span>aiCompute卡数<br />（卡）</span>
              <span>日Token量</span>
              <span>流水<br />（万元）</span>
              <span>成本<br />（万元）</span>
              <span>销毛率</span>
            </div>
            <button
              v-for="item in tokenItems"
              :key="item.name"
              class="table-row"
              :class="{ active: selectedTokenGroup === 'model' && selectedModelType === item.name }"
              type="button"
              @click="selectModel(item.name)"
            >
              <span class="item-name">{{ item.name }}</span>
              <span>{{ item.cardNum }}</span>
              <span>{{ item.dailyToken }}</span>
              <span>{{ item.revenue }}</span>
              <span>{{ item.cost }}</span>
              <span>{{ item.margin }}</span>
            </button>
            <button
              v-for="item in tokenCustomerItems"
              :key="item.name"
              class="table-row"
              :class="{ active: selectedTokenGroup === 'customer' && selectedCustomerType === item.name }"
              type="button"
              @click="selectCustomer(item.name)"
            >
              <span class="item-name">{{ item.name }}</span>
              <span>{{ item.cardNum }}</span>
              <span>{{ item.dailyToken }}</span>
              <span>{{ item.revenue }}</span>
              <span>{{ item.cost }}</span>
              <span>{{ item.margin }}</span>
            </button>
          </div>
        </div>
      </template>
    </section>
  </aside>
</template>

<script setup>
import {
  mode,
  selectedCustomerType,
  selectedModelType,
  selectedResourceType,
  selectedTokenGroup,
  parentName,
} from "@/views/useAIComputer";

defineProps({
  computeItems: { type: Array, required: true },
  computeCustomerItems: { type: Array, required: true },
  tokenItems: { type: Array, required: true },
  tokenCustomerItems: { type: Array, required: true },
});

const tokenPreviewMetrics = [
  { label: "Token卡数", value: "**", unit: "万卡" },
  { label: "日Token数", value: "**", unit: "亿" },
  { label: "PUT(百万Token耗电量)", value: "**", unit: "kwh" },
  { label: "token利用率", value: "**", unit: "%" },
];

const computePreviewMetrics = [
  { label: "算力卡数", value: "**", unit: "万卡" },
  { label: "卡时使用率", value: "**", unit: "%" },
  { label: "AI core利用率", value: "**", unit: "%" },
  { label: "HBM利用率", value: "**", unit: "%" },
];

function switchMode(nextMode) {
  mode.value = nextMode;
}

function selectComputeGroup(name) {
  parentName.value = name;
  if (name === "代次") {
    selectedResourceType.value = "A3";
    return;
  }
  selectedResourceType.value = "内部";
}

function selectComputeGeneration(name) {
  parentName.value = "代次";
  selectedResourceType.value = name;
}

function selectComputeCustomer(name) {
  parentName.value = "客户";
  selectedResourceType.value = name;
}

function selectModel(name) {
  selectedTokenGroup.value = "model";
  selectedModelType.value = name;
}

function selectCustomer(name) {
  selectedTokenGroup.value = "customer";
  selectedCustomerType.value = name;
}
</script>

<style lang="less" scoped>
.ai-overview {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  height: 100%;
  min-height: 0;
  color: #25226f;
}

.summary-card,
.detail-card,
.mode-card {
  border: 1px solid rgba(97, 92, 181, 0.22);
  border-radius: 8px;
  background: rgba(248, 249, 255, 0.88);
  box-shadow: 0 6px 18px rgba(83, 78, 155, 0.08);
}

.summary-card {
  padding: 18px 22px;
}

.section-title {
  margin-bottom: 18px;
  color: #25226f;
  font-size: 22px;
  font-weight: 700;
}

.top-metrics,
.finance-row,
.detail-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.metric,
.finance-item,
.profit {
  min-width: 0;
}

.metric-label,
.finance-item > span:first-child {
  display: block;
  margin-bottom: 4px;
  color: #353575;
  font-size: 15px;
  font-weight: 700;
}

.metric-value,
.finance-item strong,
.profit strong {
  color: #24206d;
  font-size: 30px;
  font-weight: 800;
  line-height: 1.1;
}

.metric-unit,
.finance-item > span:last-child,
.profit > span:last-child {
  margin-left: 4px;
  font-size: 14px;
}

.profit {
  color: #1faeaa;
  font-size: 15px;
  font-weight: 700;
}

.profit-dot {
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-right: 8px;
  border-radius: 50%;
  background: #23c7bb;
  box-shadow: 0 0 10px rgba(35, 199, 187, 0.6);
}

.profit small {
  display: block;
  margin-left: 22px;
  margin-top: 4px;
  font-size: 13px;
}

.mode-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border: 1px solid rgba(53, 53, 117, 0.35);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.55);
}

.mode-card {
  min-width: 0;
  padding: 0;
  border: 0;
  background: rgba(255, 255, 255, 0.52);
  color: #25226f;
  text-align: left;
  cursor: pointer;
}

.mode-card + .mode-card {
  border-left: 1px solid rgba(53, 53, 117, 0.35);
}

.mode-title {
  height: 46px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  color: #25226f;
  font-size: 22px;
  font-weight: 800;
}

.mode-card.active .mode-title {
  color: #fff;
  background: #35359b;
}

.mode-body {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 20px;
  padding: 18px 22px 20px;
}

.preview-metric span {
  display: block;
  margin-bottom: 4px;
  color: #3f3b87;
  font-size: 15px;
  font-weight: 600;
}

.preview-metric strong {
  color: #24206d;
  font-size: 26px;
  font-weight: 800;
}

.preview-metric em {
  margin-left: 4px;
  font-style: normal;
  font-size: 13px;
}

.detail-card {
  flex: 1;
  min-height: 0;
  padding: 18px 22px;
  border-color: #35359b;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.token-summary {
  grid-template-columns: 1.1fr 1fr 1fr 1.45fr 1.45fr;
}

.finance-item.wide strong {
  font-size: 25px;
}

.list-area {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 18px;
}

.vertical-label {
  width: 58px;
  min-height: 190px;
  border: 0;
  border-radius: 10px;
  background: #35359b;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  writing-mode: vertical-rl;
  letter-spacing: 4px;
  font-size: 24px;
  font-weight: 800;
}

.vertical-button {
  cursor: pointer;
}

.vertical-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.vertical-label.light {
  background: rgba(255, 255, 255, 0.72);
  color: #35359b;
  border: 1px solid rgba(53, 53, 117, 0.25);
}

.table-list {
  flex: 1;
  min-width: 0;
  overflow: auto;
}

.table-head,
.table-row {
  display: grid;
  align-items: center;
  column-gap: 12px;
}

.compute-head,
.compute-head + .table-row,
.compute-head ~ .table-row {
  grid-template-columns: 1.15fr 0.9fr 0.75fr 0.85fr 0.85fr 0.7fr;
}

.token-head,
.token-head + .table-row,
.token-head ~ .table-row {
  grid-template-columns: 1.1fr 0.85fr 0.75fr 0.85fr 0.85fr 0.7fr;
}

.table-head {
  min-height: 46px;
  color: #3f3b87;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

.table-head span:first-child {
  grid-column: 2;
}

.table-row {
  width: 100%;
  min-height: 58px;
  padding: 0;
  border: 0;
  border-bottom: 1px solid rgba(53, 53, 117, 0.08);
  background: transparent;
  color: #25226f;
  font-size: 17px;
  font-weight: 700;
  text-align: center;
  cursor: pointer;
}

.table-row:hover,
.table-row.active {
  background: rgba(53, 53, 155, 0.08);
}

.item-name {
  text-align: left;
  font-size: 20px;
}
</style>
