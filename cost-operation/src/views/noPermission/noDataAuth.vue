<template>
  <main class="no-data-auth no-rem">
    <header class="page-banner">
      <div class="page-banner__inner">
        <div class="page-title">
          <h1>数据权限页面申请</h1>
          <el-tooltip :content="permissionTooltip" placement="right">
            <el-icon class="page-title__icon"><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
        <div class="page-banner__art" aria-hidden="true">
          <span class="page-banner__orbit page-banner__orbit--outer" />
          <span class="page-banner__orbit page-banner__orbit--inner" />
          <span class="page-banner__shield"><span class="page-banner__lock" /></span>
        </div>
      </div>
    </header>
    <section class="no-data-auth__content">
      <el-tabs v-model="activeStatus" class="status-tabs" @tab-change="handleStatusChange">
        <el-tab-pane label="未拥有" name="waiting" />
        <el-tab-pane label="已拥有" name="owned" />
        <el-tab-pane label="审批中" name="approving" />
      </el-tabs>
      <p class="status-message">{{ statusMessage }}</p>

      <section v-if="activeStatus === 'owned'" class="owned-auth">
        <div v-if="isCxoRoleSelected" class="cxo-owned-auth">
          <el-table
            :data="ownedCxoTableRows"
            :span-method="getCxoOwnedSpanMethod"
            border
            class="cxo-owned-table"
          >
            <el-table-column prop="cloudServerName" label="云服务">
              <template #default="scope">
                <span v-if="scope.row.cloudServerCode" class="owned-card__name">
                  <FourGridIcon />
                  {{ scope.row.cloudServerName }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="dataTypeName" label="数据类型">
              <template #default="scope">
                <span v-if="scope.row.dataTypeCode" class="owned-card__name">
                  <FourGridIcon />
                  {{ scope.row.dataTypeName }}
                </span>
              </template>
            </el-table-column>
          </el-table>
          <div class="cxo-owned-actions">
            <el-button class="back-button" :loading="backLoading" @click="handleBack">
              返回
            </el-button>
          </div>
        </div>

        <template v-else>
          <div class="owned-section">
            <h2 class="owned-section__title">云服务</h2>
            <div class="service-grid owned-list">
              <button
                v-for="cloudServer in ownedCloudServers"
                :key="cloudServer.code"
                class="owned-card service-card"
                type="button"
              >
                <span class="owned-card__name">
                  <span class="resource-card__checkbox resource-card__checkbox--checked" aria-hidden="true" />
                  <FourGridIcon />
                  {{ cloudServer.code }}
                </span>
                <span class="service-card__art" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div class="owned-section">
            <h2 class="owned-section__title">{{ secondaryPermissionLabel }}</h2>
            <div class="owned-list--region">
              <div v-for="group in ownedRegionGroups" :key="group.code" class="owned-region-group">
                <h3 class="owned-region-group__title">{{ group.name }}</h3>
                <div class="region-grid owned-region-grid">
                  <div v-for="region in group.children" :key="region.code" class="owned-card owned-card--region">
                    <span class="owned-card__name">
                      <FourGridIcon />
                      {{ region.name }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </section>

      <section v-else-if="activeStatus === 'approving'" class="approving-table">
        <el-table :data="approvingRows" class="approving-table__inner">
          <el-table-column prop="index" label="序号" min-width="90" sortable />
          <el-table-column prop="user" label="申请人" min-width="160" sortable />
          <el-table-column prop="order" label="工单号" min-width="220" sortable />
          <el-table-column prop="title" label="工单标题" min-width="260" sortable />
          <el-table-column prop="status" label="状态" min-width="160" sortable />
          <el-table-column prop="approver" label="当前处理人" min-width="220" sortable />
        </el-table>
      </section>

      <el-form
        v-else
        ref="formRef"
        :model="form"
        :rules="rules"
        class="apply-form"
        label-position="top"
      >
        <div v-if="isCxoRoleSelected" class="cxo-application-groups">
          <section
            v-for="group in cxoApplicationGroups"
            :key="group.value"
            class="cxo-application-group"
          >
            <el-checkbox
              class="cxo-application-group__select-all"
              :model-value="isCxoApplicationGroupAllSelected(group)"
              :indeterminate="isCxoApplicationGroupIndeterminate(group)"
              @change="toggleCxoApplicationGroup(group)"
            >
              {{ group.label }}
            </el-checkbox>
            <div class="service-grid">
              <button
                v-for="dataType in group.dataTypes"
                :key="dataType.value"
                class="resource-card"
                :class="{
                  'resource-card--active': form.cxoPermissionMap[group.value]
                    .includes(dataType.value)
                }"
                type="button"
                @click="toggleCxoDataType(group.value, dataType.value)"
              >
                <span class="resource-card__name">
                  <span class="resource-card__checkbox" aria-hidden="true" />
                  <FourGridIcon />
                  {{ dataType.label }}
                </span>
                <span class="resource-card__meta">审批人：{{ dataType.approver }}</span>
              </button>
            </div>
          </section>
        </div>

        <template v-else>
          <el-form-item prop="cloudServerCodes">
            <template #label>
              <span class="form-item-title">
                <span>云服务</span>
                <span class="form-item-title__meta">审批人：{{ cloudServerApprover }}</span>
              </span>
            </template>
            <div class="service-grid">
              <button
                v-for="cloudServer in unownedCloudServers"
                :key="cloudServer.code"
                :class="{
                  'resource-card--active': form.cloudServerCodes.includes(cloudServer.code)
                }"
                class="resource-card service-card"
                type="button"
                @click="toggleCloudServer(cloudServer.code)"
              >
                <span class="resource-card__name">
                  <span class="resource-card__checkbox" aria-hidden="true" />
                  <FourGridIcon />
                  {{ cloudServer.code }}
                </span>
                <span class="service-card__art" aria-hidden="true" />
              </button>
            </div>
          </el-form-item>

          <el-form-item label="Region" prop="regionCodes">
            <section class="region-panel">
            <div class="region-toolbar">
              <label class="region-toolbar__label">区域</label>
              <el-select
                v-model="regionScopeFilter"
                class="region-toolbar__select"
                @change="handleRegionScopeChange"
              >
                <el-option label="全部" value="all" />
                <el-option
                  v-for="scope in regionScopeOptions"
                  :key="scope.code"
                  :label="scope.name"
                  :value="scope.code"
                />
              </el-select>
              <label class="region-toolbar__label">大区</label>
              <el-select v-model="areaFilter" class="region-toolbar__select" @change="handleAreaChange">
                <el-option label="全部" value="all" />
                <el-option
                  v-for="area in areaOptions"
                  :key="area.code"
                  :label="area.name"
                  :value="area.code"
                />
              </el-select>
              <el-input
                v-model="keyword"
                class="region-toolbar__search"
                placeholder="请输入Region名称"
                clearable
                @input="handleKeywordChange"
              >
                <template #suffix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>

            <el-scrollbar class="region-scroll">
              <div class="region-selection-bar">
                <button
                  class="region-select-all"
                  type="button"
                  @click="toggleAllRegions"
                >
                  <span
                    class="resource-card__checkbox"
                    :class="{
                      'resource-card__checkbox--checked': isAllRegionsChecked,
                      'resource-card__checkbox--indeterminate': isAllRegionsIndeterminate,
                    }"
                    aria-hidden="true"
                  />
                  全部Region
                </button>
                <span class="region-selection-bar__summary">已选择 {{ selectedRegionNames.length }} 个</span>
                <span class="region-selection-bar__names" :title="selectedRegionNames.join('、')">
                  {{ selectedRegionNames.join('、') }}
                </span>
              </div>
              <div
                v-for="group in visibleRegionGroups"
                :key="group.code"
                class="region-group"
              >
                <div class="region-group__title">
                  <button
                    class="region-group__arrow"
                    :class="{ 'region-group__arrow--open': openedGroups.includes(group.code) }"
                    type="button"
                    @click="toggleGroup(group.code)"
                  >
                    ›
                  </button>
                  <button
                    class="region-group__checkbox-button"
                    type="button"
                    @click="toggleRegionGroup(group)"
                  >
                    <span
                      class="resource-card__checkbox"
                      :class="{
                        'resource-card__checkbox--checked': isRegionGroupChecked(group),
                        'resource-card__checkbox--indeterminate': isRegionGroupIndeterminate(group),
                      }"
                      aria-hidden="true"
                    />
                  </button>
                  {{ group.name }}
                </div>
                <div
                  v-if="openedGroups.includes(group.code)"
                  class="region-grid"
                >
                  <button
                    v-for="region in group.children"
                    :key="region.code"
                    class="resource-card resource-card--region"
                    :class="{ 'resource-card--active': form.regionCodes.includes(region.code) }"
                    type="button"
                    @click="toggleRegion(region.code)"
                  >
                    <span class="resource-card__name">
                      <span class="resource-card__checkbox" aria-hidden="true" />
                      <FourGridIcon />
                      {{ region.name }}
                    </span>
                    <span class="resource-card__meta" />
                  </button>
                </div>
              </div>
            </el-scrollbar>
            </section>
          </el-form-item>
        </template>

        <el-form-item label="申请原因" prop="reason" required>
          <div class="reason-input">
            <el-input
              v-model="form.reason"
              maxlength="200"
              placeholder="请输入申请原因"
            />
            <span class="reason-input__count">{{ form.reason.length }} / 200</span>
          </div>
        </el-form-item>

        <div class="form-actions">
          <el-button class="back-button" :loading="backLoading" @click="handleBack">
            返回
          </el-button>
          <el-button class="quick-apply-button" :loading="submitLoading" @click="handleSubmit">
            快捷申请
          </el-button>
        </div>
      </el-form>
    </section>
  </main>
