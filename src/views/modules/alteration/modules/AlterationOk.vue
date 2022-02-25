<template>
  <a-modal
    :visible="visible"
    :title="title"
    destroyOnClose
    :bodyStyle="bodyStyle"
    :width="900"
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
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        ref="ruleForm">
        <a-row>
          <a-col :span="24">
            <a-form-model-item
              ref="remark"
              label="填写意见"
              prop="remark"
            >
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
          <a-col :span="24">
            <a-form-model-item label="相关资源">
              <a-table
                ref="table"
                bordered
                size="middle"
                rowKey="id"
                :columns="columns"
                :dataSource="dataSource"
              >
              </a-table>
              <a-button v-if="resourcesMaintain" type='primary' @click="bindToCenter">进入资源维护中心</a-button>
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
import { mapState } from 'vuex'
import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'

export default {
  name: 'AlterationComplaint',
  mixins: [JEditableTableMixin],
  props: ['formData', 'dataSource'],
  data() {
    return {
      title: '',
      labelCol: {
        xs: { span: 24 },
        sm: { span: 3 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
      visible: false,
      confirmLoading: false,
      bodyStyle: {
        padding: '0',
        'overflow-y': 'auto',
      },
      rules: {
        remark: [
          { required: true, message: '请输入内容', trigger: 'blur' },
          { max: 300, message: '最多300个字符', trigger: 'blur' },
        ],
      },
      fromData: {
        remark: ''
      },
      // 相关资源表头
      columns: [
        {
          title: '资源名称',
          dataIndex: 'name',
          ellipsis: true,
          align: 'center',
        },
        {
          title: '资源描述',
          align: 'center',
          ellipsis: true,
          dataIndex: 'describes',
        },
      ]
    }
  },
  computed: {
    ...mapState({
      // 资源维护权限
      resourcesMaintain: (state) => state.user.resourcesMaintain,
    })
  },
  methods: {
    add(title) {
      this.visible = true
      this.title = title
      Object.keys(this.fromData).forEach((item) => {
        this.fromData[item] = ''
      })
    },
    // 
    bindToCenter() {
      this.$router.push({
        path: "/conserResource/conserResource",
      })
    },
    // 提交
    handleOkConfirm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.handleCancel()
          this.$emit('ok', this.fromData.remark)
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