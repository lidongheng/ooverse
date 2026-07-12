export const resourceMenus = [
  { label: 'ECS资源', value: 'ECS', icon: '▦' },
  { label: 'OBS资源', value: 'OBS', icon: '▰' },
  { label: 'XPU资源', value: 'XPU', icon: '▤' },
  { label: '网络资源', value: 'network', icon: '◉' },
];

export const ecsMetrics = [
  {
    title: '算力',
    value: '126.6',
    unit: '万核',
    trend: '854环比',
    specs: [
      { label: 'Intel V5', value: '15.0 万核' },
      { label: 'Intel V6', value: '18.0 万核' },
      { label: 'Intel V7', value: '50.0 万核' },
      { label: 'Intel V9', value: '43.6 万核' },
    ],
  },
  {
    title: 'AI算力',
    value: '33.1',
    unit: '万核',
    trend: '854环比',
    specs: [
      { label: 'AXD V6', value: '7.0 万核' },
      { label: 'AXD V7', value: '12.0 万核' },
      { label: 'AXD V8', value: '6.1 万核' },
      { label: 'AXD V9', value: '8.0 万核' },
    ],
  },
  {
    title: 'KI算力',
    value: '9.5',
    unit: '万核',
    trend: '854环比',
    specs: [
      { label: 'Kunpeng V1', value: '4.4 万核' },
      { label: 'Kunpeng V2', value: '5.1 万核' },
    ],
  },
];

export const ecsGenerationMetrics = [
  { title: 'V5及以前', value: '16.5', unit: '万核', trend: '122' },
  { title: 'V6-V8', value: '12.5', unit: '万核', trend: '122' },
  { title: 'V9', value: '11.4', unit: '万核', trend: '122' },
];

export const ecsBars = [
  {
    title: '算力',
    data: [
      { name: '华北-上海一', value: 2.7 },
      { name: '西南-贵阳一', value: 2.6 },
      { name: '华东-上海一', value: 2.0 },
      { name: '西北-宁夏', value: 1.1 },
      { name: '华北-乌兰', value: 0.9 },
      { name: '西南-c6', value: 0.6 },
      { name: '欧洲', value: 0.2 },
    ],
  },
  {
    title: 'AI算力',
    data: [
      { name: '华北-北京四', value: 11.9 },
      { name: '华北-北京一', value: 11.3 },
      { name: '西南-贵阳', value: 3.9 },
      { name: '华北-c7', value: 3.6 },
      { name: '西北', value: 2.8 },
      { name: '华南-广州', value: 1.8 },
      { name: '华东', value: 1.7 },
    ],
  },
  {
    title: 'KI算力',
    data: [
      { name: '华东-上海一', value: 40.0 },
      { name: '华北-bd', value: 27.7 },
      { name: '德国-广州', value: 22.4 },
      { name: '西南', value: 21.4 },
      { name: '华东', value: 8.1 },
      { name: '香港', value: 4.6 },
      { name: '泰国', value: 1.6 },
    ],
  },
];

export const trendValues = [
  608, 610, 608, 601, 600, 608, 608, 610, 611, 620, 640, 680, 690, 800, 808,
  810, 815, 817, 820, 822, 825, 845, 860, 850, 835, 825, 815, 817, 835, 988,
];

export const resourceTree = [
  {
    label: '算力',
    children: [
      {
        label: 'AI算力',
        children: [
          { label: 'ac6' },
          { label: 'ac7' },
          { label: 'ac8' },
          { label: 'ac9' },
          { label: 'am7' },
        ],
      },
      { label: 'KI算力' },
    ],
  },
];

export const ecsTableRows = [
  { index: 1, area: '西南', region: '西南-贵阳一', az: '西南-贵阳一-AZ1', family: 'c', generation: 'c6', type: 'c6-4', stock: '14,854' },
  { index: 2, area: '西南', region: '西南-贵阳一', az: '西南-贵阳一-AZ1', family: 'c', generation: 'c6', type: 'c6-4', stock: '12,814' },
  { index: 3, area: '华东', region: '华东-上海一', az: '华东-上海一-AZ1', family: 'c', generation: 'c6', type: 'c6-4', stock: '9,547' },
  { index: 4, area: '华北', region: '华北-北京四', az: '华北-北京四-AZ1', family: 'c', generation: 'c6', type: 'c6-4', stock: '9,565' },
  { index: 5, area: '西南', region: '西南-贵阳一', az: '西南-贵阳一-AZ1', family: 'c', generation: 'c6', type: 'c6-4', stock: '8,556' },
  { index: 6, area: '华东', region: '华东-上海一', az: '华东-上海一-AZ1', family: 'c', generation: 'c6', type: 'c6-4', stock: '8,566' },
];

