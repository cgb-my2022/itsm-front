<template>
  <a-card class="j-address-list-right-card-box" :loading="cardLoading" :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="10">
          <a-col :md="6" :sm="12">
            <a-form-item label="姓名" style="margin-left: 8px">
              <a-input placeholder="请输入姓名查询" v-model="queryParam.realname"></a-input>
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="12">
            <a-form-item label="工号" style="margin-left: 8px">
              <a-input placeholder="请输入工号查询" v-model="queryParam.workNo"></a-input>
            </a-form-item>
          </a-col>

          <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
            <a-col :md="6" :sm="24">
              <a-button type="primary" @click="searchQuery" icon="search" style="margin-left: 18px">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </a-col>
          </span>
        </a-row>
      </a-form>
    </div>

    <a-table
      ref="table"
      size="middle"
      bordered
      rowKey="userId"
      :pagination="ipagination"
      :columns="columns"
      :dataSource="dataSource"
      :loading="loading"
      :row-selection="{
        selectedRowKeys: selectedRowKeys,
        onChange: onSelectChange,
        type: type,
      }"
      @change="handleTableChange"
    >
    </a-table>
  </a-card>
</template>

<script>
import { getAction } from '@/api/manage'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'

export default {
  name: 'AddressListRight',
  mixins: [JeecgListMixin],
  components: {},
  props: ['value', 'type', 'selectedDefault'],
  data() {
    return {
      description: '用户信息',
      cardLoading: true,
      positionInfo: {},
      columns: [
        {
          title: '姓名',
          align: 'center',
          dataIndex: 'realname',
        },
        {
          title: '工号',
          align: 'center',
          dataIndex: 'workNo',
        },
        {
          title: '部门',
          align: 'center',
          dataIndex: 'departName',
        },
      ],
      selectedRowKeys: [],
      url: {
        list: '/sys/user/queryByOrgCodeForAddressList',
        listByPosition: '/sys/position/list',
      },
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(orgCode) {
        this.dataSource = []
        this.loadData(1, orgCode)
      },
    },
    selectedDefault: {
      immediate: true,
      handler(value) {
        this.selectedRowKeys = value ? value : []
      }
    }
  },
  created() {
    this.queryPositionInfo()
  },
  methods: {
    loadData(pageNum, orgCode) {
      this.loading = true
      if (pageNum === 1) {
        this.ipagination.current = 1
      }
      // update-begin- --- author:wangshuai ------ date:20200102 ---- for:传过来的部门编码为空全查
      if (!orgCode) {
        getAction(this.url.list, {
          ...this.getQueryParams(),
        })
          .then((res) => {
            if (res.success) {
              this.dataSource = res.result.records
              this.ipagination.total = res.result.total
            }
          })
          .finally(() => {
            this.loading = false
            this.cardLoading = false
          })
        // update-end- --- author:wangshuai ------ date:20200102 ---- for:传过来的部门编码为空全查
      } else {
        //加载数据 若传入参数1则加载第一页的内容
        getAction(this.url.list, {
          orgCode,
          ...this.getQueryParams(),
        })
          .then((res) => {
            if (res.success) {
              this.dataSource = res.result.records
              this.ipagination.total = res.result.total
            }
          })
          .finally(() => {
            this.loading = false
            this.cardLoading = false
          })
      }
    },

    searchQuery() {
      this.loadData(1, this.value)
    },
    searchReset() {
      this.queryParam = {}
      this.loadData(1, this.value)
    },

    handleTableChange(pagination, filters, sorter) {
      if (Object.keys(sorter).length > 0) {
        this.isorter.column = sorter.field
        this.isorter.order = 'ascend' === sorter.order ? 'asc' : 'desc'
      }
      this.ipagination = pagination
      this.loadData(null, this.value)
    },

    // 查询职务信息
    queryPositionInfo() {
      getAction(this.url.listByPosition, { pageSize: 99999 }).then((res) => {
        if (res.success) {
          let positionInfo = {}
          res.result.records.forEach((record) => {
            positionInfo[record['code']] = record['name']
          })
          this.positionInfo = positionInfo
        }
      })
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      let info = null
      if (selectedRowKeys.length > 0) {
        info = {
          ids: selectedRowKeys,
          names: []
        }
        selectedRows.forEach(item => {
          info.names.push(item.realname)
        })
      }
      this.$emit("chechRows", info)
    },
  },
}
</script>
<style>
.j-address-list-right-card-box .ant-table-placeholder {
  min-height: 46px;
}
</style>
<style scoped>
.j-address-list-right-card-box {
  height: 100%;
  min-height: 300px;
}
</style>