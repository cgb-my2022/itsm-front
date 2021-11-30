<template>
    <a-modal
        title="选择业务流程"
        :width="660"
        :visible="visible"
        :confirmLoading="confirmLoading"
        @ok="handleOkConfirm"
        @cancel="handleCancel"
        cancelText="关闭">
        <a-table
            ref="table"
            size="middle"
            bordered
            rowKey="processId"
            class="j-table-force-nowrap"
            :pagination="false" 
            :columns="columns"
            :dataSource="dataSource"
            :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange, type: type }">
        </a-table>
    </a-modal>
</template>

<script>
import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { getAction } from '@/api/manage'
import JEllipsis from '@/components/jeecg/JEllipsis'

export default {
  mixins: [JeecgListMixin, JEditableTableMixin],
  components: { JEllipsis },
  data() {
    return {
      confirmLoading: false,
      dataSource: [],
      disableMixinCreated: true,
      refKeys: ['serviceOrderAttach'],
      type: "radio",
      columns: [
        {
          title: '流程名称',
          align: 'center',
          dataIndex: 'processName',
        },
        {
          title: '流程编码',
          align: 'center',
          dataIndex: 'processRelationCode',
        },
      ],
      url: '/sys/serviceCat/processList'
    }
  },
  created() {
    this.initData()  
  },
  methods: {
    initData() {
        this.confirmLoading = true
        getAction(this.url).then(res => {
          this.confirmLoading = false;
          if (res.code === 200) {
            this.dataSource = res.result
          }
        }).finally(() => {
          this.confirmLoading = false
          return '';
        })
    },
    // 提交
    handleOkConfirm(e) {
        e.preventDefault();
        if (this.selectedRowKeys.length === 0) {
            this.$message.warning("请选择业务流程")
            return;
        }
        const data = this.dataSource.find(item => item.processId === this.selectedRowKeys[0])
        this.$emit("selectFinished", data);
        this.visible = false;
    },
    select(id) {
        this.visible = true
        this.selectedRowKeys = id ? [id] : []
    }
  }
}
</script>