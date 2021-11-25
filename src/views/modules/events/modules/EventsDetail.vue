<template>
  <!--style="width: calc(100% - 100px); height: calc(100% - 55px);"-->
  <!-- 弹出框 -->
  <a-modal
    :visible="visible"
    :title="acceptType === 1 ? '工单办理' : '工单详情'"
    width="900px"
    destroyOnClose
    :bodyStyle="bodyStyle"
    style="top: 0px"
    :footer="null"
    @cancel="handleModalCancel"
  >
    <!-- 表单内容 -->
    <a-spin :spinning="confirmLoading">
      <div style="margin-top: 5px">
        <staff-service-order-form
          :formData="formData"
          :dictOptions="dictOptions"
          :dictStatus="dictStatus"
        ></staff-service-order-form>
      </div>
    </a-spin>
    <!-- 操作 -->
    <div
      v-if="acceptType === 1"
      class="box-bot"
      :style="{
        position: 'absolute',
        bottom: 0,
        borderTop: '1px solid #e9e9e9',
        padding: '10px 16px',
        background: '#fff',
        textAlign: 'left',
        zIndex: 99,
      }"
    >
      <a-space :size="8" align="center">
        <!-- 未接单 -->
        <template v-if="formData.orderStatus === 1">
          <a-button v-if="userInfo.id === formData.currentUserId" @click="taskDeal('eventsAssigned')" type="primary"
            >快速派单</a-button
          >
          <a-button v-else @click="receiveOrder()" type="primary">接单</a-button>
        </template>
        <!-- 已挂起  -->
        <template v-else-if="formData.orderStatus === 4">
          <a-button @click="bindSolution()" type="primary">解挂</a-button>
        </template>
        <!-- 已接单，已激活，已转单  -->
        <template v-else>
          <a-button @click="taskDeal('eventsSolution')" type="primary">办理</a-button>
          <a-button @click="taskDeal('eventsOut')" style="background: orange; color: #ffffff">转单</a-button>
          <a-button @click="taskDeal('eventsPending')" style="background: orange; color: #ffffff">暂挂</a-button>
        </template>
        <a-button @click="handleModalCancel()">关闭</a-button>
      </a-space>
    </div>
    <!-- 办理 -->
    <events-solution
      ref="eventsSolution"
      :categoryOptions="categoryOptions"
      :formData="formData"
      @complete="handleDataReload()"
    ></events-solution>
    <!-- 转单 -->
    <events-out ref="eventsOut" @ok="handleOk"></events-out>
    <!-- 快速派单 -->
    <events-assigned ref="eventsAssigned" @ok="handleOk"></events-assigned>
    <!-- 暂挂 -->
    <events-pending ref="eventsPending" @ok="handleOk"></events-pending>
  </a-modal>
</template>

<script>
import { putAction, postAction, getAction } from '@/api/manage'
import StaffServiceOrderForm from './StaffServiceOrderForm'
import ATextarea from 'ant-design-vue/es/input/TextArea'
import EventsSolution from './EventsSolution'
import EventsOut from './EventsOut'
import EventsAssigned from './EventsAssigned'
import EventsPending from './EventsPending'

export default {
  name: 'ServiceTaskDealModal',
  props: {
    dictStatus: {
      type: Array,
    },
    dictOptions: {
      type: Array,
    },
    categoryOptions: {
      type: Array,
    },
    userInfo: {
      type: Object,
      default: () => {},
    },
  },
  components: {
    ATextarea,
    StaffServiceOrderForm,
    EventsSolution,
    EventsOut,
    EventsPending,
    EventsAssigned,
  },
  data() {
    return {
      confirmAction: '1',
      ModalText: '',
      model: {
        id: '',
        transferReason: '',
        frontPendingReason: '',
        supportPendingReason: '',
        remark: '',
        businessType: 1,
      },
      formData: {},
      loading: false,
      title: '工单详情',
      visible: false,
      confirmLoading: false,
      confirmLoading4: false,
      confirmLoading3: false,
      currTask: {},
      bodyStyle: {
        paddingBottom: '70px',
        height: (window.innerHeight - 200) + 'px',
        'overflow-y': 'auto',
      },
      iframeUrl: '',
      url: {
        moreInfo: '/sys/event/moreInfo', //详情
        receiveOrder: '/sys/event/receiveOrder', //接单
        supportTranslate: '/sys/event/supportTranslate', //转单
        supportPending: '/sys/event/pending', //暂挂
        unLock: '/sys/event/unLock', //解挂
        supportDelegate: '/sys/event/supportDelegate', //快速派单
      },
      acceptType: 1,
      rowId: null,
    }
  },
  created() {},
  methods: {
    // 根据id初始化数据
    deal(id, type) {
      this.confirmLoading = true
      this.acceptType = type
      this.rowId = id
      this.getDetail()
    },
    getDetail() {
      getAction(this.url.moreInfo, { id: this.rowId }).then((res) => {
        this.confirmLoading = false
        if (res.code === 200) {
          let result = res.result
          Object.keys(result.eventOrder).forEach((item) => {
            result[item] = result.eventOrder[item]
          })
          delete result.eventOrder
          this.formData = result
          this.visible = true
        }
      })
    },
    // 接单
    receiveOrder() {
      this.confirmLoading = true
      postAction(this.url.receiveOrder, 
      { 
        id: this.rowId, version: this.formData.version
      }).then((res) => {
          this.confirmLoading = false
          if (res.code === 200) {
            this.$message.success(res.message)
            this.getDetail()
          } else {
            this.$message.error(res.message)
          }
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    // 解挂
    bindSolution() {
      const that = this
      that.$confirm({
        title: '解挂',
        content: '确认继续处理已挂起的工单吗?',
        onOk: function () {
          that.handleOk({}, 'unLock')
        },
      })
    },
    // 操作
    taskDeal(ref) {
      if (!ref) return
      this.$refs[ref].deal()
    },
    handleOk(values, type, load = 0) {
      const that = this
      const { id, version } = that.formData
      const params = Object.assign(
        {
          id,
          version,
        },
        values
      )
      putAction(that.url[type], params)
        .then((res) => {
          that.loading = false
          if (res.success) {
            that.$message.success(res.message)
            if (load === 1) {
              that.handleDataReload()
            } else {
              that.getDetail()
            }
          } else {
            that.$message.warning(res.message)
          }
        })
        .finally(() => {
          that.loading = false
        })
    },
    // 关闭模态框
    handleModalCancel() {
      this.visible = false
    },
    handleDataReload() {
      this.$emit('ok')
      this.visible = false
    },
  },
}
</script>

<style  lang="less" scoped>
.ant-tabs-left-content {
  padding-top: 10px !important;
}
/** Button按钮间距 */
.ant-btn {
  margin-left: 3px;
}
.box-bot {
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  left: 0;
  right: 0;
}
</style>
