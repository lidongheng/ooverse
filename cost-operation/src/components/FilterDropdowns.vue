<template>
  <div class="filter-bar custom-filter-bar" :class="{ 'is-loading': loading }">
    <div
      v-for="filter in visibleFilters"
      :key="filter.key"
      class="filter-item"
    >
      <span v-if="!filter.hideLabel" class="filter-label">{{ filter.label }}</span>
      <el-popover
        v-if="filter.type === 'areaCascade'"
        :visible="areaVisible[filter.key]"
        @update:visible="visible => setAreaVisible(filter, visible)"
        placement="bottom-start"
        :trigger="loading ? 'manual' : 'click'"
        width="fit-content"
        :show-arrow="false"
        :popper-class="getAreaPopperClass(filter)"
      >
        <template #reference>
          <button class="select-trigger area-trigger" type="button" :disabled="loading">
            <el-icon v-if="filter.icon === 'location'" class="area-trigger-icon"><Location /></el-icon>
            <span>{{ getAreaSummary(filter) }}</span>
            <el-icon><ArrowDown /></el-icon>
          </button>
        </template>
        <div class="dropdown-panel area-cascade-panel">
          <div class="area-cascade-columns">
            <div class="area-cascade-column">
              <div class="column-title">{{ filter.columns[0].title }}</div>
              <div class="resource-scroll">
                <el-checkbox-group
                  :model-value="getAreaValue(filter.areaValueKey)"
                  @update:model-value="value => setAreaValue(filter, filter.areaValueKey, value)"
                >
                  <label
                    v-for="item in getAreaRootOptions(filter)"
                    :key="item.value"
                    :class="['resource-row', { active: areaActive[filter.key] === item.value }]"
                    @mouseenter="setAreaActive(filter, item.value)"
                  >
                    <el-checkbox :value="item.value">{{ item.label }}</el-checkbox>
                    <el-icon><ArrowRight /></el-icon>
                  </label>
                </el-checkbox-group>
              </div>
            </div>
            <div class="area-cascade-column">
              <div class="column-title">{{ filter.columns[1].title }}</div>
              <div class="resource-scroll">
                <el-checkbox-group
                  :model-value="getAreaValue(filter.districtValueKey)"
                  @update:model-value="value => setAreaValue(filter, filter.districtValueKey, value)"
                >
                  <label
                    v-for="item in getAreaDistrictOptions(filter)"
                    :key="item.value"
                    :class="['resource-row', { active: areaDistrictActive[filter.key] === item.value }]"
                    @mouseenter="setAreaDistrictActive(filter, item.value)"
                  >
                    <el-checkbox :value="item.value">{{ item.label }}</el-checkbox>
                    <el-icon><ArrowRight /></el-icon>
                  </label>
                </el-checkbox-group>
              </div>
            </div>
            <div class="area-cascade-column">
              <div class="column-title">{{ filter.columns[2].title }}</div>
              <div class="resource-scroll">
                <el-checkbox-group
                  :model-value="getAreaValue(filter.regionValueKey)"
                  @update:model-value="value => setAreaValue(filter, filter.regionValueKey, value)"
                >
                  <label
                    v-for="item in getAreaRegionOptions(filter)"
                    :key="item.value"
                    class="resource-row"
                  >
                    <el-checkbox :value="item.value">{{ item.label }}</el-checkbox>
                  </label>
                </el-checkbox-group>
              </div>
            </div>
          </div>
          <div class="panel-actions">
            <button class="plain-btn" type="button" @click="cancelAreaFilter(filter)">取消</button>
            <button class="primary-btn" type="button" @click="confirmAreaFilter(filter)">确定</button>
          </div>
        </div>
      </el-popover>
      <el-popover
        v-else-if="isCustomFilter(filter)"
        :visible="customVisible[filter.key]"
        @update:visible="visible => setCustomVisible(filter, visible)"
        placement="bottom-start"
        :trigger="loading ? 'manual' : 'click'"
        width="fit-content"
        :show-arrow="false"
        :popper-class="getCustomPopperClass(filter)"
      >
        <template #reference>
          <button class="select-trigger resource-trigger" type="button" :disabled="loading">
            <span>{{ getCustomSummary(filter) }}</span>
            <el-icon><ArrowDown /></el-icon>
          </button>
        </template>
        <div
          v-if="filter.type === 'list'"
          class="dropdown-panel custom-list-panel"
        >
          <div class="option-list">
            <label class="option-row checked-row">
              <el-checkbox
                :model-value="isAllSelected(getCustomValue(filter.valueKey), getCustomRootOptions(filter))"
                :indeterminate="isIndeterminate(getCustomValue(filter.valueKey), getCustomRootOptions(filter))"
                @change="checked => toggleCustomAll(filter, filter.valueKey, getCustomRootOptions(filter), checked)"
              />
              <span>全部</span>
            </label>
            <el-checkbox-group
              :model-value="getCustomValue(filter.valueKey)"
              class="option-group"
              @update:model-value="value => setCustomValue(filter, filter.valueKey, value)"
            >
              <label
                v-for="item in getCustomRootOptions(filter)"
                :key="item.value"
                class="option-row"
              >
                <el-checkbox :value="item.value">{{ item.label }}</el-checkbox>
              </label>
            </el-checkbox-group>
          </div>
        </div>
        <div
          v-else
          class="dropdown-panel custom-cascade-panel"
        >
          <div v-if="filter.searchable" class="search-box custom-search">
            <el-icon><Search /></el-icon>
            <input
              :value="customKeyword[filter.key]"
              placeholder="请输入关键字"
              @input="event => setCustomKeyword(filter.key, event.target.value)"
            />
          </div>
          <div class="custom-columns">
            <div class="custom-column">
              <div class="column-title">{{ filter.columns[0].title }}</div>
              <div class="resource-scroll">
                <label class="resource-row checked-row">
                  <el-checkbox
                    :model-value="isAllSelected(getCustomValue(filter.parentValueKey), getCustomRootOptions(filter))"
                    :indeterminate="isIndeterminate(getCustomValue(filter.parentValueKey), getCustomRootOptions(filter))"
                    @change="checked => toggleCustomParentAll(filter, checked)"
                  />
                  <span>全部</span>
                  <el-icon><ArrowRight /></el-icon>
                </label>
                <el-checkbox-group
                  :model-value="getCustomValue(filter.parentValueKey)"
                  @update:model-value="value => setCustomParentValue(filter, value)"
                >
                  <label
                    v-for="item in getCustomRootOptions(filter)"
                    :key="item.value"
                    :class="['resource-row', { active: customActive[filter.key] === item.value }]"
                    @mouseenter="setCustomActive(filter.key, item.value)"
                  >
                    <el-checkbox :value="item.value">{{ item.label }}</el-checkbox>
                    <el-icon><ArrowRight /></el-icon>
                  </label>
                </el-checkbox-group>
              </div>
            </div>
            <div class="custom-column">
              <div class="column-title">{{ filter.columns[1].title }}</div>
              <div class="resource-scroll">
                <label class="resource-row checked-row">
                  <el-checkbox
                    :model-value="isAllSelected(getCustomValue(filter.valueKey), getCustomLeafOptions(filter))"
                    :indeterminate="isIndeterminate(getCustomValue(filter.valueKey), getCustomLeafOptions(filter))"
                    @change="checked => toggleCustomAll(filter, filter.valueKey, getCustomLeafOptions(filter), checked)"
                  />
                  <span>全部</span>
                </label>
                <el-checkbox-group
                  :model-value="getCustomValue(filter.valueKey)"
                  @update:model-value="value => setCustomValue(filter, filter.valueKey, value)"
                >
                  <label
                    v-for="item in getCustomLeafOptions(filter)"
                    :key="item.value"
                    class="resource-row"
                  >
                    <el-checkbox :value="item.value">{{ item.label }}</el-checkbox>
                  </label>
                </el-checkbox-group>
              </div>
            </div>
          </div>
          <div v-if="filter.confirmable" class="panel-actions">
            <button class="plain-btn" type="button" @click="cancelCustomFilter(filter)">取消</button>
            <button class="primary-btn" type="button" @click="confirmCustomFilter(filter)">确定</button>
          </div>
        </div>
      </el-popover>
      <el-popover
        v-else-if="filter.type === 'range'"
        v-model:visible="rangeVisible"
        placement="bottom-start"
        :trigger="loading ? 'manual' : 'click'"
        width="fit-content"
        :show-arrow="false"
        :popper-class="rangePopperClass"
      >
        <template #reference>
          <button
            class="select-trigger"
            :class="{ 'area-trigger': isRangeAreaCascader }"
            type="button"
            :disabled="loading"
          >
            <el-icon v-if="isRangeAreaCascader && filter.icon === 'location'" class="area-trigger-icon"><Location /></el-icon>
            <span>{{ rangeSummary }}</span>
            <el-icon><ArrowDown /></el-icon>
          </button>
        </template>
        <div
          class="dropdown-panel range-panel"
          :class="{
            'range-panel--single': !showRegionFilter || !showAzFilter,
            'range-panel--area-cascader': isRangeAreaCascader,
          }"
        >
          <div v-if="showRegionSearch" class="search-box range-search">
            <el-icon><Search /></el-icon>
            <input v-model="regionKeyword" placeholder="请输入关键字" />
          </div>
          <div class="range-columns" :class="{ 'range-columns--single': !showRegionFilter || !showAzFilter }">
            <div v-if="showRegionFilter" class="range-column">
              <div class="column-title">{{ regionColumnConfig.label }}</div>
              <div class="option-list">
                <label v-if="showRangeFirstAll" class="option-row checked-row">
                  <el-checkbox
                    :model-value="isAllSelected(regionValue, filteredRegionOptions)"
                    :indeterminate="isIndeterminate(regionValue, filteredRegionOptions)"
                    @change="checked => toggleAll('region', checked)"
                  />
                  <span>全部</span>
                  <el-icon><ArrowRight /></el-icon>
                </label>
                <el-checkbox-group v-model="regionValue" class="option-group">
                  <label
                    v-for="item in filteredRegionOptions"
                    :key="item.value"
                    class="option-row"
                  >
                    <el-checkbox :value="item.value">{{ item.label }}</el-checkbox>
                    <el-icon><ArrowRight /></el-icon>
                  </label>
                </el-checkbox-group>
              </div>
            </div>

            <div v-if="showAzFilter" class="range-column">
              <div class="column-title">{{ azColumnConfig.label }}</div>
              <div class="option-list">
                <label v-if="showRangeSecondAll" class="option-row checked-row">
                  <el-checkbox
                    :model-value="isAllSelected(azValue, filteredAzOptions)"
                    :indeterminate="isIndeterminate(azValue, filteredAzOptions)"
                    @change="checked => toggleAll('az', checked)"
                  />
                  <span>全部</span>
                  <el-icon><ArrowRight /></el-icon>
                </label>
                <el-checkbox-group v-model="azValue" class="option-group">
                  <label
                    v-for="item in filteredAzOptions"
                    :key="item.value"
                    class="option-row"
                  >
                    <el-checkbox :value="item.value">{{ item.label }}</el-checkbox>
                    <el-icon><ArrowRight /></el-icon>
                  </label>
                </el-checkbox-group>
              </div>
            </div>
          </div>
          <div class="panel-actions">
            <button class="plain-btn" type="button" @click="cancelRange">取消</button>
            <button class="primary-btn" type="button" @click="confirmRange">确定</button>
          </div>
        </div>
      </el-popover>
      <el-popover
        v-else-if="filter.type === 'resourceTree'"
        v-model:visible="resourceVisible"
        placement="bottom-start"
        :trigger="loading ? 'manual' : 'click'"
        width="fit-content"
        :show-arrow="false"
        :popper-class="resourcePopperClass"
      >
        <template #reference>
          <button class="select-trigger resource-trigger" type="button" :disabled="loading">
            <span>{{ loading ? '加载中' : resourceSummary }}</span>
            <el-icon><ArrowDown /></el-icon>
          </button>
        </template>
        <div v-if="isResourceListFilter" class="dropdown-panel resource-panel resource-panel--list">
          <div class="resource-columns resource-columns--list">
            <div class="resource-column">
              <div class="column-title">{{ resourceCloudServerColumn.label }}</div>
              <div class="resource-scroll">
                <label class="resource-row checked-row">
                  <el-checkbox
                    :model-value="isAllSelected(resourceCloudServerValue, resourceTypeOnlyCloudServers)"
                    :indeterminate="isIndeterminate(resourceCloudServerValue, resourceTypeOnlyCloudServers)"
                    @change="checked => toggleAll(resourceCloudServerColumn.valueKey, checked)"
                  />
                  <span>全部</span>
                  <el-icon><ArrowRight /></el-icon>
                </label>
                <el-checkbox-group v-model="resourceCloudServerValue">
                  <label
                    v-for="item in resourceTypeOnlyCloudServers"
                    :key="item.value"
                    :class="['resource-row', { active: activeCloudServer === item.value }]"
                    @mouseenter="activeCloudServer = item.value"
                  >
                    <el-checkbox :value="item.value">{{ item.label }}</el-checkbox>
                    <el-icon><ArrowRight /></el-icon>
                  </label>
                </el-checkbox-group>
              </div>
            </div>

            <div class="resource-column">
              <div class="column-title">{{ resourceTypeColumn.label }}</div>
              <div class="resource-scroll">
                <label class="resource-row checked-row">
                  <el-checkbox
                    :model-value="isAllSelected(resourceTypeValue, visibleResourceTypes)"
                    :indeterminate="isIndeterminate(resourceTypeValue, visibleResourceTypes)"
                    @change="checked => toggleAll(resourceTypeColumn.valueKey, checked)"
                  />
                  <span>全部</span>
                </label>
                <el-checkbox-group v-model="resourceTypeValue">
                  <label
                    v-for="item in visibleResourceTypes"
                    :key="item.value"
                    class="resource-row"
                  >
                    <el-checkbox :value="item.value">{{ item.label }}</el-checkbox>
                  </label>
                </el-checkbox-group>
              </div>
            </div>
          </div>
        </div>
        <div
          v-else
          class="dropdown-panel resource-panel"
          :class="{ 'resource-panel--single': isOneLevelResourceTree }"
        >
          <div class="resource-columns" :class="{ 'resource-columns--single': isOneLevelResourceTree }">
            <div v-if="!isOneLevelResourceTree" class="resource-column">
              <div class="column-title">{{ resourceCloudServerColumn.label }}</div>
              <div class="resource-scroll">
                <label class="resource-row checked-row">
                  <el-checkbox
                    :model-value="isAllSelected(resourceCloudServerValue, resourceCloudServers)"
                    :indeterminate="isIndeterminate(resourceCloudServerValue, resourceCloudServers)"
                    @change="checked => toggleAll(resourceCloudServerColumn.valueKey, checked)"
                  />
                  <span>全部</span>
                  <el-icon><ArrowRight /></el-icon>
                </label>
                <el-checkbox-group v-model="resourceCloudServerValue">
                  <label
                    v-for="item in resourceCloudServers"
                    :key="item.value"
                    :class="['resource-row', { active: activeCloudServer === item.value }]"
                    @mouseenter="activeCloudServer = item.value"
                  >
                    <el-checkbox :value="item.value">{{ item.label }}</el-checkbox>
                    <el-icon><ArrowRight /></el-icon>
                  </label>
                </el-checkbox-group>
              </div>
            </div>

            <div v-if="!isOneLevelResourceTree" class="resource-column">
              <div class="column-title">{{ resourceSeriesColumn.label }}</div>
              <div class="resource-scroll">
                <label class="resource-row checked-row">
                  <el-checkbox
                    :model-value="isAllSelected(resourceSeriesValue, visibleResourceSeries)"
                    :indeterminate="isIndeterminate(resourceSeriesValue, visibleResourceSeries)"
                    @change="checked => toggleAll(resourceSeriesColumn.valueKey, checked)"
                  />
                  <span>全部</span>
                  <el-icon><ArrowRight /></el-icon>
                </label>
                <el-checkbox-group v-model="resourceSeriesValue">
                  <label
                    v-for="item in visibleResourceSeries"
                    :key="item.value"
                    :class="['resource-row', { active: activeSeries === item.value }]"
                    @mouseenter="activeSeries = item.value"
                  >
                    <el-checkbox :value="item.value">{{ item.label }}</el-checkbox>
                    <el-icon><ArrowRight /></el-icon>
                  </label>
                </el-checkbox-group>
              </div>
            </div>

            <div v-if="!isOneLevelResourceTree" class="resource-column">
              <div class="column-title">{{ resourceFamilyColumn.label }}</div>
              <div class="resource-scroll">
                <label class="resource-row checked-row">
                  <el-checkbox
                    :model-value="isAllSelected(resourceFamilyValue, visibleResourceFamilies)"
                    :indeterminate="isIndeterminate(resourceFamilyValue, visibleResourceFamilies)"
                    @change="checked => toggleAll(resourceFamilyColumn.valueKey, checked)"
                  />
                  <span>全部</span>
                  <el-icon><ArrowRight /></el-icon>
                </label>
                <el-checkbox-group v-model="resourceFamilyValue">
                  <label
                    v-for="item in visibleResourceFamilies"
                    :key="item.value"
                    :class="['resource-row', { active: activeFamily === item.value }]"
                    @mouseenter="activeFamily = item.value"
                  >
                    <el-checkbox :value="item.value">{{ item.label }}</el-checkbox>
                    <el-icon><ArrowRight /></el-icon>
                  </label>
                </el-checkbox-group>
              </div>
            </div>

            <div v-if="!isOneLevelResourceTree" class="resource-column">
              <div class="column-title">{{ resourceGenerationColumn.label }}</div>
              <div class="resource-scroll">
                <label class="resource-row checked-row">
                  <el-checkbox
                    :model-value="isAllSelected(resourceVerValue, visibleResourceGenerations)"
                    :indeterminate="isIndeterminate(resourceVerValue, visibleResourceGenerations)"
                    @change="checked => toggleAll(resourceGenerationColumn.valueKey, checked)"
                  />
                  <span>全部</span>
                  <el-icon><ArrowRight /></el-icon>
                </label>
                <el-checkbox-group v-model="resourceVerValue">
                  <label
                    v-for="item in visibleResourceGenerations"
                    :key="item.value"
                    :class="['resource-row', { active: activeGeneration === item.value }]"
                    @mouseenter="activeGeneration = item.value"
                  >
                    <el-checkbox :value="item.value">{{ item.label }}</el-checkbox>
                    <el-icon><ArrowRight /></el-icon>
                  </label>
                </el-checkbox-group>
              </div>
            </div>

            <div class="resource-column">
              <div class="column-title">{{ resourceTypeColumn.label }}</div>
              <div class="resource-scroll">
                <label class="resource-row checked-row">
                  <el-checkbox
                    :model-value="isAllSelected(resourceTypeValue, visibleResourceTypes)"
                    :indeterminate="isIndeterminate(resourceTypeValue, visibleResourceTypes)"
                    @change="checked => toggleAll(resourceTypeColumn.valueKey, checked)"
                  />
                  <span>全部</span>
                </label>
                <el-checkbox-group v-model="resourceTypeValue">
                  <label
                    v-for="item in visibleResourceTypes"
                    :key="item.value"
                    class="resource-row"
                  >
                    <el-checkbox :value="item.value">{{ item.label }}</el-checkbox>
                  </label>
                </el-checkbox-group>
              </div>
            </div>
          </div>
          <div v-if="isResourceConfirmable" class="panel-actions">
            <button class="plain-btn" type="button" @click="cancelResource">取消</button>
            <button class="primary-btn" type="button" @click="confirmResource">确定</button>
          </div>
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { ArrowDown, ArrowRight, Location, Search } from '@element-plus/icons-vue';

