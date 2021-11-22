<template>
  <a-modal
    title="事件工单"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOkConfirm"
    @cancel="handleCancel"
    cancelText="关闭"
    okText="提交"
  >
    <a-spin :spinning="loading">
      <a-form-model
        :model="serviceOrderModel"
        ref="ruleForm"
        :rules="rules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-form-model-item ref="eventCatId" label="事件分类" prop="eventCatId">
          <a-tree-select
            style="width: 100%"
            v-model="serviceOrderModel.eventCatId"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            placeholder="请选择"
            :tree-data="categoryOptions"
            tree-default-expand-all
            :replace-fields="{ title: 'title', value: 'id', key: 'id', children: 'children' }"
            @change="changeCat"
          >
          </a-tree-select>
        </a-form-model-item>
        <a-form-model-item ref="reason" label="问题原因" prop="reason">
          <a-textarea
            v-model="serviceOrderModel.reason"
            :maxLength="300"
            placeholder="请输入问题原因(有效长度1-300)"
            @blur="
              () => {
                $refs.reason.onFieldBlur()
              }
            "
          />
        </a-form-model-item>
        <a-form-model-item ref="solution" label="解决方案" prop="solution">
          <a-textarea
            v-model="serviceOrderModel.solution"
            :maxLength="300"
            placeholder="请输入解决方案(有效长度1-300)"
            @blur="
              () => {
                $refs.solution.onFieldBlur()
              }
            "
          />
        </a-form-model-item>
        <!-- 子表单区域 -->
        <a-tabs v-model="activeKey" @change="handleChangeTabs">
          <a-tab-pane tab="服务工单附件" :key="refKeys[0]" :forceRender="true">
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
          </a-tab-pane>
        </a-tabs>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
import AListItem from 'ant-design-vue/es/list/Item'
import JEllipsis from '@/components/jeecg/JEllipsis.vue'
import JUpload from '@/components/jeecg/JUpload'
import { initDictOptions } from '@/components/dict/JDictSelectUtil'
import { postAction } from '@/api/manage'
import ATextarea from 'ant-design-vue/es/input/TextArea'
import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
import { FormTypes, getRefPromise, validateFormAndTables } from '@/utils/JEditableTableUtil'
import { validateTables, VALIDATE_NO_PASSED } from '@/utils/JEditableTableUtil'
export default {
  mixins: [JEditableTableMixin],
  components: {
    ATextarea,
    JUpload,
    JEllipsis,
    AListItem,
  },
  name: 'ServiceOrderFormFrontLine',
  props: ['formData', 'categoryOptions'],
  data() {
    return {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
      rules: {
        eventCatId: [{ required: true, message: '请选择事件分类', trigger: 'change' }],
        reason: [
          { required: true, message: '请输入问题原因', trigger: 'blur' },
          { max: 300, message: '最多300个字符', trigger: 'blur' },
        ],
        solution: [
          { required: true, message: '请输入解决方案', trigger: 'blur' },
          { max: 3500, message: '最多300个字符', trigger: 'blur' },
        ],
      },
      url: {
        upload: window._CONFIG['domianURL'] + '/sys/common/upload',
        resolveOrder: '/sys/event/resolveOrder',
      },
      fileList: [],
      headers: {},
      desc: {},
      serviceOrderModel: {
        eventCatId: '',
        eventCatFullName: '',
        reason: '',
        solution: '',
      },
      remarksDictOptions: [],
      loading: false,
      // 新增时子表默认添加几行空数据
      addDefaultRowNum: 1,
      refKeys: ['serviceOrderAttach'],
      tableKeys: ['serviceOrderAttach'],
      activeKey: 'serviceOrderAttach',
      // 服务工单附件
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
            width: '200px',
            placeholder: '请输入${title}',
            defaultValue: '',
          },
        ],
      },
    }
  },
  methods: {
    deal() {
      this.visible = true
      Object.keys(this.serviceOrderModel).forEach((item) => {
        this.serviceOrderModel[item] = this.formData[item]
      })
    },
    // 选项业务
    changeCat(value, label) {
      this.serviceOrderModel.eventCatFullName = label.join(' ')
    },
    // 提交
    handleOkConfirm() {
      const that = this
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.$confirm({
            title: '提示',
            content: '确认提交吗?',
            onOk: function () {
              that.okConfirm()
            },
          })
        } else {
          return false
        }
      })
    },
    // 提交
    okConfirm() {
      // 封装cases
      const that = this
      let cases = []
      cases.push(that.$refs[that.refKeys[0]])
      // 同时验证并获取多个实例的值
      validateTables(cases)
        .then((all) => {
          // all 是一个数组，每项都对应传入cases的下标，包含values和deleteIds
          that.confirmLoading = true
          const { id, version } = that.formData
          const data = {
            id,
            version,
            orderAttachList: all[0].values,
          }
          const params = Object.assign({}, that.serviceOrderModel, data)
          postAction(that.url.resolveOrder, params)
            .then((res) => {
              that.confirmLoading = false
              if (res.success) {
                if (res.success) {
                  that.$message.success(res.message)
                  that.$emit('complete')
                  that.close()
                } else {
                  that.$message.warning(res.message)
                }
              } else {
                that.$message.warning(res.message)
              }
            })
            .finally(() => {
              that.confirmLoading = false
            })
        })
        .catch((e = {}) => {
          // 判断表单验证是否未通过
          if (e.error === VALIDATE_NO_PASSED) {
            // 如果有未通过表单验证的子表，就自动跳转到它所在的tab
            this.activeKey = e.index == null ? this.activeKey : this.refKeys[e.index]
          }
        })
    },
  },
}
</script>
