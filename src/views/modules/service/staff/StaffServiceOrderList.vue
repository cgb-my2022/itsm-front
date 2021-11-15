<!--普通员工服务工单列表-->
<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="工单状态">
              <j-dict-select-tag placeholder="请选择工单状态" v-model="queryParam.orderStatus" dictCode="service_order_status"/>
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
              <a-button type="primary" @click="bindReset" icon="reload" style="margin-left: 8px">重置</a-button>
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
    <div class="table-operator">
      <a-button @click="handleSubmit('请求目录', 'serviceCatalog')" type="primary">请求目录</a-button>
      <a-button @click="handleSubmit('快速发起', 'modalForm')" type="primary" style="margin-left: 10px">快速发起</a-button>

      <!-- <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>-->
    </div>

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
        <!-- 工单状态 -->
        <template slot="status" slot-scope="text, record">
          <div class="order-status">
            <p v-if="record.orderStatus === 1 || record.orderStatus === 4" class="order-status_round c-blue"></p>
            <p v-if="record.orderStatus === 2 || record.orderStatus === 3 || record.orderStatus === 5" class="order-status_round c-green"></p>
            <p v-if="record.orderStatus === 6" class="order-status_round c-red"></p>
            <p v-if="record.orderStatus === 7" class="order-status_round c-gray"></p>
            <p>{{text}}</p>
          </div>
        </template>
        <!-- 处理人 -->
        <template slot="realname" slot-scope="text, record">
          <span v-if="setRealname([2],record.orderStatusDetail)"></span>
          <span v-else-if="setRealname([3,4,5,12],record.orderStatusDetail)">{{record.frontlineUserRealname}}</span>
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
          <template v-if="record.orderStatus === 6">
            <a @click="confirmProcess(record)">确认</a>
            <a-divider type="vertical"/>
            <a @click="cancelProcess(record)" style="color:orange;">退回</a>
            <a-divider type="vertical"/>
          </template>
          <template v-if="record.orderStatus === 7 && record.commentStatus === 0">
            <a @click="bindEvaluation(record)">评价</a>
            <a-divider type="vertical"/>
          </template>
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
              <a-menu-item v-else @click="handlePreviewPic(record)">审批进度</a-menu-item>
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
          <a-dropdown>
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
              <a-menu-item v-else @click="handlePreviewPic(record)">审批进度</a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
      </a-table>
    </div>

    <!-- 快速发起 -->
    <staff-service-order-modal ref="modalForm" @closeLoad="taskOk"></staff-service-order-modal>
    <!-- 服务目录 -->
    <staff-service-catalog ref="serviceCatalog" @closeLoad="taskOk"></staff-service-catalog>
    <!-- 流程图 -->
    <service-process-inst-pic-modal ref="extActProcessInstPicModal"></service-process-inst-pic-modal>
    <!-- 详情 -->
    <service-task-detail-modal ref="taskDetailModal"></service-task-detail-modal>
    <!-- 办理 -->
    <service-task-deal-modal ref="taskDealModal" @closeLoad="taskOk" />
    <!-- 评价 -->
    <staff-service-evaluation ref="serviceEvaluation" @closeLoad="taskOk"></staff-service-evaluation>
    <!-- 退回 -->
    <staff-service-back ref="serviceBack" @closeLoad="taskOk"></staff-service-back>
    <!-- 弹出框 -->
    <!--<his-task-deal-modal ref="taskDealModal" :path="path" :formData="formData"></his-task-deal-modal>
    <task-notify-modal ref="taskNotifyModal"></task-notify-modal>-->
    <!--<process-module/>-->
  </a-card>
</template>

