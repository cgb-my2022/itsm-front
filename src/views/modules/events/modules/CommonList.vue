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
                style="width: 100%"
                :value="catIds"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                placeholder="请选择"
                allow-clear
                :tree-data="categoryOptions"
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
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="事件内容">
                <a-input v-model="queryParam.eventDesc"/>
              </a-form-item>
            </a-col>
          </template>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset1" icon="reload" style="margin-left: 8px">重置</a-button>
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
    <div v-if="typeList === 1" class="table-operator">
      <a-button @click="bindBtn(4)" type="primary">新建</a-button>
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
        <!-- 紧急程度 -->
        <template slot="eventLevel" slot-scope="text">
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
            <span>{{setStatus(text)}}</span>
          </span>
        </template>
        <!-- 操作按钮 -->
        <span slot="action" slot-scope="text, record">
          <template v-if="userInfo.id === record.currentUserId">
            <!-- 事件办理页面 并且是自己的未完成的单 -->
            <template v-if="typeList === 2 && record.orderStatus !== 7">
              <a @click="bindBtn(1,record)">办理</a>
              <a-divider type="vertical" />
            </template>
            <!-- 事件列表页面 并且是自己的待确认的单 -->
            <template v-if="typeList === 1 && record.orderStatus === 6">
              <a @click="bindBtn(5, record)">确认</a>
              <a-divider type="vertical" />
            </template>
          </template>
          <template v-if="!record.currentUserId">
            <!-- 待接单 -->
            <template v-if="typeList === 2 && record.orderStatus !== 7">
              <a @click="bindBtn(1,record)">办理</a>
              <a-divider type="vertical" />
            </template>
          </template>
          <a @click="bindBtn(2, record)">详情</a>
          <a-divider type="vertical" />
          <a @click="bindBtn(3, record)" style="color: orange">进度</a>
        </span>
      </a-table>
    </div>
    <!-- 新建事件工单 -->
    <add-events 
      :categoryOptions="categoryOptions" 
      ref="addEvents" 
      @closeLoad="loadData">
    </add-events>
    <!-- 详情 -->
    <events-detail 
      :categoryOptions="categoryOptions"
      :dictStatus="dictStatus" 
      :dictOptions="dictOptions" 
      :userInfo="userInfo"
      ref="eventsDetail" 
      @ok="loadData">
    </events-detail>
    <!-- 流程图 -->
    <events-process ref="eventsProcess"></events-process>
  </a-card>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import JDictSelectTag from '@/components/dict/JDictSelectTag.vue'
import JDate from '@/components/jeecg/JDate.vue'
import '@/assets/less/TableExpand.less'
import { postAction, putAction } from '@/api/manage'
import { ajaxGetDictItems, getDictItemsFromCache } from '@/api/api'
import AddEvents from './AddEvents.vue'
import EventsDetail from './EventsDetail.vue'
import EventsProcess from '@/views/modules/service/common/ServiceProcessInstPicModal';
import { mapGetters } from 'vuex'

