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
          <a-col :span="12">
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
          <a-col :span="24">
            <a-form-model-item 
            :labelCol="labelCol2" 
            :wrapperCol="wrapperCol2"
            ref="transferReason" 
            label="转办原因" 
            prop="transferReason">
              <a-textarea
                v-model="fromData.transferReason"
                rows="4"
                :maxLength="300"
                placeholder="请输入(有效长度1-300)"
                @blur="
                  () => {
                    $refs.transferReason.onFieldBlur()
                  }
                "
              />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </a-spin>
    <!-- 选择负责人 -->
    <change-role ref="changeRole" type='radio' @checkSuccess="checkRoleSuccess"></change-role>
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
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      labelCol2: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol2: {
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
          { required: true, message: '请选择', trigger: 'blur' },
        ],
        transferReason: [
          { required: true, message: '请输入内容', trigger: 'blur' },
          { max: 300, message: '最多300个字符', trigger: 'blur' },
        ]
      },
      fromData: {
        transferReason: '', // 转办原因
        currentUserName: '',  //当前处理人员
        currentUserId: '',  //当前处理人员id
      }
    }
  },
  methods: {
    add(title) {
      this.visible = true
      this.title = title
      Object.keys(this.fromData).forEach(item => {
        this.fromData[item] = ''
      })
    },
    // 选择测试工单
    handleSelect(e) {
      e.srcElement.blur()
      this.$refs.changeRole.add('选择审批人')
    },
    // 选择人员完成
    checkRoleSuccess(value) {
      this.fromData.currentUserId = value.ids.join(",")
      this.fromData.currentUserName = value.names.join(",")
      this.handleOkConfirm(2)
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