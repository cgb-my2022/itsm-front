<template>
  <a-modal
    destroyOnClose
    :title="title"
    :width="600"
    :visible="visible"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭">
      <a-spin :spinning="confirmLoading">
        <!-- 主表单区域 -->
        <a-form :form="form">
            <a-row>
                <a-col :span="24">
                  <a-form-item label="挂起原因" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                    <a-textarea 
                    v-decorator="['pendingReason', {
                      rules: [{ required: true, message: '请输入挂起原因!' }]
                    }]"
                    placeholder="请输入挂起原因(有效长度1-300)"
                    :maxLength="300"
                    rows="4"/>
                  </a-form-item>
                </a-col>
            </a-row>
        </a-form>
      </a-spin>

  </a-modal>
</template>

<script>
  import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
  import ARow from 'ant-design-vue/es/grid/Row'
  export default {
    mixins: [JEditableTableMixin],
    components: { ARow },
    name: 'BizServiceTaskSelectTwo',
    data() {
      return {
        disableSubmit: false,
        refKeys: ['serviceOrderAttach' ],
        addDefaultRowNum: 1,
        labelCol2: {
          xs: { span: 24 },
          sm: { span: 4 }
        },
        wrapperCol2: {
          xs: { span: 24 },
          sm: { span: 20 }
        }
      }
    },
    methods: {
      handleCancel() {
        this.visible = false; 
      },
      handleOk(e) {
        e.preventDefault();
        this.form.validateFields((err, values) => {
          if (!err) {
            this.$emit('ok', values, 'supportPending');
            this.visible = false;
          }
        });
      },
      deal() {
        this.visible = true;
      }
    }
  }
</script>
