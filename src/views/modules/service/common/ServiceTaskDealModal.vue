<template>
  <!--style="width: calc(100% - 100px); height: calc(100% - 55px);"-->
  <!-- 弹出框 -->
  <a-modal
    :visible="visible"
    title="服务请求办理"
    width="900px"
    destroyOnClose
    :bodyStyle="bodyStyle"
    style="top: 0px;"
    :footer="null"
    @cancel="handleModalCancel">
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
      <a-divider />
      <div style="text-align: center">
        <!--当前任务环节：{{ currTask.taskName }}-->
        <!--<a-select style="width:300px" :defaultValue="currTask.id">
          <a-select-option :value="currTask.id">{{ currTask.taskName }}</a-select-option>
        </a-select>-->

        <a-space :size="8" align="center">
          <!--一线-->
          <template v-if="formData.orderStatusDetail===3"><!--一线已接单-->
            <a-button @click="taskDeal()" type="primary" icon="caret-right">任务办理</a-button>
            <a-button @click="frontPending()" type="primary" icon="lock">暂挂</a-button>
            <a-button @click="toSupportLine()" type="primary" icon="rollback">转二线</a-button>
          </template>
          <template v-else-if="formData.orderStatusDetail===4"><!--一线暂挂状态-->
            <a-button @click="frontActive()" type="primary" icon="unlock">解挂</a-button>
          </template>

          <!--二线-->
          <template v-else-if="formData.orderStatusDetail===6"><!--二线已接单-->
            <a-button @click="taskDeal()" type="primary" icon="caret-right">任务办理</a-button>
            <a-button @click="supportPending()" type="primary" icon="lock">暂挂</a-button>
          </template>
          <template v-else-if="formData.orderStatusDetail===7"><!--一二线暂挂状态-->
            <a-button @click="supportActive()" type="primary" icon="unlock">解挂</a-button>
          </template>
          <template v-else-if="formData.orderStatusDetail===10"><!--一线待转办状态-->
            <a-button @click="frontDelegate()" type="primary" icon="unlock">转办</a-button>
          </template>
          <template v-else-if="formData.orderStatusDetail===11"><!--二线待转办状态-->
            <a-button @click="supportDelegate()" type="primary" icon="unlock">转办</a-button>
          </template>

        </a-space>
        <!-- <span style="color: red" v-if="currTask.suspendFlag">当前流程已挂起，需要进行解挂，再进行办理！</span>-->
      </div>
    </a-spin>
    <service-biz-task-opt-modal ref="bpmBizTaskOptModal" :formData="formData" @ok="completeProcess"></service-biz-task-opt-modal>

    <biz-service-task-select-entruster-modal ref="selectEntrusterModal" @selectFinished="handleEntruster"></biz-service-task-select-entruster-modal>
    <a-modal
      title="转二线处理"
      :visible="visible2"
      :confirm-loading="confirmLoading"
      @ok="toSupportOk()"
      @cancel="handleCancel"
    >
      <a-textarea
        v-model="model.transferReason"
        placeholder="请输入转处理原因"
        :auto-size="{ minRows: 4, maxRows: 8 }"
      />
  </a-modal>
    <a-modal
      title="暂挂"
      :visible="visible3"
      :confirm-loading="confirmLoading3"
      @ok="handleOk3"
      @cancel="handleCancel3"
    >
      <a-textarea
        v-model="model.frontPendingReason"
        placeholder="请输入暂挂原因"
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
        placeholder="请输入暂挂原因"
        :auto-size="{ minRows: 4, maxRows: 8 }"
      />
    </a-modal>
  </a-modal>
</template>

