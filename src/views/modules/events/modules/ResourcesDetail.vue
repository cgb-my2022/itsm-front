<template>
  <a-modal
    :title="title"
    :width="1200"
    :visible="true"
    :footer="null"
    @cancel="handleCancel"
  >
    <div class="box-main">
        <conser-detail :detailId="detailId" isShowButton="0"></conser-detail>
    </div>
  </a-modal>
</template>

<script>
import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
import ConserDetail from '@/views/conserResource/detailComp/conserDetail'

export default {
  mixins: [JEditableTableMixin],
  components: {
    ConserDetail
  },
  props: {
    detailId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
        title: "资源关联详情",
        refKeys: ['serviceOrderAttach' ],
        visible: true
    }
  },
  methods: {
    handleCancel() {
        this.$emit("closeDetail")
    }
  }
}
</script>

<style scoped>
.box-main {
    margin-bottom: -20px;
}
.box-main >>> .ant-card-body {
    padding-top: 0px !important;
}
</style>