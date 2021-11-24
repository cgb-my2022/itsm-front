<template>
  <div class="index-container-ty">
    <div style="background-color:white;margin-bottom: 5px">
      <a-row type="flex">

        <a-col :flex="5" >
          <a-card-grid class="tubg" @click="toServiceOrderReceiveList" style="cursor: pointer">
            <div >
              <a-icon type="clock-circle" style="margin-right: 5px"/><span>历史事件</span>
            </div>
          </a-card-grid>
        </a-col>

      </a-row>
    </div>

    <a-spin :spinning="loading">
      <a-row type="flex" justify="start" :gutter="3">

        <a-col style="padding-top: 10px;" :sm="24" :lg="12">
          <div class="card-head">
            <p class="card-head-p1">
              <span class="card-head-p1-span1">新的待办</span> <span class="card-head-p1-span2">({{ dataSource1Size }})</span>
            </p>
            <p class="card-head-p2" @click="toServiceOrderReceiveList">
              更多 <a-icon type="double-right" />
            </p>
          </div>
          <div class="card-tb">

            <a-table
              :columns="columns"
              :dataSource="dataSource1"
              :pagination="false">
              <template slot="ellipsisText" slot-scope="text">
                <j-ellipsis :value="text" :length="textMaxLength"></j-ellipsis>
              </template>

              <!-- <span slot="action" slot-scope="text, record">
                <template v-if="record.bpmStatus === '1'">
                  <a @click="startProcess(record)">提交流程</a>
                  <a-divider type="vertical"/>
                </template>
                <a @click="showDetailServiceOrder(record)">详情</a>
              </span>-->

              <span slot="action" slot-scope="text, record">
                <template v-if="showClaimButton(record.supportUserName)">
                  <a @click="handleClaim(record)">接单</a>
                  <a-divider type="vertical" />
                  <a @click="showDetailServiceOrder(record)">详情</a>
                </template>
                <template v-else>
                  <a @click="handleProcess(record)">办理</a>
                </template>
              </span>

            </a-table>
          </div>
        </a-col>

        <a-col style="padding-top: 10px;" :sm="24" :lg="12">
          <div class="card-head">
            <p class="card-head-p1">
              <span class="card-head-p1-span1">在办事件</span> <span class="card-head-p1-span2">({{ dataSource2Size }})</span>
            </p>
            <p class="card-head-p2" @click="toServiceOrderReceiveList">
              更多 <a-icon type="double-right" />
            </p>
          </div>
          <div class="card-tb">

            <a-table
              :columns="columns"
              :dataSource="dataSource2"
              :pagination="false">
              <template slot="ellipsisText" slot-scope="text">
                <j-ellipsis :value="text" :length="textMaxLength"></j-ellipsis>
              </template>

              <!-- <span slot="action" slot-scope="text, record">
                <template v-if="record.bpmStatus === '1'">
                  <a @click="startProcess(record)">提交流程</a>
                  <a-divider type="vertical"/>
                </template>
                <a @click="showDetailServiceOrder(record)">详情</a>
              </span>-->

              <span slot="action" slot-scope="text, record">
                <template v-if="showClaimButton(record.supportUserName)">
                  <a @click="handleClaim(record)">接单</a>
                  <a-divider type="vertical" />
                  <a @click="showDetailServiceOrder(record)">详情</a>
                </template>
                <template v-else>
                  <a @click="handleProcess(record)">办理</a>
                </template>
              </span>

            </a-table>
          </div>
        </a-col>

      </a-row>
    </a-spin>
    <staff-serviceOrder-modal ref="modalForm" @ok="modalFormOk"></staff-serviceOrder-modal>
    <service-task-deal-modal ref="taskDealModal" @closeLoad="taskOk" />
    <service-task-detail-modal ref="taskDetailModal" />
  </div>
</template>

