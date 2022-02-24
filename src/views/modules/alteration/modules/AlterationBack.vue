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
        ref="ruleForm" 
        :label-col="labelCol" 
        :wrapper-col="wrapperCol">
        <a-row>
          <a-col :span="24">
            <a-form-model-item ref="reason" :label="title + '原因'" prop="reason">
              <a-textarea
                v-model="fromData.reason"
                rows="4"
                :maxLength="300"
                placeholder="请输入(有效长度1-300)"
                @blur="
                  () => {
                    $refs.reason.onFieldBlur()
                  }
                "
              />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
export default {
  name: 'AlterationBack',
  data() {
    return {
      title: "",
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      visible: false,
      confirmLoading: false,
      bodyStyle: {
        padding: '0',
        'overflow-y': 'auto',
      },
      rules: {
        reason: [
          { required: true, message: '请输入内容', trigger: 'blur' },
          { max: 300, message: '最多300个字符', trigger: 'blur' },
        ]
      },
      fromData: {
        reason: ''
      }
    }
  },
  methods: {
    add(title) {
      this.visible = true
      this.title = title
    },
    handleOkConfirm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.handleCancel()
          this.$emit('ok', this.fromData.reason)
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