export default {
  name: 'StaffServiceOrderList',
  props: {
    // 1:事件列表页面  2：事件办理页面
    typeList: {
      type: Number,
      default: 1
    }
  },
  mixins: [JeecgListMixin],
  components: {
    EventsProcess,
    JDictSelectTag,
    JDate,
    AddEvents,
    EventsDetail
  },
  data() {
    return {
      description: '事件管理列表',
      flowCode: 'onl_service_order',
      dictOptions: [],  //事件级别
      dictStatus: [],   //事件状态
      // 表头
      columns: [
        {
          title: '标题',
          dataIndex: 'eventTitle',
          ellipsis: true,
          align: 'center',
        },
        {
          title: '事件内容',
          align: 'center',
          ellipsis: true,
          dataIndex: 'eventDesc',
        },
        {
          title: '事件分类',
          align: 'center',
          dataIndex: 'eventCatFullName'
        },
        {
          title: '紧急程度',
          align: 'center',
          dataIndex: 'eventLevel',
          sorter: true,
          width: 140,
          scopedSlots: { customRender: 'eventLevel' },
        },
        {
          title: '工单状态',
          align: 'center',
          dataIndex: 'orderStatus',
          width: 140,
          sorter: true,
          scopedSlots: { customRender: 'status' }
        },
        {
          title: '发起人',
          align: 'center',
          sorter: true,
          dataIndex: 'createName'
        },
        {
          title: '创建日期',
          align: 'center',
          width: 200,
          sorter: true,
          dataIndex: 'createTime',
        },
        {
          title: '受理人',
          align: 'center',
          width: 140,
          sorter: true,
          dataIndex: 'currentUserName'
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
        list: '/sys/event/list',
        confirmOrderResolved: '/sys/event/confirmOrderResolved'
      },
      serviceOrderModel: {
        id: '',
        approved: '',
      },
      catIds: "",
      categoryOptions: [], //事件类型内容
      sortName: true
    }
  },
  watch: {
    typeList: {
      handler(newVal) {
        // 是否查所有（queryAll： 1是 0否）
        this.queryParam.queryAll = newVal === 1 ? 1 : 0
      },
      immediate: true,
    }
  },
  computed: {
    ...mapGetters(["userInfo"]),
    // 根据等级id设置等级
    setLevel() {
      return function (text) {
        if (this.dictOptions.length > 0) {
          const findItem = this.dictOptions.find(item => item.value == text)
          return findItem.text || findItem.title
        } else {
          return ""
        }
      }
    },
    // 设置工单状态
    setStatus() {
      return function (text) {
        if (this.dictStatus.length > 0) {
          const findItem = this.dictStatus.find(item => item.value == text)
          return findItem.text || findItem.title
        } else {
          return ""
        }
      }
    },
  },
  created() {
    this.initDictData()
  },
  methods: {
    /** 获取数据字典内容 */
    initDictConfig() {
      // 事件等级
      this.setDic("EVENT_LEVEL", "dictOptions")
      // 工单状态
      this.setDic("SERVICE_ORDER_STATUS", "dictStatus")
    },
    setDic(dictCode, obj) {
      let data = {}
      //优先从缓存中读取字典配置
      if (getDictItemsFromCache(dictCode)) {
        data[obj] = getDictItemsFromCache(dictCode)
        Object.assign(this, data)
        return
      }
      //根据字典Code, 初始化字典数组
      ajaxGetDictItems(dictCode, null).then((res) => {
        if (res.success) {
          data[obj] = res.result
          Object.assign(this, data)
        }
      })
    },
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
    // 操作
    bindBtn(type, record) {
      switch (type) {
        case 1:
          // 办理
          this.$refs.eventsDetail.deal(record.id, type)
          break;
        case 2:
          // 详情
          this.$refs.eventsDetail.deal(record.id, type)
          break;
        case 3:
          // 进度
          this.$refs.eventsProcess.preview(record.flowCode, record.id);
          this.$refs.eventsProcess.title = '流程图';
          break;
        case 4:
          // 添加
          this.$refs.addEvents.add()
          break;
        case 5:
          // 确认
          const that = this
          that.$confirm({
            title: '确认',
            content: '确问题已经解决了吗?',
            onOk: function () {
              postAction(that.url.confirmOrderResolved, {
                id: record.id, version: record.version
              }).then(res => {
                if (res.success) {
                  that.$message.success(res.message)
                  that.loadData()
                } else {
                  that.$message.warning(res.message)
                }
              })
            },
          })
          break;
        default:
          break;
      }
    },
    // 重置
    searchReset1() {
      Object.keys(this.queryParam).forEach(item => {
        if (item != 'queryAll') {
          this.queryParam[item] = ""
        }
      })
      this.loadData(1);
    },
    // 选项业务
    changeCat(value, label) {
      this.catIds = value
      this.queryParam.catIds = value
    }
  },
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>
