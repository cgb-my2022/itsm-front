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
          <!-- <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="流程状态">
              <j-dict-select-tag placeholder="请选择流程状态" v-model="queryParam.bpmStatus" dictCode="bpm_status"/>
            </a-form-item>
          </a-col>-->

          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="8">
              <a-form-item label="账号">
                <a-input placeholder="请输入账号" v-model="queryParam.userName"></a-input>
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
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

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
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
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
        <!-- 操作 -->
        <span slot="action" slot-scope="text, record">
          <template v-if="record.orderStatusDetail==10||record.orderStatusDetail==11">
              <a  @click="handleProcess(record)">转办</a>
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
    <service-task-deal-modal ref="taskDealModal" @ok="taskOk" />
    <service-task-detail-modal ref="taskDeatilModal" />
    <!-- 弹出框 -->
    <!--<his-task-deal-modal ref="taskDealModal" :path="path" :formData="formData"></his-task-deal-modal>
    <task-notify-modal ref="taskNotifyModal"></task-notify-modal>-->
    <!--<process-module/>-->
  </a-card>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import { ServiceMixin } from '../staff/mixins/ServiceMixin'
  import StaffServiceOrderModal from '../staff/modules/StaffServiceOrderModal'
  import JDictSelectTag from '@/components/dict/JDictSelectTag.vue'
  import JDate from '@/components/jeecg/JDate.vue'
  import '@/assets/less/TableExpand.less'
  import ServiceProcessInstPicModal from '../common/ServiceProcessInstPicModal';

  import ServiceTaskDealModal from '../common/ServiceTaskDealModal'
  import ServiceTaskDetailModal from '../common/ServiceTaskDetailModal'

  export default {
    name: 'SupportServiceOrderList',
    mixins: [JeecgListMixin, ServiceMixin],
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
            title: '请求内容',
            dataIndex: 'eventContent',
            ellipsis: true,
            align: 'center',
          },
          {
            title: '所属业务',
            align: 'center',
            ellipsis: true,
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
            dataIndex: 'createName'
          },
          {
            title: '创建人所属部门',
            align: 'center',
            dataIndex: 'deptName',
            ellipsis: true
          },
          {
            title: '创建日期',
            align: 'center',
            sorter: true,
            dataIndex: 'createTime'
          },
          {
            title: '处理人',
            align: 'center',
            dataIndex: 'frontlineUserRealname',
            scopedSlots: { customRender: 'realname' }
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
          list: '/system/serviceOrder/delegateList',
        },
        dictOptions: {},
        path: 'modules/service/staff/modules/StaffServiceOrderForm'
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
    created() {
      this.getCatalog()
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
      // 办理
      handleProcess(record) {
        this.$refs.taskDealModal.title = '转办';
        this.$refs.taskDealModal.deal(record.id);
      },
      // 详情
      showDetailServiceOrder(record) {
        const path = 'modules/service/staff/modules/StaffServiceOrderForm';
        this.$refs.taskDeatilModal.deal(record.id, path);
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
