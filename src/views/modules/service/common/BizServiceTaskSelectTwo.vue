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
                <a-form-item label="选择业务" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <!-- :disabled="this.rowInfo.orderType==2" -->
                  <a-cascader 
                    placeholder="请选择"  
                    :field-names="{ label: 'title', value: 'id', children: 'children' }"
                    :show-search="{ filter }"
                    v-decorator="['serviceCatIds', {
                        rules: [{ required: true, message: '请选择业务!' }]
                    }]"
                    :options="quickOptions" 
                    change-on-select 
                    expand-trigger="hover"
                    @change="catalogChange"/>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
                <a-col :span="24">
                  <a-form-item label="转二线处理原因" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                    <a-textarea 
                    v-decorator="['transferReason', {
                      rules: [{ required: true, message: '请输入转二线处理原因!' }]
                    }]"
                    placeholder="请输入转二线处理原因(有效长度1-300)"
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
  import { ServiceMixin } from '@/views/modules/service/mixins/ServiceMixin'
  import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
  import ARow from 'ant-design-vue/es/grid/Row'
  export default {
    mixins: [ServiceMixin, JEditableTableMixin],
    components: { ARow },
    name: 'BizServiceTaskSelectTwo',
    data() {
      return {
        disableSubmit: false,
        refKeys: ['serviceOrderAttach' ],
        addDefaultRowNum: 1,
        labelCol: {
          xs: { span: 24 },
          sm: { span: 6 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 }
        },
        labelCol2: {
          xs: { span: 24 },
          sm: { span: 6 }
        },
        wrapperCol2: {
          xs: { span: 24 },
          sm: { span: 18 }
        },
        rowInfo: {
          orderType: ""
        }
      }
    },
    created() {
      this.getCatalog(3)
    },
    methods: {
      handleCancel() {
        this.visible = false; 
      },
      handleOk(e) {
        e.preventDefault();
        this.form.validateFields((err, values) => {
          if (!err) {
            let rowInfo = JSON.parse(JSON.stringify(this.rowInfo))
            delete rowInfo.orderType
            rowInfo.transferReason = values.transferReason
            this.$emit('selectFinished', rowInfo);
            this.visible = false;
          }
        });
      },
      select(formData) {
        this.visible = true;
        this.rowInfo.orderType = formData.orderType
        this.showCatalog(formData)
      }
    }
  }
</script>
