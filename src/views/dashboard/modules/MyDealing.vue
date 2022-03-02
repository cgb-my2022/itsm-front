<template>
  <a-col class="col_home" :sm="24" :lg="12">
    <div class="card-head">
      <p class="card-head-p1">
        <span class="card-head-p1-span1">{{ source === 1 ? '我的待办' : '我的在办' }}</span>
        <span class="card-head-p1-span2">({{ ipagination.total }})</span>
      </p>
    </div>
    <div class="card-tb">
      <a-table
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        @change="handleTableChange"
      >
        <!-- 工单类型 -->
        <template slot="orderType" slot-scope="text">
          <span>{{ orderType[text - 1].text }}</span>
        </template>
        <!-- 工单状态 -->
        <template slot="orderStatus" slot-scope="text, record">
          <span v-if="record.orderType === 4" class="order-status">
            <span v-if="text == 11" class="order-status_round c-blue"></span>
            <span v-if="text == 2" class="order-status_round c-green"></span>
            <span v-if="text == 7 || text == 12" class="order-status_round c-gray"></span>
            <span>{{ setStatus(text, record) }}</span>
          </span>
          <span v-else class="order-status">
            <span v-if="text === 1 || text === 4" class="order-status_round c-blue"></span>
            <span v-if="text === 2 || text === 3 || text === 5" class="order-status_round c-green"></span>
            <span v-if="text === 6" class="order-status_round c-red"></span>
            <span v-if="text === 7" class="order-status_round c-gray"></span>
            <span>{{ setStatus(text, record) }}</span>
          </span>
        </template>
        <!-- 操作按钮 -->
        <span slot="action" slot-scope="text, record">
          <!-- 服务工单 -->
          <template v-if="record.orderType === 1">
            <template v-if="record.orderStatus === 6">
              <a @click="bindSure(record)">确认</a>
              <a-divider type="vertical" />
              <a @click="bindBack(record)">退回</a>
              <a-divider type="vertical" />
            </template>
            <template v-else-if="setRealname([2, 5], record.orderStatusDetail)">
              <a @click="handleClaim(record)">接单</a>
              <a-divider type="vertical" />
            </template>
            <template v-else-if="setRealname([3, 12, 6, 13, 21, 23], record.orderStatusDetail)">
              <a @click="bindDetail(1, record)">办理</a>
              <a-divider type="vertical" />
            </template>
            <template v-else-if="setRealname([4, 7, 22], record.orderStatusDetail)">
              <a @click="bindDetail(1, record)">解挂</a>
              <a-divider type="vertical" />
            </template>
          </template>
          <!-- 事件工单 -->
          <template v-if="record.orderType === 2">
            <template v-if="record.orderStatus === 1">
              <a @click="bindDetail(1, record)">{{ userInfo.id === record.currentUserId ? '快速派单' : '接单' }}</a>
              <a-divider type="vertical" />
            </template>
            <template v-if="record.orderStatus === 6">
              <a @click="bindSure(record)">确认</a>
              <a-divider type="vertical" />
            </template>
            <template v-else>
              <a @click="bindDetail(1, record)">办理</a>
              <a-divider type="vertical" />
            </template>
          </template>
          <!-- 问题工单 -->
          <template v-if="record.orderType === 3">
            <template v-if="record.orderStatus == 1">
              <a @click="handleClaim(record)">指派</a>
              <a-divider type="vertical" />
            </template>
            <template v-else-if="record.orderStatus == 4">
              <a @click="bindDetail(1, record)">解挂</a>
              <a-divider type="vertical" />
            </template>
            <template v-else-if="userInfo.id === record.currentUserId && record.orderStatus == 6">
              <a @click="bindSure(record)">确认</a>
              <a-divider type="vertical" />
              <a @click="bindBack(record)">退回</a>
              <a-divider type="vertical" />
            </template>
            <template v-else>
              <a @click="bindDetail(1, record)">办理</a>
              <a-divider type="vertical" />
            </template>
          </template>
          <!-- 变更工单 -->
          <template v-if="record.orderType === 4">
            <template>
              <a @click="bindDetail(1, record)">办理</a>
              <a-divider type="vertical" />
            </template>
          </template>
          <a @click="bindDetail(2, record)">详情</a>
        </span>
      </a-table>
    </div>
    <!-- 服务详情 -->
    <service-detail ref="taskDetailModal" @knowledge="releaseKnowledge" />
    <!-- 服务办理 -->
    <service-deal ref="taskDealModal" @ok="loadAll" @knowledge="bindKnowledge" />
    <!-- 服务评价 -->
    <service-evaluation ref="serviceEvaluation"></service-evaluation>
    <!-- 服务退回 -->
    <service-back ref="serviceBack" @closeLoad="loadData"></service-back>
    <!-- 事件工单 -->
    <events-detail
      :categoryOptions="categoryOptions"
      :dictStatus="orderType[1].orderStatus"
      :dictOptions="eventLevel"
      :userInfo="userInfo"
      ref="eventsDetail"
      @ok="loadAll"
    >
    </events-detail>
    <!-- 问题详情 -->
    <problem-detail
      :source="3"
      :dictStatus="orderType[2].orderStatus"
      :dictOptions="levelOptions"
      :userInfo="userInfo"
      ref="problemDetail"
      @ok="loadAll"
      @knowledge="bindKnowledge"
      @releaseKnowledge="releaseKnowledge"
    >
    </problem-detail>
    <!-- 问题指派 -->
    <problem-out ref="problemOut" @ok="loadData"></problem-out>
    <!-- 问题退回 -->
    <problem-back ref="problemBack" @ok="loadData"></problem-back>
    <!-- 问题评价 -->
    <problem-evaluation ref="problemEvaluation"></problem-evaluation>
    <!-- 发布知识 -->
    <knowledge-info ref="knowledgeInfo"></knowledge-info>
    <!-- 详情 -->
    <alteration-detail 
      ref="alterationDetail" 
      :source="2"
      :dictStatus="orderType[3].orderStatus"
      @ok="loadData()">
    </alteration-detail>
  </a-col>
