<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="工单编号">
              <a-input v-model="queryParam.id" allow-clear />
            </a-form-item>
          </a-col>

          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="问题分类">
              <a-cascader
                placeholder="请选择"
                :field-names="{ label: 'title', value: 'id', children: 'children' }"
                :show-search="{ filter }"
                v-model="problemCatId"
                :options="dictOptions"
                change-on-select
                expand-trigger="hover"
                allow-clear
                @change="serviceChange"
              />
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="工单状态">
              <a-select placeholder="请选择" allow-clear v-model="queryParam.orderStatus">
                <a-select-option v-for="item in dictStatus" :key="item.value" :value="item.value">
                  <span style="display: inline-block; width: 100%" :title="item.text">
                    {{ item.text }}
                  </span>
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="10" :lg="11" :md="12" :sm="24">
            <a-form-item label="创建日期">
              <j-date
                :show-time="true"
                date-format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择开始时间"
                class="query-group-cust"
                v-model="queryParam.createTime_begin"
                :disableType="2"
              ></j-date>
              <span class="query-group-split-cust"></span>
              <j-date
                :show-time="true"
                date-format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择结束时间"
                class="query-group-cust"
                v-model="queryParam.createTime_end"
                :disableType="2"
              ></j-date>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="bindReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 操作按钮区域 -->
    <div v-if="source === 1" class="table-operator">
      <a-button @click="bindBtn(4)" type="primary">增加</a-button>
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
        <!-- 优先级 -->
        <template slot="problemLevel" slot-scope="text">
          <span v-if="text == 1" style="color: red">{{ setLevel(text) }}</span>
          <span v-if="text == 2" style="color: orange">{{ setLevel(text) }}</span>
          <span v-if="text == 3" style="color: blue">{{ setLevel(text) }}</span>
        </template>
        <!-- 工单状态 -->
        <template slot="status" slot-scope="text">
          <span class="order-status">
            <span v-if="text == 1 || text == 4" class="order-status_round c-blue"></span>
            <span v-if="text == 2 || text == 5" class="order-status_round c-green"></span>
            <span v-if="text == 6" class="order-status_round c-red"></span>
            <span v-if="text == 7" class="order-status_round c-gray"></span>
            <span>{{ setStatus(text) }}</span>
          </span>
        </template>
        <!-- 操作按钮 -->
        <span slot="action" slot-scope="text, record">
          <!-- 问题列表操作 -->
          <template v-if="source === 2">
            <template v-if="record.orderStatus == 1">
              <a @click="bindBtn(6, record)">指派</a>
              <a-divider type="vertical" />
            </template>
            <template v-if="userInfo.id === record.currentUserId && record.orderStatus == 6">
              <a @click="bindBtn(5, record)">确认</a>
              <a-divider type="vertical" />
              <a @click="bindBtn(7, record)">退回</a>
              <a-divider type="vertical" />
            </template>
            <template v-if="userInfo.id === record.upUserId && record.orderStatus == 7">
              <template v-if="record.commentStatus === 0">
                <a @click="bindBtn(8, record)">评价</a>
                <a-divider type="vertical" />
              </template>
            </template>
          </template>
          <!-- 问题办理操作 -->
          <template v-if="source === 3">
            <template v-if="record.orderStatus == 2 || record.orderStatus == 5">
              <a @click="bindBtn(1, record)">办理</a>
              <a-divider type="vertical" />
            </template>
            <template v-if="record.orderStatus == 4">
              <a @click="bindBtn(1, record)">解挂</a>
              <a-divider type="vertical" />
            </template>
          </template>
          <a @click="bindBtn(2, record)">详情</a>
          <a-divider type="vertical" />
          <a @click="bindBtn(3, record)" style="color: orange">进度</a>
        </span>
      </a-table>
    </div>
    <!-- 增加问题 -->
    <template v-if="source === 1">
      <add-problem ref="addProblem" :problemClass="dictOptions" :levelOptions="levelOptions" @ok="loadData()">
      </add-problem>
    </template>
    <template v-if="source === 2">
      <!-- 问题指派 -->
      <problem-out ref="problemOut" @ok="loadData"></problem-out>
      <!-- 问题退回 -->
      <problem-back ref="problemBack" @ok="loadData"></problem-back>
      <!-- 评价 -->
      <problem-evaluation ref="problemEvaluation" @ok="loadData"></problem-evaluation>
    </template>
    <!-- 发布知识 -->
    <knowledge-info ref="knowledgeInfo"></knowledge-info>
    <!-- 详情 -->
    <problem-detail
      :source="source"
      :dictStatus="dictStatus"
      :dictOptions="levelOptions"
      :userInfo="userInfo"
      ref="problemDetail"
      @ok="loadData"
      @knowledge="bindKnowledge"
    >
    </problem-detail>
    <!-- 进度 -->
    <problem-process ref="problemProcess"></problem-process>
  </a-card>
</template>

