<template>
  <a-modal
    title="常用知识设置确认"
    :width="450"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :okButtonProps="{ props: { disabled: disableSubmit } }"
    disableSubmit
    @ok="handleOkConfirm"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <a-spin :spinning="confirmLoading">
      <!-- 主表单区域 -->
      <a-form :form="form">
        <a-row :span="24">
          <p style="color: red;font-size: 16px;">以下为发布人设置的情况，请确认</p>
        </a-row>
        <a-row>
          <a-col :span="24">
            <a-form-item label="设为常用" :labelCol="labelCol1" :wrapperCol="wrapperCol1">
              <a-select
                v-decorator="[
                  'commonUse',
                  { 
                    initialValue: commonUse || 0, 
                    rules: [{ required: true, message: '请选择是否常用!' }]
                  },
                ]"
              >
                <a-select-option v-for="item in useOption" :key="item.id" :value="item.value">
                  {{ item.title }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :span="24">
          <p style="color: red;font-size: 16px;">温馨提示：常用知识将在系统首页展示，方便用户查阅</p>
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import { postAction, putAction } from '@/api/manage'
import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
import ARow from 'ant-design-vue/es/grid/Row'
import pick from 'lodash.pick'
export default {
  name: 'ServiceInfo',
  props: {
    commonUse: {
      type: Number,
    },
  },
  mixins: [JEditableTableMixin],
  components: { ARow },
  data() {
    return {
      disableSubmit: false,
      refKeys: ['serviceOrderAttach'],
      labelCol1: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol1: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
      disabled: false,
      addDefaultRowNum: 1,
      // 是否常用
      useOption: [
        { id: '1', title: '否', value: 0 },
        { id: '2', title: '是', value: 1 },
      ],
    }
  },
  methods: {
    /** 调用完edit()方法之后会自动调用此方法 */
    editAfter() {
      let fieldval = pick(this.model, 'commonUse')
      this.$nextTick(() => {
        this.form.setFieldsValue(fieldval)
      })
    },
    // 提交
    handleOkConfirm(e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          this.$emit("bindOk", values)
          this.visible = false
        }
      })
    }
  },
}
</script>