<script>
  import ServiceTaskDealModal from '../common/ServiceTaskDealModal'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import { ServiceMixin } from './mixins/ServiceMixin'
  import StaffServiceOrderModal from './modules/StaffServiceOrderModal'
  import ServiceTaskDetailModal from '../common/ServiceTaskDetailModal'
  import JDictSelectTag from '@/components/dict/JDictSelectTag.vue'
  import JDate from '@/components/jeecg/JDate.vue'
  import '@/assets/less/TableExpand.less'
  import { postAction, putAction } from '@/api/manage'
  import ServiceProcessInstPicModal from '../common/ServiceProcessInstPicModal';
  import StaffServiceCatalog from './modules/StaffServiceCatalog'
  import StaffServiceEvaluation from './modules/StaffServiceEvaluation'
  import StaffServiceBack from './modules/StaffServiceBack'
  export default {
    name: 'StaffServiceOrderList',
    mixins: [JeecgListMixin, ServiceMixin],
    components: {
      JDictSelectTag,
      JDate,
      StaffServiceOrderModal,
      ServiceProcessInstPicModal,
      ServiceTaskDetailModal,
      ServiceTaskDealModal,
      StaffServiceCatalog,
      StaffServiceEvaluation,
      StaffServiceBack
    },
    data () {
      return {
        description: '服务工单管理页面',
        flowCode: 'onl_service_order',
        // 表头
        columns: [
          {
            title: '请求内容',
            dataIndex: 'eventContent',
            ellipsis: true,
            width: 250,
            align: 'center',
          },
          {
            title: '所属业务',
            align: 'center',
            ellipsis: true,
            width: 250,
            dataIndex: 'serviceCatFullName'
          },
          {
            title: '工单状态',
            align: 'center',
            dataIndex: 'orderStatus_dictText',
            width: 140,
            scopedSlots: { customRender: 'status' }
          },
          {
            title: '创建人',
            align: 'center',
            width: 140,
            dataIndex: 'realName'
          },
          {
            title: '创建日期',
            align: 'center',
            width: 200,
            sorter: true,
            dataIndex: 'createTime'
          },
          {
            title: '处理人',
            align: 'center',
            width: 140,
            dataIndex: 'frontlineUserRealname',
            scopedSlots: { customRender: 'realname' }
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            fixed: 'right',
            width: 180,
            scopedSlots: { customRender: 'action' }
          }
        ],
        url: {
          list: '/system/serviceOrder/list',
          delete: '/system/serviceOrder/delete',
          deleteBatch: '/system/serviceOrder/deleteBatch',
          exportXlsUrl: '/system/serviceOrder/exportXls',
          importExcelUrl: 'system/serviceOrder/importExcel',
          startProcess: '/process/extActProcess/startMutilProcess',
          resolve: '/system/serviceOrder/confirmOrderResolved',
          updateOrderStatus: window._CONFIG['domianURL'] + '/system/serviceOrder/updateServiceOrderStatus'
        },
        dictOptions: {},
        serviceOrderModel: {
          id: '',
          approved: ''
        }
      }
    },
    computed: {
      importExcelUrl: function() {
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      },
      setRealname() {
        return function(arr, status) {
          if(arr.indexOf(status) != -1) {
            return true
          }
          return false
        }
      }
    },
    mounted() {
      this.getCatalog()
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
      // 退回
      cancelProcess(record) {
        this.$refs.serviceBack.deal(record)
      },
      // 评价 
      bindEvaluation(record) {
        this.$refs.serviceEvaluation.deal(record.id)
      },
      // 确认
      confirmProcess(record) {
        // this.$refs.taskDealModal.title = '确认';
        // this.$refs.taskDealModal.deal(record);
        const that = this;
        that.$confirm({
          title: "确认",
          content: "确认问题已经解决了吗?",
          okText: "确定",
          cancelText: "取消",
          type: "warning",
          onOk: async () => {
            var params = { 
              id: record.id, 
              version: record.version
            };
            postAction(that.url.resolve, params).then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.loadData()
                that.bindEvaluation(record)
              } else {
                that.$message.warning(res.message);
              }
            })
          },
          onCancel() {},
        });
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
  .order-status {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .order-status .c-blue {
    background: blue;
  }
  .order-status .c-green {
    background: green;
  }
  .order-status .c-gray {
    background: gray;
  }
  .order-status .c-red {
    background: red;
  }
  .order-status .order-status_round {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 10px;
  }
</style>