</template>

<script setup>
import { useNoDataAuth } from './useNoDataAuth';

const {
  FourGridIcon,
  QuestionFilled,
  Search,
  activeStatus,
  statusMessage,
  permissionTooltip,
  handleStatusChange,
  isCxoRoleSelected,
  ownedCxoTableRows,
  getCxoOwnedSpanMethod,
  backLoading,
  handleBack,
  ownedCloudServers,
  secondaryPermissionLabel,
  ownedSecondaryPermissions,
  ownedRegionGroups,
  approvingRows,
  formRef,
  form,
  rules,
  cxoApplicationGroups,
  isCxoApplicationGroupAllSelected,
  isCxoApplicationGroupIndeterminate,
  toggleCxoApplicationGroup,
  toggleCxoDataType,
  cloudServerApprover,
  unownedCloudServers,
  toggleCloudServer,
  regionScopeFilter,
  handleRegionScopeChange,
  regionScopeOptions,
  areaFilter,
  handleAreaChange,
  areaOptions,
  keyword,
  handleKeywordChange,
  isAllRegionsChecked,
  isAllRegionsIndeterminate,
  toggleAllRegions,
  visibleRegionGroups,
  selectedRegionNames,
  openedGroups,
  toggleGroup,
  toggleRegionGroup,
  isRegionGroupChecked,
  isRegionGroupIndeterminate,
  toggleRegion,
  submitLoading,
  handleSubmit,
} = useNoDataAuth();
</script>

