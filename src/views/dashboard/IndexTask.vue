<template>
  <div class="index-container-ty">
    <a-divider type="vertical" />
    <a-card title="" style="margin-bottom: 5px">
      <a-card-grid @click="handleSubmit('提交工单')" style="width:30%;text-align:center;cursor: pointer">
        <a-icon type="plus" /><br><span>提交工单</span>
      </a-card-grid>
      <a-card-grid @click="toServiceOrderList" style="width:30%;text-align:center;cursor: pointer" :hoverable="true">
        <a-icon type="clock-circle" /><br><span>历史事件</span>
      </a-card-grid>
      <a-card-grid  @click="toUserCenter" style="width:40%;text-align:center;cursor: pointer" :hoverable="true">
        <a-icon type="user"/><br><span>个人信息维护</span>
      </a-card-grid>
      <staff-service-order-modal ref="modalForm" @ok="myUnfinished"></staff-service-order-modal>
      <service-task-detail-modal :path="path" :formData="formData" ref="taskDealModal"></service-task-detail-modal>
    </a-card>

    <a-spin :spinning="loading">
      <a-row type="flex" justify="start" :gutter="3">
        <a-col :sm="24" :lg="12">
          <a-card>
            <div slot="title" class="index-md-title">
              <a-icon type="check-circle" />
              我的待办【{{ dataSource1Size }}】
            </div>

            <div slot="extra">
              <span style="cursor: pointer" @click="toServiceOrderList" slot="footer" >更多 <a-icon type="double-right" /></span>
            </div>

            <a-table
              :class="'my-index-table tytable1'"
              ref="table1"
              size="small"
              rowKey="id"
              :columns="columns"
              :dataSource="dataSource1"
              :pagination="false">
              <template slot="ellipsisText" slot-scope="text">
                <j-ellipsis :value="text" :length="textMaxLength"></j-ellipsis>
              </template>

              <template slot="dayWarnning" slot-scope="text,record">
                <a-icon type="bulb" theme="twoTone" style="font-size:22px" :twoToneColor="getTipColor(record)"/>
              </template>

              <span slot="action" slot-scope="text, record">
                <template v-if="record.bpmStatus === '1'">
                  <a @click="startProcess(record)">提交流程</a>
                  <a-divider type="vertical"/>
                </template>
                <a @click="showDetailServiceOrder(record)">详情</a>
              </span>

            </a-table>
          </a-card>
        </a-col>

        <!-- <a-col :span="24">
          <div style="height: 5px;"></div>
        </a-col>-->

        <a-col :sm="24" :lg="12">
          <a-card>
            <div slot="title" class="index-md-title">
              <a-icon type="container" />
              常用请求【{{ dataSource4Size }}】
            </div>
            <a-table
              :class="'my-index-table tytable4'"
              ref="table4"
              size="small"
              rowKey="id"
              :columns="columns"
              :dataSource="dataSource4"
              :pagination="false">
              <template slot="ellipsisText" slot-scope="text">
                <j-ellipsis :value="text" :length="textMaxLength"></j-ellipsis>
              </template>

              <template slot="dayWarnning" slot-scope="text,record">
                <a-icon type="bulb" theme="twoTone" style="font-size:22px" :twoToneColor="getTipColor(record)"/>
              </template>

              <span slot="action" slot-scope="text, record">
                <a @click="handleData">办理</a>
              </span>

            </a-table>
          </a-card>
        </a-col>

        <a-col :sm="24" :lg="12">
          <a-card>
            <div slot="title" class="index-md-title">
              <a-icon type="bulb" />
              知识库【{{ dataSource3.length }}】
            </div>
            <a-table
              :class="'my-index-table '"
              ref="table3"
              size="small"
              rowKey="id"
              :columns="columns"
              :dataSource="dataSource3"
              :pagination="false">
              <template slot="ellipsisText" slot-scope="text">
                <j-ellipsis :value="text" :length="textMaxLength"></j-ellipsis>
              </template>

              <template slot="dayWarnning" slot-scope="text,record">
                <a-icon type="bulb" theme="twoTone" style="font-size:22px" :twoToneColor="getTipColor(record)"/>
              </template>

              <span slot="action" >
                <a @click="handleData">办理</a>
              </span>

            </a-table>
          </a-card>
        </a-col>

      </a-row>
    </a-spin>

  </div>
</template>

