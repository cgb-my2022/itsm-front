<template>
  <a-modal
    :visible="visible"
    title="详情"
    width="1000px"
    destroyOnClose
    :bodyStyle="bodyStyle"
    style="top: 0px;min-height: 500px;"
    :footer="null"
    @cancel="handleModalCancel">
    <a-spin :spinning="confirmLoading">
      <div style="margin-top: 5px">
        <service-biz-dynamic-link :path="path" width="100%" height="100%" :formData="formData"></service-biz-dynamic-link>
      </div>
    </a-spin>
    <div
      v-if="knowledgeRelease && formData.orderStatus == 7" 
      class="box-bot"
      :style="{
        position: 'absolute',
        bottom: 0,
        borderTop: '1px solid #e9e9e9',
        padding: '10px 16px',
        background: '#fff',
        textAlign: 'left',
        zIndex: 99
      }">
      <a-space :size="8" align="center">
        <template>
          <a-button @click="bindKnowledge()" type="primary">发布知识</a-button>
        </template>
      </a-space>
     </div>
  </a-modal>
</template>

<script>
  import { mapState } from 'vuex'
  import { getAction } from '@/api/manage'
  import { isURL } from '@/utils/validate'
  import ServiceBizDynamicLink from './ServiceBizDynamicLink.vue';
  import Vue from 'vue'
  import { ACCESS_TOKEN } from '@/store/mutation-types'

  export default {
    name: 'ServiceTaskDetailModal',
    components: {
      ServiceBizDynamicLink
    },
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
      },
      ...mapState({
        // 发布知识权限
        knowledgeRelease: state => state.user.knowledgeRelease
      })
    },
    data() {
      return {
        loading: false,
        title: '流程',
        visible: false,
        confirmLoading: false,
        currTask: {},
        bodyStyle: {
          paddingBottom: '70px',
          height: (window.innerHeight - 200) + 'px',
          'overflow-y': 'auto',
        },
        iframeUrl: '',
        path: '',
        formData: {},
        url: {
          claim: '/act/task/claim',
          taskEntrust: '/act/task/taskEntrust',
          suspend: '/act/processInstance/suspend',
          restart: '/act/processInstance/restart',
          moreInfo: '/system/serviceOrder/moreInfo'
        }
      }
    },
    methods: {
      // 发布知识
      bindKnowledge() {
        this.visible = false
        this.$emit('knowledge', this.formData.id, this.url.moreInfo, 'serviceOrder') 
      },
      // 关闭模态框
      handleModalCancel() {
        this.visible = false
      },
      deal(id, path) {
        this.path = path
        getAction(
          this.url.moreInfo, { id }
        ).then(res => {
          this.visible = true;
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
  .box-bot {
    display: flex;
    justify-content: center;
    box-sizing: border-box;
    left: 0;
    right: 0;
  }
</style>
