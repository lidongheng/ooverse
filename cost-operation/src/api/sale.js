import saleHomeData from '@/views/saleView/saleHome/homeData.json';

const SALE_REGION_TREE_RESPONSE = {
  status: 200,
  message: 'SUCCESS',
  messageEn: 'SUCCESS',
  data: [
    {
      insideOutside: null,
      areaName: '国内',
      regionId: null,
      regionName: null,
      flavorVcpuType: null,
      flavorFamily: null,
      flavorGeneration: null,
      cardModel: null,
      regionTreeItem: [
        {
          insideOutside: null,
          areaName: '华南',
          regionId: null,
          regionName: null,
          flavorVcpuType: null,
          flavorFamily: null,
          flavorGeneration: null,
          cardModel: null,
          regionTreeItem: [
            {
              insideOutside: '国内',
              areaName: '华南',
              regionId: 'cn-south-1',
              regionName: '华南-广州',
              flavorVcpuType: null,
              flavorFamily: null,
              flavorGeneration: null,
              cardModel: null,
              regionTreeItem: null,
            },
            {
              insideOutside: '国内',
              areaName: '华南',
              regionId: 'cn-south-2',
              regionName: '华南-深圳',
              flavorVcpuType: null,
              flavorFamily: null,
              flavorGeneration: null,
              cardModel: null,
              regionTreeItem: null,
            },
          ],
        },
        {
          insideOutside: null,
          areaName: '华东',
          regionId: null,
          regionName: null,
          flavorVcpuType: null,
          flavorFamily: null,
          flavorGeneration: null,
          cardModel: null,
          regionTreeItem: [
            {
              insideOutside: '国内',
              areaName: '华东',
              regionId: 'cn-east-3',
              regionName: '华东-上海',
              flavorVcpuType: null,
              flavorFamily: null,
              flavorGeneration: null,
              cardModel: null,
              regionTreeItem: null,
            },
            {
              insideOutside: '国内',
              areaName: '华东',
              regionId: 'cn-east-4',
              regionName: '华东-青岛',
              flavorVcpuType: null,
              flavorFamily: null,
              flavorGeneration: null,
              cardModel: null,
              regionTreeItem: null,
            },
          ],
        },
      ],
    },
    {
      insideOutside: null,
      areaName: '海外',
      regionId: null,
      regionName: null,
      flavorVcpuType: null,
      flavorFamily: null,
      flavorGeneration: null,
      cardModel: null,
      regionTreeItem: [
        {
          insideOutside: null,
          areaName: '亚太',
          regionId: null,
          regionName: null,
          flavorVcpuType: null,
          flavorFamily: null,
          flavorGeneration: null,
          cardModel: null,
          regionTreeItem: [
            {
              insideOutside: '海外',
              areaName: '亚太',
              regionId: 'ap-southeast-3',
              regionName: '亚太-新加坡',
              flavorVcpuType: null,
              flavorFamily: null,
              flavorGeneration: null,
              cardModel: null,
              regionTreeItem: null,
            },
            {
              insideOutside: '海外',
              areaName: '亚太',
              regionId: 'ap-southeast-2',
              regionName: '亚太-曼谷',
              flavorVcpuType: null,
              flavorFamily: null,
              flavorGeneration: null,
              cardModel: null,
              regionTreeItem: null,
            },
          ],
        },
        {
          insideOutside: null,
          areaName: '欧洲',
          regionId: null,
          regionName: null,
          flavorVcpuType: null,
          flavorFamily: null,
          flavorGeneration: null,
          cardModel: null,
          regionTreeItem: [
            {
              insideOutside: '海外',
              areaName: '欧洲',
              regionId: 'eu-west-0',
              regionName: '欧洲-巴黎',
              flavorVcpuType: null,
              flavorFamily: null,
              flavorGeneration: null,
              cardModel: null,
              regionTreeItem: null,
            },
            {
              insideOutside: '海外',
              areaName: '欧洲',
              regionId: 'eu-west-1',
              regionName: '欧洲-阿姆斯特丹',
              flavorVcpuType: null,
              flavorFamily: null,
              flavorGeneration: null,
              cardModel: null,
              regionTreeItem: null,
            },
          ],
        },
      ],
    },
  ],
}

const FLAVOR_VCPU_TYPE_RESPONSE = {
  status: 200,
  message: 'SUCCESS',
  messageEn: 'SUCCESS',
  data: {
    flavorVcpuTypeList: [
      { flavorVcpuType: '32U' },
      { flavorVcpuType: '64U' },
    ],
    flavorGenerationItem: [
      {
        flavorFamily: 'Intel',
        item: [
          { flavorGeneration: 'V5' },
          { flavorGeneration: 'V6' },
        ],
      },
      {
        flavorFamily: 'Kunpeng',
        item: [
          { flavorGeneration: 'V1' },
          { flavorGeneration: 'V2' },
        ],
      },
    ],
  },
}

const CARD_MODEL_RESPONSE = {
  status: 200,
  message: 'SUCCESS',
  messageEn: 'SUCCESS',
  data: [
    { cardModel: 'A3' },
    { cardModel: 'A2' },
  ],
}

export async function getRegionTreeAPI(_params) {
  return structuredClone(SALE_REGION_TREE_RESPONSE)
}

export async function getFlavorVcpuTypeAPI(_params) {
  return structuredClone(FLAVOR_VCPU_TYPE_RESPONSE)
}

export async function getCardModelAPI(_params) {
  return structuredClone(CARD_MODEL_RESPONSE)
}

export async function getSaleHomeDataAPI(_params) {
  return structuredClone(saleHomeData);
}