<script>
import { postAction, getAction, deleteAction } from '@/api/manage'
import { ServiceColumns } from '@/views/modules/service/mixins/ServiceColumns'
import JDate from '@/components/jeecg/JDate.vue'
import AddProblem from './AddProblem.vue'
import { mapGetters } from 'vuex'
import ProblemProcess from '@/views/modules/service/common/ServiceProcessInstPicModal'
import ProblemDetail from './ProblemDetail.vue'
import ProblemOut from './ProblemOut.vue'
import ProblemBack from './ProblemBack.vue'
import ProblemEvaluation from './ProblemEvaluation.vue'

export default {
  name: 'problemCommon',
  props: {
    // 页面标识  1：我的问题 2：问题列表 3：问题办理
    source: {
      type: Number,
      default: 1,
    },
    // 列表接口
    listUrl: {
      type: String,
      default: '',
    },
  },
  mixins: [ServiceColumns],
  components: {
    JDate,
    AddProblem,
    ProblemProcess,
    ProblemDetail,
    ProblemOut,
    ProblemBack,
    ProblemEvaluation,
  },
  data() {
    return {
      // 问题分类
      problemCatId: [],
      dictOptions: [],
      // 优先级
      levelOptions: [],
      // 工单状态
      dictStatus: [],
      // 表头
      columns: [
        {
          title: '编号',
          dataIndex: 'id',
          align: 'center',
          ellipsis: true,
          width: 190,
        },
        {
          title: '问题标题',
          dataIndex: 'problemTitle',
          ellipsis: true,
          align: 'center',
        },
        {
          title: '问题分类',
          align: 'center',
          ellipsis: true,
          dataIndex: 'problemCatFullName',
        },
        {
          title: '优先级',
          align: 'center',
          dataIndex: 'problemLevel',
          sorter: true,
          width: 140,
          scopedSlots: { customRender: 'problemLevel' },
        },
        {
          title: '工单状态',
          align: 'center',
          dataIndex: 'orderStatus',
          width: 140,
          sorter: true,
          scopedSlots: { customRender: 'status' },
        },
        {
          title: '发起人',
          align: 'center',
          sorter: true,
          dataIndex: 'createName',
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
          sorter: true,
          dataIndex: 'solRealName',
        },
        {
          title: '完成日期',
          align: 'center',
          width: 200,
          sorter: true,
          dataIndex: 'comfirmTime',
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
        list: this.listUrl,
        confirmOrderResolved: '/sys/problem/confirmOrderResolved', //确认已解决
      },
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    // 根据等级id设置等级
    setLevel() {
      return function (text) {
        if (this.levelOptions.length > 0) {
          const findItem = this.levelOptions.find((item) => item.value == text)
          return findItem.text || findItem.title
        } else {
          return ''
        }
      }
    },
    // 设置工单状态
    setStatus() {
      return function (text) {
        if (this.dictStatus.length > 0) {
          const findItem = this.dictStatus.find((item) => item.value == text)
          return findItem.text || findItem.title
        } else {
          return ''
        }
      }
    },
  },
  methods: {
    /** 获取数据字典内容 */
    initDictConfig() {
      // 问题分类
      this.setDic('B05', 'dictOptions', 1)
      // 工单状态
      this.setDic('problem_order_status', 'dictStatus')
      // 优先级
      this.setDic('service_level', 'levelOptions')
    },
    // 操作
    bindBtn(type, record) {
      switch (type) {
        case 1:
          // 办理
          this.$refs.problemDetail.deal(record.id, '办理', type)
          break
        case 2:
          // 详情
          this.$refs.problemDetail.deal(record.id, '详情', type)
          break
        case 3:
          // 进度
          this.$refs.problemProcess.preview(record.flowCode, record.id)
          this.$refs.problemProcess.title = '流程'
          break
        case 4:
          // 添加
          this.$refs.addProblem.add()
          break
        case 5:
          // 确认
          const that = this
          that.$confirm({
            title: '确认',
            content: '确认问题已经解决了吗?',
            onOk: function () {
              postAction(that.url.confirmOrderResolved, {
                id: record.id,
                version: record.version,
              }).then((res) => {
                if (res.success) {
                  that.$message.success(res.message)
                  that.loadData()
                } else {
                  that.$message.warning(res.message)
                }
              })
            },
          })
          break
        case 6:
          // 指派
          this.$refs.problemOut.deal(record)
          break
        case 7:
          // 退回
          this.$refs.problemBack.deal(record)
          break
        case 8:
          // 评价
          this.$refs.problemEvaluation.deal(record.id)
          break
        default:
          break
      }
    },
    // 重置
    bindReset() {
      this.problemCatId = []
      this.queryParam.problemCatId = ''
      this.searchReset()
    },
    // 选择问题分类
    serviceChange(value, selectedOptions) {
      const problemCatId = value.length > 0 ? value[value.length - 1] : ''
      this.queryParam.problemCatId = problemCatId
    }
  }
}
</script>

<style scoped>
@import '~@assets/less/common.less';
</style>