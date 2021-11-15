<template>
  <div class="index-container-ty">
    <div style="background-color:white;margin-bottom: 5px">
      <a-row type="flex">
        <a-col :flex="5">
         <!-- <div class="tu" @click="handleSubmit('提交工单')" style="cursor: pointer">-->
          <a-card-grid class="tubg" style="cursor: pointer" @click="handleSubmit('提交工单')" >
              <div><a-icon type="form" style="margin-right: 5px"/>提交工单</div>
          </a-card-grid>
          <!--</div>-->
        </a-col>
        <a-col :flex="5" >
            <a-card-grid class="tubg"@click="toServiceOrderList" style="cursor: pointer">
            <div >
              <a-icon type="clock-circle" style="margin-right: 5px"/><span>历史事件</span>
            </div>
            </a-card-grid>
        </a-col>
        <a-col :flex="5" >

            <a-card-grid class="tubg" @click="toUserCenter" style="cursor: pointer">
              <div > <a-icon type="user" style="margin-right: 5px"/><span>个人信息维护</span> </div>
            </a-card-grid>
        </a-col>
      </a-row>
    </div>
    <staff-service-order-modal ref="modalForm" @ok="loadData()"></staff-service-order-modal>
    <service-task-deal-modal ref="taskDealModal" @closeLoad="loadData()" />
    <service-task-detail-modal ref="taskDetailModal" />
      <a-row type="flex" justify="start" :gutter="3">
        <a-col style="padding-top: 10px;" :sm="24" :lg="12">
          <div class="card-head">
            <p class="card-head-p1">
              <span class="card-head-p1-span1">新的待办</span> <span class="card-head-p1-span2">({{ dataSource1Size }})</span>
            </p>
            <p class="card-head-p2" @click="toServiceOrderList">
              更多 <a-icon type="double-right" />
            </p>
          </div>
         <div class="card-tb">

            <a-table :columns="columns" :data-source="dataSource1" :pagination="false">
              <template slot="ellipsisText" slot-scope="text">
                <j-ellipsis :value="text" :length="textMaxLength"></j-ellipsis>
              </template>

              <span slot="action" slot-scope="text, record">
                <template v-if="record.orderStatus===6">
                  <a @click="handleProcess(record)">确认</a>
                  <a-divider type="vertical"/>
                </template>
                <a @click="showDetailServiceOrder(record)">查看</a>
              </span>
            </a-table>
            </div>
        </a-col>

        <!-- <a-col :span="24">
          <div style="height: 5px;"></div>
        </a-col>-->

        <a-col style="padding-top: 10px;" :sm="24" :lg="12">
          <div class="card-head">
            <p class="card-head-p1">
              <span class="card-head-p1-span1">常用请求</span> <span class="card-head-p1-span2">({{ dataSource2Size }})</span>
            </p>
            <!--<p class="card-head-p2" @click="toServiceOrderList">
              更多 <a-icon type="double-right" />
            </p>-->
          </div>
          <div class="card-tb">

            <a-table :columns="columns" :data-source="dataSource2" :pagination="false">
              <!--<template slot="ellipsisText" slot-scope="text">
                <j-ellipsis :value="text" :length="textMaxLength"></j-ellipsis>
              </template>

              <span slot="action" slot-scope="text, record">
                <template v-if="record.bpmStatus === '1'">
                  <a @click="startProcess(record)">提交流程</a>
                  <a-divider type="vertical"/>
                </template>
                <a @click="showDetailServiceOrder(record)">查看</a>
              </span>-->
            </a-table>
          </div>
        </a-col>

        <a-col style="padding-top: 10px;" :sm="24" :lg="24">
          <div class="card-head">
            <p class="card-head-p1">
              <span class="card-head-p1-span1">知识库</span> <span class="card-head-p1-span2">({{ dataSource2Size }})</span>
            </p>
            <!--<p class="card-head-p2" @click="toServiceOrderList">
              更多 <a-icon type="double-right" />
            </p>-->
          </div>
          <div class="card-tb">

            <a-table :columns="columns" :data-source="dataSource3" :pagination="false">
              <!--<template slot="ellipsisText" slot-scope="text">
                <j-ellipsis :value="text" :length="textMaxLength"></j-ellipsis>
              </template>

              <span slot="action" slot-scope="text, record">
                <template v-if="record.bpmStatus === '1'">
                  <a @click="startProcess(record)">提交流程</a>
                  <a-divider type="vertical"/>
                </template>
                <a @click="showDetailServiceOrder(record)">查看</a>
              </span>-->
            </a-table>
          </div>
        </a-col>

      </a-row>

  </div>
</template>

<script>
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import StaffServiceOrderModal from '../modules/service/staff/modules/StaffServiceOrderModal'
  import ServiceTaskDetailModal from '../modules/service/common/ServiceTaskDetailModal'
  import ServiceTaskDealModal from '../modules/service/common/ServiceTaskDealModal'
  import { filterDictTextByCache } from '@/components/dict/JDictSelectUtil'
  import { mapGetters } from 'vuex'
  import { getAction } from '@/api/manage'

  export default {
    name: 'IndexTask',
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
            dataIndex: 'serviceCatFullName',
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
    },
    mounted() {
      this.loadData();
    },
    methods: {
      ...mapGetters(['nickname', 'welcome']),
      // 办理
      handleProcess(record) {
        this.$refs.taskDealModal.title = '确认服务请求';
        this.$refs.taskDealModal.deal(record.id);
      },
      loadData() {
        this.myUnfinished();
      },
      // 详情
      showDetailServiceOrder(record) {
        const path = 'modules/service/staff/modules/StaffServiceOrderForm';
        this.$refs.taskDetailModal.deal(record.id, path);
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
