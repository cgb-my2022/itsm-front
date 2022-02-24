<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery" class="row_search">
        <a-row :gutter="24">
          <a-col :xl="12" :lg="7" :md="12" :sm="24">
            <a-form-item label="工单编号">
              <a-input v-model="queryParam.id" allow-clear />
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
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
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
        :row-selection="rowSelection"
        @change="handleTableChange"
      >
        <!-- 工单状态 -->
        <template slot="status">
          <span class="order-status">
            <span class="order-status_round c-gray"></span>
            <span>已结束</span>
          </span>
        </template>
      </a-table>
    </div>
  </a-card>
</template>

<script>
import JDate from '@/components/jeecg/JDate.vue'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'

export default {
  mixins: [JeecgListMixin],
  props: {
    // 默认选中
    selectedDefault: {
      type: Array
    },
    // 查询条件
    queryParams: {
      type: Object
    },
  },
  components: {
    JDate,
  },
  data() {
    return {
      url: {
        list: '/sys/change/allList',
      },
      defaultCheckedId: [], //默认选中的id
      queryParam: {
        id: ''
      },
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
         {
          title: '申请日期',
          align: 'center',
          width: 200,
          sorter: true,
          dataIndex: 'createTime',
        },
        {
          title: '流程结束日期',
          align: 'center',
          width: 200,
          sorter: true,
          dataIndex: 'solTime',
        }
      ],
    }
  },
  watch: {
    selectedDefault: {
      immediate: true,
      handler(value) {
        if (value) {
          this.defaultCheckedId = value
        }
      }
    },
    queryParams: {
      immediate: true,
      handler(value) {
        this.queryParam = Object.assign(this.queryParam, value)
      }
    }
  },
  computed: {
    //表格默认选中
    rowSelection() {
      return {
        //表格默认选中
        onChange: (selectedRowKeys, selectedRows) => {
          let rows = []
          if (selectedRows.length > 0) {
            selectedRows.forEach((item) => {
              rows.push(item.id)
            })
          }
          this.defaultCheckedId = rows //在默认选中的基础上，做了另外选择（如果没写，则会出现的问题：除了选中id为1，2，3，的数据，选择不上其他数据）
          this.$emit("chechRows", rows)
        },
        getCheckboxProps: (record) => ({
          //重点部分
          props: {
            defaultChecked: this.defaultCheckedId.indexOf(record.id) > -1 ? true : false, //defaultCheckedId里面是默认选中的id，判断是否含有这些id，有的那就选中，没有的就不选中
            id: record.id + '', //使得id的数据类型为string
          },
        }),
      }
    },
  },
  methods: {
    
  }
}
</script>

<style scoped>
@import '~@assets/less/common.less';
.query-group-cust {
  width: 300px;
}
.row_search > .ant-row{
  display: flex;
  flex-wrap: wrap;
}
</style>