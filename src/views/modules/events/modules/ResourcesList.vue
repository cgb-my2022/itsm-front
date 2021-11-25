<template>
  <a-modal
    destroyOnClose
    :title="title"
    :width="1200"
    :visible="visible"
    :loading="loadingList"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <a-table
      ref="table"
      size="middle"
      bordered
      rowKey="id"
      class="j-table-force-nowrap"
      :pagination="false"
      :columns="columns"
      :dataSource="dataSource"
      :loading="loadingList"
      :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
    >
    </a-table>
  </a-modal>
</template>

<script>
import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { getAction } from '@/api/manage'

export default {
  mixins: [JEditableTableMixin, JeecgListMixin],
  data() {
    return {
        loadingList: false,
        title: "资源关联列表",
        columns: [
            {
                title: '名称 ',
                align: 'center',
                dataIndex: 'name',
                ellipsis: true,
            },
            {
                title: '描述',
                align: 'center',
                dataIndex: 'describes',
                ellipsis: true,
            },
            {
                title: '资源类型',
                align: 'center',
                dataIndex: 'resourceTypeId',
                ellipsis: true,
            },
            {
                title: '使用人',
                align: 'center',
                dataIndex: 'useUserName',
            }
        ],
        dataSource: [],
        url: "/cmdb/resource/getResourceList",
        disableMixinCreated: true,
        visible: false,
        refKeys: ['serviceOrderAttach' ],
        selectedRowKeys: []
    }
  },
  created() {
    this.initData()
  },
  methods: {
    add(list) {
        this.selectedRowKeys = list
        this.visible = true
    },
    initData() {
        this.loadingList = true
        getAction(this.url).then(res => {
            if (res.result) {
                this.dataSource = res.result
            }
            this.loadingList = false
        })
    },
    handleOk() {
        if (this.selectedRowKeys.length > 0) {
            let data = []
            this.selectedRowKeys.forEach(item => {
                const findIndex = this.dataSource.findIndex(citem => citem.id === item )
                data.push(this.dataSource[findIndex])
            });
            this.$emit("selectOk", data)
            this.visible = false;
        } else {
            this.$message.warning("请勾选需要添加的内容！")
        }
    }
  }
}
</script>