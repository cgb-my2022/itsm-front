<template>
  <a-modal
    :visible="visible"
    title="暂挂"
    destroyOnClose
    :bodyStyle="bodyStyle"
    :width="600"
    :confirmLoading="confirmLoading"
    @ok="handleOkConfirm"
    @cancel="handleCancel"
    cancelText="关闭"
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
            <a-form-model-item ref="pendingReason" label="暂挂原因" prop="pendingReason">
              <a-textarea
                v-model="fromData.pendingReason"
                rows="4"
                :maxLength="300"
                placeholder="请输入暂挂原因(有效长度1-300)"
                @blur="
                  () => {
                    $refs.pendingReason.onFieldBlur()
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
  name: 'StaffServiceEvaluation',
  data() {
    return {
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
        pendingReason: [
          { required: true, message: '请输入暂挂原因', trigger: 'blur' },
          { max: 300, message: '最多300个字符', trigger: 'blur' },
        ]
      },
      fromData: {
        id: '',
        version: '',
        pendingReason: ''
      },
    }
  },
  methods: {
    add(record) {
      this.fromData = {
        id: record.id,
        pendingReason: '',
        version: record.version
      }
      this.visible = true
    },
    handleOkConfirm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.$emit('ok', this.fromData, 'pending', 1)
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