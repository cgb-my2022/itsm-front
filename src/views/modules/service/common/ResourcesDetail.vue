<template>
  <a-modal
    :title="title"
    :width="1200"
    :visible="true"
    :footer="null"
    @cancel="handleCancel"
  >
    <div class="box-main">
        <conser-edit :detailId="detailId" isShowButton="0" @closeDetail="handleCancel"></conser-edit>
    </div>
  </a-modal>
</template>

<script>
import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
import ConserEdit from '@/views/conserResource/conserEdit'

export default {
  mixins: [JEditableTableMixin],
  components: {
    ConserEdit
  },
  props: {
    detailId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
        title: "资源关联编辑",
        refKeys: ['serviceOrderAttach' ],
        visible: true
    }
  },
  methods: {
    handleCancel(data) {
      this.$emit("closeDetail", data)
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