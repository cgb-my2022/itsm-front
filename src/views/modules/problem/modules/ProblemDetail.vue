<template>
  <!-- 弹出框 -->
  <a-modal
    :visible="visible"
    :title="title"
    width="900px"
    destroyOnClose
    :bodyStyle="bodyStyle"
    style="top: 0px"
    :footer="null"
    @cancel="handleCancel"
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
    <template v-if="source === 3 && type === 1">
      <!-- 操作 -->
      <div
        v-if="source === 3"
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
          <template v-if="formData.orderStatus == 2 || formData.orderStatus == 5">
            <a-button @click="taskDeal('problemSolution')" type="primary">办理</a-button>
            <a-button @click="taskDeal('problemPending')" style="background: orange; color: #ffffff">暂挂</a-button>
          </template>
          <template v-if="formData.orderStatus == 4">
            <a-button @click="bindSolution()" type="primary">解挂</a-button>
          </template>
        </a-space>
      </div>
      <!-- 办理 -->
      <problem-solution
        ref="problemSolution"
        :formData="formData"
        @knowledge="bindKnowledge"
        @complete="handleDataReload()"
      ></problem-solution>
      <!-- 暂挂 -->
      <problem-pending ref="problemPending" @ok="handleOk"></problem-pending>
    </template>
    <!-- 操作 -->
    <div
      v-if="(formData.orderStatus == 7 || formData.orderStatus == 6) && knowledgeRelease"
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
        <a-button @click="bindKnowledge()" type="primary">发布知识</a-button>
      </a-space>
    </div>
  </a-modal>
</template>

<script>
import { mapState } from 'vuex'
import { putAction, postAction, getAction } from '@/api/manage'
import StaffServiceOrderForm from './StaffServiceOrderForm'
import ATextarea from 'ant-design-vue/es/input/TextArea'
import ProblemSolution from './ProblemSolution'
import ProblemPending from './ProblemPending'

export default {
  name: 'ServiceTaskDealModal',
  props: {
    // 页面标识  1：我的问题 2：问题列表 3：问题办理
    source: {
      type: Number,
      default: 1,
    },
    // 工单状态
    dictStatus: {
      type: Array,
    },
    // 优先级
    dictOptions: {
      type: Array,
    },
    // 当前用户信息
    userInfo: {
      type: Object,
      default: () => {},
    },
  },
  components: {
    ATextarea,
    StaffServiceOrderForm,
    ProblemSolution,
    ProblemPending,
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
      title: '详情',
      visible: false,
      confirmLoading: false,
      confirmLoading4: false,
      confirmLoading3: false,
      currTask: {},
      bodyStyle: {
        paddingBottom: '70px',
        height: window.innerHeight - 200 + 'px',
        'overflow-y': 'auto',
      },
      iframeUrl: '',
      url: {
        moreInfo: '/sys/problem/moreInfo', //详情
        pending: '/sys/problem/pending', //暂挂
        unLock: '/sys/problem/unLock', //解挂
      },
      rowId: null,
      type: 1,
      load: 1,
    }
  },
  computed: {
    ...mapState({
      // 发布知识权限
      knowledgeRelease: (state) => state.user.knowledgeRelease,
    }),
  },
  created() {},
  methods: {
    // 根据id初始化数据
    deal(id, title, type) {
      this.confirmLoading = true
      this.title = title
      this.rowId = id
      this.type = type
      this.getDetail()
    },
    getDetail() {
      getAction(this.url.moreInfo, { id: this.rowId }).then((res) => {
        this.confirmLoading = false
        if (res.code === 200) {
          let result = res.result
          Object.keys(result.problemOrder).forEach((item) => {
            result[item] = result.problemOrder[item]
          })
          delete result.problemOrder
          this.formData = result
          this.visible = true
        }
      })
    },
    // 接单
    receiveOrder() {
      this.confirmLoading = true
      postAction(this.url.receiveOrder, {
        id: this.rowId,
        version: this.formData.version,
      })
        .then((res) => {
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
        title: '确认解挂吗',
        content: '是否解挂该任务?',
        onOk: function () {
          that.handleOk({}, 'unLock')
        },
      })
    },
    // 操作
    taskDeal(ref) {
      if (!ref) return
      this.$refs[ref].add(this.formData)
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
              that.load = load
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
    handleDataReload() {
      this.$emit('ok')
      this.visible = false
    },
    // 发布知识
    bindKnowledge() {
      this.visible = false
      this.$emit('knowledge', this.formData.id, this.url.moreInfo, 'problemOrder', 'problemTitle')
    },
    // 关闭模态框
    handleCancel() {
      if (this.load === 0) {
        this.$emit('ok')
      }
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