const props = defineProps({
  options: {
    type: Object,
    default: () => ({
      regionNameList: [],
      azNameList: [],
      resourceTree: [],
    }),
  },
  modelValue: {
    type: Object,
    default: null,
  },
  filterConfig: { type: Array, required: true },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'change']);

const rangeVisible = ref(false);
const resourceVisible = ref(false);
const regionKeyword = ref('');
const customVisible = ref({});
const customKeyword = ref({});
const customActive = ref({});
const customValueMap = ref({});
const customSnapshotMap = ref({});
const areaVisible = ref({});
const areaActive = ref({});
const areaDistrictActive = ref({});
const areaValueMap = ref({});
const areaSnapshotMap = ref({});

const rangeFilterConfig = computed(() => getFilterConfigByKey('range'));
const resourceTypeFilterConfig = computed(() => getFilterConfigByKey('resourceType'));
const rangeColumns = computed(() => rangeFilterConfig.value?.columns ?? []);
const regionColumnConfig = computed(() => rangeColumns.value[0] ?? {});
const azColumnConfig = computed(() => rangeColumns.value[1] ?? {});
const regionOptions = computed(() => getRangeColumnOptions(regionColumnConfig.value, 'regionNameList'));
const azOptions = computed(() => getRangeColumnOptions(azColumnConfig.value, 'azNameList'));
const resourceTreeColumns = computed(() => resourceTypeFilterConfig.value.columns);
const resourceCloudServerColumn = computed(() => resourceTreeColumns.value[0]);
const resourceSeriesColumn = computed(() => resourceTreeColumns.value[1]);
const resourceFamilyColumn = computed(() => resourceTreeColumns.value[2]);
const resourceGenerationColumn = computed(() => resourceTreeColumns.value[3]);
const resourceTypeColumn = computed(() => resourceTreeColumns.value[4]);
const customFilters = computed(() => props.filterConfig.filter(filter => isCustomFilter(filter)));
const areaFilters = computed(() => props.filterConfig.filter(filter => filter.type === 'areaCascade'));
const hasRangeFilter = computed(() => Boolean(rangeFilterConfig.value));
const hasResourceTreeFilter = computed(() => Boolean(resourceTypeFilterConfig.value));
const visibleFilters = computed(() =>
  props.filterConfig.filter((filter) => {
    if (filter.type === 'range') return showRangeFilter.value;
    if (filter.type === 'resourceTree') return showResourceTypeFilter.value;
    return filter.visible !== false;
  })
);

