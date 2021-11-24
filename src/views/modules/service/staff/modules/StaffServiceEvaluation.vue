<template>
  <a-modal
    :visible="visible"
    title="评价"
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
      <a-form-model :model="fromData" ref="ruleForm" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row>
          <a-col :span="24">
            <a-form-model-item ref="orderScore" label="服务满意度评价" prop="orderScore">
              <a-rate v-model="fromData.orderScore" :tooltips="desc" style="color: red" />
              <span class="ant-rate-text">{{ desc[fromData.orderScore - 1] }}</span>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item ref="content" label="评价留言">
              <a-textarea
                v-model="fromData.content"
                rows="4"
                :maxLength="300"
                placeholder="请输入评价留言(有效长度1-300)"
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
      desc: ['1分', '2分', '3分', '4分', '5分'],
      fromData: {
        orderId: '',
        orderScore: 5,
        content: '',
      },
      url: '/system/serviceOrder/evaluateOrder',
    }
  },
  methods: {
    deal(orderId) {
      this.fromData = {
        orderId,
        orderScore: 5,
        content: '',
      }
      this.visible = true
    },
    handleOkConfirm() {
      this.confirmLoading = true
      postAction(this.url, this.fromData)
        .then((res) => {
          this.confirmLoading = false
          if (res.code === 200) {
            this.$message.success(res.message)
            this.visible = false
          } else {
            this.$message.warning(res.message)
          }
          this.$emit('closeLoad')
        })
        .finally(() => {
          this.confirmLoading = false
          return ''
        })
    },
    handleCancel() {
      this.visible = false
      this.$emit('closeLoad')
    },
  },
}
</script>