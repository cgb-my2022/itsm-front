<template>
  <a-modal
    :visible="visible"
    :title="title"
    destroyOnClose
    :bodyStyle="bodyStyle"
    :width="600"
    :confirmLoading="confirmLoading"
    @ok="handleOkConfirm"
    @cancel="handleCancel"
    okText="提交"
    cancelText="取消"
  >
    <a-spin :spinning="confirmLoading" style="margin-top: 20px">
      <!-- 主表单区域 -->
      <a-form-model 
        :model="fromData" 
        :rules="rules"
        ref="ruleForm">
        <a-row>
          <a-col :span="24">
            <a-form-model-item 
            :labelCol="labelCol" 
            :wrapperCol="wrapperCol"
            ref="currentUserName" 
            label="选择审批人" 
            prop="currentUserName">
              <a-input
                v-model="fromData.currentUserName"
                placeholder="请选择"
                @click="handleSelect"/>
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </a-spin>
    <!-- 选择负责人 -->
    <change-role ref="changeRole" type='checkbox' @checkSuccess="checkRoleSuccess"></change-role>
  </a-modal>
</template>

<script>
import ChangeRole from './AddressList.vue'
export default {
  name: 'AlterationComplaint',
  components: { ChangeRole },
  data() {
    return {
      title: "",
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 },
      },
      visible: false,
      confirmLoading: false,
      bodyStyle: {
        padding: '0',
        'overflow-y': 'auto',
      },
      rules: {
        currentUserName: [
          { required: true, message: '请选择', trigger: 'change' },
        ]
      },
      fromData: {
        currentUserName: '',  //当前处理人员
        currentUserId: '',  //当前处理人员id
      },
      info: null
    }
  },
  methods: {
    add(title) {
      this.visible = true
      this.title = title
      this.info = null
      Object.keys(this.fromData).forEach(item => {
        this.fromData[item] = ''
      })
    },
    // 选择测试工单
    handleSelect(e) {
      e.srcElement.blur()
      this.$refs.changeRole.add('选择审批人', this.info)
    },
    // 选择人员完成
    checkRoleSuccess(value) {
      this.info = value
      this.fromData.currentUserId = value.ids.join(",")
      this.fromData.currentUserName = value.names.join(",")
    },
    handleOkConfirm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.handleCancel()
          this.$emit('ok', this.fromData)
        } else {
          return false
        }
      })
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>