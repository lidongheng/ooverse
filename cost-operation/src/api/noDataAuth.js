const userAuthMock = {
  account: "12345678",
  geoTree: [
    {
      name: "英超",
      code: "PREMIER_LEAGUE",
      children: [
        {
          name: "英超-曼城",
          code: "REGION_CN_EAST",
        },
        {
          name: "英超-阿森纳",
          code: "REGION_CN_NORTH",
        },
        {
          name: "英超-利物浦",
          code: "REGION_CN_SOUTH",
        },
      ],
    },
    {
      name: "西甲",
      code: "LA_LIGA",
      children: [
        {
          name: "西甲-皇家马德里",
          code: "REGION_CN_WEST",
        },
        {
          name: "西甲-巴塞罗那",
          code: "REGION_CN_BEIJING_ONE",
        },
        {
          name: "西甲-马德里竞技",
          code: "REGION_CN_SHANGHAI_ONE",
        },
      ],
    },
    {
      name: "意甲",
      code: "SERIE_A",
      children: [
        {
          name: "意甲-国际米兰",
          code: "REGION_CN_SHENZHEN",
        },
        {
          name: "意甲-尤文图斯",
          code: "REGION_CN_HONGKONG",
        },
      ],
    },
    {
      name: "德甲",
      code: "BUNDESLIGA",
      children: [
        {
          name: "德甲-拜仁慕尼黑",
          code: "REGION_AP_SINGAPORE",
        },
        {
          name: "德甲-多特蒙德",
          code: "REGION_AP_JAKARTA",
        },
      ],
    },
    {
      name: "法甲",
      code: "LIGUE_1",
      children: [
        {
          name: "法甲-巴黎圣日耳曼",
          code: "REGION_EU_FRANKFURT",
        },
        {
          name: "法甲-马赛",
          code: "REGION_US_SILICON_VALLEY",
        },
      ],
    },
  ],
  totalDimenPermConfigList: [
    {
      permDimenTypeCode: "1",
      permDimenTypeName: "角色",
      detailList: [
        {
          permCode: "ROLE_CXO",
          permName: "CXO",
        },
        {
          permCode: "ROLE_INTERNAL_CUSTOMER",
          permName: "内部客户",
        },
      ],
    },
    {
      permDimenTypeCode: "2",
      permDimenTypeName: "区域",
      detailList: [
        {
          permCode: "AREA_CN_SOUTH",
          permName: "华南",
        },
        {
          permCode: "AREA_CN_EAST",
          permName: "华东",
        },
      ],
    },
    {
      permDimenTypeCode: "4",
      permDimenTypeName: "云服务类型",
      detailList: [
        {
          permCode: "CLOUD_ECS",
          permName: "ECS",
        },
        {
          permCode: "CLOUD_OBS",
          permName: "OBS",
        },
        {
          permCode: "CLOUD_XPU",
          permName: "XPU",
        },
      ],
    },
  ],
  ruleCodeList: [
    {
      name: "张三",
      code: "ROLE_CXO",
      validEndTime: "2027-10-31",
      account: "12345678",
      userName: "张三",
    },
  ],
  regionCodeList: [
    {
      name: "张三",
      code: "REGION_CN_EAST",
      validEndTime: "2027-10-31",
      account: "12345678",
      userName: "张三",
    },
    {
      name: "张三",
      code: "REGION_CN_WEST",
      validEndTime: "2027-10-31",
      account: "12345678",
      userName: "张三",
    },
    {
      name: "张三",
      code: "REGION_CN_SOUTH",
      validEndTime: "2027-10-31",
      account: "12345678",
      userName: "张三",
    },
  ],
  cloudServerNameList: [
    {
      name: "张三",
      code: "CLOUD_ECS",
      validEndTime: "2027-10-31",
      account: "12345678",
      userName: "张三",
    },
    {
      name: "张三",
      code: "CLOUD_OBS",
      validEndTime: "2027-10-31",
      account: "12345678",
      userName: "张三",
    },
  ],
};

const statusTextMap = {
  waiting: "未拥有",
  owned: "已拥有",
  approving: "审批中",
};

let applications = [
  {
    user: "12345678",
    order: "ORDER1001",
    title: "数据权限申请",
    status: "审批中",
    approver: "张三",
    userId: "12345678",
    tenant: "",
    description: "项目联调需要临时开通数据权限。",
    dataRoleList: [
      {
        dataRoleId: "CLOUD_ECS",
        validityPeriod: "2027-10-31",
      },
      {
        dataRoleId: "REGION_CN_EAST",
        validityPeriod: "2027-10-31",
      },
    ],
  },
];

let recordSeed = 1002;

const waitMock = (data) =>
  new Promise((resolve) => {
    window.setTimeout(() => {
      resolve({
        status: 200,
        massage: "success",
        data,
      });
    }, 220);
  });

const clone = (value) => JSON.parse(JSON.stringify(value));

const toOrderView = (record) => ({
  user: record.user,
  order: record.order,
  title: record.title,
  status: record.status,
  approver: record.approver,
});

export const getNoDataAuthOptions = (_config) =>
  waitMock(clone(userAuthMock));

export const getNoDataAuthList = (params, _config) => {
  let list = applications;

  if (params.status !== "all") {
    list = list.filter((record) => record.status === statusTextMap[params.status]);
  }

  return waitMock(clone(list.map(toOrderView)));
};

export const createNoDataAuth = (payload, _config) => {
  const record = {
    user: payload.userId,
    order: `ORDER${recordSeed}`,
    title: "数据权限申请",
    status: "审批中",
    approver: "张三",
    userId: payload.userId,
    tenant: payload.tenant,
    description: payload.description,
    dataRoleList: payload.dataRoleList,
  };

  recordSeed += 1;
  applications = [record, ...applications];

  return waitMock(true);
};

export const updateNoDataAuth = (order, payload) => {
  applications = applications.map((record) => {
    if (record.order !== order) {
      return record;
    }

    return {
      ...record,
      userId: payload.userId,
      tenant: payload.tenant,
      description: payload.description,
      dataRoleList: payload.dataRoleList,
    };
  });

  return waitMock(true);
};

export const deleteNoDataAuth = (order) => {
  applications = applications.filter((record) => record.order !== order);

  return waitMock(true);
};
