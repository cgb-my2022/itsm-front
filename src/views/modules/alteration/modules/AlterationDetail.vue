<template>
  <!-- 弹出框 -->
  <a-modal
    :visible="visible"
    :title="title"
    width="900px"
    destroyOnClose
    :bodyStyle="bodyStyle"
    style="top: 0px"
    :footer="null"
    @cancel="handleCancel"
  >
    <!-- 表单内容 -->
    <a-spin :spinning="confirmLoading">
      <div style="margin-top: 5px">
        <staff-service-order-form
          :formData="formData"
          :stringSource="stringSource"
          :changeType="changeType"
          :dictStatus="dictStatus"
        ></staff-service-order-form>
      </div>
    </a-spin>
    <!-- 审批操作 -->
    <template v-if="showBtns">
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
          <a-button @click="bindAdd('alterationOk', '同意')" type="primary">同意</a-button>
          <a-button @click="bindAdd('alterationCancel', '驳回')" style="background: orange; color: #ffffff">驳回</a-button>
          <a-button @click="bindAdd('alterationComplaint', '转办')" type="primary">转办</a-button>
          <a-button @click="bindAdd('changeRole', '选择审批人')" type="primary">加签</a-button>
        </a-space>
      </div>
      <!-- 同意 -->
      <alteration-ok ref="alterationOk" :formData="formData" :dataSource="dataSource" @ok="handleOk"></alteration-ok>
      <!-- 驳回 -->
      <alteration-back ref="alterationCancel" @ok="handleCancelOk"></alteration-back>
      <!-- 加签 -->
      <change-role ref="changeRole" type='checkbox' @checkSuccess="checkRoleSuccess"></change-role>
      <!-- 转办 -->
      <alteration-complaint ref="alterationComplaint" @ok="handleComplaintOk"></alteration-complaint>
    </template>
    <!-- 详情操作 -->
    <template v-if="source === 1">
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
        <a-space v-if="formData.orderStatus == 11 || formData.orderStatus == 12" :size="8" align="center">
          <a-button @click="bindDel()" type="primary">删除</a-button>
          <a-button @click="bindEdit()" type="primary">编辑</a-button>
        </a-space>
        <a-space v-else-if="formData.orderStatus == 2 && formData.backStatus === 1" :size="8" align="center">
          <a-button @click="bindAdd('alterationBack', '撤回')" type="primary">撤回</a-button>
        </a-space>
      </div>
      <!-- 撤回 -->
      <alteration-back ref="alterationBack" @ok="bindBackOK"></alteration-back>
    </template>
  </a-modal>
</template>

<script>
import { mapGetters } from 'vuex'
import { putAction, postAction, getAction, deleteAction } from '@/api/manage'
import StaffServiceOrderForm from './StaffServiceOrderForm'
import ATextarea from 'ant-design-vue/es/input/TextArea'
import AlterationOk from './AlterationOk'
import AlterationComplaint from './AlterationComplaint'
import AlterationBack from './AlterationBack.vue'
import ChangeRole from './AddressList.vue'

