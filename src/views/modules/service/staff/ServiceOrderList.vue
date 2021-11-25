<!--普通员工服务工单列表-->
<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="工单状态">
              <j-dict-select-tag placeholder="请选择流程状态" v-model="queryParam.orderStatus" dictCode="service_order_status"/>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="选择业务">
              <a-cascader 
                placeholder="请选择"  
                :field-names="{ label: 'title', value: 'id', children: 'children' }"
                :show-search="{ filter }"
                v-model="serviceCatName" 
                :options="serviceOptions" 
                change-on-select 
                expand-trigger="hover"
                @change="serviceChange"/>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :xl="10" :lg="11" :md="12" :sm="24">
              <a-form-item label="创建日期">
                <j-date :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择开始时间" class="query-group-cust" v-model="queryParam.createTime_begin"></j-date>
                <span class="query-group-split-cust"></span>
                <j-date :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择结束时间" class="query-group-cust" v-model="queryParam.createTime_end"></j-date>
              </a-form-item>
            </a-col>
          </template>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
   <!-- <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>

      &lt;!&ndash; <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>&ndash;&gt;
    </div>-->

    <!-- table区域-begin -->
    <div>
      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        class="j-table-force-nowrap"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :scroll="{ x: 1500 }"
        @change="handleTableChange">

        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>
        <template slot="imgSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
          <img v-else :src="getImgView(text)" height="25px" alt="" style="max-width:80px;font-size: 12px;font-style: italic;"/>
        </template>
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
          <a-button
            v-else
            :ghost="true"
            type="primary"
            icon="download"
            size="small"
            @click="uploadFile(text)">
            下载
          </a-button>
        </template>
        <!-- 优先级 -->
        <template slot="serviceLevel" slot-scope="text">
          <span v-if="text == 1" style="color:red;">{{setLevel(text)}}</span>
          <span v-if="text == 2" style="color:orange;">{{setLevel(text)}}</span>
          <span v-if="text == 3" style="color:blue;">{{setLevel(text)}}</span>
        </template>
        <!-- 工单状态 -->
        <template slot="status" slot-scope="text, record">
          <span class="order-status">
            <span v-if="record.orderStatus === 1 || record.orderStatus === 4" class="order-status_round c-blue"></span>
            <span v-if="record.orderStatus === 2 || record.orderStatus === 3 || record.orderStatus === 5" class="order-status_round c-green"></span>
            <span v-if="record.orderStatus === 6" class="order-status_round c-red"></span>
            <span v-if="record.orderStatus === 7" class="order-status_round c-gray"></span>
            <span>{{text}}</span>
          </span>
        </template>
        <!-- 处理人 -->
        <template slot="realname" slot-scope="text, record">
          <!-- <span v-if="setRealname([2],record.orderStatusDetail)"></span> -->
          <span v-if="setRealname([3,4,5,12],record.orderStatusDetail)">{{record.frontlineUserRealname}}</span>
          <span v-else-if="setRealname([10],record.orderStatusDetail)">{{record.frontlineDelegateName}}</span>
          <span v-else-if="setRealname([11],record.orderStatusDetail)">{{record.supportDelegateName}}</span>
          <span v-else-if="setRealname([8,9,14],record.orderStatusDetail)">{{record.solRealName}}</span>
          <span v-else-if="setRealname([6,7,13],record.orderStatusDetail)">{{record.supportUserRealname}}</span>
          <span v-else></span>
        </template>
        <!-- 操作按钮 -->
        <span slot="action" slot-scope="text, record">
          <!--<template v-if="record.bpmStatus === '1'">
            <a @click="startProcess(record)">提交流程</a>
            <a-divider type="vertical"/>
          </template>-->
          <a href="javascript:;" @click="showDetailServiceOrder(record)">详情</a>
            <a-divider type="vertical"/>
           <a href="javascript:;"  @click="handlePreviewPic(record)">进度</a>
          <!--<a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a href="javascript:;" @click="handleDetail(record)">详情</a>
              </a-menu-item>
              <a-menu-item v-if="record.bpmStatus === '1'">
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
              <a-menu-item v-else @click="handlePreviewPic(record)">进度</a-menu-item>
            </a-menu>
          </a-dropdown>-->
          <!--<a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item @click="taskNotify(record)">催办</a-menu-item>
              <a-menu-item >
                <a-popconfirm title="确定要作废流程吗?" @confirm="() => invalidProcess(record)">
                  <a>
                    作废流程
                  </a>
                </a-popconfirm>
              </a-menu-item>
              <a-menu-item >
                <a-popconfirm title="确定要取回流程吗?" @confirm="() => callBackProcess(record)">
                  <a>
                    取回流程
                  </a>
                </a-popconfirm>
              </a-menu-item>
              <a-menu-item @click="showHistory(record)">历史</a-menu-item>
            </a-menu>
          </a-dropdown>-->
         <!-- <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a href="javascript:;" @click="showDetailServiceOrder(record)">详情</a>
              </a-menu-item>
              <a-menu-item v-if="record.bpmStatus === '1'">
                <a @click="handleEdit(record)">编辑</a>
              </a-menu-item>
              <a-menu-item v-if="record.bpmStatus === '1'">
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
              <a-menu-item v-else @click="handlePreviewPic(record)">进度</a-menu-item>
            </a-menu>
          </a-dropdown>-->
        </span>
      </a-table>
    </div>

    <staff-service-order-modal ref="modalForm" @ok="modalFormOk"></staff-service-order-modal>
    <service-process-inst-pic-modal ref="extActProcessInstPicModal"></service-process-inst-pic-modal>
    <service-task-detail-modal ref="taskDetailModal"></service-task-detail-modal>
    <service-task-deal-modal  ref="taskDealModal" @closeLoad="taskOk" />
    <!-- 弹出框 -->
    <!--<his-task-deal-modal ref="taskDealModal" :path="path" :formData="formData"></his-task-deal-modal>
    <task-notify-modal ref="taskNotifyModal"></task-notify-modal>-->
    <!--<process-module/>-->
  </a-card>
