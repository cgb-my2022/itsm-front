<template>
  <!--style="width: calc(100% - 100px); height: calc(100% - 55px);"-->
  <!-- 弹出框 -->
  <a-modal
    :visible="visible"
    :title="title"
    width="900px"
    destroyOnClose
    :bodyStyle="bodyStyle"
    style="top: 0px;"
    :footer="null"
    @cancel="handleModalCancel"
  >
    <a-spin :spinning="confirmLoading">
      <div style="margin-top: 5px">
        <!--<template v-if="isComp" >
              <service-biz-dynamic-link path="modules/service/staff/modules/StaffServiceOrderForm" width="100%" height="100%" :formData="formData"></service-biz-dynamic-link>
            </template>
            <template v-else>
              <iframe :src="iframeUrl" frameborder="0" width="100%" height="100%" scrolling="auto"></iframe>
            </template>-->
        <staff-service-order-form :formData="formData"></staff-service-order-form>
      </div>
      <!--<a-collapse-panel key="2" header="This is panel header 2" :disabled="false">
          <p>{{ text }}</p>
        </a-collapse-panel>-->
      <!-- <a-divider />-->
    </a-spin>
    <div class="box-bot"
      :style="{
        position: 'absolute',
        bottom: 0,
        borderTop: '1px solid #e9e9e9',
        padding: '10px 16px',
        background: '#fff',
        textAlign: 'left',
        zIndex: 1
      }">
      <!--当前任务环节：{{ currTask.taskName }}-->
      <!--<a-select style="width:300px" :defaultValue="currTask.id">
            <a-select-option :value="currTask.id">{{ currTask.taskName }}</a-select-option>
          </a-select>-->

      <a-space :size="8" align="center">
        <!--一线-->
        <template v-if="formData.orderStatusDetail === 3 || formData.orderStatusDetail === 12"
          ><!--一线已接单-->
          <a-button @click="taskDeal()" type="primary" icon="caret-right">任务办理</a-button>
          <a-button @click="frontPending()" type="primary" icon="lock">暂挂</a-button>
          <a-button @click="frontDelegate()" type="primary" icon="user">转办</a-button>
          <a-button @click="toSupportLine()" type="primary" icon="rollback">转二线</a-button>
        </template>
        <template v-else-if="formData.orderStatusDetail === 4"
          ><!--一线暂挂状态-->
          <a-button @click="frontActive()" type="primary" icon="unlock">解挂</a-button>
        </template>
        <template v-if="formData.orderStatusDetail === 10"
          ><!--一线经理待转办-->
          <a-button @click="frontSupDelegate()" type="primary" icon="user">转办</a-button>
        </template>
        <!--二线-->
        <template v-else-if="formData.orderStatusDetail === 6 || formData.orderStatusDetail === 13"
          ><!--二线已接单-->
          <a-button @click="taskDeal()" type="primary" icon="caret-right">任务办理</a-button>
          <a-button @click="supportPending()" type="primary" icon="lock">暂挂</a-button>
          <a-button @click="supportDelegate()" type="primary" icon="user">转办</a-button>
        </template>
        <template v-else-if="formData.orderStatusDetail === 7"
          ><!--一二线暂挂状态-->
          <a-button @click="supportActive()" type="primary" icon="unlock">解挂</a-button>
        </template>
        <template v-if="formData.orderStatusDetail === 11"
          ><!--一线经理待转办-->
          <a-button @click="supportSupDelegate()" type="primary" icon="user">转办</a-button>
        </template>

        <template v-if="formData.orderStatusDetail === 8 || formData.orderStatusDetail === 9"
          ><!--待确认状态-->
          <a-button @click="confirmOrder()" type="primary" icon="check-circle">确认</a-button>
        </template>
      </a-space>
      <!-- <span style="color: red" v-if="currTask.suspendFlag">当前流程已挂起，需要进行解挂，再进行办理！</span>-->
    </div>
    <service-biz-task-opt-modal
      ref="bpmBizTaskOptModal"
      :formData="formData"
      @ok="completeProcess"
    ></service-biz-task-opt-modal>
    <!--运维转办-->
    <biz-service-task-select-entruster-modal
      ref="ywdelegate"
      @selectFinished="handleDelegate"
    ></biz-service-task-select-entruster-modal>
    <!--主管转办-->
    <biz-service-task-select-entruster-modal
      ref="supDelegate"
      @selectFinished="handleEntruster"
    ></biz-service-task-select-entruster-modal>
    <!-- 转二线 -->
    <biz-service-task-select-two ref="twoDelegate" @selectFinished="toSupportOk"></biz-service-task-select-two>
    <a-modal
      title="暂挂"
      :visible="visible3"
      :confirm-loading="confirmLoading3"
      @ok="handleOk3"
      @cancel="handleCancel3"
    >
      <a-textarea
        v-model="model.frontPendingReason"
        placeholder="请输入暂挂原因(有效长度1-300)"
        :maxLength="300"
        :auto-size="{ minRows: 4, maxRows: 8 }"
      />
    </a-modal>
    <a-modal
      title="暂挂"
      :visible="visible4"
      :confirm-loading="confirmLoading4"
      @ok="handleOk4"
      @cancel="handleCancel4"
    >
      <a-textarea
        v-model="model.supportPendingReason"
        placeholder="请输入暂挂原因(有效长度1-300)"
        :maxLength="300"
        :auto-size="{ minRows: 4, maxRows: 8 }"
      />
    </a-modal>
    <a-modal
      title="确认"
      :visible="visible5"
      :confirm-loading="confirmLoading5"
      @cancel="handleCancel5"
      @ok="handleOk5"
    >
      <div style="width: 80%; display: inline-block; margin-top: 5px">
        <a-textarea v-model="model.remark" placeholder="请输入备注" :auto-size="{ minRows: 4, maxRows: 8 }" />
      </div>
      <div style="margin-top: 5px; margin-bottom: 25px">
        <a-radio-group v-model="confirmAction">
          <a-radio value="1">
            <span style="color: #1121ff">已完成</span>
          </a-radio>
          <a-radio value="2">
            <span style="color: red">重新激活</span>
          </a-radio>
        </a-radio-group>
        <!--<a-button type="primary" @click="resolve()"  icon="check-circle">已解决</a-button>
        <a-button @click="unResolve()" type="danger" icon="stop">激活</a-button>-->
      </div>
    </a-modal>
  </a-modal>
