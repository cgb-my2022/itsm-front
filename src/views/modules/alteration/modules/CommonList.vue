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
            <a-form-item label="选择业务">
              <a-cascader
                placeholder="请选择"
                :field-names="{ label: 'title', value: 'id', children: 'children' }"
                :show-search="{ filter }"
                v-model="problemCatId"
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
    <!-- 增加变更 -->
    <template v-if="source === 1">
      <add-alteration ref="addAlteratio" :businessOptions="dictOptions" @ok="loadData()">
      </add-alteration>
    </template>
  </a-card>
</template>

<script>
import JDate from '@/components/jeecg/JDate.vue'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import AddAlteration from './AddAlteration.vue'

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
  },
  components: {
    JDate,
    AddAlteration
  },
  data() {
    return {
      url: {
        list: this.listUrl
      },
      dictOptions: [],  //选择业务
      dictStatus: [],  //工单状态
      problemCatId: [],  //业务
      columns: []
    }
  },
  methods: {
    /** 获取数据字典内容 */
    initDictConfig() {
      // 选择业务
      this.setDic('B06', 'dictOptions', 1)
      // 工单状态
      this.setDic('problem_order_status', 'dictStatus')
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
          this.$refs.addAlteratio.add()
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
    // 选择业务
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