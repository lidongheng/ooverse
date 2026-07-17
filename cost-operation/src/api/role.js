export function getPermissionConfig(_config) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: 200,
        massage: "success",
        data: {
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
          ruleCodeList: [
            {
              name: "张三",
              code: "ROLE_CXO",
              validEndTime: "2027-10-31",
              account: "12345678",
              userName: "张三",
            },
            {
              name: "张三",
              code: "ROLE_FRONT_SALES",
              validEndTime: "2027-10-31",
              account: "12345678",
              userName: "张三",
            },
          ],
          totalDimenPermConfigList: [
            {
              permDimenTypeCode: "1",
              permDimenTypeName: "角色",
              detailList: [
                {
                  permCode: "ROLE_CXO",
                  permName: "角色1",
                  approver: "李四 23456789",
                },
                {
                  permCode: "ROLE_FRONT_SALES",
                  permName: "角色2",
                  approver: "李四 23456789",
                },
                {
                  permCode: "ROLE_INTERNAL_CUSTOMER",
                  permName: "角色3",
                  approver: "李四 23456789",
                },
                {
                  permCode: "ROLE_SERVICE_PE",
                  permName: "角色4",
                  approver: "李四 23456789",
                },
                {
                  permCode: "ROLE_OPS_ANALYST",
                  permName: "角色5",
                  approver: "李四 23456789",
                },
              ],
            },
            {
              permDimenTypeCode: "3",
              permDimenTypeName: "数据类型",
              detailList: [
                {
                  permCode: "DATA_COST",
                  permName: "成本",
                },
                {
                  permCode: "DATA_EFFICIENCY",
                  permName: "效率",
                },
                {
                  permCode: "DATA_OPERATE",
                  permName: "销毛",
                },
                {
                  permCode: "DATA_REVENUE",
                  permName: "流水",
                },
              ],
            },
            {
              permDimenTypeCode: "4",
              permDimenTypeName: "云服务",
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
                  permCode: "CLOUD_EVS",
                  permName: "XPU",
                },
              ],
            },
            {
              permDimenTypeCode: "6",
              permDimenTypeName: "CXO云服务类型",
              detailList: [
                {
                  permCode: "CXO_CLOUD_GENERAL_COMPUTING",
                  permName: "通算/存储",
                },
                {
                  permCode: "CXO_CLOUD_NPU",
                  permName: "智算",
                }
              ],
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
              code: "CLOUD_ECS",
              validEndTime: "2027-02-18",
            },
            {
              code: "CLOUD_OBS",
              validEndTime: "2027-02-18",
            },
            {
              code: "CLOUD_EVS",
              validEndTime: "2027-02-18",
            },
          ],
          dataTypeCodeMap: {
            CXO_CLOUD_NPU: [ // 智算
              {
                name: "成本",
                code: "DATA_COST",
                validEndTime: "2027-10-31",
                account: "12345678",
                userName: "张三",
              },
              {
                name: "效率",
                code: "DATA_EFFICIENCY",
                validEndTime: "2027-10-31",
                account: "12345678",
                userName: "张三",
              }
            ],
            CXO_CLOUD_GENERAL_COMPUTING: [] // 通算/存储
          }
        },
      });
    }, 500);
  });
}
