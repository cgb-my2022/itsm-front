<template>
  <a-modal
    title="移动到"
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
        <a-row>
          <a-col :span="24">
            <a-form-item label="目录名称" :labelCol="labelCol1" :wrapperCol="wrapperCol1">
              <a-cascader
                v-decorator="[
                  'knowledgeCatIds',
                  {
                    rules: [{ required: true, message: '请选择目录名称' }],
                  },
                ]"
                placeholder="请选择"
                :field-names="{ label: 'title', value: 'id', children: 'children' }"
                :show-search="{ filter }"
                :options="gData"
                change-on-select
                expand-trigger="hover"
                @change="serviceChange"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import { postAction } from '@/api/manage'
import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
import ARow from 'ant-design-vue/es/grid/Row'
import pick from 'lodash.pick'
export default {
  name: 'ServiceInfo',
  props: {
    // 知识目录
    gData: {
      type: Array,
    },
    // 移动的知识id
    manageIds: {
      type: Array,
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
      urls: {
        batchMove: '/know/knowledgeManage/batchMove', // 知识后台管理-批量移动
      },
      knowledgeCatId: null,
      knowledgeCatName: null
    }
  },
  methods: {
    /** 调用完edit()方法之后会自动调用此方法 */
    editAfter() {
      let fieldval = pick(this.model, 'knowledgeCatIds')
      this.$nextTick(() => {
        this.form.setFieldsValue(fieldval)
      })
    },
    // 过滤服务目录
    filter(inputValue, path) {
      return path.some((option) => option.title.toLowerCase().indexOf(inputValue.toLowerCase()) > -1)
    },
    // 搜索change
    serviceChange(value, selectedOptions) {
      const len = value.length
      let knowledgeCatName = '', knowledgeCatId = ''
      if (len > 0) {
        selectedOptions.forEach((item, index) => {
          knowledgeCatName += item.catName
          if (index < len - 1) {
            knowledgeCatName += '/'
          }
        })
        knowledgeCatId = value[len - 1]
      }
      this.knowledgeCatId = knowledgeCatId
      this.knowledgeCatName = knowledgeCatName
    },
    // 提交
    handleOkConfirm(e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          this.confirmLoading = true
          let params = []
          this.manageIds.forEach(item => {
            params.push({
              id: item,
              knowledgeCatId: this.knowledgeCatId,
              knowledgeCatName: this.knowledgeCatName
            })
          })
          postAction(this.urls.batchMove, params)
            .then((res) => {
              this.confirmLoading = false
              if (res.success) {
                this.visible = false
                this.$emit('closeLoad')
              } else {
                this.$message.warning(res.message)
              }
            })
            .finally(() => {
              this.confirmLoading = false
              return ''
            })
        }
      })
    }
  }
}
</script>