export default {
  name: 'ServiceTaskDealModal',
  props: {
    // 页面标识  1：我的问题 2：问题列表 3：问题办理
    source: {
      type: Number,
      default: 1,
    },
    // 工单状态
    dictStatus: {
      type: Array,
    },
    // 变更类型
    changeType: {
      type: Array,
    }
  },
  components: {
    ATextarea,
    StaffServiceOrderForm,
    AlterationOk,
    AlterationComplaint,
    AlterationBack,
    ChangeRole
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  data() {
    return {
      confirmAction: '1',
      ModalText: '',
      model: {
        id: '',
        transferReason: '',
        frontPendingReason: '',
        supportPendingReason: '',
        remark: '',
        businessType: 1,
      },
      formData: {},
      loading: false,
      title: '详情',
      visible: false,
      confirmLoading: false,
      confirmLoading4: false,
      confirmLoading3: false,
      currTask: {},
      bodyStyle: {
        paddingBottom: '70px',
        height: window.innerHeight - 200 + 'px',
        'overflow-y': 'auto',
      },
      iframeUrl: '',
      url: {
        moreInfo: '/sys/change/moreInfo', //详情
        getResourceListById: 'cmdb/resource/getResourceListById', //获取关联资源
        removeOrder: '/sys/change/removeOrder/', //删除工单
        backOrder: '/sys/change/backOrder', //撤回工单
        agreeOrder: '/sys/change/agreeOrder', //同意工单
        rejectOrder: '/sys/change/rejectOrder', //驳回工单
        delegateOrder: '/sys/change/delegateOrder',  //转办工单
        signOrder: '/sys/change/signOrder',  //加签工单
      },
      rowId: null,  // 详情id
      type: 1,
      showBtns: false,   //是否可以显示办理按钮
      dataSource: [],   //相关资源
      stringSource: ""
    }
  },
  methods: {
    // 根据id初始化数据
    deal(id, title, type) {
      this.confirmLoading = true
      this.title = title
      this.rowId = id
      this.type = type
      this.getDetail()
    },
    // 获取详情
    getDetail() {
      getAction(this.url.moreInfo, { id: this.rowId }).then((res) => {
        this.confirmLoading = false
        if (res.code === 200) {
          let result = res.result
          Object.keys(result.changeOrder).forEach((item) => {
            result[item] = result.changeOrder[item]
          })
          delete result.changeOrder
          this.formData = result
          this.visible = true
          // 判断是否有办理按钮
          this.setManage(result)
          this.getResources()
        }
      })
    },
    // 获取相关资源
    getResources() {
      getAction(this.url.getResourceListById, { id: this.formData.createBy })
        .then((res) => {
          if (res.result) {
            let result = res.result
            let stringSource = []
            if(result.length > 0) {
              result.forEach(item => {
                stringSource.push(item.name)
              })
            }
            this.dataSource = result
            this.stringSource = stringSource.join(",")
          }
        })
    },
    setManage(text) {
      const id =  this.userInfo.id
      const signUserIds = text.signUserIds ? text.signUserIds.split(",") : []
      if (text.orderStatus != 2) return false
      if (text.currentUserId != id) {
        if (text.signNum == 0) {
          return false
        }
        if (text.signNum != 0 && signUserIds.indexOf(this.userInfo.id) === -1) {
          return false
        }
      }
      this.setShowBtns(text)
    },
    // 是否显示操作按钮
    setShowBtns(text) {
      let showBtns = false
      if (this.source === 2 && text.orderStatus == 2) {
        // 可点击
        // 1.加签数量( signNum) = 0  当前处理人员id(currentUserId) = 当前用户id
        // 2.加签数量( signNum) != 0 signUserIds最后一位当前用户id
        let signUserIds = text.signUserIds ? text.signUserIds.split(",") : null
        if (text.signNum == 0 && text.currentUserId == this.userInfo.id) {
          showBtns = true
        }
        if (text.signNum != 0) {
          if (signUserIds && signUserIds[signUserIds.length - 1] == this.userInfo.id) {
            showBtns = true
          }  
        }
      }
      this.showBtns = showBtns
    },
    // 删除
    bindDel() {
      const that = this
      that.$confirm({
        title: '删除提示',
        content: '确定删除该列表？删除后不可恢复。',
        onOk: function () {
          deleteAction(that.url.removeOrder + that.rowId)
            .then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.handleDataReload()
              } else {
                that.$message.error(res.message)
              }
            })
        }
      })
    },
    // 编辑
    bindEdit() {
      this.visible = false
      this.$emit('edit', this.formData)
    },
    bindAdd(ref, title) {
      if (this.confirmLoading) return
      this.$refs[ref].add(title)
    },
    // 选择人员完成
    checkRoleSuccess(value) {
      if (this.confirmLoading) return
      this.confirmLoading = true
      let params = {
        id: this.rowId,
        version: this.formData.version,
        signUserIdList: value.ids,
      }
      postAction(this.url.signOrder, params)
        .then((res) => {
          this.confirmLoading = false
          if (res.success) {
            this.$message.success(res.message)
            this.handleDataReload()
          } else {
            this.$message.error(res.message)
          }
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    // 驳回
    handleCancelOk(value) {
      let params = {
        id: this.rowId,
        version: this.formData.version,
        remark: value,
      }
      postAction(this.url.rejectOrder, params)
        .then((res) => {
          this.confirmLoading = false
          if (res.success) {
            this.$message.success(res.message)
            this.handleDataReload()
          } else {
            this.$message.error(res.message)
          }
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    // 撤回
    bindBackOK(value) {
      let params = {
        id: this.rowId,
        version: this.formData.version,
        backReason: value,
      }
      postAction(this.url.backOrder, params)
        .then((res) => {
          this.confirmLoading = false
          if (res.success) {
            this.$message.success(res.message)
            this.handleDataReload()
          } else {
            this.$message.error(res.message)
          }
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    // 转办
    handleComplaintOk(value) {
      let params = {
        id: this.rowId,
        version: this.formData.version,
        transferReason: value.transferReason,
        currentUserId: value.currentUserId
      }
      postAction(this.url.delegateOrder, params)
        .then((res) => {
          this.confirmLoading = false
          if (res.success) {
            this.$message.success(res.message)
            this.handleDataReload()
          } else {
            this.$message.error(res.message)
          }
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    // 同意
    handleOk(values) {
      const { id, version } = this.formData
      const params = {
        id: this.formData.id,
        version: this.formData.version,
        agreeRemark: values
      }
      postAction(this.url.agreeOrder, params)
        .then((res) => {
          this.confirmLoading = false
          if (res.success) {
            this.$message.success(res.message)
            this.handleDataReload()
          } else {
            this.$message.error(res.message)
          }
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    handleDataReload() {
      this.$emit('ok')
      this.visible = false
    },
    handleCancel() {
      this.visible = false
    }
  }
}
</script>

<style  lang="less" scoped>
.ant-tabs-left-content {
  padding-top: 10px !important;
}
/** Button按钮间距 */
.ant-btn {
  margin-left: 3px;
}
.box-bot {
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  left: 0;
  right: 0;
}
</style>
