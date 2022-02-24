<template>
  <a-modal
    :title="title"
    :width="600"
    :visible="visible"
    destroyOnClose
    :footer="null"
    @cancel="handleCancel"
  >
    <a-timeline  v-if="historyList && historyList.length > 0" class="time-line">
      <template v-for="(item, index) in historyList">
        <a-timeline-item :key="item.id">
          <!-- <a-icon slot="dot" type="clock-circle-o" style="font-size: 16px;" /> -->
          <p v-if="index === 0" slot="dot" class="record-dot">NEW</p>
          <div class="record-list">
            <div class="top">
              <p class="time">{{ item.createTime }}</p>
              <p class="status">{{ historyStatus[item.historyStatus] }}</p>
            </div>
            <div class="bottom">
              <p class="version">v{{ item.version }}</p>
              <div class="bottom_info">
                <p class="content">{{ historyPerson[item.historyStatus] }}：{{ item.createName }}</p>
                <template v-if="item.historyStatus === 2">
                  <p class="content">修改原因：{{ item.changeReason }}</p>
                  <p class="content" v-if="item.changeDesc">详细描述：{{ item.changeDesc }}</p>
                </template>
              </div>
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
    // 历史
    historyList: {
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
      historyStatus: ['知识提交', '知识发布', '知识修改', '知识退回'],
      historyPerson: ['提交人', '发布人', '修改人', '审批人']
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
.record-dot {
  font-size: 10px;
  color: #1890FF;
  border: 1px solid #1890FF;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  text-align: center;
  line-height: 30px;
  margin-bottom: 0px;
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
.record-list .bottom .bottom_info {
  display: flex;
  flex-direction: column;
}
</style>