const showRegionFilter = computed(() => regionColumnConfig.value.visible);
const showAzFilter = computed(() => azColumnConfig.value.visible);
const showRangeFilter = computed(() => showRegionFilter.value || showAzFilter.value);
const showRegionSearch = computed(() => regionColumnConfig.value.searchable);
const showRangeFirstAll = computed(() => regionColumnConfig.value.showAll !== false);
const showRangeSecondAll = computed(() => azColumnConfig.value.showAll !== false);
const showResourceTypeFilter = computed(() => resourceTypeFilterConfig.value.visible);
const isResourceListFilter = computed(() => resourceTypeFilterConfig.value.variant === "list");
const isResourceConfirmable = computed(() => resourceTypeFilterConfig.value.confirmable);
const isRangeAreaCascader = computed(() => rangeFilterConfig.value?.variant === 'areaCascader');
const useRangeColumnOptionKeys = computed(() => rangeFilterConfig.value?.optionKeyMode === 'valueKeyList');
const rangeAutoSelectChild = computed(() => rangeFilterConfig.value?.autoSelectChild !== false);
const rangePopperClass = computed(() => {
  const singleClass = !showRegionFilter.value || !showAzFilter.value ? " filter-popper--range-single" : "";
  const areaClass = isRangeAreaCascader.value ? " filter-popper--area-cascade" : "";
  return `filter-popper filter-popper--range${singleClass}${areaClass}`;
});
const resourcePopperClass = computed(() => "filter-popper");
const loading = computed(() => props.loading);
const filteredAzOptions = computed(() => filterAzOptionsByRegions(azOptions.value, regionValue.value));
const resourceTree = computed(() => normalizeResourceTree(props.options?.resourceTree));
const isOneLevelResourceTree = computed(() =>
  resourceTree.value.length > 0 && resourceTree.value.every(item => !(item.children ?? []).length)
);
const resourceCloudServers = computed(() => resourceTree.value.map(toOptionMeta));
const resourceTypeOnlyCloudServers = computed(() => {
  const cloudServers = resourceTree.value.filter(item => collectDirectTypesByCloudServers([item.value]).length > 0);
  return getUniqueOptions(cloudServers);
});
const currentResourceCloudServers = computed(() => {
  if (isResourceListFilter.value) {
    return resourceTypeOnlyCloudServers.value;
  }
  return resourceCloudServers.value;
});
const allResourceSeries = computed(() => collectSeriesByCloudServers(resourceCloudServers.value.map(item => item.value)));
const allResourceFamilies = computed(() =>
  collectFamiliesBySeries(resourceCloudServers.value.map(item => item.value), allResourceSeries.value.map(item => item.value))
);
const allResourceGenerations = computed(() =>
  collectGenerationsByFamilies(
    resourceCloudServers.value.map(item => item.value),
    allResourceSeries.value.map(item => item.value),
    allResourceFamilies.value.map(item => item.value),
  )
);
const allResourceTypes = computed(() => {
  if (isResourceListFilter.value) {
    return collectDirectTypesByCloudServers(resourceTypeOnlyCloudServers.value.map(item => item.value));
  }
  return collectTypesByGenerations(
    resourceCloudServers.value.map(item => item.value),
    allResourceSeries.value.map(item => item.value),
    allResourceFamilies.value.map(item => item.value),
    allResourceGenerations.value.map(item => item.value),
  );
});

const regionValue = ref([]);
const azValue = ref([]);
const resourceCloudServerValue = ref([]);
const resourceSeriesValue = ref([]);
const resourceFamilyValue = ref([]);
const resourceVerValue = ref([]);
const resourceTypeValue = ref([]);
const rangeSnapshot = ref(getRangeValue());
const resourceSnapshot = ref({});

const activeCloudServer = ref('');
const activeSeries = ref('');
const activeFamily = ref('');
const activeGeneration = ref('');
let syncingFromModel = false;
let syncingResourceCascade = false;
let syncingLocationCascade = false;

const filteredRegionOptions = computed(() => {
  const keyword = regionKeyword.value.trim().toLowerCase();
  if (!keyword) {
    return regionOptions.value;
  }
  return regionOptions.value.filter(item => item.label.toLowerCase().includes(keyword));
});

const visibleResourceSeries = computed(() =>
  collectSeriesByCloudServers(resourceCloudServerValue.value)
);

const visibleResourceFamilies = computed(() => {
  return collectFamiliesBySeries(resourceCloudServerValue.value, resourceSeriesValue.value);
});

const visibleResourceGenerations = computed(() => {
  return collectGenerationsByFamilies(
    resourceCloudServerValue.value,
    resourceSeriesValue.value,
    resourceFamilyValue.value,
  );
});

