<template>
  <!--style="width: calc(100% - 100px); height: calc(100% - 55px);"-->
  <!-- 弹出框 -->
  <a-modal
    title="服务请求办理"
    :visible="visible"
    width="90%"
    style="top: 20px;"
    destroyOnClose
    :bodyStyle ="bodyStyle"
    :footer="null"
    @cancel="handleModalCancel">
    <a-spin :spinning="confirmLoading">
      <a-tabs defaultActiveKey="1" tabPosition="top">

        <a-tab-pane key="1">
          <span slot="tab">
            <a-icon type="file-text"/>
            <span>任务办理</span>
          </span>
          <service-biz-task-module :taskData="taskData" :formData="formData" @complete = "completeProcess"></service-biz-task-module>
        </a-tab-pane>
        <a-tab-pane key="2">
          <span slot="tab">
            <a-icon type="sliders"/>
            <span>流程图</span>
          </span>
          <service-biz-process-module :taskData="taskData"></service-biz-process-module>
        </a-tab-pane>
      </a-tabs>
    </a-spin>
  </a-modal>
</template>

<script>

  import ServiceBizTaskModule from './ServiceBizTaskModule';
  import ServiceBizProcessModule from './ServiceBizProcessModule';
  import { getAction } from '@/api/manage'

  export default {
    name: 'ServiceBizTaskOptModal',
    components: {
      ServiceBizProcessModule,
      ServiceBizTaskModule
    },
    props: ['formData'],
    data() {
      return {
        loading: false,
        title: "流程",
        visible: false,
        confirmLoading:false,
        bodyStyle:{
          padding: "0",
          "overflow-y":"auto"
        },
        iframeUrl:"",
        taskData: ''
      }
    },
    created() {
      this.getBizProcessNodeInfo();
    },
    methods: {
      // 关闭模态框
      handleModalCancel() {
        this.visible = false
      },
      deal(){
        this.visible = true;
      },
      completeProcess(){
        this.visible = false;
        this.$emit('ok');
      },
      getBizProcessNodeInfo() {
        let url = '/process/extActProcessNode/getBizProcessNodeInfo'
        var params = { flowCode: 'onl_service_order', dataId: this.formData.id };// 查询条件
        getAction(url, params).then((res) => {
          if (res.success) {
            console.log('获取流程节点信息', res);
            console.log('表单数据', res.result.records)
            var data = {
              dataId: res.result.dataId,
              taskId: res.result.taskId,
              flowCode: this.flowCode,
              taskDefKey: res.result.taskDefKey,
              procInsId: res.result.procInsId,
              tableName: res.result.tableName,
              permissionList: res.result.permissionList,
              bizTaskList: res.result.bizTaskList,
              vars: res.result.records
            }
            this.taskData = data;
          }
        })
      }
    }

  }
</script>

<style  lang="less" scoped>
  .ant-tabs-left-content{
    padding-top: 10px !important;
  }
</style>