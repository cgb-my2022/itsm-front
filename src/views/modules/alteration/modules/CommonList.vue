<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery" class="row_search">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="12" :sm="24">
            <a-form-item label="工单编号">
              <a-input v-model="queryParam.id" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="12" :sm="24">
            <a-form-item label="选择业务">
              <a-cascader
                placeholder="请选择"
                :field-names="{ label: 'title', value: 'id', children: 'children' }"
                :show-search="{ filter }"
                v-model="changeCatId"
                :options="dictOptions"
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
          <a-col>
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
          <a-col>
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
        <!-- 工单状态 -->
        <template slot="status" slot-scope="text, record">
          <span class="order-status">
            <span v-if="text == 11" class="order-status_round c-blue"></span>
            <span v-if="text == 2" class="order-status_round c-green"></span>
            <span v-if="text == 7 || text == 12" class="order-status_round c-gray"></span>
            <span>{{ setStatus(text) }}</span>
            <span v-if="record.currentRole && text != 11">（{{ record.currentRole }}）</span>
          </span>
        </template>
        <!-- 操作按钮 -->
        <span slot="action" slot-scope="text, record">
          <!-- 问题办理操作 -->
          <template v-if="source === 2">
            <template v-if="setManage(record)">
              <a :disabled="setDisabled(record)" @click="bindBtn(1, record)">办理</a>
              <a-divider type="vertical" />
            </template>
          </template>
          <a @click="bindBtn(2, record)">详情</a>
          <template v-if="record.orderStatus != 11">
            <a-divider type="vertical" />
            <a @click="bindBtn(3, record)" style="color: orange">进度</a>
          </template>
        </span>
      </a-table>
    </div>
    <!-- 增加变更 -->
    <template v-if="source === 1">
      <!-- 增加 -->
      <add-alteration ref="addAlteration" :businessOptions="dictOptions" :changeType="changeType" @ok="loadData()">
      </add-alteration>
      <!-- 编辑 -->
      <alteration-info ref="alterationInfo" :changeOptions="changeType" @ok="loadData()"> </alteration-info>
    </template>
    <!-- 详情 -->
    <alteration-detail 
    ref="alterationDetail" 
    :source="source"
    :dictStatus="dictStatus" 
    :changeType="changeType" 
    @edit="bindEdit"
    @ok="loadData()">
    </alteration-detail>
    <!-- 进度 -->
    <alteration-process ref="alterationProcess"></alteration-process>
  </a-card>
</template>

<script>
import { mapGetters } from 'vuex'
import JDate from '@/components/jeecg/JDate.vue'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import AddAlteration from './AddAlteration.vue'
import AlterationProcess from '@/views/modules/service/common/ServiceProcessInstPicModal'
import AlterationDetail from './AlterationDetail.vue'
import AlterationInfo from './AlterationInfo.vue'

export default {
  mixins: [JeecgListMixin],
  props: {
    // 页面标识  1：我的变更 2：变更审批
    source: {
      type: Number,
      default: 1,
    },
    // 列表接口
    listUrl: {
      type: String,
      default: '',
    },
    // 不同的表头
    columnsDifferent: {
      type: Array,
    }
  },
  components: {
    JDate,
    AddAlteration,
    AlterationProcess,
    AlterationDetail,
    AlterationInfo,
  },
  data() {
    return {
      url: {
        list: this.listUrl,
      },
      dictOptions: [], //选择业务
      dictStatus: [], //工单状态
      changeCatId: [], //业务
      changeType: [
        //变更类型
        { value: 1, text: '应用系统正式环境补丁' },
        { value: 2, text: '应用系统测试环境补丁' },
      ],
      columns: [
        {
          title: '编号',
          dataIndex: 'id',
          align: 'center',
          ellipsis: true,
          width: 190,
        },
        {
          title: '变更标题',
          dataIndex: 'changeTitle',
          ellipsis: true,
          align: 'center',
        },
        {
          title: '所属业务',
          dataIndex: 'changeCatFullName',
          ellipsis: true,
          align: 'center',
        },
        {
          title: '工单状态',
          align: 'center',
          dataIndex: 'orderStatus',
          width: 200,
          sorter: true,
          scopedSlots: { customRender: 'status' },
        },
      ],
    }
  },
  watch: {
    // 合并表头
    columnsDifferent: {
      handler(newVal) {
        if (newVal) {
          this.columns = this.columns.concat(newVal)
        }
      },
      immediate: true,
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
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
    // 设置是否显示办理按钮
    setManage() {
      return function (text) { 
        const id =  this.userInfo.id
        const signUserIds = text.signUserIds ? text.signUserIds.split(",") : []
        if (text.orderStatus != 2) return false
        if (text.currentUserId != id) {
          if (text.signNum == 0) {
            return false
          }
          if (text.signNum != 0 && signUserIds.indexOf(this.userInfo.id) === -1) {
            return false
          }
        }
        return true
      }
    },
    // 设置是否有办理按钮
    setDisabled() {
      return function (text) {
        // 可点击
        // 1.加签数量( signNum) = 0  当前处理人员id(currentUserId) = 当前用户id
        // 2.加签数量( signNum) != 0 signUserIds最后一位当前用户id
        let signUserIds = text.signUserIds ? text.signUserIds.split(",") : null
        if (text.signNum == 0 && text.currentUserId == this.userInfo.id) {
          return false
        }
        if (text.signNum != 0 && signUserIds && signUserIds[signUserIds.length - 1] == this.userInfo.id) {
          return false
        } 
        return true
      }
    }
  },
  methods: {
    /** 获取数据字典内容 */
    initDictConfig() {
      // 选择业务
      this.setDic('B06', 'dictOptions', 1)
      // 工单状态
      this.setDic('change_order_status', 'dictStatus')
    },
    // 操作
    bindBtn(type, record) {
      switch (type) {
        case 1:
          // 办理
          this.$refs.alterationDetail.deal(record.id, '办理', type)
          break
        case 2:
          // 详情
          this.$refs.alterationDetail.deal(record.id, '详情', type)
          break
        case 3:
          // 进度
          this.$refs.alterationProcess.preview(record.flowCode, record.subId)
          this.$refs.alterationProcess.title = '流程'
          break
        case 4:
          // 添加
          this.$refs.addAlteration.add()
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
        default:
          break
      }
    },
    // 编辑
    bindEdit(info) {
      let businessInfo = {
        changeCatId: info.changeCatId,
        changeCatFullName: info.changeCatFullName,
        changeCatIds: info.changeCatIds,
        changeType: info.changeType, //选择变更类型
        changeOrderIds: info.changeOrderIds ? info.changeOrderIds : '', // 关联测试工单
        changeTest: info.changeOrderIds ? 1 : 0, //是否需要测试
        orderStatus: null, //变更工单状态
        createName: info.createName
      }
      this.$refs.alterationInfo.add(businessInfo, info)
    },
    // 重置
    bindReset() {
      this.changeCatId = []
      this.queryParam.changeCatId = ''
      this.searchReset()
    },
    // 选择业务
    serviceChange(value, selectedOptions) {
      const changeCatId = value.length > 0 ? value[value.length - 1] : ''
      this.queryParam.changeCatId = changeCatId
    },
  },
}
</script>

<style scoped>
@import '~@assets/less/common.less';
.query-group-cust {
  width: 200px;
}
</style>