const visibleResourceTypes = computed(() => {
  if (isOneLevelResourceTree.value) {
    return allResourceTypes.value;
  }
  if (isResourceListFilter.value) {
    return collectDirectTypesByCloudServers(resourceCloudServerValue.value);
  }
  return collectTypesByGenerations(
    resourceCloudServerValue.value,
    resourceSeriesValue.value,
    resourceFamilyValue.value,
    resourceVerValue.value,
  );
});

const resourceSummary = computed(() => {
  return `已选 ${resourceTypeValue.value.length} 项`;
});

const rangeSummary = computed(() => {
  if (isRangeAreaCascader.value) {
    return getSummary(azValue.value, filteredAzOptions.value);
  }
  const regionComplete = !showRegionFilter.value || isAllSelected(regionValue.value, regionOptions.value);
  const azComplete = !showAzFilter.value || isAllSelected(azValue.value, filteredAzOptions.value);
  if (regionComplete && azComplete) {
    return '全部';
  }
  if (showRegionFilter.value && !showAzFilter.value) {
    return getSummary(regionValue.value, regionOptions.value);
  }
  if (!showRegionFilter.value && showAzFilter.value) {
    return getSummary(azValue.value, filteredAzOptions.value);
  }
  return `已选 ${regionValue.value.length + azValue.value.length} 项`;
});

watch(resourceSeriesValue, (nextValue, oldValue) => {
  if (!hasResourceTreeFilter.value) return;
  if (syncingFromModel) return;
  if (syncingResourceCascade) return;
  syncingResourceCascade = true;
  syncSeriesCascade(nextValue, oldValue);
  syncingResourceCascade = false;
}, { flush: 'sync' });

watch(resourceCloudServerValue, (nextValue, oldValue) => {
  if (!hasResourceTreeFilter.value) return;
  if (syncingFromModel) return;
  if (syncingResourceCascade) return;
  syncingResourceCascade = true;
  syncCloudServerCascade(nextValue, oldValue);
  syncingResourceCascade = false;
}, { flush: 'sync' });

watch(resourceFamilyValue, (nextValue, oldValue) => {
  if (!hasResourceTreeFilter.value) return;
  if (syncingFromModel) return;
  if (syncingResourceCascade) return;
  syncingResourceCascade = true;
  syncFamilyCascade(nextValue, oldValue);
  syncingResourceCascade = false;
}, { flush: 'sync' });

watch(resourceVerValue, (nextValue, oldValue) => {
  if (!hasResourceTreeFilter.value) return;
  if (syncingFromModel) return;
  if (syncingResourceCascade) return;
  syncingResourceCascade = true;
  syncGenerationCascade(nextValue, oldValue);
  syncingResourceCascade = false;
}, { flush: 'sync' });

watch(resourceTypeValue, () => {
  if (!hasResourceTreeFilter.value) return;
  if (syncingFromModel) return;
  // list 型资源类型保持即时提交；tree 型仍等用户点击“确定”。
  if (!isResourceListFilter.value) return;
  emitCurrentValue();
}, { deep: true, flush: 'sync' });

watch(regionValue, () => {
  if (!hasRangeFilter.value) return;
  if (syncingFromModel) return;
  syncingLocationCascade = true;
  if (rangeAutoSelectChild.value) {
    azValue.value = filteredAzOptions.value.map(item => item.value);
  } else {
    azValue.value = keepValid(azValue.value, filteredAzOptions.value, []);
  }
  syncingLocationCascade = false;
  if (rangeVisible.value) return;
  emitCurrentValue();
}, { deep: true, flush: 'sync' });

watch(azValue, () => {
  if (!hasRangeFilter.value) return;
  if (syncingFromModel) return;
  if (syncingLocationCascade) return;
  if (rangeVisible.value) return;
  emitCurrentValue();
}, { deep: true, flush: 'sync' });

watch(rangeVisible, (visible) => {
  if (!hasRangeFilter.value) return;
  if (loading.value) {
    rangeVisible.value = false;
    return;
  }
  if (visible) {
    rangeSnapshot.value = getRangeValue();
    return;
  }

  syncingFromModel = true;
  setRangeValue(rangeSnapshot.value);
  syncingFromModel = false;
});

watch(resourceVisible, (visible) => {
  if (!hasResourceTreeFilter.value) return;
  if (loading.value) {
    resourceVisible.value = false;
    return;
  }
  if (!isResourceConfirmable.value) {
    return;
  }
  if (visible) {
    resourceSnapshot.value = getResourceValue();
    return;
  }

  syncingFromModel = true;
  setResourceValue(resourceSnapshot.value);
  syncingFromModel = false;
});

watch(
  () => props.modelValue,
  (value) => {
    applyModelValue(value);
  },
  { deep: true, immediate: true }
);

watch(
  () => props.options,
  () => {
    applyModelValue(props.modelValue);
  },
  { deep: true }
);

watch(loading, (value) => {
  if (!value) return;
  rangeVisible.value = false;
  resourceVisible.value = false;
  customVisible.value = {};
  areaVisible.value = {};
});

function normalizeOptions(options) {
  return (options ?? []).map(item => {
    if (typeof item === 'string') {
      return { label: item, value: item, name: item };
    }
    return normalizeNode(item);
  }).filter(item => item.value);
}

function sortOptionsByInitial(options) {
  const collator = new Intl.Collator('zh-Hans-CN', {
    numeric: true,
    sensitivity: 'base',
  });
  return [...options].sort((a, b) => collator.compare(a.label, b.label));
}

function normalizeResourceTree(tree) {
  return (tree ?? []).map(normalizeNode).filter(item => item.value);
}

function normalizeNode(item) {
  const label = item?.label ?? item?.name ?? item?.value ?? '';
  const value = item?.objStr ?? item?.value ?? item?.name ?? item?.label ?? '';
  return {
    label,
    value,
    name: item?.name ?? label,
    level: item?.level,
    obj: item?.obj,
    objStr: item?.objStr,
    children: normalizeOptions(item?.children),
  };
}

function toOptionMeta(item) {
  return {
    label: item.label,
    value: item.value,
    name: item.name,
    level: item.level,
    obj: item.obj,
    objStr: item.objStr,
  };
}

function getFilterConfigByKey(key) {
  return props.filterConfig.find(filter => filter.key === key);
}

function getRangeColumnOptions(column, legacyOptionKey) {
  const optionKey = getRangeColumnOptionKey(column, legacyOptionKey);
  return sortOptionsByInitial(normalizeOptions(props.options?.[optionKey]));
}

function getRangeColumnOptionKey(column, legacyOptionKey) {
  if (column.optionKey) {
    return column.optionKey;
  }
  if (!useRangeColumnOptionKeys.value) {
    return legacyOptionKey;
  }
  if (column.valueKey.endsWith('List')) {
    return column.valueKey;
  }
  return `${column.valueKey}List`;
}

function isCustomFilter(filter) {
  return ['list', 'cascade'].includes(filter.type);
}

function allSelectedValue() {
  const value = {};
  if (hasRangeFilter.value) {
    value[regionColumnConfig.value.valueKey] = regionOptions.value.map(item => item.value);
    value[azColumnConfig.value.valueKey] = azOptions.value.map(item => item.value);
  }
  if (hasResourceTreeFilter.value) {
    value[resourceCloudServerColumn.value.valueKey] = currentResourceCloudServers.value.map(item => item.value);
    value[resourceSeriesColumn.value.valueKey] = isResourceListFilter.value ? [] : allResourceSeries.value.map(item => item.value);
    value[resourceFamilyColumn.value.valueKey] = isResourceListFilter.value ? [] : allResourceFamilies.value.map(item => item.value);
    value[resourceGenerationColumn.value.valueKey] = isResourceListFilter.value ? [] : allResourceGenerations.value.map(item => item.value);
    value[resourceTypeColumn.value.valueKey] = allResourceTypes.value.map(item => item.value);
  }
  return {
    ...value,
    ...customAllSelectedValue(),
    ...areaSelectedValue(),
  };
}

function customAllSelectedValue() {
  return customFilters.value.reduce((result, filter) => {
    if (filter.type === 'list') {
      result[filter.valueKey] = getCustomRootOptions(filter).map(item => item.value);
      return result;
    }
    if (hasCustomCascadeOutput(filter)) {
      const parentValues = getCustomRootOptions(filter).map(item => item.value);
      const leafValues = getCustomLeafOptions(filter, parentValues).map(item => item.value);
      result[filter.outputKey] = getCustomCascadeOutput(filter, parentValues, leafValues);
      return result;
    }
    result[filter.parentValueKey] = getCustomRootOptions(filter).map(item => item.value);
    result[filter.valueKey] = getCustomLeafOptions(filter, result[filter.parentValueKey]).map(item => item.value);
    return result;
  }, {});
}

