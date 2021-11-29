<template>
  <a-modal
    destroyOnClose
    :title="title"
    :width="800"
    :visible="visible"
    :loading="loadingList"
    :footer="null"
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
      :dataSource="resourcesList"
      :loading="loadingList"
    >
      <!-- 操作按钮 -->
      <span slot="action" slot-scope="text, record">
        <a-button @click="bindDetail(record.id)">详情</a-button>
      </span>
    </a-table>
    <!-- 资源详情 -->
    <resources-detail 
      :detailId="detailId" 
      v-if="showDetail" 
      ref="resourcesDetail" 
      @closeDetail="showDetail=false">
    </resources-detail>
  </a-modal>
</template>

<script>
import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import ResourcesDetail from '@/views/modules/service/common/ResourcesDetail'

export default {
  mixins: [JEditableTableMixin, JeecgListMixin],
  props: {
    resourcesList: {
      type: Array,
      default: []
    }
  },
  components: { ResourcesDetail },
  data() {
    return {
        loadingList: false,
        title: "资源关联列表",
        columns: [
          {
            title: '资源名称',
            dataIndex: 'name',
            ellipsis: true,
            align: 'center'
          },
          {
            title: '资源描述',
            align: 'center',
            ellipsis: true,
            dataIndex: 'describes',
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            width: 140,
            scopedSlots: { customRender: 'action' },
          }
        ],
        disableMixinCreated: true,
        visible: false,
        refKeys: ['serviceOrderAttach' ],
        showDetail: false,
        detailId: ""
    }
  },
  methods: {
    add() {
      this.visible = true
    },
    bindDetail(id) {
      this.detailId = id
      this.showDetail = true
    }
  }
}
</script>