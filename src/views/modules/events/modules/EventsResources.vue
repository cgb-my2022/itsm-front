<template>
  <a-modal
    destroyOnClose
    :title="title"
    :width="1000"
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
      :dataSource="dataSource"
      :loading="loadingList"
    >
        <span slot="action" slot-scope="text, record">
            <a @click="handleDetail(record.id)">详情</a>
        </span>
    </a-table>
    <!-- 资源详情 -->
    <resources-detail v-if="showDetail" :detailId="detailId" ref="resourcesDetail" @closeDetail="showDetail=false"></resources-detail>
  </a-modal>
</template>

<script>
import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { getAction } from '@/api/manage'
import ResourcesDetail from './ResourcesDetail'

export default {
  mixins: [JEditableTableMixin, JeecgListMixin],
  props: {
    ids: {
        type: String,
        default: ""
    }
  },
  components: { ResourcesDetail },
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
            },
            {
                title: '操作',
                dataIndex: 'action',
                scopedSlots: { customRender: 'action' },
                align: 'center',
                width: 100,
            }
        ],
        dataSource: [],
        url: "/cmdb/resource/getResourceListByIdList",
        disableMixinCreated: true,
        visible: false,
        refKeys: ['serviceOrderAttach' ],
        showDetail: false,
        detailId: ""
    }
  },
  watch: {
    ids: {
        immediate: true,
        handler(value) {
            if (value) {
                this.initData()
            }
        }
    }
  },
  methods: {
    add() {
        this.visible = true
    },
    // 查看资源
    handleDetail(id) {
      this.showDetail = true
      this.detailId = id
    },
    initData() {
        this.loadingList = true
        getAction(this.url, {ids: this.ids}).then(res => {
            if (res.result) {
                this.dataSource = res.result
            }
            this.loadingList = false
        })
    }
  }
}
</script>