function applyModelValue(value) {
  syncingFromModel = true;
  const fallback = allSelectedValue();
  const next = value ?? fallback;
  if (hasRangeFilter.value) {
    regionValue.value = keepValid(getModelGroupValue(next, regionColumnConfig.value.valueKey, fallback), regionOptions.value, fallback[regionColumnConfig.value.valueKey]);
    azValue.value = keepValid(getModelGroupValue(next, azColumnConfig.value.valueKey, fallback), filteredAzOptions.value, fallback[azColumnConfig.value.valueKey]);
    rangeSnapshot.value = getRangeValue();
  }
  if (hasResourceTreeFilter.value) {
    resourceCloudServerValue.value = keepValid(getModelGroupValue(next, resourceCloudServerColumn.value.valueKey, fallback), currentResourceCloudServers.value, fallback[resourceCloudServerColumn.value.valueKey]);
    resourceSeriesValue.value = keepValid(getModelGroupValue(next, resourceSeriesColumn.value.valueKey, fallback), allResourceSeries.value, fallback[resourceSeriesColumn.value.valueKey]);
    resourceFamilyValue.value = keepValid(getModelGroupValue(next, resourceFamilyColumn.value.valueKey, fallback), allResourceFamilies.value, fallback[resourceFamilyColumn.value.valueKey]);
    resourceVerValue.value = keepValid(getModelGroupValue(next, resourceGenerationColumn.value.valueKey, fallback), allResourceGenerations.value, fallback[resourceGenerationColumn.value.valueKey]);
    resourceTypeValue.value = keepValid(getModelGroupValue(next, resourceTypeColumn.value.valueKey, fallback), allResourceTypes.value, fallback[resourceTypeColumn.value.valueKey]);
    resourceSnapshot.value = getResourceValue();
    activeCloudServer.value = currentResourceCloudServers.value[0]?.value ?? '';
    activeSeries.value = visibleResourceSeries.value[0]?.value ?? '';
    activeFamily.value = allResourceFamilies.value[0]?.value ?? '';
    activeGeneration.value = allResourceGenerations.value[0]?.value ?? '';
  }
  applyCustomModelValue(next, fallback);
  applyAreaModelValue(next);
  syncingFromModel = false;
}

function applyAreaModelValue(next) {
  areaFilters.value.forEach((filter) => {
    areaValueMap.value[filter.areaValueKey] = keepValid(
      getAreaModelGroupValue(next, filter.areaValueKey),
      getAreaRootOptions(filter),
      [],
    );
    areaValueMap.value[filter.districtValueKey] = keepValid(
      getAreaModelGroupValue(next, filter.districtValueKey),
      getAreaAllDistrictOptions(filter),
      [],
    );
    areaValueMap.value[filter.regionValueKey] = keepValid(
      getAreaModelGroupValue(next, filter.regionValueKey),
      getAreaAllRegionOptions(filter),
      [],
    );
    areaActive.value[filter.key] = getFirstActiveValue(
      getAreaValue(filter.areaValueKey),
      getAreaRootOptions(filter),
    );
    areaDistrictActive.value[filter.key] = getFirstActiveValue(
      getAreaValue(filter.districtValueKey),
      getAreaDistrictOptions(filter),
    );
    saveAreaSnapshot(filter);
  });
}

function applyCustomModelValue(next, fallback) {
  customFilters.value.forEach((filter) => {
    if (filter.type === 'list') {
      customValueMap.value[filter.valueKey] = keepValid(
        getModelGroupValue(next, filter.valueKey, fallback),
        getCustomRootOptions(filter),
        fallback[filter.valueKey],
      );
      return;
    }
    if (hasCustomCascadeOutput(filter)) {
      const selectedValue = getCustomCascadeSelectedValue(filter, next, fallback);
      customValueMap.value[filter.parentValueKey] = keepValid(
        selectedValue.parentValues,
        getCustomRootOptions(filter),
        getCustomCascadeSelectedValue(filter, fallback, fallback).parentValues,
      );
      customValueMap.value[filter.valueKey] = keepValid(
        selectedValue.leafValues,
        getCustomLeafOptions(filter, customValueMap.value[filter.parentValueKey]),
        getCustomCascadeSelectedValue(filter, fallback, fallback).leafValues,
      );
      customActive.value[filter.key] = getCustomRootOptions(filter)[0]?.value ?? '';
      return;
    }
    customValueMap.value[filter.parentValueKey] = keepValid(
      getModelGroupValue(next, filter.parentValueKey, fallback),
      getCustomRootOptions(filter),
      fallback[filter.parentValueKey],
    );
    customValueMap.value[filter.valueKey] = keepValid(
      getModelGroupValue(next, filter.valueKey, fallback),
      getCustomLeafOptions(filter),
      fallback[filter.valueKey],
    );
    customActive.value[filter.key] = getCustomRootOptions(filter)[0]?.value ?? '';
  });
}

function getModelGroupValue(value, key, fallback) {
  if (Object.prototype.hasOwnProperty.call(value, key)) {
    return value[key];
  }
  return fallback[key];
}

function keepValid(values, options, fallback) {
  if (!Array.isArray(values)) {
    return [...fallback];
  }
  const optionValues = new Set(options.map(item => item.value));
  return values.filter(item => optionValues.has(item));
}

function filterAzOptionsByRegions(options, selectedRegions) {
  if (!regionOptions.value.length) {
    return options;
  }
  if (!selectedRegions?.length) {
    return [];
  }

  const regionLabels = regionOptions.value
    .filter(item => selectedRegions.includes(item.value))
    .flatMap(item => [item.value, item.label])
    .filter(Boolean);

  return options.filter((item) => {
    const azName = String(item.label ?? item.value ?? "");
    return regionLabels.some(region => azName.startsWith(region));
  });
}

function emitCurrentValue() {
  if (syncingFromModel) return;
  const value = {};
  if (hasRangeFilter.value) {
    value[regionColumnConfig.value.valueKey] = [...regionValue.value];
    value[azColumnConfig.value.valueKey] = [...azValue.value];
  }
  if (hasResourceTreeFilter.value) {
    value[resourceCloudServerColumn.value.valueKey] = [...resourceCloudServerValue.value];
    value[resourceSeriesColumn.value.valueKey] = [...resourceSeriesValue.value];
    value[resourceFamilyColumn.value.valueKey] = [...resourceFamilyValue.value];
    value[resourceGenerationColumn.value.valueKey] = [...resourceVerValue.value];
    value[resourceTypeColumn.value.valueKey] = [...resourceTypeValue.value];
  }
  Object.assign(value, getCustomCurrentValue());
  Object.assign(value, getAreaCurrentValue());
  emit('update:modelValue', value);
  emit('change', value);
}

function getCustomCurrentValue() {
  return customFilters.value.reduce((result, filter) => {
    if (hasCustomCascadeOutput(filter)) {
      result[filter.outputKey] = getCustomCascadeOutput(
        filter,
        getCustomValue(filter.parentValueKey),
        getCustomValue(filter.valueKey),
      );
      return result;
    }
    if (filter.type !== 'list') {
      result[filter.parentValueKey] = [...getCustomValue(filter.parentValueKey)];
    }
    result[filter.valueKey] = [...getCustomValue(filter.valueKey)];
    return result;
  }, {});
}

function getCustomRootOptions(filter) {
  return sortOptionsByInitial(normalizeOptions(props.options?.[filter.optionKey]));
}

function getCustomLeafOptions(filter, parentValue) {
  const selectedParents = parentValue ?? getCustomValue(filter.parentValueKey);
  const rootOptions = getCustomRootOptions(filter);
  const parentValues = selectedParents;
  const keyword = (customKeyword.value[filter.key] ?? '').trim().toLowerCase();
  const options = getUniqueOptions(
    rootOptions
      .filter(item => parentValues.includes(item.value))
      .flatMap(item => item.children ?? [])
  );
  if (!filter.searchable || !keyword) {
    return options;
  }
  return options.filter(item => item.label.toLowerCase().includes(keyword));
}

function getCustomValue(key) {
  return customValueMap.value[key] ?? [];
}

function hasCustomCascadeOutput(filter) {
  return filter.type === 'cascade' && filter.outputKey && filter.outputFields;
}

function getCustomCascadeOutput(filter, parentValues, leafValues) {
  const leafValueSet = new Set(leafValues);
  return getCustomRootOptions(filter)
    .filter(parentItem => parentValues.includes(parentItem.value))
    .flatMap(parentItem =>
      (parentItem.children ?? [])
        .filter(leafItem => leafValueSet.has(leafItem.value))
        .map(leafItem => ({
          [filter.outputFields.parent]: parentItem.value,
          [filter.outputFields.value]: leafItem.value,
        }))
    );
}

function getCustomCascadeSelectedValue(filter, value, fallback) {
  const outputValue = getModelGroupValue(value, filter.outputKey, fallback);
  const parentField = filter.outputFields.parent;
  const valueField = filter.outputFields.value;
  return {
    parentValues: Array.from(new Set(outputValue.map(item => item[parentField]))),
    leafValues: Array.from(new Set(outputValue.map(item => item[valueField]))),
  };
}

function setCustomValue(filter, key, value) {
  customValueMap.value[key] = value;
  if (!filter.confirmable) {
    emitCurrentValue();
  }
}

