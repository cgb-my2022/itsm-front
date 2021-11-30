<template>
  <a-modal
    centered
    :title="title"
    :width="750"
    :visible="visible"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <!-- table区域-begin -->
      <div>
        <a-table
          size="middle"
          bordered
          rowKey="id"
          :pagination="false"
          :columns="columns1"
          :dataSource="dataSource1"
          :loading="loading"
          :rowSelection="{ selectedRowKeys: selectedRowKeys, onSelect: onSelect, onChange: onSelectChange, type: type }"
        >
          <span slot="username" slot-scope="text">
            <j-ellipsis :value="text" :length="15" />
          </span>
          <span slot="realname" slot-scope="text">
            <j-ellipsis :value="text" :length="10" />
          </span>
        </a-table>
      </div>
      <!-- table区域-end -->
    </a-modal>
</template>

<script>
import { filterObj } from '@/utils/util'
import { getAction, postAction } from '@/api/manage'
import JEllipsis from '@/components/jeecg/JEllipsis'

export default {
  name: 'BizSelectSingleUserModal',
  components: { JEllipsis },
  props: {
    url: {
      type: String,
      default: "/sys/event/assignList"
    }
  },
  data() {
    return {
      title: '用户列表',
      names: [],
      visible: false,
      placement: 'right',
      description: '人员管理页面',
      // 查询条件
      queryParam: {},
      // 表头
      columns1: [
        {
          title: '用户账号',
          align: 'center',
          dataIndex: 'username',
          width: '40%',
          scopedSlots: { customRender: 'username' },
        },
        {
          title: '用户姓名',
          align: 'center',
          width: '40%',
          dataIndex: 'realname',
          scopedSlots: { customRender: 'realname' },
        },
      ],
      //数据集
      dataSource1: [],
      dataSource2: [],
      loading: false,
      selectedRowKeys: [],
      selectedRows: [],
      type: 'radio',
      eventParams: {}
    }
  },
  methods: {
    handleCancel() {
      this.visible = false
    },
    handleOk() {
      if (this.dataSource2.length <= 0) {
        this.$message.warning('请选用户信息')
        return
      }
      this.$emit('selectFinished', this.dataSource2[0])
      this.visible = false
    },
    select(values = {}) {
      this.visible = true
      this.eventParams = values
      this.loadData()
    },
    loadData() {
      getAction(this.url, this.eventParams).then((res) => {
        if (res.success) {
          this.dataSource1 = res.result
        }
      })
    },
    onSelect(record, selected) {
      if (selected === true) {
        this.dataSource2 = []
        this.dataSource2.push(record)
      } else {
        this.dataSource2 = []
      }
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectionRows = selectedRows
    },
    onClearSelected() {
      this.selectedRowKeys = []
      this.selectionRows = []
    },
    handleDelete: function (record) {
      this.dataSource2 = []
    },
  },
}
</script>
<style lang="less" scoped>
.ant-card-body .table-operator {
  margin-bottom: 18px;
}
.ant-table-tbody .ant-table-row td {
  padding-top: 15px;
  padding-bottom: 15px;
}
.anty-row-operator button {
  margin: 0 5px;
}
.ant-btn-danger {
  background-color: #ffffff;
}

.ant-modal-cust-warp {
  height: 100%;
}
.ant-modal-cust-warp .ant-modal-body {
  height: calc(100% - 110px) !important;
  overflow-y: auto;
}
.ant-modal-cust-warp .ant-modal-content {
  height: 90% !important;
  overflow-y: hidden;
}
</style>