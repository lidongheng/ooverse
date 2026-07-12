import { APP_CONFIG } from '@/config/app'
import { requestWithToken } from '@/plugins/init'

const TOTAL_RESPONSE = {
  status: 200,
  massage: 'success',
  data: {
    cost: 0,
    momValue: -111111111,
    trend: [],
  },
}

const CARD_OPERATE_RESPONSE = {
  status: 200,
  massage: 'success',
  data: {
    commonComputing: [
      {
        baseLineVal: null,
        challgengeVal: null,
        compareValue: 111111111,
        mom: 0.1111,
        name: null,
        nameCn: '盈亏',
        targetVal: null,
        trends: [],
        value: 999999999,
      },
    ],
    externalCustomer: [
      {
        baseLineVal: null,
        challgengeVal: null,
        compareValue: 111111111,
        mom: 0.1111,
        name: null,
        nameCn: '销毛率',
        targetVal: null,
        trends: [],
        value: 999999999,
      },
    ],
    intelligentComputing: [],
    internalCustomer: [
      {
        baseLineVal: null,
        challgengeVal: null,
        compareValue: 111111111,
        mom: 0.1111,
        name: null,
        nameCn: '销毛率',
        targetVal: null,
        trends: [],
        value: 999999999,
      },
    ],
  },
}

const CARD_INDICATOR_RESPONSE = {
  status: 200,
  massage: 'success',
  data: {
    indicator: {
      asset_gyy_servers_num_trends_app: {
        baseLineVal: null,
        calendarKey: '20260513',
        challengeVal: null,
        compareLastMonval: '1111.1',
        createTime: null,
        curValue: 111111.11,
        dateDay: '20260430',
        id: null,
        keyCode: 'asset_gyy_servers_num_trends_app',
        monValueDecimal: '0.0333',
        month: '202604',
        paraName: '指标中文名',
        paraUnit: '指标单位',
        service: '服务商id',
        serviceName: null,
        targetVal: null,
      },
      general_computing_server_num_all: {},
      dfa_card_num_all: {},
      ecs_out_customer_allocate_num: {},
      ecs_in_customer_allocate_num: {},
      pool_total_asset_online_rate: {},
      universal_harddisk_rate: {},
      pool_cpu_use_rate_all: {},
      pool_npu_use_rate_all: {},
      ascend_card_count_inner: {},
      ascend_card_count_outer: {},
      hashrate_all_total: {},
    },
  },
}

const RESOURCE_POOL_CUSTOMER_INFO_EFFICIENCY_RESPONSE = {
  status: 200,
  massage: 'success',
  data: {
    customerAlloactionTotal: 11111111,
    detailList: [],
    externalAllocationTotal: {
      baseLineVal: null,
      challengeVal: null,
      cmpLastMonth: 111111,
      name: null,
      targetVal: null,
      val: 11111111,
    },
    externalServerNumTotal: 111111,
    hwRdSelfAllocationTotal: {
      baseLineVal: null,
      challengeVal: null,
      cmpLastMonth: 111111,
      name: null,
      targetVal: null,
      val: 11111111,
    },
    internalAllocationTotal: {
      baseLineVal: null,
      challengeVal: null,
      cmpLastMonth: 111111,
      name: null,
      targetVal: null,
      val: 11111111,
    },
    internalServerNumTotal: 111111,
    summary: {
      customerAlloactionTotal: 11111111,
      externalAllocationTotal: 11111111,
      hwRdSelfAllocationTotal: 11111111,
      internalAllocationTotal: 11111111,
      serverNumExternalTotal: 111111,
      serverNumHwRdSelfTotal: 11111,
      serverNumInternalTotal: 111111,
      serverNumTotal: 111111,
    },
  },
}

const RESOURCE_POOL_LIFECYCLE_RESPONSE = {
  status: 200,
  massage: 'success',
  data: [
    {
      cpuUseRate: 0.1,
      diskSpaceUseRate: 0.1,
      gainResourcePoolNum: 1,
      grossProfitRate: null,
      hardDiskUseRate: null,
      lossResourcePoolNum: 0,
      poolNum: 10,
      resourceName: '资源池',
    },
    {
      cpuUseRate: 0.1,
      diskSpaceUseRate: 0.1,
      gainResourcePoolNum: 1,
      grossProfitRate: null,
      hardDiskUseRate: null,
      lossResourcePoolNum: 0,
      poolNum: 10,
      resourceName: 'ECS资源池',
    },
    {
      cpuUseRate: 0.1,
      diskSpaceUseRate: 0.1,
      gainResourcePoolNum: 1,
      grossProfitRate: null,
      hardDiskUseRate: null,
      lossResourcePoolNum: 0,
      poolNum: 10,
      resourceName: 'EVS资源池',
    },
    {
      cpuUseRate: 0.1,
      diskSpaceUseRate: 0.1,
      gainResourcePoolNum: 1,
      grossProfitRate: null,
      hardDiskUseRate: null,
      lossResourcePoolNum: 0,
      poolNum: 10,
      resourceName: 'OBS资源池',
    },
  ],
}

const API_PATHS = {
  cardCost: '/infra/card-cost',
  cardIndicator: '/infra/card-indicator',
  cardOperate: '/infra/card-operate',
  cardRecurringRevenue: '/infra/card-recurring-revenue',
  resourcePoolCustomerInfoEfficiency: '/infra/resource-pool-customer-info-efficiency',
  resourcePoolLifecycle: '/infra/resource-pool-lifecycle',
  totalCost: '/infra/total-cost',
  totalTurnover: '/infra/total-turnover',
}

async function requestMock(response) {
  // 返回深拷贝，避免页面侧对响应对象的赋值影响下一次 mock 请求。
  return structuredClone(response)
}

function requestBackend(path, data) {
  return requestWithToken(path, {
    method: 'POST',
    data,
  })
}

function requestInfra(path, data, response) {
  if (APP_CONFIG.dev.skipBackendRequests) {
    return requestMock(response)
  }
  return requestBackend(path, data)
}

export function getTotalTurnoverAPI(params) {
  return requestInfra(API_PATHS.totalTurnover, params, TOTAL_RESPONSE)
}

export function getTotalCostAPI(params) {
  return requestInfra(API_PATHS.totalCost, params, TOTAL_RESPONSE)
}

export function getCardRecurringRevenueAPI(params) {
  return requestInfra(API_PATHS.cardRecurringRevenue, params, CARD_OPERATE_RESPONSE)
}

export function getCardOperateAPI(params) {
  return requestInfra(API_PATHS.cardOperate, params, CARD_OPERATE_RESPONSE)
}

export function getCardCostAPI(params) {
  return requestInfra(API_PATHS.cardCost, params, CARD_OPERATE_RESPONSE)
}

export function getCardIndicatorAPI(params) {
  return requestInfra(API_PATHS.cardIndicator, params, CARD_INDICATOR_RESPONSE)
}

export function getResourcePoolCustomerInfoEfficiencyAPI(params) {
  return requestInfra(
    API_PATHS.resourcePoolCustomerInfoEfficiency,
    params,
    RESOURCE_POOL_CUSTOMER_INFO_EFFICIENCY_RESPONSE
  )
}

export function getResourcePoolLifecycleAPI(metric, date, month) {
  const params = typeof metric === 'object' ? metric : { metric, date, month };
  return requestInfra(
    API_PATHS.resourcePoolLifecycle,
    params,
    RESOURCE_POOL_LIFECYCLE_RESPONSE
  )
}