function setCustomParentValue(filter, value) {
  customValueMap.value[filter.parentValueKey] = value;
  customValueMap.value[filter.valueKey] = value.length ? getCustomLeafOptions(filter, value).map(item => item.value) : [];
  if (!filter.confirmable) {
    emitCurrentValue();
  }
}

function toggleCustomAll(filter, key, options, checked) {
  setCustomValue(filter, key, checked ? options.map(item => item.value) : []);
}

function toggleCustomParentAll(filter, checked) {
  const values = checked ? getCustomRootOptions(filter).map(item => item.value) : [];
  setCustomParentValue(filter, values);
}

function setCustomVisible(filter, visible) {
  if (loading.value) {
    customVisible.value[filter.key] = false;
    return;
  }
  if (visible) {
    saveCustomSnapshot(filter);
  }
  if (!visible && filter.confirmable) {
    restoreCustomSnapshot(filter);
  }
  customVisible.value[filter.key] = visible;
}

function setCustomKeyword(key, value) {
  customKeyword.value[key] = value;
}

function setCustomActive(key, value) {
  customActive.value[key] = value;
}

function getCustomSummary(filter) {
  if (filter.type === 'list') {
    return getSummary(getCustomValue(filter.valueKey), getCustomRootOptions(filter));
  }
  return getSummary(getCustomValue(filter.valueKey), getCustomLeafOptions(filter));
}

function getCustomPopperClass(filter) {
  const typeClass = filter.type === 'list' ? 'filter-popper--custom-list' : 'filter-popper--custom-cascade';
  return `filter-popper ${typeClass}`;
}

function getCustomValueKeys(filter) {
  if (filter.type === 'list') {
    return [filter.valueKey];
  }
  return [filter.parentValueKey, filter.valueKey];
}

function saveCustomSnapshot(filter) {
  customSnapshotMap.value[filter.key] = getCustomValueKeys(filter).reduce((result, key) => {
    result[key] = [...getCustomValue(key)];
    return result;
  }, {});
}

function restoreCustomSnapshot(filter) {
  const snapshot = customSnapshotMap.value[filter.key];
  if (!snapshot) return;
  Object.entries(snapshot).forEach(([key, value]) => {
    customValueMap.value[key] = [...value];
  });
}

function cancelCustomFilter(filter) {
  restoreCustomSnapshot(filter);
  customVisible.value[filter.key] = false;
}

function confirmCustomFilter(filter) {
  saveCustomSnapshot(filter);
  customVisible.value[filter.key] = false;
  emitCurrentValue();
}

function getAreaRootOptions(filter) {
  return normalizeOptions(props.options?.[filter.optionKey]);
}

function getAreaAllDistrictOptions(filter) {
  return getUniqueOptions(
    getAreaRootOptions(filter).flatMap(item => item.children ?? [])
  );
}

function getAreaAllRegionOptions(filter) {
  return getUniqueOptions(
    getAreaAllDistrictOptions(filter).flatMap(item => item.children ?? [])
  );
}

function getAreaDistrictOptions(filter) {
  const activeValue = areaActive.value[filter.key];
  const activeArea = getAreaRootOptions(filter).find(item => item.value === activeValue);
  return activeArea?.children ?? [];
}

function getAreaRegionOptions(filter) {
  const activeValue = areaDistrictActive.value[filter.key];
  const activeDistrict = getAreaDistrictOptions(filter).find(item => item.value === activeValue);
  return activeDistrict?.children ?? [];
}

function getAreaValue(key) {
  return areaValueMap.value[key] ?? [];
}

function getAreaModelGroupValue(value, key) {
  if (Object.prototype.hasOwnProperty.call(value, key)) {
    return value[key];
  }
  return [];
}

function getFirstActiveValue(values, options) {
  const matched = options.find(item => values.includes(item.value));
  if (matched) {
    return matched.value;
  }
  return options[0]?.value ?? '';
}

function areaSelectedValue() {
  return areaFilters.value.reduce((result, filter) => {
    result[filter.areaValueKey] = [];
    result[filter.districtValueKey] = [];
    result[filter.regionValueKey] = [];
    return result;
  }, {});
}

function getAreaCurrentValue() {
  return areaFilters.value.reduce((result, filter) => {
    result[filter.areaValueKey] = [...getAreaValue(filter.areaValueKey)];
    result[filter.districtValueKey] = [...getAreaValue(filter.districtValueKey)];
    result[filter.regionValueKey] = [...getAreaValue(filter.regionValueKey)];
    return result;
  }, {});
}

function setAreaValue(filter, key, value) {
  areaValueMap.value[key] = value;
  if (key === filter.areaValueKey) {
    syncAreaSelection(filter);
  }
  if (key === filter.districtValueKey) {
    syncDistrictSelection(filter);
  }
}

function syncAreaSelection(filter) {
  const selectedArea = getAreaValue(filter.areaValueKey);
  areaActive.value[filter.key] = getFirstActiveValue(selectedArea, getAreaRootOptions(filter));
  const districtOptions = getAreaAllDistrictOptions(filter)
    .filter(item => selectedArea.some(area => getAreaChildren(filter, area).includes(item.value)));
  areaValueMap.value[filter.districtValueKey] = keepValid(
    getAreaValue(filter.districtValueKey),
    districtOptions,
    [],
  );
  syncDistrictSelection(filter);
}

function syncDistrictSelection(filter) {
  const selectedDistrict = getAreaValue(filter.districtValueKey);
  const regionOptions = getAreaAllRegionOptions(filter)
    .filter(item => selectedDistrict.some(district => getDistrictChildren(filter, district).includes(item.value)));
  areaValueMap.value[filter.regionValueKey] = keepValid(
    getAreaValue(filter.regionValueKey),
    regionOptions,
    [],
  );
  areaDistrictActive.value[filter.key] = getFirstActiveValue(selectedDistrict, getAreaDistrictOptions(filter));
}

function getAreaChildren(filter, areaValue) {
  const area = getAreaRootOptions(filter).find(item => item.value === areaValue);
  return (area?.children ?? []).map(item => item.value);
}

function getDistrictChildren(filter, districtValue) {
  const district = getAreaAllDistrictOptions(filter).find(item => item.value === districtValue);
  return (district?.children ?? []).map(item => item.value);
}

function setAreaVisible(filter, visible) {
  if (loading.value) {
    areaVisible.value[filter.key] = false;
    return;
  }
  if (visible) {
    saveAreaSnapshot(filter);
  }
  if (!visible) {
    restoreAreaSnapshot(filter);
  }
  areaVisible.value[filter.key] = visible;
}

function setAreaActive(filter, value) {
  areaActive.value[filter.key] = value;
}

function setAreaDistrictActive(filter, value) {
  areaDistrictActive.value[filter.key] = value;
}

function getAreaSummary(filter) {
  return getSummary(getAreaValue(filter.regionValueKey), getAreaAllRegionOptions(filter));
}

function getAreaPopperClass() {
  return 'filter-popper filter-popper--area-cascade';
}

function getAreaValueKeys(filter) {
  return [filter.areaValueKey, filter.districtValueKey, filter.regionValueKey];
}

function saveAreaSnapshot(filter) {
  areaSnapshotMap.value[filter.key] = {
    values: getAreaValueKeys(filter).reduce((result, key) => {
      result[key] = [...getAreaValue(key)];
      return result;
    }, {}),
    active: areaActive.value[filter.key],
    districtActive: areaDistrictActive.value[filter.key],
  };
}

function restoreAreaSnapshot(filter) {
  const snapshot = areaSnapshotMap.value[filter.key];
  if (!snapshot) return;
  Object.entries(snapshot.values).forEach(([key, value]) => {
    areaValueMap.value[key] = [...value];
  });
  areaActive.value[filter.key] = snapshot.active;
  areaDistrictActive.value[filter.key] = snapshot.districtActive;
}

function cancelAreaFilter(filter) {
  restoreAreaSnapshot(filter);
  areaVisible.value[filter.key] = false;
}

function confirmAreaFilter(filter) {
  saveAreaSnapshot(filter);
  areaVisible.value[filter.key] = false;
  emitCurrentValue();
}

function getUniqueOptions(options) {
  const map = new Map();
  (options ?? []).forEach(item => {
    if (!map.has(item.value)) {
      map.set(item.value, item);
    }
  });
  return Array.from(map.values());
}

function isResourceTypeNode(item) {
  return Boolean(item?.obj?.resourceType);
}

function collectSelectedCloudServers(cloudServerValues) {
  const cloudServerSet = new Set(cloudServerValues);
  return resourceTree.value.filter(item => cloudServerSet.has(item.value));
}

function collectSeriesByCloudServers(cloudServerValues) {
  if (isOneLevelResourceTree.value) {
    return [];
  }
  const series = collectSelectedCloudServers(cloudServerValues)
    .flatMap(item => item.children ?? [])
    .filter(item => !isResourceTypeNode(item));
  return getUniqueOptions(series);
}

function collectDirectTypesByCloudServers(cloudServerValues) {
  if (isOneLevelResourceTree.value) {
    return resourceTree.value;
  }
  const types = collectSelectedCloudServers(cloudServerValues)
    .flatMap(item => item.children ?? [])
    .filter(isResourceTypeNode);
  return getUniqueOptions(types);
}