</template>

<script>
import { postAction, getAction } from '@/api/manage'
import { mapGetters } from 'vuex'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import ServiceDetail from '@/views/modules/service/common/ServiceTaskDetailModal'
import ServiceDeal from '@/views/modules/service/common/ServiceTaskDealModal'
import ServiceEvaluation from '@/views/modules/service/staff/modules/StaffServiceEvaluation'
import ServiceBack from '@/views/modules/service/staff/modules/StaffServiceBack'
import EventsDetail from '@/views/modules/events/modules/EventsDetail.vue'
import ProblemDetail from '@/views/modules/problem/modules/ProblemDetail.vue'
import ProblemOut from '@/views/modules/problem/modules/ProblemOut.vue'
import ProblemBack from '@/views/modules/problem/modules/ProblemBack.vue'
import ProblemEvaluation from '@/views/modules/problem/modules/ProblemEvaluation.vue'
import AlterationDetail from '@/views/modules/alteration/modules/AlterationDetail.vue'
export default {
  name: 'MyDealing',
  mixins: [JeecgListMixin],
  props: {
    // 页面标识
    source: {
      type: Number,
      default: 1,
    },
    // 接口地址
    listUrl: {
      type: String,
      required: true,
    },
    // 工单类型
    orderType: {
      type: Array,
      required: true,
    },
    loadIndex: {
      type: Number,
      default: 0,
    },
  },
  components: {
    ServiceDetail,
    ServiceDeal,
    ServiceEvaluation,
    ServiceBack,
    EventsDetail,
    ProblemDetail,
    ProblemOut,
    ProblemBack,
    ProblemEvaluation,
    AlterationDetail
  },
  computed: {
    ...mapGetters(['userInfo']),
    // 设置工单状态
    setStatus() {
      return function (text, record) {
        let dictStatus = this.orderType[record.orderType - 1].orderStatus
        if (dictStatus.length > 0) {
          const findItem = dictStatus.find((item) => item.value == text)
          return findItem.text || findItem.title
        } else {
          return ''
        }
      }
    },
    setRealname() {
      return function (arr, status) {
        if (arr.indexOf(status) != -1) {
          return true
        }
        return false
      }
    },
  },
  watch: {
    loadIndex: {
      handler(newVal) {
        if (newVal != 0) {
          this.loadData()
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      url: {
        list: this.listUrl, // 我的在办
        // 服务
        receiveOrder: '/system/serviceOrder/receiveOrder', // 一线接单
        supportReceiveOrder: '/system/serviceOrder/supportReceiveOrder', //二线接单
        resolve: '/system/serviceOrder/confirmOrderResolved', // 确认
        // 事件
        eventResolved: '/sys/event/confirmOrderResolved', // 确认
        // 问题
        problemResolved: '/sys/problem/confirmOrderResolved', //确认
      },
      ipagination: {
        showSizeChanger: false,
      },
      levelOptions: [], // 问题优先级
      eventLevel: [], // 事件优先级
      categoryOptions: [], //事件类型内容
      columns: [
        {
          title: '工单类型',
          dataIndex: 'orderType',
          align: 'center',
          ellipsis: true,
          sorter: true,
          scopedSlots: { customRender: 'orderType' },
        },
        {
          title: '工单标题/内容',
          dataIndex: 'title',
          align: 'center',
          ellipsis: true,
        },
        {
          title: '业务类型',
          dataIndex: 'catFullName',
          align: 'center',
          ellipsis: true,
        },
        {
          title: '工单状态',
          align: 'center',
          dataIndex: 'orderStatus',
          sorter: true,
          width: 110,
          scopedSlots: { customRender: 'orderStatus' },
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          width: 160,
          scopedSlots: { customRender: 'action' },
        },
      ],
    }
  },
  methods: {
    /** 获取数据字典内容 */
    initDictConfig() {
      // 问题优先级
      this.setDic('service_level', 'levelOptions')
      // 事件等级
      this.setDic('event_level', 'eventLevel')
      // 事件类型
      this.setDic('B04', 'categoryOptions', 1)
    },
    // 查看详情、办理
    bindDetail(type, record) {
      const title = type === 1 ? '办理' : '详情'
      switch (record.orderType) {
        case 1:
          // 服务工单
          if (type === 1) {
            // 办理
            this.$refs.taskDealModal.title = '办理'
            this.$refs.taskDealModal.deal(record.orderId)
          } else if (type === 2) {
            // 详情
            const path = 'modules/service/staff/modules/StaffServiceOrderForm'
            this.$refs.taskDetailModal.deal(record.orderId, path)
          }
          break
        case 2:
          // 事件工单
          this.$refs.eventsDetail.deal(record.orderId, type)
          break
        case 3:
          // 问题工单
          this.$refs.problemDetail.deal(record.orderId, title, type)
          break
        case 4:
          // 变更工单
          this.$refs.alterationDetail.deal(record.orderId, title, type)
          break
        default:
          break
      }
    },
    // 接单、指派
    handleClaim(record) {
      var that = this
      if (record.orderType == 1) {  // 服务接单
        let url = ''
        if (record.orderStatusDetail == 2) {
          // 一线接单
          url = that.url.receiveOrder
        } else if (record.orderStatusDetail == 5) {
          // 二线接单
          url = that.url.supportReceiveOrder
        }
        that.$confirm({
          title: '确认接单吗',
          content: '是否接单?',
          onOk: function () {
            var param = {
              id: record.orderId,
              version: record.version,
            }
            postAction(url, param).then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.loadAll()
              } else {
                that.$message.warning(res.message)
              }
            })
          },
        })
      } else if (record.orderType == 3) {  // 问题指派
        let info = JSON.parse(JSON.stringify(record))
        info.id = info.orderId
        that.$refs.problemOut.deal(info)
      }
    },
    // 退回
    bindBack(record) {
      let info = JSON.parse(JSON.stringify(record))
      info.id = info.orderId
      switch (info.orderType) {
        case 1:
          // 服务工单
          this.$refs.serviceBack.deal(info)
          break
        case 3:
          // 问题工单
          this.$refs.problemBack.deal(info)
          break
        default:
          break
      }
    },
    // 确认
    bindSure(record) {
      const that = this
      let url = ''
      if (record.orderType == 1) {
        url = that.url.resolve
      } else if (record.orderType == 2) {
        url = that.url.eventResolved
      } else if (record.orderType == 3) {
        url = that.url.problemResolved
      }
      that.$confirm({
        title: '确认',
        content: '确认问题已经解决了吗?',
        onOk: function () {
          const params = {
            id: record.orderId,
            version: record.version,
          }
          postAction(url, params).then((res) => {
            if (res.success) {
              that.$message.success(res.message)
              that.loadData()
              if (record.orderType == 1) {
                that.$refs.serviceEvaluation.deal(record.orderId)
              } else if (record.orderType == 3) {
                that.$refs.problemEvaluation.deal(record.orderId)
              }
            } else {
              that.$message.warning(res.message)
            }
          })
        },
      })
    },
    loadAll() {
      this.$emit('loadAll')
    }
  }
}
</script>

<style scoped>
@import '~@assets/less/common.less';
.col_home {
  padding-top: 10px;
  background-color: white;
  border-left: 2px solid #f0f2f5;
  box-sizing: border-box;
}
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
  padding-left: 15px;
  padding-right: 15px;
}
</style>
