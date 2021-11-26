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
                expand-trigger="hover"
                @change="serviceChange"
              />
            </a-form-item>
          </a-col>
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
            <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="bindReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'" />
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
        @change="handleTableChange"
      >
        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>
        <template slot="imgSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px; font-style: italic">无图片</span>
          <img
            v-else
            :src="getImgView(text)"
            height="25px"
            alt=""
            style="max-width: 80px; font-size: 12px; font-style: italic"
          />
        </template>
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px; font-style: italic">无文件</span>
          <a-button v-else :ghost="true" type="primary" icon="download" size="small" @click="uploadFile(text)">
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
            <span
              v-if="record.orderStatus === 2 || record.orderStatus === 3 || record.orderStatus === 5"
              class="order-status_round c-green"
            ></span>
            <span v-if="record.orderStatus === 6" class="order-status_round c-red"></span>
            <span v-if="record.orderStatus === 7" class="order-status_round c-gray"></span>
            <span>{{ text }}</span>
          </span>
        </template>
        <!-- 处理人 -->
        <template slot="realname" slot-scope="text, record">
          <!-- <span v-if="setRealname([2], record.orderStatusDetail)"></span> -->
          <span v-if="setRealname([3, 4, 5, 12], record.orderStatusDetail)">{{
            record.frontlineUserRealname
          }}</span>
          <span v-else-if="setRealname([10], record.orderStatusDetail)">{{ record.frontlineDelegateName }}</span>
          <span v-else-if="setRealname([11], record.orderStatusDetail)">{{ record.supportDelegateName }}</span>
          <span v-else-if="setRealname([8, 9, 14, 24], record.orderStatusDetail)">{{ record.solRealName }}</span>
          <span v-else-if="setRealname([6, 7, 13], record.orderStatusDetail)">{{ record.supportUserRealname }}</span>
          <span v-else-if="setRealname([21, 22, 23], record.orderStatusDetail)">{{ record.vipDelegateName }}</span>
          <span v-else></span>
        </template>
        <!-- 操作按钮 -->
        <span slot="action" slot-scope="text, record">
          <template v-if="record.orderStatusDetail == 21 || record.orderStatusDetail == 23">
            <a @click="handleProcess(record)">办理</a>
            <a-divider type="vertical" />
          </template>
          <template v-else-if="record.orderStatusDetail == 22">
            <a @click="handleProcess(record)">解挂</a>
            <a-divider type="vertical" />
          </template>
          <a @click="showDetailServiceOrder(record)">详情</a>
          <a-divider type="vertical" />
          <a @click="handlePreviewPic(record)">进度</a>
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
import { ServiceColumns } from '@/views/modules/service/mixins/ServiceColumns'
import { postAction, getAction } from '@/api/manage'

export default {
  name: 'SupportServiceOrderList',
  mixins: [ServiceColumns],
  data() {
    return {
      description: 'vip工单管理页面',
      flowCode: 'onl_service_order',
      url: {
        list: '/system/serviceOrderVip/vipSupList',
        receive: '/system/serviceOrder/supportReceiveOrder',
      },
      dictOptions: {},
    }
  },
  methods: {
    initDictConfig() {},
    handlePreviewPic: function (record) {
      var flowCode = this.flowCode
      var dataId = record.id
      this.$refs.extActProcessInstPicModal.preview(flowCode, dataId)
      this.$refs.extActProcessInstPicModal.title = '流程图'
    },
    showClaimButton(assignee) {
      if (!assignee) {
        return true
      }
      return false
    },
    // 接单
    handleClaim(record) {
      var that = this
      this.$confirm({
        title: '确认接单吗',
        content: '是否接单?',
        onOk: function () {
          var param = {
            id: record.id,
            version: record.version,
          }
          postAction(that.url.receive, param).then((res) => {
            if (res.success) {
              that.$message.success(res.message)
              that.loadData()
              that.onClearSelected()
            } else {
              that.$message.warning(res.message)
            }
          })
        },
      })
    },
    // 办理
    handleProcess(record) {
      this.$refs.taskDealModal.title = '办理'
      this.$refs.taskDealModal.deal(record.id)
    },
    // 详情
    showDetailServiceOrder(record) {
      const path = 'modules/service/staff/modules/StaffServiceOrderForm'
      this.$refs.taskDeatilModal.deal(record.id, path)
    },
    taskOk() {
      console.log('流程办理完成')
      this.loadData()
    },
  },
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>
