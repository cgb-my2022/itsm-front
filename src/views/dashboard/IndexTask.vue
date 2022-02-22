<template>
  <div class="index-container-ty">
    <div style="background-color: white; margin-bottom: 5px">
      <a-row type="flex">
        <a-col :flex="5">
          <!-- <div class="tu" @click="handleSubmit('提交工单')" style="cursor: pointer">-->
          <a-card-grid class="tubg" style="cursor: pointer" @click="visibleStaff = true">
            <div><a-icon type="form" style="margin-right: 5px" />提交工单</div>
          </a-card-grid>
          <!--</div>-->
        </a-col>
        <a-col :flex="5">
          <a-card-grid class="tubg" @click="toServiceOrderList" style="cursor: pointer">
            <div><a-icon type="clock-circle" style="margin-right: 5px" /><span>历史事件</span></div>
          </a-card-grid>
        </a-col>
        <a-col :flex="5">
          <a-card-grid class="tubg" @click="toUserCenter" style="cursor: pointer">
            <div><a-icon type="user" style="margin-right: 5px" /><span>个人信息维护</span></div>
          </a-card-grid>
        </a-col>
      </a-row>
    </div>
    <a-row type="flex" justify="start" :gutter="3">
      <a-col style="padding-top: 10px" :sm="24" :lg="12">
        <div class="card-head">
          <p class="card-head-p1">
            <span class="card-head-p1-span1">新的待办</span>
            <span class="card-head-p1-span2">({{ dataSource1Size }})</span>
          </p>
          <p class="card-head-p2" @click="toServiceOrderList">更多 <a-icon type="double-right" /></p>
        </div>
        <div class="card-tb">
          <a-table :columns="columns" :data-source="dataSource1" :pagination="false">
            <template slot="ellipsisText" slot-scope="text">
              <j-ellipsis :value="text" :length="textMaxLength"></j-ellipsis>
            </template>

            <span slot="action" slot-scope="text, record">
              <template v-if="record.orderStatus === 6">
                <a @click="handleProcess(record)">确认</a>
                <a-divider type="vertical" />
                <a @click="cancelProcess(record)" style="color: orange">退回</a>
                <a-divider type="vertical" />
              </template>
              <template v-if="record.orderStatus === 7 && record.commentStatus === 0">
                <a @click="bindEvaluation(record)">评价</a>
                <a-divider type="vertical" />
              </template>
              <a @click="showDetailServiceOrder(record)">查看</a>
            </span>
          </a-table>
        </div>
      </a-col>
      <a-col style="padding-top: 10px" :sm="24" :lg="12">
        <div class="card-head">
          <p class="card-head-p1">
            <span class="card-head-p1-span1">常用请求</span>
            <span class="card-head-p1-span2">({{ dataSource2Size }})</span>
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
      <a-col style="padding-top: 10px" :sm="24" :lg="24">
        <div class="card-head">
          <p class="card-head-p1">
            <span class="card-head-p1-span1">常用知识</span>
            <!-- <span class="card-head-p1-span2">({{ dataSource2Size }})</span> -->
          </p>
          <p class="card-head-p2" @click="toKnowledgeInfo">更多 <a-icon type="double-right" /></p>
        </div>
        <div class="card-tb">
          <a-table :columns="columns" :data-source="dataSource3" rowKey="id" :pagination="false">
            <span slot="action" slot-scope="text, record">
              <a @click="showDetailKnowledge(record.id)">详情</a>
            </span>
          </a-table>
        </div>
      </a-col>
    </a-row>
    <!-- 知识详情 -->
    <knowledge-detail ref="KnowledgeDetail" :rowInfo="rowInfo" @closeLoad="getKnowledge()"></knowledge-detail>
    <!-- 详情 -->
    <service-task-detail-modal ref="taskDetailModal" @knowledge="bindKnowledge" />
    <!-- 快速发起 -->
    <staff-service-order-modal ref="modalForm" @closeLoad="loadData"></staff-service-order-modal>
    <!-- 服务目录 -->
    <staff-service-catalog ref="serviceCatalog" @closeLoad="loadData"></staff-service-catalog>
    <!-- 办理 -->
    <service-task-deal-modal ref="taskDealModal" @closeLoad="loadData" @knowledge="bindKnowledge" />
    <!-- 发布知识 -->
    <knowledge-info ref="knowledgeInfo"></knowledge-info>
    <!-- 评价 -->
    <staff-service-evaluation ref="serviceEvaluation" @closeLoad="loadData"></staff-service-evaluation>
    <!-- 退回 -->
    <staff-service-back ref="serviceBack" @closeLoad="loadData"></staff-service-back>
    <!-- 提交工单 -->
    <a-modal title="提交工单" :visible="visibleStaff" @cancel="visibleStaff = false">
      <div class="staff-box">
        <a-button @click="handleSubmitStaff('请求目录', 'serviceCatalog')" type="primary">请求目录</a-button>
        <a-button @click="handleSubmitStaff('快速发起', 'modalForm')" type="primary" style="margin-left: 30px"
          >快速发起</a-button
        >
      </div>
      <template slot="footer">
        <a-button key="back" @click="visibleStaff = false"> 关闭 </a-button>
      </template>
    </a-modal>
  </div>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import StaffServiceOrderModal from '../modules/service/staff/modules/StaffServiceOrderModal'
