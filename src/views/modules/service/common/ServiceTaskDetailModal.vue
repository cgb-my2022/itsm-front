<template>
  <a-modal
    :visible="visible"
    title="详情"
    width="1000px"
    destroyOnClose
    :bodyStyle="bodyStyle"
    style="top: 0px;"
    :footer="null"
    aria-disabled="true"
    @cancel="handleModalCancel">
    <a-spin :spinning="confirmLoading">
      <div style="margin-top: 5px">
        <service-biz-dynamic-link :path="path" width="100%" height="100%" :formData="formData"></service-biz-dynamic-link>
      </div>
    </a-spin>
  </a-modal>
</template>

<script>

  import { isURL } from '@/utils/validate'
  import ServiceBizDynamicLink from './ServiceBizDynamicLink.vue';
  import Vue from 'vue'
  import { ACCESS_TOKEN } from '@/store/mutation-types'

  export default {
    name: 'ServiceTaskDetailModal',
    components: {
      ServiceBizDynamicLink
    },
    props: ['path', 'formData'],
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
        loading: false,
        title: '流程',
        visible: false,
        confirmLoading: false,
        currTask: {},
        bodyStyle: {
          padding: '0',
          height: (window.innerHeight-100) + 'px',
          'overflow-y': 'auto'
        },
        iframeUrl: '',
        url: {
          claim: '/act/task/claim',
          taskEntrust: '/act/task/taskEntrust',
          suspend: '/act/processInstance/suspend',
          restart: '/act/processInstance/restart'
        }
      }
    },
    created() {
    },
    methods: {
      // 关闭模态框
      handleModalCancel() {
        this.visible = false
      },
      deal() {
        this.visible = true;
      },
      completeProcess() {
        this.visible = false;
        this.$emit('ok');
      },
      handleOpt(opt) {
        console.log('handleOpt')
        this.$refs.bpmBizTaskOptModal.deal(opt);
        var title = '办理';
        if (opt == 'submit') {
          //title = '发送';
          title = '办理';
        } else if (opt == 'reject') {
          title = '退回';
        }
        this.$refs.bpmBizTaskOptModal.title = title;
      },


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
