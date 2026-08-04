<template>
  <div class="container">
    <div class="title">
      <div class="section-title">
        <SvgIcon iconName="xpod-1" class="triangle-icon" :style="{ width: 20, height: 20 }" />
        <span class="title-text">算力类型</span>
      </div>
      <div class="title-right">
        <slot name="filter"></slot>
        <div class="collapse-toggle" v-if="showCollapse" @click="toggleCollapse">
          <span class="collapse-text">{{ isCollapsed ? '展开算力分布' : '收起算力分布' }}</span>
          <span class="collapse-arrow" :class="{ 'is-collapsed': isCollapsed }">
            <SvgIcon iconName="left-return" :style="{ width: 12, height: 12 }" />
          </span>
        </div>
      </div>
    </div>
    
    <div :class="{ info: true, 'info-1': !isCollapsed }">
      <div class="item-all">
        <div class="item-top">
          <SvgIcon iconName="summary" class="triangle-icon" :style="{ width: 20, height: 20 }" />
          <span class="name">总可售量</span>
          <span class="unit">(万核)</span>
        </div>
        <div class="line"></div>
        <div class="item-bottom-all">
          <div class="value-total">
            {{ permissionTable.ecs ? totalSellableValue : '**' }}
          </div>
          <div class="bottom-left-ratio bottom-left-ratio-all">
            <div class="sub-value">环比</div>
            <div class="sub-name">
            <SvgIcon
              class="icon-trend"
              :iconName="Number(totalCompareValue) < 0 ? 'ECSarrowdown' : 'ECSarrowup'"
              :style="{ width: 10, height: 10 }"
            />
            {{ totalCompareValue === '--' ? '--' : Math.abs(totalCompareValue) }}
          </div>
        </div>
      </div>
    </div>
    <SvgIcon iconName="separation" v-if="isCollapsed" style="{ width: 8, height: 112 }" />
    <SvgIcon iconName="separation-344" v-else :style="{ width: 8, height: 344 }" />
    <div class="item" v-for="(item, index) in infors" :key="item.title">
      <div class="item-top">
        <SvgIcon :iconName="item.icon" class="triangle-icon" style="{ width: 20, height: 20 }" />
        <span class="name">{{ item.title }}</span>
        <span class="unit">(万核)</span>
      </div>
      <div class="line"></div>
      <div class="item-bottom">
        <div class="bottom-left">
          <div class="bottom-left-main">
            <div class="sub-name">总可售量</div>
              <div class="sub-value">
                <span class="value-total">
                  {{ permissionTable.ecs ? item.totalValue : '**' }}
                </span>
              </div>
            </div>
            <div class="bottom-left-ratio">
              <div class="sub-name">
                <SvgIcon
                  class="icon-trend"
                  :iconName="Number(item.compareValue) < 0 ? 'ECSarrowdown' : 'ECSarrowup'"
                  :style="{ width: 10, height: 10 }"
                />
                {{ item.compareValue === '--' ? '--' : Math.abs(item.compareValue) }}
              </div>
              <div class="sub-value">环比</div>
            </div>
          </div>
          <SvgIcon iconName="separation" style="{ width: 5.5, height: 48 }"/>
          <div class="inter" :class="{ 'inter-column': item.title === 'K算力' }">
            <div class="interItem" v-for="sub in item.subList" :key="sub.title">
              <div class="inter-title">{{ sub.title }}</div>
              <div class="inter-num">{{ sub.num }}</div>
            </div>
          </div>
        </div>
        <ECSTrend v-if="!isCollapsed" :chartData="item.chartData"></ECSTrend>
      </div>
    </div>
  </div>
</template>