import StaffServiceCatalog from '../modules/service/staff/modules/StaffServiceCatalog'
import ServiceTaskDetailModal from '../modules/service/common/ServiceTaskDetailModal'
import ServiceTaskDealModal from '../modules/service/common/ServiceTaskDealModal'
import StaffServiceEvaluation from '../modules/service/staff/modules/StaffServiceEvaluation'
import StaffServiceBack from '../modules/service/staff/modules/StaffServiceBack'
import KnowledgeDetail from '@/views/modules/knowledge/common/KnowledgeDetail.vue'
import { filterDictTextByCache } from '@/components/dict/JDictSelectUtil'
import { mapGetters } from 'vuex'
import { getAction, postAction } from '@/api/manage'

export default {
  name: 'IndexTask',
  mixins: [JeecgListMixin],
  components: {
    StaffServiceOrderModal,
    ServiceTaskDetailModal,
    ServiceTaskDealModal,
    StaffServiceEvaluation,
    StaffServiceCatalog,
    StaffServiceBack,
    KnowledgeDetail
  },
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
      disableMixinCreated: true,
      visibleStaff: false,
      columns: [
        {
          title: '标题',
          align: 'center',
          ellipsis: true,
          dataIndex: 'title',
        },
        {
          title: '创建人',
          align: 'center',
          ellipsis: true,
          dataIndex: 'createName',
        },
        {
          title: '账号',
          align: 'center',
          ellipsis: true,
          dataIndex: 'userName',
        },
        {
          title: '类型',
          align: 'center',
          ellipsis: true,
          dataIndex: 'knowledgeCatName',
        },
        {
          title: '关键字',
          align: 'center',
          ellipsis: true,
          dataIndex: 'keyWords',
        },
        {
          title: '点赞数',
          align: 'center',
          dataIndex: 'star',
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          width: 150,
          fixed: 'right',
          scopedSlots: { customRender: 'action' },
        },
      ],
      url: {
        myUnfinished: '/system/serviceOrder/myUnfinish',
        list: '/system/serviceOrder/list',
        resolve: '/system/serviceOrder/confirmOrderResolved',
        knowledgeInfo: '/know/knowledgeInfo/indexList',
        knowledgeDetail: '/know/knowledgeManage/detail/', //知识详情
      },
      rowInfo: {},
    }
  },
  created() {
    this.loadData()
    this.getKnowledge()
  },
  methods: {
    ...mapGetters(['nickname', 'welcome']),
    // 获取常用知识
    getKnowledge() {
      getAction(this.url.knowledgeInfo).then((res) => {
        if (res.success) {
          this.dataSource3 = res.result.records
        }
      })
    },
    // 知识列表页
    toKnowledgeInfo() {
      this.$router.push('/knowledge/list')
    },
    // 知识详情
    showDetailKnowledge(id) {
      getAction(this.url.knowledgeDetail + id).then((res) => {
        if (res.success) {
          this.rowInfo = res.result.knowledgeManage
          this.$refs['KnowledgeDetail'].add()
          this.$refs['KnowledgeDetail'].title = '知识详情'
          this.$refs['KnowledgeDetail'].disableSubmit = false
        }
      })
    },
    // 办理
    handleProcess(record) {
      // this.$refs.taskDealModal.title = '确认服务请求';
      // this.$refs.taskDealModal.deal(record.id);
      const that = this
      that.$confirm({
        title: '确认',
        content: '确认问题已经解决了吗?',
        okText: '确定',
        cancelText: '取消',
        type: 'warning',
        onOk: async () => {
          var params = {
            id: record.id,
            version: record.version,
          }
          postAction(that.url.resolve, params).then((res) => {
            if (res.success) {
              that.$message.success(res.message)
              that.bindEvaluation(record)
            } else {
              that.$message.warning(res.message)
              that.loadData()
            }
          })
        },
        onCancel() {},
      })
    },
    // 退回
    cancelProcess(record) {
      this.$refs.serviceBack.deal(record)
    },
    // 评价
    bindEvaluation(record) {
      this.$refs.serviceEvaluation.deal(record.id)
    },
    loadData() {
      this.myUnfinished()
    },
    // 弹框方法
    handleSubmitStaff: function (title, ref) {
      this.visibleStaff = false
      this.$refs[ref].add()
      this.$refs[ref].title = title
      this.$refs[ref].disableSubmit = false
    },
    // 详情
    showDetailServiceOrder(record) {
      const path = 'modules/service/staff/modules/StaffServiceOrderForm'
      this.$refs.taskDetailModal.deal(record.id, path)
    },
    toServiceOrderList() {
      this.$router.replace('/service/StaffServiceOrderList')
    },
    toUserCenter() {
      this.$router.replace('/account/center')
    },
    goPage() {
      this.$message.success('请根据具体业务跳转页面')
      // this.$router.push({ path: '/comp/mytask' })
    },
    mock() {},
    handleData() {
      this.$message.success('办理完成')
    },
    myUnfinished() {
      var params = {}
      getAction(this.url.myUnfinished, params).then((res) => {
        if (res.success) {
          this.dataSource1Size = res.result.length
          if (this.dataSource1Size <= 5) {
            this.dataSource1 = res.result
          } else {
            this.dataSource1 = res.result.slice(0, 5)
          }
          // this.ipagination.total = res.result.total;
        }
        if (res.code === 510) {
          this.$message.warning(res.message)
        }
        this.loading = false
      })
    },
  },
}
</script>
<style>
.staff-box {
  display: flex;
  justify-content: center;
}
.tubg {
  text-align: center;
  line-height: 25px;
  width: 100%;
  font-size: 16px;
}
.tubg:hover {
  background-color: #1890ff;
  display: block;
  font-family: bold;
  opacity: 0.8;
  color: white;
  font-size: 16px;
}
.ant-table-tbody > tr > td {
  line-height: 10px;
}
.card-head {
  background-color: white;
  line-height: 45px;
  height: 45px;
}

.card-head-p1 {
  float: left;
  margin-left: 22px;
  margin-bottom: 6px;
}
.card-head-p2 {
  float: right;
  margin-right: 22px;
  margin-bottom: 6px;
  cursor: pointer;
}
.card-head-p1-span1 {
  font-weight: bold;
  font-size: 14px;
  line-height: 40px;
  margin-right: 5px;
}
.card-head-p1-span2 {
  color: gray;
  font-size: 12px;
}
.card-tb {
  background-color: white;
  height: 271px;
  padding-left: 15px;
  padding-right: 15px;
}
</style>
