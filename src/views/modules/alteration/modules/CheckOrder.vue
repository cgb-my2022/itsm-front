<template>
  <!-- 选择工单 -->
  <a-modal
    :visible="visible"
    :title="title"
    :width="1000"
    destroyOnClose
    :bodyStyle="bodyStyle"
    style="top: 0px"
    :footer="null"
    @cancel="handleCancel"
  >
    <order-list
      :queryParams="queryParam"
      :serviceType="serviceType"
      :selectedDefault="selectedInfo"
      @chechRows="chechRows"> 
    </order-list>
    <!-- 操作 -->
    <div
      class="box-bot"
      :style="{
        position: 'absolute',
        bottom: 0,
        borderTop: '1px solid #e9e9e9',
        padding: '10px 16px',
        background: '#fff',
        textAlign: 'left',
        zIndex: 99,
      }"
    >
      <a-space :size="8" align="center">
        <a-button @click="handleCancel()">取消</a-button>
        <a-button v-loading="confirmLoading" type="primary" @click="handleOkConfirm()">确定</a-button>
      </a-space>
    </div>
  </a-modal>
</template>

<script>
import OrderList from './OrderList.vue'
export default {
  name: 'CheckOrder',
  props: {
    // 是否显示选择业务
    serviceType: {
      type: Number,
      default: 1
    }
  },
  components: { OrderList },
  data() {
    return {
      queryParam: {},  //搜锁条件
      selectedInfo: [], //选择的内容
      visible: false,
      confirmLoading: false,
      title: '选择工单',
      bodyStyle: {
        paddingBottom: '70px',
        height: window.innerHeight - 200 + 'px',
        'overflow-y': 'auto',
      },
    }
  },
  methods: {
    add(title, queryParam, selectedDefault) {
      this.title = title
      this.visible = true
      this.queryParam = queryParam
      this.selectedInfo = selectedDefault ? selectedDefault : []
    },
    handleCancel() {
      this.visible = false
    },
    chechRows(list) {
      this.selectedInfo = list
    },
    handleOkConfirm() {
      if (!this.selectedInfo) {
        this.$message.warning('请' + this.title)
        return
      }
      this.visible = false
      this.$emit('checkSuccess', this.selectedInfo)
    },
  },
}
</script>

<style scoped>
  .box-bot {
    display: flex;
    justify-content: center;
    box-sizing: border-box;
    left: 0;
    right: 0;
  }
</style>