<script>
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import { filterDictTextByCache } from '@/components/dict/JDictSelectUtil'
  // import noDataPng from '@/assets/nodata.png'
  // import JEllipsis from '@/components/jeecg/JEllipsis'
  // import { timeFix } from "@/utils/util"
  import { mapGetters } from 'vuex'
  import { getAction, postAction } from '@/api/manage'
  import StaffServiceOrderModal from '../modules/service/staff/modules/StaffServiceOrderModal'
  import ServiceTaskDetailModal from '../modules/service/common/ServiceTaskDetailModal'
  import ServiceTaskDealModal from '../modules/service/common/ServiceTaskDealModal'
   export default {
    name: 'ItIndexTask',
    mixins: [JeecgListMixin],
    components: { StaffServiceOrderModal, ServiceTaskDetailModal, ServiceTaskDealModal },
    data() {
      return {
        loading: false,
        textMaxLength: 8,
        formData: {},
        path: '',
        flowCode: 'onl_service_order',
        dataSource1: [],
        dataSource1Size: 0,
        dataSource2: [],
        dataSource2Size: 0,
        columns: [
         /* {
            title: '',
            dataIndex: '',
            key:'rowIndex',
            width:50,
            fixed:'left',
            align:"center",
            scopedSlots: {customRender: "dayWarnning"},
            ellipsis: true,
          }, */
          /* {
            title:'剩余天数',
            align:"center",
            dataIndex: 'restDay',
            width:80
          }, */
          {
            title: '事件内容',
            align: 'center',
            dataIndex: 'eventContent',
            ellipsis: true
          },
          {
            title: '业务类型',
            align: 'center',
            ellipsis: true,
            dataIndex: 'serviceCatFullName',
            ellipsis: true
          },
          {
            title: '工单状态',
            align: 'center',
            ellipsis: true,
            dataIndex: 'orderStatus',
            customRender: (text) => {
              // 字典值翻译通用方法
              return filterDictTextByCache('service_order_status', text);
            }
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            ellipsis: true,
            scopedSlots: { customRender: 'action' }
          }
        ],
        url: {
          supportLineOnDoList: '/system/serviceOrder/supportLineOnDoList',
          supportLinereceiveList: '/system/serviceOrder/supportLinereceiveList',
          receive: '/system/serviceOrder/supportReceiveOrder'
        },
        disableMixinCreated: true,
      }
    },
    created() {
      this.loadData();
    },
    methods: {
      ...mapGetters(['nickname', 'welcome']),
      loadData() {
        console.log("222");
        this.mock();
        this.toDoEvents();
        this.ongoingEvents();
      },
      showClaimButton(assignee) {
        if (!assignee) {
          return true;
        }
        return false;
      },
      // 办理
      handleProcess(record) {
        this.$refs.taskDealModal.title = '办理';
        this.$refs.taskDealModal.deal(record.id);
      },
      getBizProcessNodeInfo(record) {
        let url = '/process/extActProcessNode/getBizProcessNodeInfo'
        var params = { flowCode: this.flowCode, dataId: record.id };// 查询条件
        getAction(url, params).then((res) => {
          if (res.success) {
            console.log('获取流程节点信息', res);
            console.log('表单数据', res.result.records)
            var data = {
              dataId: res.result.dataId,
              orderStatus: record.orderStatus,
              taskId: res.result.taskId,
              flowCode: this.flowCode,
              taskDefKey: res.result.taskDefKey,
              procInsId: res.result.procInsId,
              tableName: res.result.tableName,
              permissionList: res.result.permissionList,
              bizTaskList: res.result.bizTaskList,
              vars: res.result.records
            }
            this.formData = data;
            this.path = res.result.formUrl;
            console.log('------获取流程节点信息>>', data);
            console.log('------流程表单地址>>', this.formUrl);
            this.$refs.taskDealModal.deal(data, this.formUrl);
            this.loading = false;
          }
        })
      },
      // 详情
      showDetailServiceOrder(record) {
        const path = 'modules/service/staff/modules/StaffServiceOrderForm';
        this.$refs.taskDetailModal.deal(record.id, path);
      },
      toServiceOrderReceiveList() {
        this.$router.replace('/service/supportServiceOrder')
      },
      getTipColor(rd) {
        let num = rd.restDay
        if (num <= 0) {
          return tip_red
        } else if (num >= 1 && num < 4) {
          return tip_yellow
        } else if (num >= 4) {
          return tip_green
        }
      },
      goPage() {
        this.$message.success('请根据具体业务跳转页面')
        // this.$router.push({ path: '/comp/mytask' })
      },
      mock() {
        /* this.dataSource1=tempSs1
        this.dataSource2=tempSs2
        this.dataSource3=tempSs1
        this.dataSource4=[]
        this.ifNullDataSource(this.dataSource4,'.tytable4') */
      },

     /* ifNullDataSource(ds, tb) {
        this.$nextTick(() => {
          if (!ds || ds.length == 0) {
            var tmp = document.createElement('img');
            tmp.src = noDataPng
            tmp.width = 300
            let tbclass = `${tb} .ant-table-placeholder`
            document.querySelector(tbclass).innerHTML = ''
            document.querySelector(tbclass).appendChild(tmp)
          }
        })
      }, */
      handleData() {
        this.$message.success('办理完成')
      },
      toDoEvents() {
        this.dataSource1 = [];
        //待办
        var params = {
        };
        getAction(this.url.supportLinereceiveList, params).then((res) => {
          if (res.success) {
            this.dataSource1Size = res.result.total;
            this.dataSource1 = res.result.records;
          }
          this.loading = false;
        })
      },

      // 在办事件
      ongoingEvents() {
        this.dataSource2 = [];
        var params = {
        };
        getAction(this.url.supportLineOnDoList, params).then((res) => {
          if (res.success) {
            this.dataSource2Size = res.result.total;
            this.dataSource2 = res.result.records;
          }
          this.loading = false;
        })
      },
      taskOk() {
        console.log('流程办理完成')
       // this.loadData()
        this.toDoEvents();
        this.ongoingEvents();
      },
      // 接单
      handleClaim(record) {
        var that = this;
        this.$confirm({
          title: '确认接单吗',
          content: '是否接单?',
          onOk: function() {
            var param = {
              id: record.id,
              version: record.version
            }
            postAction(that.url.receive, param).then((res) => {
              if (res.success) {
                that.$message.success(res.message);
                that.toDoEvents();
                that.ongoingEvents();
              } else {
                that.$message.warning(res.message);
              }
            });
          }
        });
      },
    }
  }
</script>

<style>
  .tubg{
    text-align: center;
    line-height: 25px;
    width: 100%;
    font-size: 16px;
  }
  .tubg:hover {
    background-color: #1890FF;
    display: block;
    font-family: bold;
    opacity: 0.8;
    color:white;
    font-size: 16px;
  }
  .ant-table-tbody >tr >td{
    line-height: 10px;
  }
  .card-head{
    background-color: white;
    line-height:45px;
    height: 45px;
  }

  .card-head-p1{
    float: left;
    margin-left: 22px;
    margin-bottom: 6px;
  }
  .card-head-p2{
    float: right;
    margin-right: 22px;
    margin-bottom: 6px;
    cursor: pointer
  }
  .card-head-p1-span1{
    font-weight:bold;
    font-size: 14px;
    line-height: 40px;
    margin-right: 5px
  }
  .card-head-p1-span2{
    color: gray;
    font-size: 12px;
  }
  .card-tb{
    background-color: white;height: 271px;padding-left: 15px;padding-right: 15px;
  }
</style>
