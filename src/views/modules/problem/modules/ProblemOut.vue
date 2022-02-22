<template>
  <a-modal
    destroyOnClose
    title="指派"
    :width="600"
    :confirmLoading="confirmLoading"
    :visible="visible"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭">
      <a-spin :spinning="confirmLoading">
        <!-- 主表单区域 -->
        <a-form :form="form">
            <a-row>
              <a-col :span="24">
                <a-form-item label="处理人" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <div style="display:flex;">
                    <a-input
                      autocomplete="off"
                      @click="handleSelect"
                      placeholder="点击选择处理人"
                      v-decorator="['currentUserName', {
                        rules: [{ required: true, message: '请选择用户!' }]
                      }]">
                    </a-input>
                    <a-button icon="search" @click="handleSelect">选择</a-button>
                  </div>
                </a-form-item>
              </a-col>
            </a-row>
        </a-form>
      </a-spin>
    <select-user 
      ref="selectSingleUserModal" 
      :url="url.assignList" 
      :query="{id: rowInfo.id}"
      @selectFinished="selectUserOK">
    </select-user>
  </a-modal>
</template>

<script>
  import SelectUser from '@/views/modules/service/common/BizServiceSelectSingleUserModal.vue';
  import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
  import ARow from 'ant-design-vue/es/grid/Row' 
  import pick from 'lodash.pick'
  import { postAction } from '@/api/manage'

  export default {
    mixins: [JEditableTableMixin],
    components: { SelectUser, ARow },
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
        userData: {},
        url: {
          assignList: "/sys/problem/assignList", //处理人员列表
          assignOrder: "/sys/problem/assignOrder", //指派工单
        },
        rowInfo: {}
      }
    },
    methods: {
      deal(rowInfo) {
        this.rowInfo = rowInfo
        this.visible = true
      },
      handleCancel() {
        this.visible = false; 
      },
      handleOk(e) {
        e.preventDefault();
        this.form.validateFields((err, values) => {
          if (!err) {
            this.confirmLoading = true
            const params = {
              currentUserId: this.userData.id,
              id: this.rowInfo.id,
              version: this.rowInfo.version
            }
            postAction(this.url.assignOrder, params).then((res) => {
              if (res.success) {
                this.$message.success(res.message)
                this.$emit('ok')
                this.handleCancel()
              } else {
                this.$message.warning(res.message)
              }
            }).finally(() => {
              this.confirmLoading = false
            })
          }
        });
      },
      selectUserOK: function(data) {
        let fieldval = pick(this.model)
        fieldval.currentUserName = data.realname
        this.$nextTick(() => {
            this.form.setFieldsValue(fieldval)
        })
        this.userData = data;
      },
      handleSelect(e) {
        e.srcElement.blur()
        this.$refs.selectSingleUserModal.select(3);
      }
    }
  }
</script>
