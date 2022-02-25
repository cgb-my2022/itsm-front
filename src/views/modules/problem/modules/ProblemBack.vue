<template>
  <a-modal
    :visible="visible"
    title="退回"
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
            <a-form-model-item ref="remark" label="退回原因" prop="remark">
              <a-textarea
                v-model="fromData.remark"
                rows="4"
                :maxLength="300"
                placeholder="请输入(有效长度1-300)"
                @blur="
                  () => {
                    $refs.remark.onFieldBlur()
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
import { postAction } from '@/api/manage'
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
        remark: [
          { required: true, message: '请输入退回原因', trigger: 'blur' },
          { max: 300, message: '最多300个字符', trigger: 'blur' },
        ]
      },
      fromData: {
        id: '',
        version: '',
        remark: ''
      },
      url: '/sys/problem/confirmOrderUnresolved',
    }
  },
  methods: {
    deal(record) {
      this.fromData = {
        id: record.id,
        remark: '',
        version: record.version
      }
      this.visible = true
    },
    handleOkConfirm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.confirmLoading = true
          postAction(this.url, this.fromData)
            .then((res) => {
              this.confirmLoading = false
              if (res.success) {
                this.$message.success(res.message)
                this.visible = false
                this.$emit('ok')
              } else {
                this.$message.warning(res.message)
              }
            })
            .finally(() => {
              this.confirmLoading = false
              return ''
            })
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