export const obsMetrics = [
  { title: 'OBS可售量（PB）', value: '35.9', unit: '纳上月', trend: '1.29' },
  { title: '单AZ可售量（PB）', value: '5.6', unit: '纳上月', trend: '0.26' },
  { title: '三AZ可售量（PB）', value: '30.3', unit: '纳上月', trend: '3.56' },
];

export const obsStackBars = [
  { name: '华东-上海一', single: 26.7, multi: 57.8 },
  { name: '华东-上海二', single: 25.4, multi: 54.6 },
  { name: '华东-南京', single: 27.9, multi: 35.2 },
  { name: '华东', single: 21.5, multi: 33.3 },
  { name: '亚太-曼谷', single: 19.3, multi: 31.8 },
  { name: '华南-广州', single: 24.5, multi: 27.4 },
  { name: '西南-贵阳一', single: 21.5, multi: 27.4 },
  { name: '华北-北京四', single: 20.0, multi: 27.1 },
  { name: '华北-北京二', single: 17.7, multi: 27.4 },
  { name: '华北-北京一', single: 16.5, multi: 22.9 },
];

export const obsRows = [
  { index: 1, area: '华北', region: '华北-北京四', type: '单AZ', stock: '14,854' },
  { index: 2, area: '华北', region: '华北-乌兰察布一', type: '三AZ', stock: '12,814' },
  { index: 3, area: '西南', region: '西南-贵阳一', type: '单AZ', stock: '9,547' },
  { index: 4, area: '华东', region: '华东-上海一', type: '单AZ', stock: '9,565' },
  { index: 5, area: '华南', region: '华南-广州', type: '单AZ', stock: '8,566' },
  { index: 6, area: '华北', region: '华北-北京二', type: '单AZ', stock: '6,452' },
  { index: 7, area: '亚太', region: '亚太-加拉加斯', type: '单AZ', stock: '6,452' },
];

export const xpuMetrics = [
  { title: '总待分配量（卡）', value: '35,900', unit: '纳上月', trend: '1.29' },
  { title: 'A3待分配量（卡）', value: '5,600', unit: '纳上月', trend: '0.26' },
  { title: 'A2待分配量（卡）', value: '16,200', unit: '纳上月', trend: '3.56' },
  { title: 'A1待分配量（卡）', value: '14,100', unit: '纳上月', trend: '3.56' },
];

export const xpuRows = [
  { index: 1, area: '华北', region: '华北-北京四', type: 'A2', spec: '400T', stock: '14,854' },
  { index: 2, area: '华北', region: '华北-乌兰察布一', type: 'A3', spec: '376T', stock: '12,814' },
  { index: 3, area: '西南', region: '西南-贵阳一', type: 'A3', spec: '313T', stock: '9,547' },
  { index: 4, area: '华东', region: '华东-上海一', type: 'A3', spec: '280T', stock: '9,565' },
  { index: 5, area: '华南', region: '华南-广州', type: 'A3', spec: '280T', stock: '8,566' },
];

export const networkMetrics = [
  { title: 'Internet出口总带宽', primaryLabel: '带宽(T)', primaryValue: '129', primaryTrend: '10', secondaryLabel: '可用带宽(G)', secondaryValue: '29,791', secondaryTrend: '122' },
  { title: '动态BGP', primaryLabel: '带宽(T)', primaryValue: '70', primaryTrend: '10', secondaryLabel: '可用带宽(G)', secondaryValue: '22,050', secondaryTrend: '122' },
  { title: '静态BGP', primaryLabel: '带宽(T)', primaryValue: '35', primaryTrend: '10', secondaryLabel: '可用带宽(G)', secondaryValue: '4,621', secondaryTrend: '122' },
  { title: '纯静态', primaryLabel: '带宽(T)', primaryValue: '24', primaryTrend: '10', secondaryLabel: '可用带宽(G)', secondaryValue: '3,129', secondaryTrend: '122' },
];

export const networkRows = [
  { index: 1, exit: '北京1', bandwidth: '华北电信动态BGP', stock: '14,854' },
  { index: 2, exit: '北京1', bandwidth: '华北电信动态BGP', stock: '12,814' },
  { index: 3, exit: '北京1', bandwidth: '华北电信动态BGP', stock: '9,547' },
  { index: 4, exit: '上海1', bandwidth: '华东电信静态', stock: '8,565' },
  { index: 5, exit: '上海1', bandwidth: '华北-PN-广州广电动态BGP', stock: '8,565' },
  { index: 6, exit: '广州1', bandwidth: '华北电信动态BGP', stock: '6,452' },
  { index: 7, exit: '石家庄1', bandwidth: '华北电信动态BGP', stock: '6,452' },
  { index: 8, exit: '上海1', bandwidth: '华北电信动态BGP', stock: '6,452' },
  { index: 9, exit: '上海1', bandwidth: '华北电信动态BGP', stock: '6,452' },
  { index: 10, exit: '上海1', bandwidth: '华北电信动态BGP', stock: '6,452' },
];