function syncCloudServerCascade(nextValue, oldValue) {
  const { added } = getValueChange(nextValue, oldValue);
  const addedSeries = collectSeriesByCloudServers(added);
  const addedFamilies = collectFamiliesBySeries(added, addedSeries.map(item => item.value));
  const addedGenerations = collectGenerationsByFamilies(
    added,
    addedSeries.map(item => item.value),
    addedFamilies.map(item => item.value),
  );
  const addedTypes = collectTypesByGenerations(
    added,
    addedSeries.map(item => item.value),
    addedFamilies.map(item => item.value),
    addedGenerations.map(item => item.value),
  );
  resourceSeriesValue.value = mergeValues(resourceSeriesValue.value, addedSeries.map(item => item.value));
  resourceFamilyValue.value = mergeValues(resourceFamilyValue.value, addedFamilies.map(item => item.value));
  resourceVerValue.value = mergeValues(resourceVerValue.value, addedGenerations.map(item => item.value));
  resourceTypeValue.value = mergeValues(resourceTypeValue.value, addedTypes.map(item => item.value));
  pruneResourceSelections();
}

function syncSeriesCascade(nextValue, oldValue) {
  const { added } = getValueChange(nextValue, oldValue);
  const addedFamilies = collectFamiliesBySeries(resourceCloudServerValue.value, added);
  const addedGenerations = collectGenerationsByFamilies(
    resourceCloudServerValue.value,
    nextValue,
    addedFamilies.map(item => item.value),
  );
  const addedTypes = collectTypesByGenerations(
    resourceCloudServerValue.value,
    nextValue,
    addedFamilies.map(item => item.value),
    addedGenerations.map(item => item.value),
  );
  resourceFamilyValue.value = mergeValues(resourceFamilyValue.value, addedFamilies.map(item => item.value));
  resourceVerValue.value = mergeValues(resourceVerValue.value, addedGenerations.map(item => item.value));
  resourceTypeValue.value = mergeValues(resourceTypeValue.value, addedTypes.map(item => item.value));
  pruneResourceSelections();
}

function syncFamilyCascade(nextValue, oldValue) {
  const { added } = getValueChange(nextValue, oldValue);
  const addedGenerations = collectGenerationsByFamilies(
    resourceCloudServerValue.value,
    resourceSeriesValue.value,
    added,
  );
  const addedTypes = collectTypesByGenerations(
    resourceCloudServerValue.value,
    resourceSeriesValue.value,
    nextValue,
    addedGenerations.map(item => item.value),
  );
  resourceVerValue.value = mergeValues(resourceVerValue.value, addedGenerations.map(item => item.value));
  resourceTypeValue.value = mergeValues(resourceTypeValue.value, addedTypes.map(item => item.value));
  pruneResourceSelections();
}

function syncGenerationCascade(nextValue, oldValue) {
  const { added } = getValueChange(nextValue, oldValue);
  const addedTypes = collectTypesByGenerations(
    resourceCloudServerValue.value,
    resourceSeriesValue.value,
    resourceFamilyValue.value,
    added,
  );
  resourceTypeValue.value = mergeValues(resourceTypeValue.value, addedTypes.map(item => item.value));
  pruneResourceSelections();
}

function pruneResourceSelections() {
  const seriesValues = collectSeriesByCloudServers(resourceCloudServerValue.value).map(item => item.value);
  resourceSeriesValue.value = keepValueIntersection(resourceSeriesValue.value, seriesValues);

  const familyValues = collectFamiliesBySeries(resourceCloudServerValue.value, resourceSeriesValue.value).map(item => item.value);
  resourceFamilyValue.value = keepValueIntersection(resourceFamilyValue.value, familyValues);

  const generationValues = collectGenerationsByFamilies(
    resourceCloudServerValue.value,
    resourceSeriesValue.value,
    resourceFamilyValue.value,
  ).map(item => item.value);
  resourceVerValue.value = keepValueIntersection(resourceVerValue.value, generationValues);

  const typeValues = collectTypesByGenerations(
    resourceCloudServerValue.value,
    resourceSeriesValue.value,
    resourceFamilyValue.value,
    resourceVerValue.value,
  ).map(item => item.value);
  resourceTypeValue.value = keepValueIntersection(resourceTypeValue.value, typeValues);
}

function collectFamiliesBySeries(cloudServerValues, seriesValues) {
  if (isOneLevelResourceTree.value) {
    return [];
  }
  const seriesSet = new Set(seriesValues);
  const families = collectSeriesByCloudServers(cloudServerValues)
    .filter(item => seriesSet.has(item.value))
    .flatMap(item => item.children ?? []);
  return getUniqueOptions(families);
}

function collectGenerationsByFamilies(cloudServerValues, seriesValues, familyValues) {
  if (isOneLevelResourceTree.value) {
    return [];
  }
  const seriesSet = new Set(seriesValues);
  const familySet = new Set(familyValues);
  const generations = collectSeriesByCloudServers(cloudServerValues)
    .filter(item => seriesSet.has(item.value))
    .flatMap(item => item.children ?? [])
    .filter(item => familySet.has(item.value))
    .flatMap(item => item.children ?? []);
  return getUniqueOptions(generations);
}

function collectTypesByGenerations(cloudServerValues, seriesValues, familyValues, generationValues) {
  if (isOneLevelResourceTree.value) {
    return getUniqueOptions(resourceTree.value);
  }
  const seriesSet = new Set(seriesValues);
  const familySet = new Set(familyValues);
  const generationSet = new Set(generationValues);
  const nestedTypes = collectSeriesByCloudServers(cloudServerValues)
    .filter(item => seriesSet.has(item.value))
    .flatMap(item => item.children ?? [])
    .filter(item => familySet.has(item.value))
    .flatMap(item => item.children ?? [])
    .filter(item => generationSet.has(item.value))
    .flatMap(item => item.children ?? []);
  return getUniqueOptions([
    ...collectDirectTypesByCloudServers(cloudServerValues),
    ...nestedTypes,
  ]);
}

function getValueChange(nextValue = [], oldValue = []) {
  const oldSet = new Set(oldValue);
  const nextSet = new Set(nextValue);
  return {
    added: nextValue.filter(item => !oldSet.has(item)),
    removed: oldValue.filter(item => !nextSet.has(item)),
  };
}

function mergeValues(currentValue, addedValue) {
  return Array.from(new Set([...(currentValue ?? []), ...(addedValue ?? [])]));
}

function keepValueIntersection(currentValue, allowedValue) {
  const allowedSet = new Set(allowedValue);
  return (currentValue ?? []).filter(item => allowedSet.has(item));
}

function getResourceValue() {
  return {
    [resourceCloudServerColumn.value.valueKey]: [...resourceCloudServerValue.value],
    [resourceSeriesColumn.value.valueKey]: [...resourceSeriesValue.value],
    [resourceFamilyColumn.value.valueKey]: [...resourceFamilyValue.value],
    [resourceGenerationColumn.value.valueKey]: [...resourceVerValue.value],
    [resourceTypeColumn.value.valueKey]: [...resourceTypeValue.value],
  };
}

function setResourceValue(value) {
  resourceCloudServerValue.value = [...value[resourceCloudServerColumn.value.valueKey]];
  resourceSeriesValue.value = [...value[resourceSeriesColumn.value.valueKey]];
  resourceFamilyValue.value = [...value[resourceFamilyColumn.value.valueKey]];
  resourceVerValue.value = [...value[resourceGenerationColumn.value.valueKey]];
  resourceTypeValue.value = [...value[resourceTypeColumn.value.valueKey]];
}

function getRangeValue() {
  return {
    [regionColumnConfig.value.valueKey]: [...regionValue.value],
    [azColumnConfig.value.valueKey]: [...azValue.value],
  };
}

function setRangeValue(value) {
  regionValue.value = [...value[regionColumnConfig.value.valueKey]];
  azValue.value = [...value[azColumnConfig.value.valueKey]];
}

function getSummary(value, options) {
  if (value.length === options.length && options.length > 0) {
    return '全部';
  }
  if (!value.length) {
    return '请选择';
  }
  const first = options.find(item => item.value === value[0])?.label ?? value[0];
  return value.length === 1 ? first : `${first} +${value.length - 1}`;
}

function isAllSelected(value, options) {
  const optionValues = options.map(item => item.value);
  return optionValues.length > 0 && optionValues.every(item => value.includes(item));
}

function isIndeterminate(value, options) {
  const selectedCount = options.filter(item => value.includes(item.value)).length;
  return selectedCount > 0 && selectedCount < options.length;
}

function toggleAll(type, checked) {
  const values = checked ? getOptionsByType(type).map(item => item.value) : [];
  if (type === 'region') {
    regionValue.value = values;
  }
  if (type === 'az') {
    azValue.value = values;
  }
  if (!hasResourceTreeFilter.value) return;
  if (type === resourceCloudServerColumn.value.valueKey) {
    resourceCloudServerValue.value = values;
  }
  if (type === resourceSeriesColumn.value.valueKey) {
    resourceSeriesValue.value = values;
  }
  if (type === resourceFamilyColumn.value.valueKey) {
    resourceFamilyValue.value = values;
  }
  if (type === resourceGenerationColumn.value.valueKey) {
    resourceVerValue.value = values;
  }
  if (type === resourceTypeColumn.value.valueKey) {
    resourceTypeValue.value = values;
  }
}

