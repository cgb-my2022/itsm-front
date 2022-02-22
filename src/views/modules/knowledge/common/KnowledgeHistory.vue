<template>
  <a-modal
    :title="title"
    :width="600"
    :visible="visible"
    destroyOnClose
    :footer="null"
    @cancel="handleCancel"
  >
    <a-timeline  v-if="rowInfo && rowInfo.length > 0" class="time-line">
      <template v-for="item in rowInfo">
        <a-timeline-item :key="item.id">
          <div class="record-list">
            <div class="top">
              <p class="time">{{ item.createTime }}</p>
              <p class="status">{{ historyStatus[item.historyStatus] }}</p>
            </div>
            <div class="bottom">
              <p class="version">v{{ item.version }}</p>
              <p class="content">发布人：{{ item.createName }}</p>
            </div>
          </div>
        </a-timeline-item>
      </template>
    </a-timeline>
    <p v-else class="record-null">暂无流转记录</p>
  </a-modal>
</template>

<script>
export default {
  props: {
    // 详情内容
    rowInfo: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      disableSubmit: false,
      title: '',
      visible: false,
      bodyStyle: {
        paddingBottom: '70px',
        height: window.innerHeight - 200 + 'px',
        'overflow-y': 'auto',
      },
      historyStatus: ['知识提交', '知识发布', '知识修改', '知识退回']
    }
  },
  methods: {
    add() {
      this.visible = true
    },
    handleCancel() {
      this.visible = false
    },
  }
}
</script>

<style scoped>
/* 流转记录 */
.record-null {
  font-size: 16px;
  text-align: center;
  line-height: 30px;
  color: #000000;
}
.time-line {
  padding-left: 30px;
}
.record-list {
  margin-left: 12px;
}
.record-list div {
  display: flex;
  line-height: 20px;
}
.record-list .top {
  color: #1890FF;
}
.record-list .time,.version {
  /* width: 130px; */
  margin-right: 20px;
  /* text-align: right; */
  font-weight: bold;
}
.record-list .bottom .version{
  font-weight: bold;
}
</style>