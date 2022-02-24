<template>
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
    <a-spin :spinning="confirmLoading">
      <a-row type="flex" :gutter="16">
        <a-col :md="5" :sm="24">
          <address-list-left v-model="currentOrgCode" />
        </a-col>
        <a-col :md="24 - 5" :sm="24">
          <address-list-right 
          v-model="currentOrgCode" 
          :selectedDefault="selectedDefault"
          :type="type"
          @chechRows="chechRows"/>
        </a-col>
      </a-row>
    </a-spin>
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
import AddressListLeft from './AddressListLeft'
import AddressListRight from './AddressListRight'

export default {
  name: 'AddressList',
  components: { AddressListLeft, AddressListRight },
  props: ['type'],
  data() {
    return {
      description: '通讯录页面',
      currentOrgCode: '',
      selectedInfo: null,  //选择的内容
      selectedDefault: [],  //默认选中
      visible: false,
      confirmLoading: false,
      title: "选择审批人",
      bodyStyle: {
        paddingBottom: '70px',
        height: window.innerHeight - 200 + 'px',
        'overflow-y': 'auto',
      },
    }
  },
  methods: {
    add(title, selectedDefault) {
      this.title = title
      this.visible = true
      this.selectedDefault = selectedDefault ? selectedDefault : []
    },
    handleCancel() {
      this.visible = false
    },
    chechRows(list) {
      this.selectedInfo = list
      this.selectedDefault = list ? list.ids : []
    },
    handleOkConfirm() {
      if (!this.selectedInfo) {
        this.$message.warning("请" + this.title)
        return
      }
      this.visible = false
      this.$emit("checkSuccess", this.selectedInfo)
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
.box-bot {
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  left: 0;
  right: 0;
}
</style>