<style lang="less" scoped>
.no-data-auth {
  min-height: 100vh;
  padding-bottom: 48px;
  overflow-x: hidden;
  background: #fbfcff;
}

.no-data-auth__content {
  width: min(1080px, calc(100% - 64px));
  margin: 24px auto 0;
}

.page-banner {
  height: 156px;
  overflow: hidden;
  background: linear-gradient(105deg, #e6f0fb 0%, #eaf1fb 60%, #cde4f9 100%);
}

.page-banner__inner {
  position: relative;
  display: flex;
  align-items: center;
  width: min(1140px, calc(100% - 64px));
  height: 100%;
  margin: 0 auto;
}

.page-banner__art {
  position: absolute;
  top: -64px;
  right: 8px;
  width: 400px;
  height: 280px;
  background: radial-gradient(ellipse at center, rgba(110, 181, 239, 0.35), transparent 63%);
}

.page-banner__orbit {
  position: absolute;
  top: 50%;
  left: 50%;
  border: 2px solid rgba(255, 255, 255, 0.52);
  border-radius: 50%;
  transform: translate(-50%, -50%) rotate(-14deg);
}

.page-banner__orbit--outer {
  width: 360px;
  height: 170px;
}

.page-banner__orbit--inner {
  width: 260px;
  height: 240px;
}

.page-banner__shield {
  position: absolute;
  top: 87px;
  left: 169px;
  width: 66px;
  height: 76px;
  border: 4px solid #8cbff0;
  background: linear-gradient(145deg, #c9e6ff, #3281d0 72%);
  box-shadow: 0 6px 20px rgba(61, 124, 193, 0.3), inset 0 0 0 3px rgba(255, 255, 255, 0.55);
  clip-path: polygon(50% 0, 96% 18%, 92% 62%, 50% 100%, 8% 62%, 4% 18%);
}

.page-banner__lock {
  position: absolute;
  top: 33px;
  left: 22px;
  width: 19px;
  height: 18px;
  border-radius: 3px;
  background: #eef8ff;
  box-shadow: 0 1px 5px #276bad;
}

.page-banner__lock::before {
  position: absolute;
  top: -11px;
  left: 4px;
  width: 11px;
  height: 14px;
  border: 3px solid #eef8ff;
  border-radius: 8px 8px 0 0;
  content: '';
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.page-title h1 {
  margin: 0;
  color: #273b5d;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
}

.page-title__icon {
  color: #59607d;
  cursor: help;
}

.status-tabs {
  margin-bottom: 0;
}

.status-message {
  margin: 8px 0 20px;
  color: #596178;
  font-size: 15px;
}

.apply-form {
  padding-bottom: 28px;
}

.cxo-application-groups {
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin-bottom: 28px;
}

.cxo-application-group__select-all {
  margin-bottom: 14px;
  color: #353b5c;
  font-size: 16px;
  font-weight: 700;
}

.cxo-application-group__select-all :deep(.el-checkbox__label) {
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
}

.form-item-title {
  display: inline-flex;
  align-items: center;
  gap: 18px;
}

.form-item-title__meta {
  color: #8a90a8;
  font-size: 14px;
  font-weight: 500;
}

.owned-auth {
  padding-bottom: 28px;
}

.cxo-owned-table {
  width: 100%;
  background: transparent;
}

.cxo-owned-table :deep(.el-table__header th) {
  height: 48px;
  color: #515873;
  background: #f3f5fb;
  font-size: 16px;
  font-weight: 700;
}

.cxo-owned-table :deep(.el-table__body td) {
  height: 60px;
  color: #3c4264;
  background: #fff;
}

.cxo-owned-table :deep(.cell) {
  padding: 0 18px;
}

.cxo-owned-actions {
  display: flex;
  justify-content: center;
  padding-top: 32px;
}

.owned-section + .owned-section {
  margin-top: 26px;
}

.approving-table {
  padding-top: 18px;
}

.approving-table__inner {
  width: 100%;
  background: transparent;
}

.approving-table :deep(.el-table__header th) {
  color: #515873;
  background: #f3f5fb;
  font-size: 16px;
  font-weight: 700;
}

.approving-table :deep(.el-table__header .cell) {
  line-height: 32px;
}

.approving-table :deep(.el-table__header th.el-table__cell) {
  padding: 2px 0;
}

.approving-table :deep(.el-table__cell) {
  border-bottom: 0;
}

.approving-table :deep(.el-table__empty-block) {
  min-height: 120px;
}

.approving-table :deep(.el-table__empty-text) {
  color: #7e849b;
  font-size: 16px;
}

.approving-table :deep(.el-table::before) {
  display: none;
}

.owned-section__title {
  margin: 0 0 14px;
  color: #2f3555;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
}

.owned-list {
  display: grid;
}

.owned-list--region {
  max-height: 390px;
  padding-right: 10px;
  overflow-y: auto;
}

.owned-region-group + .owned-region-group {
  margin-top: 10px;
}

.owned-region-group__title {
  margin: 0;
  color: #6a7085;
  font-size: 14px;
  font-weight: 600;
}

.owned-region-grid {
  padding-left: 0;
}

.owned-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid #e4e7ed;
  border-radius: 3px;
  color: #3c4264;
  background: #fff;
  cursor: pointer;
}

.owned-card--region {
  justify-content: flex-start;
}

.owned-card__name {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.owned-card__meta {
  color: #8a90a8;
  font-size: 14px;
  white-space: nowrap;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px 16px;
  width: 100%;
}

.resource-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid #e4e7ed;
  border-radius: 2px;
  color: #3c4264;
  background: #fff;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease;
}

.service-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(105deg, #fff 60%, #edf4ff);
}

.service-card__art {
  position: absolute;
  right: 15px;
  bottom: 5px;
  width: 34px;
  height: 32px;
  border: 5px solid #a9cff6;
  border-radius: 8px 8px 5px 5px;
  background: linear-gradient(135deg, #e8f5ff, #5b9de1);
  box-shadow: 4px 4px 0 #d4e7fb;
  transform: rotate(-15deg);
}

.service-card:nth-child(2) .service-card__art {
  border-radius: 50% 50% 8px 8px;
  transform: rotate(15deg);
}

.service-card:nth-child(3) .service-card__art {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  transform: rotate(24deg);
}

.resource-card:hover,
.resource-card--active {
  border-color: #4865d9;
  color: #3150cc;
  box-shadow: 0 0 0 1px rgba(72, 101, 217, 0.16);
}

.resource-card__name {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  font-weight: 600;
  white-space: nowrap;
}

.four-grid-icon {
  display: inline-grid;
  grid-template-columns: repeat(2, 6px);
  gap: 1px;
  color: #4865d9;
}

.four-grid-icon :deep(span) {
  width: 6px;
  height: 6px;
  border-radius: 1px;
  background: currentColor;
}

.resource-card__checkbox {
  position: relative;
  width: 14px;
  height: 14px;
  border: 1px solid #b8bfd6;
  border-radius: 2px;
  background: #fff;
}

.resource-card--active .resource-card__checkbox {
  border-color: #4865d9;
  background: #4865d9;
}

.resource-card__checkbox--checked {
  border-color: #4865d9;
  background: #4865d9;
}

.resource-card--active .resource-card__checkbox::after,
.resource-card__checkbox--checked::after {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 8px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  content: "";
  transform: translate(-50%, -58%) rotate(45deg);
}

.resource-card__checkbox--indeterminate {
  border-color: #4865d9;
  background: #4865d9;
}

.resource-card__checkbox--indeterminate::after {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 2px;
  background: #fff;
  content: "";
  transform: translate(-50%, -50%);
}

.resource-card__meta {
  color: #8a90a8;
  font-size: 13px;
  white-space: nowrap;
}

.region-panel {
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
}

.region-toolbar {
  display: grid;
  grid-template-columns: auto 160px auto 160px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 0 0 12px;
}

.region-toolbar__label {
  color: #4a506e;
  font-weight: 600;
}

.region-toolbar__select {
  width: 160px;
}

.region-toolbar__search {
  min-width: 0;
  width: 100%;
}

.region-scroll {
  height: 390px;
  padding: 0 10px 0 0;
}

.region-selection-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  height: 32px;
}

.region-selection-bar__summary {
  flex: none;
  color: #5b6178;
  white-space: nowrap;
}

.region-selection-bar__names {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #939aab;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.region-select-all {
  display: inline-flex;
  align-items: center;
  flex: none;
  gap: 10px;
  height: 28px;
  padding: 0;
  border: 0;
  color: #4a506e;
  background: transparent;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.region-group + .region-group {
  margin-top: 12px;
}

.region-selection-bar + .region-group {
  margin-top: 12px;
}

.region-group__title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 28px;
  padding: 0;
  color: #4a506e;
  font-weight: 600;
}

.region-group__arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: 0;
  color: #6e7490;
  background: transparent;
  cursor: pointer;
  transform: rotate(0deg);
  transition: transform 0.2s ease;
}

.region-group__arrow--open {
  transform: rotate(90deg);
}

.region-group__checkbox-button {
  display: inline-flex;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.region-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px 16px;
  padding: 8px 0 10px 18px;
}

.resource-card--region {
  justify-content: flex-start;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-top: 12px;
}

.reason-input {
  position: relative;
  width: 100%;
}

.reason-input :deep(.el-input__wrapper) {
  padding-right: 72px;
}

.reason-input__count {
  position: absolute;
  top: 50%;
  right: 12px;
  color: #909399;
  font-size: 12px;
  line-height: 1;
  transform: translateY(-50%);
}

.quick-apply-button {
  width: 96px;
  height: 34px;
  border-color: #4865d9;
  color: #fff;
  background: #4865d9;
}

.quick-apply-button:hover,
.quick-apply-button:focus {
  border-color: #4865d9;
  color: #fff;
  background: #4865d9;
}

.back-button {
  width: 96px;
  height: 34px;
  border-color: #d4d8e8;
  color: #4a5270;
  background: #fff;
}

:deep(.el-tabs__item) {
  display: inline-flex;
  align-items: center;
  min-width: 82px;
  height: 32px;
  padding: 0 18px !important;
  box-sizing: border-box;
  justify-content: center;
  color: #4f5570;
  background: #f1f3fa;
  font-weight: 600;
  line-height: 32px;
  text-align: center;
}

:deep(.el-tabs__item:first-child),
:deep(.el-tabs__item:last-child) {
  padding: 0 20px !important;
}

:deep(.el-tabs__item.is-active) {
  color: #fff;
  background: #4865d9;
}

:deep(.el-tabs__active-bar) {
  display: none;
}

:deep(.el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.el-form-item__label) {
  color: #2f3555;
  font-size: 16px;
  font-weight: 700;
}

@media (max-width: 900px) {
  .no-data-auth__content,
  .page-banner__inner {
    width: calc(100% - 48px);
  }

  .page-banner__art {
    right: -110px;
    opacity: 0.65;
  }

  .owned-card {
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
    padding: 12px 18px;
  }

  .owned-card__meta {
    white-space: normal;
  }

  .service-grid,
  .region-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .resource-card {
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    min-height: 64px;
  }

  .resource-card__meta {
    white-space: normal;
  }

  .region-toolbar {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .region-toolbar__select {
    width: 100%;
  }

  .region-toolbar__search {
    grid-column: 1 / -1;
  }
}

@media (max-width: 600px) {
  /* 移动端根字号随视口缩放，no-rem 规则保留固定触控与文字尺寸。 */
  .no-rem .page-banner {
    height: 120px;
  }

  .no-rem .page-banner__art {
    display: none;
  }

  .no-rem .page-title h1 {
    font-size: 22px;
  }

  .no-rem .no-data-auth__content,
  .no-rem .page-banner__inner {
    width: calc(100% - 32px);
  }

  .no-rem .no-data-auth__content {
    margin-top: 20px;
  }

  .no-rem .page-title__icon {
    font-size: 16px;
  }

  .no-rem .status-message {
    margin: 12px 0 20px;
    font-size: 14px;
  }

  .no-rem .service-grid,
  .no-rem .region-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .no-rem .resource-card,
  .no-rem .owned-card {
    min-height: 48px;
    padding: 8px 12px;
    font-size: 14px;
  }

  .no-rem .resource-card__checkbox {
    width: 14px;
    height: 14px;
  }

  .no-rem .four-grid-icon {
    grid-template-columns: repeat(2, 6px);
  }

  .no-rem .four-grid-icon :deep(span) {
    width: 6px;
    height: 6px;
  }

  .no-rem .owned-section__title,
  .no-rem .cxo-application-group__select-all {
    font-size: 16px;
  }

  .no-rem .region-toolbar {
    gap: 10px;
    padding-bottom: 12px;
  }

  .no-rem .region-toolbar__label,
  .no-rem .region-select-all,
  .no-rem .region-selection-bar,
  .no-rem .region-group__title,
  .no-rem .owned-region-group__title {
    font-size: 14px;
  }

  .no-rem .region-scroll,
  .no-rem .owned-list--region {
    height: 390px;
    max-height: 390px;
  }

  .no-rem .region-grid {
    padding-left: 22px;
  }

  .no-rem .service-card__art {
    width: 30px;
    height: 28px;
  }

  .no-rem .region-selection-bar {
    gap: 8px;
    height: 32px;
  }

  .no-rem .region-select-all {
    gap: 8px;
    height: 28px;
  }

  .no-rem .region-selection-bar__names {
    display: none;
  }
}
</style>