</template>

<script>
import { putAction, postAction, getAction } from '@/api/manage'
import { isURL } from '@/utils/validate'
import ServiceBizTaskOptModal from './ServiceBizTaskOptModal.vue'
import StaffServiceOrderForm from '../staff/modules/StaffServiceOrderForm'
import Vue from 'vue'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import BizServiceTaskSelectEntrusterModal from './BizServiceTaskSelectEntrusterModal.vue'
import ATextarea from 'ant-design-vue/es/input/TextArea'
import BizServiceTaskSelectTwo from './BizServiceTaskSelectTwo.vue'

export default {
  name: 'ServiceTaskDealModal',
  components: {
    ATextarea,
    StaffServiceOrderForm,
    ServiceBizTaskOptModal,
    BizServiceTaskSelectEntrusterModal,
    BizServiceTaskSelectTwo,
  },
  computed: {
    isComp: function () {
      // console.log('isComp组件名称：', this.path);
      var TOKEN = Vue.ls.get(ACCESS_TOKEN)
      var DOMAIN_URL = window._CONFIG['domianURL']
      var TASKID = this.formData.taskDefKey
      var URL = (this.path || '').replace(/{{([^}}]+)?}}/g, (s1, s2) => eval(s2)) // URL支持{{ window.xxx }}占位符变量
      // console.log('isComp组件名称：', URL);
      if (isURL(URL)) {
        this.iframeUrl = URL
        return false
      }
      return true
    },
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
      visible5: false,
      visible4: false,
      visible3: false,
      loading: false,
      title: '',
      visible: false,
      confirmLoading: false,
      confirmLoading5: false,
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
        claim: '/act/task/claim',
        // taskEntrust: '/act/task/taskEntrust',
        delegateFrontUser: '/system/serviceOrder/delegateFrontUser',
        nextDelegateFrontUser: '/system/serviceOrder/nextDelegateFrontUser',
        delegateSupportUser: '/system/serviceOrder/delegateSupportUser',
        nextDelegateSupportUser: '/system/serviceOrder/nextDelegateSupportUser',
        // suspend: '/act/processInstance/suspend',
        frontLinePending: '/system/serviceOrder/frontLinePending',
        supportLinePending: '/system/serviceOrder/supportLinePending',
        // restart: '/act/processInstance/restart',
        frontLineUnlock: '/system/serviceOrder/frontLineUnlock',
        supportLineUnlock: '/system/serviceOrder/supportLineUnlock',
        transferSupport: '/system/serviceOrder/transferSupport',
        unresolve: '/system/serviceOrder/confirmOrderUnresolved',
        resolve: '/system/serviceOrder/confirmOrderResolved',
        moreInfo: '/system/serviceOrder/moreInfo',
      },
    }
  },
  created() {},
  methods: {
    // 根据id初始化数据
    deal(id) {
      // this.formData = data;
      getAction(this.url.moreInfo, { id }).then((res) => {
        if (res.code === 200) {
          let result = res.result
          Object.keys(result.serviceOrder).forEach((item) => {
            result[item] = result.serviceOrder[item]
          })
          this.formData = result
          this.visible = true
        }
      })
    },
    // 转二线
    toSupportLine() {
      this.$refs.twoDelegate.select(this.formData)
      this.$refs.twoDelegate.title = '转二线办理'
    },
    toSupportOk(data) {
      this.ModalText = '转办二线中...'
      this.confirmLoading = true
      let params = {
        id: this.formData.id,
        version: this.formData.version,
      }
      Object.assign(params, data)
      putAction(this.url.transferSupport, params)
        .then((res) => {
          this.confirmLoading = false
          if (res.success) {
            this.$message.success(res.message)
            this.completeProcess()
          } else {
            this.$message.warning(res.message)
          }
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    // 暂挂
    frontPending() {
      this.visible3 = true
    },
    supportPending() {
      this.visible4 = true
    },
    confirmOrder() {
      this.visible5 = true
    },
    // 暂挂
    handleOk3(e) {
      this.model.id = this.formData.id
      let that = this
      if (this.model.frontPendingReason === '') {
        that.$message.warning('请输入暂挂原因')
        return
      }
      this.ModalText = '暂挂处理中...'
      this.confirmLoading3 = true
      var params = {
        id: this.model.id,
        version: this.formData.version,
        frontPendingReason: this.model.frontPendingReason,
      }

      putAction(that.url.frontLinePending, params)
        .then((res) => {
          that.visible3 = false
          that.visible = false
          if (res.success) {
            that.$message.success(res.message)
          } else {
            that.$message.warning(res.message)
          }
          that.$emit('ok')
        })
        .finally(() => {
          that.confirmLoading3 = false
          that.visible3 = false
          that.visible = false
          that.$emit('ok')
        })
    },
    handleOk4(e) {
      this.model.id = this.formData.id
      let that = this
      if (this.model.supportPendingReason === '') {
        that.$message.warning('请输入暂挂原因')
        return
      }
      this.ModalText = '暂挂处理中...'
      this.confirmLoading4 = true
      var params = {
        id: this.model.id,
        version: this.formData.version,
        supportPendingReason: this.model.supportPendingReason,
      }

      putAction(that.url.supportLinePending, params)
        .then((res) => {
          that.visible4 = false
          that.visible = false
          if (res.success) {
            that.$message.success(res.message)
          } else {
            that.$message.warning(res.message)
          }
          that.$emit('ok')
        })
        .finally(() => {
          that.confirmLoading4 = false
          that.visible4 = false
          that.visible = false
          that.$emit('ok')
        })
    },
    handleOk5(e) {
      if (this.confirmAction === '1') {
        this.resolve()
      } else if (this.confirmAction === '2') {
        this.unResolve()
      }
    },
    handleCancel3(e) {
      // console.log('Clicked cancel button');
      this.visible3 = false
    },
    handleCancel4(e) {
      // console.log('Clicked cancel button');
      this.visible4 = false
    },
    handleCancel5(e) {
      // console.log('Clicked cancel button');
      this.visible5 = false
    },
    // 关闭模态框
    handleModalCancel() {
      this.visible = false
    },
    completeProcess() {
      this.visible = false
      this.$emit('ok')
    },
    taskDeal() {
      this.$refs.bpmBizTaskOptModal.deal()
    },
    // 签收
    handleClaim() {
      var that = this
      var params = { taskId: this.currTask.id } // 查询条件
      this.$confirm({
        title: '确认签收吗',
        content: '是否签收该任务?',
        onOk: function () {
          that.confirmLoading = true
          putAction(that.url.claim, params)
            .then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.completeProcess()
              } else {
                that.$message.warning(res.message)
              }
            })
            .finally(() => {
              that.confirmLoading = false
            })
        },
      })
    },
    handleDelegate(data) {
      var that = this
      var params = {
        id: this.formData.id,
        version: this.formData.version,
      } // 查询条件
      let url0 = ''
      // 一线已接单
      if (this.formData.orderStatusDetail == 3 || this.formData.orderStatusDetail == 12) {
        url0 = that.url.delegateFrontUser
        params.frontlineUserName = data.username
        // 二线已接单
      } else if (this.formData.orderStatusDetail == 6 || this.formData.orderStatusDetail == 13) {
        url0 = that.url.delegateSupportUser
        params.supportUserName = data.username
      }
      Object.assign(params, data)
      putAction(url0, params).then((res) => {
        if (res.success) {
          that.$message.success(res.message)
          that.completeProcess()
        } else {
          that.$message.warning(res.message)
        }
      })
    },
    handleEntruster(data) {
      var that = this
      var params = {
        id: this.formData.id,
        version: this.formData.version,
      } // 查询条件
      let url0 = ''
      // 一线待转办
      if (
        this.formData.orderStatusDetail == 10 ||
        this.formData.orderStatusDetail == 3 ||
        this.formData.orderStatusDetail == 12
      ) {
        url0 = that.url.nextDelegateFrontUser
        params.frontlineUserName = data.username
        // 二线待转办
      } else if (
        this.formData.orderStatusDetail == 11 ||
        this.formData.orderStatusDetail == 6 ||
        this.formData.orderStatusDetail == 13
      ) {
        url0 = that.url.nextDelegateSupportUser
        params.supportUserName = data.username
      }
      Object.assign(params, data)
      putAction(url0, params).then((res) => {
        if (res.success) {
          that.$message.success(res.message)
          that.completeProcess()
        } else {
          that.$message.warning(res.message)
        }
      })
    },
    // 挂起
    handleSuspend() {
      var that = this
      var params = { processInstanceId: this.currTask.procInstId }
      this.$confirm({
        title: '确认挂起吗',
        content: '是否挂起该任务?',
        onOk: function () {
          that.confirmLoading = true
          putAction(that.url.suspend, params)
            .then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.completeProcess()
              } else {
                that.$message.warn(res.message)
              }
            })
            .finally(() => {
              that.confirmLoading = false
            })
        },
      })
    },
    /* handleSuspend() {
        var that = this;
        var params = { 'processInstanceId': this.currTask.procInstId };
        this.$confirm({
          title: '确认挂起吗',
          content: '是否挂起该任务?',
          onOk: function() {
            that.confirmLoading = true;
            getAction(that.url.suspend, params).then((res) => {
              if (res.success) {
                that.$message.success(res.message);
                that.completeProcess();
              } else {
                that.$message.warn(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
            })
          }
        });
      }, */
    // 激活
    /* handleActive() {
        var that = this;
        var params = { 'processInstanceId': this.currTask.procInstId };
        this.$confirm({
          title: '确认解挂吗',
          content: '是否解挂该任务?',
          onOk: function() {
            that.confirmLoading = true;
            getAction(that.url.restart, params).then((res) => {
              if (res.success) {
                that.$message.success(res.message);
                that.completeProcess();
              } else {
                that.$message.warn(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
            })
          }
        });
      } */
    frontActive() {
      var that = this
      var params = { id: this.formData.id, version: this.formData.version }
      this.$confirm({
        title: '确认解挂吗',
        content: '是否解挂该任务?',
        onOk: function () {
          that.confirmLoading = true
          putAction(that.url.frontLineUnlock, params)
            .then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.completeProcess()
              } else {
                that.$message.warn(res.message)
              }
            })
            .finally(() => {
              that.confirmLoading = false
            })
        },
      })
    },
    supportActive() {
      var that = this
      var params = { id: this.formData.id, version: this.formData.version }
      this.$confirm({
        title: '确认解挂吗',
        content: '是否解挂该任务?',
        onOk: function () {
          that.confirmLoading = true
          putAction(that.url.supportLineUnlock, params)
            .then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.completeProcess()
              } else {
                that.$message.warn(res.message)
              }
            })
            .finally(() => {
              that.confirmLoading = false
            })
        },
      })
    },
    // 一线转办
    frontDelegate() {
      this.$refs.ywdelegate.select(1, this.formData)
      this.$refs.ywdelegate.title = '选择办理人'
    },
    // 二线转办
    supportDelegate() {
      this.$refs.ywdelegate.select(2, this.formData)
      this.$refs.ywdelegate.title = '选择办理人'
    },

    // 一线主管转办
    frontSupDelegate() {
      this.$refs.supDelegate.select(1, this.formData)
      this.$refs.supDelegate.title = '选择办理人'
    },
    // 二线主管转办
    supportSupDelegate() {
      this.$refs.supDelegate.select(2, this.formData)
      this.$refs.supDelegate.title = '选择办理人'
    },

    // 未解决
    unResolve(e) {
      this.model.id = this.formData.id
      let that = this
      var params = { id: this.model.id, version: this.formData.version, remark: this.model.remark }

      postAction(that.url.unresolve, params)
        .then((res) => {
          if (res.success) {
            that.$message.success(res.message)
          } else {
            that.$message.warning(res.message)
          }
          that.visible = false
          that.$emit('ok')
        })
        .finally(() => {
          that.visible = false
          that.$emit('ok')
        })
    },

    // 已解决
    resolve(e) {
      this.model.id = this.formData.id
      let that = this
      var params = { id: this.model.id, version: this.formData.version, remark: this.model.remark }

      postAction(that.url.resolve, params)
        .then((res) => {
          if (res.success) {
            that.$message.success(res.message)
          } else {
            that.$message.warning(res.message)
          }
          that.visible = false
          that.$emit('ok')
        })
        .finally(() => {
          that.visible = false
          that.$emit('ok')
        })
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
