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
                <a-form-item label="用户名" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <div style="display:flex;">
                    <a-input
                      disabled
                      placeholder="点击选择用户"
                      v-decorator="['userName', {
                        rules: [{ required: true, message: '请选择用户!' }]
                      }]">
                    </a-input>
                    <a-button icon="search" @click="handleSelect">选择</a-button>
                  </div>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
                <a-col :span="24">
                  <a-form-item label="转办原因" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                    <a-textarea 
                    v-decorator="['transferReason', {
                      rules: [{ required: true, message: '请输入转办原因!' }]
                    }]"
                    :maxLength="300"
                    rows="4" 
                    placeholder="请输入转办原因(有效长度1-300)"/>
                  </a-form-item>
                </a-col>
            </a-row>
        </a-form>
      </a-spin>
    <biz-service-select-single-user-modal ref="selectSingleUserModal" @selectFinished="selectUserOK"></biz-service-select-single-user-modal>
  </a-modal>
</template>

<script>
  import BizServiceSelectSingleUserModal from '@/views/modules/service/common/BizServiceSelectSingleUserModal.vue';
  import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
  import ARow from 'ant-design-vue/es/grid/Row'
  import pick from 'lodash.pick'
  export default {
    mixins: [JEditableTableMixin],
    components: { BizServiceSelectSingleUserModal, ARow },
    name: 'BizServiceTaskSelectEntrusterModal',
    data() {
      return {
        disableSubmit: false,
        refKeys: ['serviceOrderAttach' ],
        addDefaultRowNum: 1,
        labelCol: {
          xs: { span: 24 },
          sm: { span: 4 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 }
        },
        labelCol2: {
          xs: { span: 24 },
          sm: { span: 4 }
        },
        wrapperCol2: {
          xs: { span: 24 },
          sm: { span: 20 }
        },
        userData: {}
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
            let params = JSON.parse(JSON.stringify(values));
            params.currentUserId = this.userData.id;
            this.$emit('ok', params, 'supportTranslate');
            this.visible = false;
          }
        });
      },
      selectUserOK: function(data) {
        let fieldval = pick(this.model)
        fieldval.userName = data.realname
        this.$nextTick(() => {
            this.form.setFieldsValue(fieldval)
        })
        this.userData = data;
      },

      deal() {
        this.visible = true;
      },
      handleSelect: function() {
        this.$refs.selectSingleUserModal.select(1);
      }
    }
  }
</script>
