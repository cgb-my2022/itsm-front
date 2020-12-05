<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="申请编号">
              <a-input placeholder="请输入申请编号" v-model="queryParam.id"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="业务类型">
              <j-dict-select-tag placeholder="请选择业务类型" v-model="queryParam.businessType" dictCode="SERVICE_ORDER_BUSINESS_TYPE"/>
            </a-form-item>
          </a-col>
          <!-- <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="流程状态">
              <j-dict-select-tag placeholder="请选择流程状态" v-model="queryParam.bpmStatus" dictCode="bpm_status"/>
            </a-form-item>
          </a-col>-->

          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="8">
              <a-form-item label="用户名称">
                <a-input placeholder="请输入用户名称" v-model="queryParam.userName"></a-input>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="8">
              <a-form-item label="真实姓名">
                <a-input placeholder="请输入真实姓名" v-model="queryParam.realName"></a-input>
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
    <!--<div class="table-operator">
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
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

        <span slot="action" slot-scope="text, record">
          <template v-if="record.orderStatusDetail==5">
              <a  @click="handleClaim(record)">接单</a>
            <a-divider type="vertical" />
          </template>
          <template v-else-if="record.orderStatusDetail==6">
            <a  @click="handleProcess(record)">办理</a>
            <a-divider type="vertical" />
          </template>
          <template v-else-if="record.orderStatusDetail==7">
            <a  @click="handleProcess(record)">解挂</a>
            <a-divider type="vertical" />
          </template>
          <a-dropdown>
          <a class="ant-dropdown-link">
            更多 <a-icon type="down" />
          </a>
          <a-menu slot="overlay">
            <a-menu-item>
              <a @click="handlePreviewPic(record)">审批进度</a>
            </a-menu-item>
            <a-menu-item>
              <a @click="showDetailServiceOrder(record)">详情</a>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
        </span>
      </a-table>
    </div>

    <staff-service-order-modal ref="modalForm" @ok="modalFormOk"></staff-service-order-modal>
    <service-process-inst-pic-modal ref="extActProcessInstPicModal"></service-process-inst-pic-modal>
    <service-task-deal-modal  :formData="formData" ref="taskDealModal" @ok="taskOk" />
    <service-task-detail-modal :path="path" :formData="formData" ref="taskDeatilModal" />
    <!-- 弹出框 -->
    <!--<his-task-deal-modal ref="taskDealModal" :path="path" :formData="formData"></his-task-deal-modal>
    <task-notify-modal ref="taskNotifyModal"></task-notify-modal>-->
    <!--<process-module/>-->
  </a-card>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import StaffServiceOrderModal from '../staff/modules/StaffServiceOrderModal'
  import JDictSelectTag from '@/components/dict/JDictSelectTag.vue'
  import JDate from '@/components/jeecg/JDate.vue'
  import '@/assets/less/TableExpand.less'
  import { postAction, getAction } from '@/api/manage'
  import ServiceProcessInstPicModal from '../common/ServiceProcessInstPicModal';

  import ServiceTaskDealModal from '../common/ServiceTaskDealModal'
  import ServiceTaskDetailModal from '../common/ServiceTaskDetailModal'

  export default {
    name: 'SupportServiceOrderList',
    mixins: [JeecgListMixin],
    components: {
      JDictSelectTag,
      JDate,
      StaffServiceOrderModal,
      ServiceProcessInstPicModal,
      ServiceTaskDealModal,
      ServiceTaskDetailModal
    },
    data () {
      return {
        description: '服务工单管理页面',
        flowCode: 'onl_service_order',
        // 表头
        columns: [
          {
            title: '编号',
            dataIndex: 'id',
            align: 'center',
            width: 160
          },
          {
            title: '用户名称',
            align: 'center',
            dataIndex: 'userName'
          },
          {
            title: '真实姓名',
            align: 'center',
            dataIndex: 'realName'
          },
          {
            title: '部门',
            align: 'center',
            dataIndex: 'deptName',
            ellipsis: true
          },
          {
            title: '业务类型',
            align: 'center',
            dataIndex: 'businessType_dictText'
          },
          /* {
            title: '设备信息',
            align: 'center',
            dataIndex: 'deviceInfo',
            ellipsis: true
          }, */
          {
            title: '事件内容',
            align: 'center',
            dataIndex: 'eventContent',
            ellipsis: true
          },
         /* {
            title: '流程状态',
            align: 'center',
            dataIndex: 'bpmStatus_dictText'
          }, */
          {
            title: '创建日期',
            align: 'center',
            dataIndex: 'createTime'
          },
          {
            title: '工单状态',
            align: 'center',
            dataIndex: 'orderStatus_dictText',
            width: 80
          },
          {
            title: '工单状态明细',
            align: 'center',
            dataIndex: 'orderStatusDetail_dictText',
            width: 80
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            fixed: 'right',
            width: 130,
            scopedSlots: { customRender: 'action' }
          }
        ],
        url: {
          list: '/system/serviceOrder/supportLineList',
          receive: '/system/serviceOrder/supportReceiveOrder'
        },
        dictOptions: {},
        path: '',
        formData: {}
      }
    },
    computed: {
      importExcelUrl: function() {
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      }
    },
    methods: {
      initDictConfig() {
      },
       handlePreviewPic: function(record) {
        var flowCode = this.flowCode;
        var dataId = record.id;
        this.$refs.extActProcessInstPicModal.preview(flowCode, dataId);
        this.$refs.extActProcessInstPicModal.title = '流程图';
      },
      showClaimButton(assignee) {
        if (!assignee) {
          return true;
        }
        return false;
      },
      // 接单
      handleClaim(record) {
        var that = this;
        this.$confirm({
          title: '确认接单吗',
          content: '是否接单?',
          onOk: function() {
            var param = {
              id: record.id,
              version: record.version
            }
            postAction(that.url.receive, param).then((res) => {
              if (res.success) {
                that.$message.success(res.message);
                that.loadData();
                that.onClearSelected();
              } else {
                that.$message.warning(res.message);
              }
            });
          }
        });
      },
      // 办理
      handleProcess(record) {
        this.$refs.taskDealModal.title = '办理';
        this.$refs.taskDealModal.deal(record);
      },
      // 详情
      showDetailServiceOrder(record) {
        this.formData = record;
        this.formData.dataId = record.id;
        this.path = 'modules/service/staff/modules/StaffServiceOrderForm';
        this.$refs.taskDeatilModal.deal();
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
