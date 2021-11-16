<!--普通员工服务工单列表-->
<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="工单状态">
              <j-dict-select-tag
                placeholder="请选择工单状态"
                v-model="queryParam.orderStatus"
                dictCode="service_order_status"
              />
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="事件分类">
              <a-tree-select
                show-search
                style="width: 100%"
                :value="catIds"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                placeholder="请选择"
                allow-clear
                multiple
                :tree-data="categoryOptions"
                tree-checkable
                tree-default-expand-all
                :replace-fields="{ title: 'title', value: 'id', key: 'id', children: 'children' }"
                :filterTreeNode="searchFilterTreeNode"
                @change="changeCat"
              >
              </a-tree-select>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :xl="10" :lg="11" :md="12" :sm="24">
              <a-form-item label="创建日期">
                <j-date
                  :show-time="true"
                  date-format="YYYY-MM-DD HH:mm:ss"
                  placeholder="请选择开始时间"
                  class="query-group-cust"
                  v-model="queryParam.createTime_begin"
                ></j-date>
                <span class="query-group-split-cust"></span>
                <j-date
                  :show-time="true"
                  date-format="YYYY-MM-DD HH:mm:ss"
                  placeholder="请选择结束时间"
                  class="query-group-cust"
                  v-model="queryParam.createTime_end"
                ></j-date>
              </a-form-item>
            </a-col>
          </template>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchQuery" icon="reload" style="margin-left: 8px">重置</a-button>
              <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'" />
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleSubmit('请求目录', 'serviceCatalog')" type="primary">请求目录</a-button>
      <a-button @click="handleSubmit('快速发起', 'modalForm')" type="primary" style="margin-left: 10px"
        >快速发起</a-button
      >
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
        @change="handleTableChange"
      >
        <!-- 工单状态 -->
        <template slot="status" slot-scope="text, record">
          <div class="order-status">
            <p v-if="record.orderStatus === 1 || record.orderStatus === 4" class="order-status_round c-blue"></p>
            <p
              v-if="record.orderStatus === 2 || record.orderStatus === 3 || record.orderStatus === 5"
              class="order-status_round c-green"
            ></p>
            <p v-if="record.orderStatus === 6" class="order-status_round c-red"></p>
            <p v-if="record.orderStatus === 7" class="order-status_round c-gray"></p>
            <p>{{ text }}</p>
          </div>
        </template>
        <!-- 处理人 -->
        <template slot="realname" slot-scope="text, record">
          <span v-if="setRealname([2], record.orderStatusDetail)"></span>
          <span v-else-if="setRealname([3, 4, 5, 12], record.orderStatusDetail)">{{
            record.frontlineUserRealname
          }}</span>
          <span v-else-if="setRealname([10], record.orderStatusDetail)">{{ record.frontlineDelegateName }}</span>
          <span v-else-if="setRealname([11], record.orderStatusDetail)">{{ record.supportDelegateName }}</span>
          <span v-else-if="setRealname([8, 9, 14], record.orderStatusDetail)">{{ record.solRealName }}</span>
          <span v-else-if="setRealname([6, 7, 13], record.orderStatusDetail)">{{ record.supportUserRealname }}</span>
          <span v-else></span>
        </template>
        <!-- 操作按钮 -->
        <span slot="action" slot-scope="text, record">
          <a @click="bindDetail(record)">详情</a>
          <a-divider type="vertical" />
          <a @click="handlePreviewPic(record)" style="color: orange">进度</a>
          <a-divider type="vertical" />
        </span>
      </a-table>
    </div>
  </a-card>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import JDictSelectTag from '@/components/dict/JDictSelectTag.vue'
import JDate from '@/components/jeecg/JDate.vue'
import '@/assets/less/TableExpand.less'
import { postAction, putAction } from '@/api/manage'
import { ajaxGetCategoryItems, getDictItemsFromCache } from '@/api/api'

export default {
  name: 'StaffServiceOrderList',
  mixins: [JeecgListMixin],
  components: {
    JDictSelectTag,
    JDate,
  },
  data() {
    return {
      description: '事件管理列表',
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
          dataIndex: 'serviceCatFullName',
        },
        {
          title: '工单状态',
          align: 'center',
          dataIndex: 'orderStatus_dictText',
          width: 140,
          scopedSlots: { customRender: 'status' },
        },
        {
          title: '创建人',
          align: 'center',
          width: 140,
          dataIndex: 'realName',
        },
        {
          title: '创建日期',
          align: 'center',
          width: 200,
          sorter: true,
          dataIndex: 'createTime',
        },
        {
          title: '处理人',
          align: 'center',
          width: 140,
          dataIndex: 'frontlineUserRealname',
          scopedSlots: { customRender: 'realname' },
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 180,
          scopedSlots: { customRender: 'action' },
        },
      ],
      url: {
        list: '/system/serviceOrder/list',
        delete: '/system/serviceOrder/delete',
        deleteBatch: '/system/serviceOrder/deleteBatch',
        exportXlsUrl: '/system/serviceOrder/exportXls',
        importExcelUrl: 'system/serviceOrder/importExcel',
        startProcess: '/process/extActProcess/startMutilProcess',
        resolve: '/system/serviceOrder/confirmOrderResolved',
        updateOrderStatus: window._CONFIG['domianURL'] + '/system/serviceOrder/updateServiceOrderStatus',
      },
      dictOptions: {},
      serviceOrderModel: {
        id: '',
        approved: '',
      },
      catIds: [],
      categoryOptions: [], //事件类型内容
    }
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
    setRealname() {
      return function (arr, status) {
        if (arr.indexOf(status) != -1) {
          return true
        }
        return false
      }
    },
  },
  created() {
    this.initDictData()
  },
  methods: {
    // 详情
    bindDetail() {},
    // 进度
    handlePreviewPic() {},
    // 初始化工单类型
    initDictData() {
      let dictCode = 'B04'
      // 优先从缓存中读取字典配置
      if (getDictItemsFromCache(dictCode, 1)) {
        this.categoryOptions = getDictItemsFromCache(dictCode, 1).children
        return
      }
      // 根据字典Code, 初始化字典数组
      ajaxGetCategoryItems().then((res) => {
        if (res.success) {
          this.categoryOptions = res.result[dictCode].children
        }
      })
    },
    // 选项业务
    changeCat(value, label) {
      this.queryParam.catIds = value.join(',')
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
