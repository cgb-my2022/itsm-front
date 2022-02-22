<template>
  <a-modal
    title="任务办理"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :okButtonProps="{ props: { disabled: disableSubmit } }"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="取消"
    okText="提交"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <!-- 主表单区域 -->
        <a-row>
          <a-col :span="24">
            <a-form-item label="问题原因" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
              <a-textarea
                v-decorator="['reason', validatorRules.reason]"
                rows="4"
                placeholder="请输入(有效长度1-300)"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="解决方案" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
              <a-textarea
                v-decorator="['solution', validatorRules.solution]"
                rows="4"
                placeholder="请输入(有效长度1-300)"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="相关资源" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
              <a-button type="primary" @click="bindToSource">进入资源维护中心</a-button>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="关联变更" :labelCol="labelCol2" :wrapperCol="labelCol2">
              <div style="display: flex;width: 500px;">
                <a-input
                  autocomplete="off"
                  @click="handleSelect"
                  v-decorator="['currentUserName']"
                >
                </a-input>
                <a-button icon="search" @click="handleSelect">选择变更</a-button>
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="问题处理附件" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
              <j-editable-table
                :ref="refKeys[0]"
                :loading="serviceOrderAttachTable.loading"
                :columns="serviceOrderAttachTable.columns"
                :dataSource="serviceOrderAttachTable.dataSource"
                :maxRow="5"
                :maxFile="10"
                :showAction="false"
                :maxHeight="300"
                :rowNumber="true"
                :rowSelection="true"
                :actionButton="true"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import { mapState } from 'vuex'
import { FormTypes } from '@/utils/JEditableTableUtil'
import pick from 'lodash.pick'
import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
import JDictSelectTag from '@/components/dict/JDictSelectTag'
import ARow from 'ant-design-vue/es/grid/Row'
import { postAction } from '@/api/manage'

export default {
  name: 'ServiceOrderModal',
  mixins: [JEditableTableMixin],
  components: {
    ARow,
    JDictSelectTag,
  },
  props: {
    formData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      refKeys: ['serviceOrderAttach'],
      disableMixinCreated: true,
      disableSubmit: false,
      labelCol2: {
        xs: { span: 24 },
        sm: { span: 3 },
      },
      wrapperCol2: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
      validatorRules: {
        reason: {
          rules: [
            { required: true, message: '请输入问题原因', trigger: 'blur' },
            { max: 300, message: '最多300个字符', trigger: 'blur' },
          ],
        },
        solution: {
          rules: [
            { required: true, message: '请输入解决方案', trigger: 'blur' },
            { max: 300, message: '最多300个字符', trigger: 'blur' },
          ],
        },
      },
      url: {
        add: '/sys/problem/resolveOrder',
      },
      // 服务工单附件
      refKeys: ['serviceOrderAttach'],
      tableKeys: ['serviceOrderAttach'],
      activeKey: 'serviceOrderAttach',
      serviceOrderAttachTable: {
        loading: false,
        dataSource: [],
        columns: [
          {
            title: '附件地址',
            key: 'attachUrl',
            type: FormTypes.file,
            token: true,
            responseName: 'message',
            width: '100%',
            placeholder: '请输入${title}',
            defaultValue: '',
          },
        ],
      },
    }
  },
  computed: {
    ...mapState({
      // 发布知识权限
      knowledgeRelease: state => state.user.knowledgeRelease
    })
  },
  created() {},
  methods: {
    //  初始页面内容
    add() {
      this.visible = true
      this.form.resetFields()
    },
    // 提交
    request(formData) {
      let params = Object.assign({}, formData)
      params.id = this.formData.id
      params.version = this.formData.version
      this.confirmLoading = true
      postAction(this.url.add, params)
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message)
            if (this.knowledgeRelease) {
              this.$emit('knowledge')
            } else {
              this.$emit('complete')
            }
            this.close()
          } else {
            this.$message.warning(res.message)
          }
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    // 资源维护中心
    bindToSource() {
      this.$router.replace('/conserResource/conserResource')
    },
    handleSelect(e) {
      e.srcElement.blur()
      // this.$refs.selectSingleUserModal.select(3);
    }
  },
}
</script>