</template>

<script>
  import { ServiceColumns } from '@/views/modules/service/mixins/ServiceColumns'
  import { postAction, putAction } from '@/api/manage'

  export default {
    name: 'ServiceOrderList',
    mixins: [ServiceColumns],
    data () {
      return {
        description: '服务工单管理页面',
        flowCode: 'onl_service_order',
        url: {
          list: '/system/serviceOrder/myCompanylist',
          delete: '/system/serviceOrder/delete',
          deleteBatch: '/system/serviceOrder/deleteBatch',
          exportXlsUrl: '/system/serviceOrder/exportXls',
          importExcelUrl: 'system/serviceOrder/importExcel',
          startProcess: '/process/extActProcess/startMutilProcess',
          updateOrderStatus: window._CONFIG['domianURL'] + '/system/serviceOrder/updateServiceOrderStatus'
        },
        dictOptions: {},
        serviceOrderModel: {
          id: '',
          approved: ''
        },
        formData: {},
        path: ''
      }
    },
    methods: {
      initDictConfig() {
      },
      // 详情
      showDetailServiceOrder(record) {
        const path = 'modules/service/staff/modules/StaffServiceOrderForm';
        this.$refs.taskDetailModal.deal(record.id, path);
      },
      startProcess: function(record) {
        var that = this;
        this.$confirm({
          title: '提示',
          content: '确认提交流程吗?',
          onOk: function() {
            that.loading = true;
            var param = {
              flowCode: that.flowCode,
              id: record.id,
              formUrl: 'modules/service/staff/modules/StaffServiceOrderForm',
              formUrlMobile: 'modules/service/staff/modules/StaffServiceOrderForm'
            }
            postAction(that.url.startProcess, param).then((res) => {
              if (res.success) {
                that.updateOrderStatus(record.needDeptAppr, record.id);
              } else {
                that.$message.warning(res.message);
              }
              that.loading = false;
            });
          }
        });
      },
      updateOrderStatus: function(orderStatus, dataId) {
        let that = this;
        that.serviceOrderModel.orderStatus = orderStatus
        that.serviceOrderModel.id = dataId
        putAction(that.url.updateOrderStatus, that.serviceOrderModel).then((res) => {
          if (res.success) {
            that.$message.success('提交成功');
            that.loadData();
            that.onClearSelected();
          } else {
            that.$message.warning(res.message);
          }
          that.loading = false;
        })
      },
      handlePreviewPic: function(record) {
        var flowCode = this.flowCode;
        var dataId = record.id;
        this.$refs.extActProcessInstPicModal.preview(flowCode, dataId);
        this.$refs.extActProcessInstPicModal.title = '流程图';
      },
      // 确认
      confirmProcess(record) {
        this.$refs.taskDealModal.title = '确认';
        this.$refs.taskDealModal.deal(record.id);
      },
      // 流程作废
      invalidProcess(record) {
        var that = this;
        var params = {
          processInstanceId: record.processInstanceId
        };// 查询条件
        console.log('流程作废', params)
        putAction(that.url.invalidProcess, params).then((res) => {
          if (res.success) {
            that.$message.success(res.message);
            that.loadData();
          } else {
            that.$message.warning(res.message);
            that.loadData();
          }
        })
      },
      // 流程取回
      callBackProcess(record) {
        var that = this;
        var params = {
          processInstanceId: record.processInstanceId
        };// 查询条件
        console.log('流程取回', params)
        putAction(that.url.callBackProcess, params).then((res) => {
          if (res.success) {
            that.$message.success(res.message);
            that.loadData();
          } else {
            that.$message.warning(res.message);
            that.loadData();
          }
        })
      },
      // 历史
      showHistory(record) {
        this.getHisProcessNodeInfo(record);
      },
      // 催办
      taskNotify(record) {
        this.$refs.taskNotifyModal.notify(record);
        this.$refs.taskNotifyModal.title = '催办提醒';
      },

      taskOk() {
        console.log('流程办理完成')
        this.loadData()
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>