<script>

  import { putAction } from '@/api/manage'
  import { isURL } from '@/utils/validate'
  import ServiceBizTaskOptModal from './ServiceBizTaskOptModal.vue';
  import StaffServiceOrderForm from '../staff/modules/StaffServiceOrderForm';
  import Vue from 'vue'
  import { ACCESS_TOKEN } from '@/store/mutation-types'
  import BizServiceTaskSelectEntrusterModal from "./BizServiceTaskSelectEntrusterModal.vue";

  export default {
    name: 'ServiceTaskDealModal',
    components: {
      StaffServiceOrderForm,
      ServiceBizTaskOptModal,
      BizServiceTaskSelectEntrusterModal
    },
    //props: ['path', 'formData'],
    computed: {
      isComp: function () {
        console.log('isComp组件名称：', this.path);
        var TOKEN = Vue.ls.get(ACCESS_TOKEN);
        var DOMAIN_URL = window._CONFIG['domianURL'];
        var TASKID = this.formData.taskDefKey;
        var URL = (this.path || '').replace(/{{([^}}]+)?}}/g, (s1, s2) => eval(s2)) // URL支持{{ window.xxx }}占位符变量
        console.log('isComp组件名称：', URL);
        if (isURL(URL)) {
          this.iframeUrl = URL;
          return false;
        }
        return true;
      }
    },
    data() {
      return {
        ModalText: '',
        model: {
          id: '',
          transferReason: '',
          frontPendingReason: '',
          supportPendingReason: ''
        },
        formData: {},
        visible4: false,
        visible3: false,
        visible2: false,
        loading: false,
        title: '流程',
        visible: false,
        confirmLoading: false,
        confirmLoading4: false,
        confirmLoading3: false,
        currTask: {},
        bodyStyle: {
          padding: '0',
          height: (window.innerHeight) + 'px',
          'overflow-y': 'auto'
        },
        iframeUrl: '',
        url: {
          claim: '/act/task/claim',
         // taskEntrust: '/act/task/taskEntrust',
          delegateFrontUser: '/system/serviceOrder/delegateFrontUser',
          delegateSupportUser: '/system/serviceOrder/delegateSupportUser',
          //suspend: '/act/processInstance/suspend',
          frontLinePending: '/system/serviceOrder/frontLinePending',
          supportLinePending: '/system/serviceOrder/supportLinePending',
          //restart: '/act/processInstance/restart',
          frontLineUnlock: '/system/serviceOrder/frontLineUnlock',
          supportLineUnlock: '/system/serviceOrder/supportLineUnlock',
          transferSupport: '/system/serviceOrder/transferSupport'
        }
      }
    },
    created() {
    },
    methods: {
      toSupportLine() {
         this.visible2 = true;
      },
      frontPending() {
        this.visible3 = true;
      },
      supportPending() {
        this.visible4 = true;
      },
      toSupportOk(e) {
        this.model.id = this.formData.id;
        let that = this;
        if (this.model.transferReason === '') {
          that.$message.warning('请输入转处理原因');
          return;
        }
        this.ModalText = '转办二线中...';
        this.confirmLoading = true;
        var params = { id: this.model.id, version: this.formData.version, transferReason: this.model.transferReason };

        putAction(that.url.transferSupport, params).then((res) => {
          that.visible2 = false;
          that.visible = false;
          if (res.success) {
            that.$message.success(res.message);
          } else {
            that.$message.warning(res.message);
          }
          that.$emit('ok');
        }).finally(() => {
          that.confirmLoading = false;
          that.visible2 = false;
          that.visible = false;
          that.$emit('ok');
        })


      },
      handleCancel(e) {
        console.log('Clicked cancel button');
        this.visible2 = false;
      },

      //暂挂
      handleOk3(e) {
        this.model.id = this.formData.id;
        let that = this;
        if (this.model.frontPendingReason === '') {
          that.$message.warning('请输入暂挂原因');
          return;
        }
        this.ModalText = '暂挂处理中...';
        this.confirmLoading3 = true;
        var params = { id: this.model.id, version: this.formData.version, frontPendingReason: this.model.frontPendingReason };

        putAction(that.url.frontLinePending, params).then((res) => {
          that.visible3 = false;
          that.visible = false;
          if (res.success) {
            that.$message.success(res.message);
          } else {
            that.$message.warning(res.message);
          }
          that.$emit('ok');
        }).finally(() => {
          that.confirmLoading3 = false;
          that.visible3 = false;
          that.visible = false;
          that.$emit('ok');
        })
      },
      handleOk4(e) {
        this.model.id = this.formData.id;
        let that = this;
        if (this.model.supportPendingReason === '') {
          that.$message.warning('请输入暂挂原因');
          return;
        }
        this.ModalText = '暂挂处理中...';
        this.confirmLoading4 = true;
        var params = { id: this.model.id, version: this.formData.version, supportPendingReason: this.model.supportPendingReason };

        putAction(that.url.supportLinePending, params).then((res) => {
          that.visible4 = false;
          that.visible = false;
          if (res.success) {
            that.$message.success(res.message);
          } else {
            that.$message.warning(res.message);
          }
          that.$emit('ok');
        }).finally(() => {
          that.confirmLoading4 = false;
          that.visible4 = false;
          that.visible = false;
          that.$emit('ok');
        })
      },
      handleCancel3(e) {
        console.log('Clicked cancel button');
        this.visible3 = false;
      },
      handleCancel4(e) {
        console.log('Clicked cancel button');
        this.visible4 = false;
      },
      // 关闭模态框
      handleModalCancel() {
        this.visible = false
      },
      deal(data) {
        this.formData = data;
        this.visible = true;
      },
      completeProcess() {
        this.visible = false;
        this.$emit('ok');
      },
      taskDeal() {
        this.$refs.bpmBizTaskOptModal.deal();
      },
      // 签收
      handleClaim() {
        var that = this;
        var params = { taskId: this.currTask.id };// 查询条件
        this.$confirm({
          title: '确认签收吗',
          content: '是否签收该任务?',
          onOk: function() {
            that.confirmLoading = true;
            putAction(that.url.claim, params).then((res) => {
              if (res.success) {
                that.$message.success(res.message);
                that.completeProcess();
              } else {
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
            })
          }
        });
      },
      handleEntruster(data) {
        var that = this;
        var params = {};// 查询条件
        console.log('委托', params)
        let url0 = '';
        //一线待转办
        if(this.formData.orderStatusDetail==10){
          url0 = that.url.delegateFrontUser;
          params = {
            id: this.formData.id,
            version: this.formData.version,
            frontlineUserName: data.username
          };
          //二线待转办
        }else if(this.formData.orderStatusDetail==11){
          url0 = that.url.delegateSupportUser;
          params = {
            id: this.formData.id,
            version: this.formData.version,
            supportUserName: data.username
          };
        }
        putAction(url0, params).then((res) => {
          if (res.success) {
            that.$message.success(res.message);
            that.completeProcess();
          } else {
            that.$message.warning(res.message);
          }
        })
      },
      // 挂起
      handleSuspend() {
        var that = this;
        var params = { 'processInstanceId': this.currTask.procInstId };
        this.$confirm({
          title: '确认挂起吗',
          content: '是否挂起该任务?',
          onOk: function() {
            that.confirmLoading = true;
            putAction(that.url.suspend, params).then((res) => {
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
      },
      /*handleSuspend() {
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
      },*/
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
      }*/
      frontActive() {
        var that = this;
        var params = { 'id': this.formData.id, version: this.formData.version };
        this.$confirm({
          title: '确认解挂吗',
          content: '是否解挂该任务?',
          onOk: function() {
            that.confirmLoading = true;
            putAction(that.url.frontLineUnlock, params).then((res) => {
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
      },
      supportActive() {
        var that = this;
        var params = { 'id': this.formData.id, version: this.formData.version };
        this.$confirm({
          title: '确认解挂吗',
          content: '是否解挂该任务?',
          onOk: function() {
            that.confirmLoading = true;
            putAction(that.url.supportLineUnlock, params).then((res) => {
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
      },
      //一线转办
      frontDelegate(){
        this.$refs.selectEntrusterModal.select(1, this.formData.workplaceCompanyId);
        this.$refs.selectEntrusterModal.title="选择办理人";
      },
      //二线转办
      supportDelegate(){
        this.$refs.selectEntrusterModal.select(2);
        this.$refs.selectEntrusterModal.title="选择办理人";
      }
    }

  }
</script>

<style  lang="less" scoped>
  .ant-tabs-left-content{
    padding-top: 10px !important;
  }
  /** Button按钮间距 */
  .ant-btn {
    margin-left: 3px
  }
</style>