function getOptionsByType(type) {
  if (type === 'region') {
    return filteredRegionOptions.value;
  }
  if (type === 'az') {
    return filteredAzOptions.value;
  }
  if (!hasResourceTreeFilter.value) {
    return [];
  }
  const map = {
    [resourceCloudServerColumn.value.valueKey]: currentResourceCloudServers.value,
    [resourceSeriesColumn.value.valueKey]: visibleResourceSeries.value,
    [resourceFamilyColumn.value.valueKey]: visibleResourceFamilies.value,
    [resourceGenerationColumn.value.valueKey]: visibleResourceGenerations.value,
    [resourceTypeColumn.value.valueKey]: visibleResourceTypes.value,
  };
  return map[type] ?? [];
}

function cancelRange() {
  syncingFromModel = true;
  setRangeValue(rangeSnapshot.value);
  syncingFromModel = false;
  rangeVisible.value = false;
}

function confirmRange() {
  rangeSnapshot.value = getRangeValue();
  rangeVisible.value = false;
  emitCurrentValue();
}

function cancelResource() {
  syncingFromModel = true;
  setResourceValue(resourceSnapshot.value);
  syncingFromModel = false;
  resourceVisible.value = false;
}

function confirmResource() {
  resourceSnapshot.value = getResourceValue();
  resourceVisible.value = false;
  emitCurrentValue();
}
</script>

<style scoped lang="less">
.filter-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
}

.filter-bar.is-loading {
  cursor: progress;
}

.custom-filter-bar {
  justify-content: flex-end;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.filter-label {
  flex: 0 0 auto;
  font-size: 13px;
  font-weight: 400;
  color: #6262a8;
}

.select-trigger {
  width: 116px;
  height: 28px;
  padding: 0 8px 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  background: #fff;
  color: #252b3a;
  font-size: 13px;
  text-align: left;
  cursor: pointer;

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.select-trigger:disabled {
  cursor: not-allowed;
  background: #f5f7fb;
  color: #9095a3;
}

.resource-trigger {
  width: 126px;
}

.area-trigger {
  width: auto;
  min-width: 176px;
  height: 34px;
  padding: 0 12px 0 10px;
  gap: 8px;
  border: 1px solid #dfe2ec;
  border-radius: 18px;
  box-shadow: 0 2px 10px rgba(50, 50, 93, 0.08);
  color: #1f2440;
  font-size: 15px;
  font-weight: 700;

  span {
    flex: 1;
  }
}

.area-trigger-icon {
  flex: 0 0 auto;
  color: #4a4abd;
  font-size: 18px;
}

.dropdown-panel {
  background: #fff;
  color: #252b3a;
  font-family: Microsoft YaHei, Arial, sans-serif;
}

.single {
  width: 100%;
  padding: 0;
  box-sizing: border-box;
}

:global(.filter-popper--single) {
  box-sizing: border-box;
  padding: 10px;
}

:global(.filter-popper--range) {
  box-sizing: border-box;
  padding: 10px;
}

.az-panel {
  padding-top: 12px;
}

.search-box {
  height: 34px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  margin-bottom: 8px;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  color: #697386;
  box-sizing: border-box;

  input {
    flex: 1;
    border: 0;
    outline: 0;
    min-width: 0;
    color: #33336b;
    font-size: 14px;

    &::placeholder {
      color: #adb0b8;
    }
  }
}

.option-list {
  max-height: 220px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.option-group {
  display: flex;
  flex-direction: column;
}

.range-panel {
  width: 520px;
}

.range-panel--single {
  width: 260px;
}

.range-search {
  margin: 0 10px 8px;
}

.range-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(210px, 1fr));
  gap: 8px;
  padding: 0 10px 8px;
}

.range-columns--single {
  grid-template-columns: minmax(210px, 1fr);
}

.range-column {
  min-width: 0;

  .option-list {
    max-height: 240px;
  }

  .option-row {
    justify-content: space-between;
    cursor: pointer;
  }

  .checked-row {
    justify-content: flex-start;
  }

  .option-row :deep(.el-checkbox) {
    width: auto;
    flex: 1;
    min-width: 0;
  }

  .checked-row > :deep(.el-checkbox) {
    width: auto !important;
    flex: 0 0 auto !important;
    min-width: auto !important;
  }

  .option-row :deep(.el-checkbox__label) {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .option-row .el-icon {
    flex: 0 0 auto;
    margin-left: 8px;
  }

  .checked-row .el-icon {
    margin-left: auto;
  }
}

.option-row,
.resource-row {
  min-height: 28px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  box-sizing: border-box;
  color: #33336b;
  font-size: 13px;
}

.option-row {
  padding: 0 10px;
}

.checked-row {
  background: #e9ebfd;
}

.option-row.is-checked,
.option-row.is-indeterminate,
.option-row:has(.el-checkbox.is-checked),
.option-row:has(.el-checkbox.is-indeterminate),
.resource-row:has(.el-checkbox.is-checked) {
  background: #e9ebfd;
}

.checked-row {
  gap: 10px;

  > :deep(.el-checkbox) {
    width: auto;
    flex: 0 0 auto;
  }

  span {
    white-space: nowrap;
  }

  > :deep(.el-checkbox.is-checked) + span,
  > :deep(.el-checkbox.is-indeterminate) + span {
    color: #33336b;
    font-weight: 600;
  }
}

.resource-panel {
  width: min(900px, calc(100vw - 32px));
}

.resource-panel--single {
  width: 220px;
}

.resource-panel--list {
  width: min(420px, calc(100vw - 32px));
}

:global(.filter-popper--custom-list) {
  box-sizing: border-box;
  padding: 10px;
}

:global(.filter-popper--custom-cascade) {
  box-sizing: border-box;
  padding: 10px;
}

:global(.filter-popper--area-cascade) {
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid #e1e4ee;
}

.custom-list-panel {
  width: 220px;
}

.custom-cascade-panel {
  width: min(440px, calc(100vw - 32px));
}

.area-cascade-panel {
  width: min(760px, calc(100vw - 32px));
}

.custom-search {
  margin-bottom: 8px;
}

.custom-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(150px, 1fr));
  gap: 8px;
}

.area-cascade-columns {
  display: grid;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
  gap: 8px;
  padding: 0 10px 8px;
}

.custom-column {
  min-width: 0;
}

.area-cascade-column {
  min-width: 0;
}

.resource-columns {
  display: grid;
  grid-template-columns: repeat(5, minmax(136px, 1fr));
  gap: 8px;
  padding: 10px 14px 8px;
}

.resource-columns--list {
  grid-template-columns: repeat(2, minmax(150px, 1fr));
}

.resource-columns--single {
  grid-template-columns: minmax(180px, 1fr);
}

.resource-column {
  min-width: 0;
}

.column-title {
  height: 24px;
  line-height: 24px;
  margin-bottom: 6px;
  border-bottom: 1px solid #dfe1e6;
  font-size: 13px;
  font-weight: 600;
}

.resource-scroll {
  height: 150px;
  overflow-y: auto;
  padding-right: 4px;
  overflow-x: hidden;
}

.resource-row {
  justify-content: space-between;
  padding: 0 8px;
  cursor: pointer;

  &:hover,
  &.active {
    background: #f7f9ff;
  }
}

.panel-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 6px 14px;
  border-top: 1px solid #edf0f5;
}

.plain-btn,
.primary-btn {
  min-width: 62px;
  height: 28px;
  padding: 0 12px;
  border-radius: 3px;
  font-size: 13px;
  cursor: pointer;
}

.plain-btn {
  border: 1px solid #adb0b8;
  background: #fff;
  color: #252b3a;
}

.primary-btn {
  border: 1px solid #4a4abd;
  background: #4a4abd;
  color: #fff;
}

:deep(.el-checkbox) {
  width: 100%;
  height: 28px;
  margin-right: 0;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner),
:deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner) {
  background-color: #444494;
  border-color: #444494;
}

:deep(.el-checkbox__input.is-checked + .el-checkbox__label),
:deep(.el-checkbox__input.is-indeterminate + .el-checkbox__label) {
  color: #33336b;
  font-weight: 600;
}

.resource-row :deep(.el-checkbox) {
  width: auto;
  flex: 1;
}

.resource-row.checked-row {
  justify-content: flex-start;

  > :deep(.el-checkbox) {
    flex: 0 0 auto;
    width: auto;
  }

  span {
    flex: 0 0 auto;
    margin-left: 0;
  }

  .el-icon {
    margin-left: auto;
  }
}

:deep(.el-checkbox__label) {
  color: #33336b;
  font-size: 14px;
  font-weight: 400;
  white-space: nowrap;
}
</style>