<script>
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import StaffServiceOrderModal from '../modules/service/staff/modules/StaffServiceOrderModal'
  import ServiceTaskDetailModal from '../modules/service/common/ServiceTaskDetailModal'
  import { filterDictTextByCache } from '@/components/dict/JDictSelectUtil'
  import { mapGetters } from 'vuex'
  import { getAction } from '@/api/manage'

  export default {
    name: 'IndexTask',
    mixins: [JeecgListMixin],
    components: { StaffServiceOrderModal, ServiceTaskDetailModal },
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
        dataSource3: [],
        dataSource32Size: 0,
        dataSource4: [],
        dataSource4Size: 0,
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
            dataIndex: 'businessType',
            customRender: (text) => {
              // 字典值翻译通用方法
              return filterDictTextByCache('SERVICE_ORDER_BUSINESS_TYPE', text);
            }
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
          myUnfinished: '/system/serviceOrder/myUnfinish',
          list: '/system/serviceOrder/list'
        }

      }
    },
    created() {
      this.mock();
      this.myUnfinished();
    },
    mounted() {
    },
    methods: {
      ...mapGetters(['nickname', 'welcome']),
      // 详情
      showDetailServiceOrder(record) {
        this.formData = record;
        this.formData.dataId = record.id;
        this.path = 'modules/service/staff/modules/StaffServiceOrderForm';
        this.$refs.taskDealModal.deal();
      },
      toServiceOrderList() {
        this.$router.replace('/service/StaffServiceOrderList')
      },
      toUserCenter(){
        this.$router.replace('/account/center')
      },
      goPage() {
        this.$message.success('请根据具体业务跳转页面')
        // this.$router.push({ path: '/comp/mytask' })
      },
      mock() {
      },
      handleData() {
        this.$message.success('办理完成')
      },
      myUnfinished() {
        var params = {
        };
        getAction(this.url.myUnfinished, params).then((res) => {
          if (res.success) {
            this.dataSource1Size = res.result.length;
            if (this.dataSource1Size <= 5) {
              this.dataSource1 = res.result;
            }else {
              this.dataSource1 = res.result.slice(0, 5);
            }
           // this.ipagination.total = res.result.total;
          }
          if (res.code === 510) {
            this.$message.warning(res.message)
          }
          this.loading = false;
        })
      }
    }
  }
</script>

<style>
  .my-index-table{height:270px}
  .my-index-table table{font-size: 14px !important;}

  .index-container-ty .ant-card-head-title{padding-top: 6px;padding-bottom: 6px;}
  .index-container-ty .ant-card-extra{padding:0}
  /*.index-container-ty .ant-card-extra a{color:#fff}*/
  .index-container-ty .ant-card-extra a:hover{color:#152ede}
  .index-container-ty .ant-card-head-wrapper,.index-container-ty .ant-card-head{
    line-height:24px;
    min-height:24px;
    /*background: #90aeff;*/
    /*background: #4d79ef;*/
  }
  .index-container-ty .ant-card-body{padding: 10px 12px 0px 12px}

  /* .index-container-ty .ant-card-actions{background: #fff}
   .index-container-ty .ant-card-actions li {margin:2px 0;}
   .index-container-ty .ant-card-actions > li > span{width: 100%}*/

  .index-container-ty .ant-table-footer{text-align: right;padding:6px 12px 6px 6px;background: #fff;border-top: 2px solid #f7f1f1;}

  .index-md-title{
    postion:relative;
    padding-left:24px;
    width: 100%;
    /*color: #fff;*/
    font-size: 21px;
    font-family: cursive;
  }
  .index-md-title img{
    position: absolute;
    height:32px;
    top: 2px;
    left:14px;
  }

  .index-container-ty .ant-card-body{
    /*border-left:1px solid #90aeff;
    /*border-right:1px solid #90aeff;
    border-bottom:1px solid #90aeff;*/
  }

  .index-container-ty .ant-table-thead > tr > th,
  .index-container-ty .ant-table-tbody > tr > td{
    border-bottom: 1px solid ;
  }
  .index-container-ty  .ant-table-small > .ant-table-content > .ant-table-scroll > .ant-table-body > table > .ant-table-thead > tr > th{
    border-bottom: 1px solid ;
  }
  .index-container-ty .ant-table-placeholder {
    padding: 0
  }

  .headerContent .title .welcome-text {
    display: none;
  }
</style>
