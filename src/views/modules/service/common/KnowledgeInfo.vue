<template>
  <a-modal
    :title="title"
    :width="1200"
    :visible="visible"
    :confirmLoading="confirmLoading"
    destroyOnClose
    :bodyStyle="bodyStyle"
    style="top: 0px"
    :footer="null"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <!-- 主表单区域 -->
      <a-form :form="form">
        <div class="title_info">
          <h2>知识信息</h2>
          <a-tag color="#87d068">草稿</a-tag>
        </div>
        <a-row>
          <a-col :span="24">
            <a-form-item label="关联服务" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
              <a-tree-select
                show-search
                style="width: 100%"
                v-decorator="['serviceCatId', { initialValue: rowInfo.serviceCatId }]"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                placeholder="请选择"
                allow-clear
                multiple
                :maxTagCount="4"
                :tree-data="serviceOptions"
                tree-default-expand-all
                :replace-fields="{ title: 'title', value: 'id', key: 'id', children: 'children' }"
                @change="changeService"
              >
              </a-tree-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="类型" :labelCol="labelCol1" :wrapperCol="wrapperCol1">
              <a-cascader
                placeholder="请选择"
                :field-names="{ label: 'title', value: 'id', children: 'children' }"
                v-decorator="[
                  'knowledgeCatIds', 
                  { 
                    initialValue: rowInfo.knowledgeCatIds, 
                    rules: validatorRules.knowledgeCatIds.rules
                  }
                ]"
                :options="knowledgeOptions"
                change-on-select
                expand-trigger="hover"
                @change="knowledgeChange"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="设为常用" :labelCol="labelCol1" :wrapperCol="wrapperCol1">
              <a-select
                v-decorator="[
                  'commonUse',
                  { initialValue: rowInfo.commonUse || 0, rules: validatorRules.commonUse.rules },
                ]"
              >
                <a-select-option v-for="item in useOption" :key="item.id" :value="item.value">
                  {{ item.title }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="标题" :labelCol="labelCol1" :wrapperCol="wrapperCol1">
              <a-input
                v-decorator="['title', { initialValue: rowInfo.title || '', rules: validatorRules.title.rules }]"
                :maxLength="32"
                placeholder="请输入标题(有效长度1-32)"
              >
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="关键词" :labelCol="labelCol1" :wrapperCol="wrapperCol1">
              <a-input
                v-decorator="[
                  'keyWords',
                  { initialValue: rowInfo.keyWords || ''},
                ]"
                :maxLength="30"
                placeholder="有效长度1-30，请用逗号隔开"
              >
              </a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <div class="title_info">
          <h2>知识内容</h2>
        </div>
        <a-row style="width: 100%">
          <a-col :span="24">
            <a-form-item :labelCol="labelColX1" :wrapperCol="wrapperColX1" label="知识明细" class="j-field-content">
              <j-editor
                v-decorator="[
                  'content',
                  { initialValue: rowInfo.content || contentDefault },
                ]"
                triggerChange
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item :labelCol="labelColX1" :wrapperCol="wrapperColX1" label="附件" class="j-field-content">
              <j-editable-table
                :ref="refKeys[0]"
                :loading="serviceOrderAttachTable.loading"
                :columns="serviceOrderAttachTable.columns"
                :dataSource="serviceOrderAttachTable.dataSource"
                :maxRow="10"
                :maxFile="100"
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
    <!-- 操作 -->
    <div
      class="box-bot"
      :style="{
        position: 'absolute',
        bottom: 0,
        borderTop: '1px solid #e9e9e9',
        padding: '10px 16px',
        background: '#fff',
        textAlign: 'left',
        zIndex: 99,
      }"
    >
      <a-space :size="8" align="center">
        <a-button v-if="rowInfo && rowInfo.createTime" @click="handleCancel()">取消</a-button>
        <a-button v-else v-loading="confirmLoading" @click="handleOkConfirm(0)">保存为草稿</a-button>
        <a-button v-loading="confirmLoading" @click="handleOkConfirm(1)" type="primary">{{rowInfo.createTime ? '提交' : '提交数据'}}</a-button>
      </a-space>
    </div>
  </a-modal>
</template>

<script>
import { FormTypes, getRefPromise, validateFormAndTables } from '@/utils/JEditableTableUtil'
import JEditor from '@/components/jeecg/JEditor.vue'
import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
import pick from 'lodash.pick'
import ARow from 'ant-design-vue/es/grid/Row'
import { postAction, putAction, getAction } from '@/api/manage'
import { getServiceCat } from '@/api/api'

export default {
  name: 'ServiceInfo',
  mixins: [JEditableTableMixin],
  components: { ARow, JEditor },
  data() {
    return {
      knowledgeOptions: [],  //知识类型
      serviceOptions: [], // 关联服务
      rowInfo: {},  //详情内容
      disableSubmit: false,
      bodyStyle: {
        paddingBottom: '70px',
        height: window.innerHeight - 200 + 'px',
        'overflow-y': 'auto',
      },
      labelCol1: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol1: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
      labelCol2: {
        xs: { span: 24 },
        sm: { span: 3 },
      },
      wrapperCol2: {
        xs: { span: 24 },
        sm: { span: 21 },
      },
      labelColX1: {
        xs: { span: 24 },
        sm: { span: 2 },
      },
      wrapperColX1: {
        xs: { span: 24 },
        sm: { span: 22 },
      },
      disabled: false,
      addDefaultRowNum: 1,
      urls: {
        knowledgeAdd: '/know/knowledgeManage/add', // 知识新增
        knowledgeEdit: '/know/knowledgeManage/edit', // 知识编辑
        treeList: '/know/knowledgeCat/treeList', // 分类查询
      },
      validatorRules: {
        knowledgeCatIds: {
          rules: [{ required: true, message: '请选择类型!' }],
        },
        commonUse: {
          rules: [{ required: true, message: '请选择是否常用!' }],
        },
        title: {
          rules: [{ required: true, message: '请输入标题！' }],
        },
        changeReason: {
          rules: [{ required: true, message: '请输入修改描述!' }],
        }
      },
      // 是否常用
      useOption: [
        { id: '2', title: '否', value: 0 },
        { id: '3', title: '是', value: 1 },
      ],
      contentDefault:
        '<p>【业务范围】</p>\n<p>&nbsp;</p>\n<p>【问题描述】</p>\n<p>&nbsp;</p>\n<p>【解决方案】</p>\n<p>&nbsp;</p>',
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
  watch: {
    rowInfo: {
      handler(newVal) {
        this.serviceOrderAttachTable.dataSource = newVal.attachment
        this.model.serviceCatNames =  newVal.serviceCatNames ? newVal.serviceCatNames.split(",") : ""
      },
      immediate: true,
    }
  },
  created() {
    this.initService()
    this.getTreeData()
  },
  methods: {
    initOptionsData(rowInfo) {
      this.rowInfo = rowInfo
    },
    // 初始化关联服务
    initService() {
      getServiceCat({ delFlag: 0, permissions: 2 }).then((res) => {
        if (res.success) {
          this.serviceOptions = res.result
        }
      })
    },
    // 知识类型
    getTreeData() {
      getAction(this.urls.treeList)
        .then((res) => {
          if (res.success) {
            this.knowledgeOptions = res.result
          }
        })
    },
    // 选项业务
    changeService(value, label) {
      this.model.serviceCatNames = label
    },
    // 选择知识类型
    knowledgeChange(value, selectedOptions) {
      const len = value.length
      let knowledgeCatName = ''
      if (len > 0) {
        selectedOptions.forEach((item, index) => {
          knowledgeCatName += item.catName
          if (index < len - 1) {
            knowledgeCatName += '/'
          }
        })
      }
      this.model.knowledgeCatName = knowledgeCatName
    },
    //清空知识明细
    clear() {
      this.$refs.editor.clear()
    },
    /** 调用完edit()方法之后会自动调用此方法 */
    editAfter() {
      let info = [
        'serviceCatId', //服务目录id
        'serviceCatNames', //服务目录名称集合
        'knowledgeCatIds', //知识目录id
        'knowledgeCatName', //知识目录名称
        'commonUse', // 是否常用(0->否 1->是)
        'title', // 标题
        'keyWords', //关键字(多个逗号分割)
        'content', //知识明细·
        'attachment', //附件
        'changeReason', //修改原因
        'changeDesc', //修改描述
      ]
      let fieldval = pick(this.model, ...info)
      this.$nextTick(() => {
        this.form.setFieldsValue(fieldval)
      })
    },
    getAllTable() {
      let values = this.tableKeys.map((key) => getRefPromise(this, key))
      return Promise.all(values)
    },
    /** 整理成formData */
    classifyIntoFormData(allValues) {
      let main = Object.assign(this.model, allValues.formValue)
      return {
        ...main, // 展开
        orderAttachList: allValues.tablesValue[0].values,
      }
    },
    /**
     * 提交
     * type: 0-草稿 1-提交
     */
    handleOkConfirm(type) {
      const that = this
      /** 触发表单验证 */
      that
        .getAllTable()
        .then((tables) => {
          /** 一次性验证主表和所有的次表 */
          return validateFormAndTables(that.form, tables)
        })
        .then((allValues) => {
          if (typeof that.classifyIntoFormData !== 'function') {
            throw that.throwNotFunction('classifyIntoFormData')
          }
          let formData = that.classifyIntoFormData(allValues)
          // 发起请求
          that.requestMethods(formData, type)
        })
        .catch((e) => {
          const VALIDATE_NO_PASSED = Symbol()
          if (e.error === VALIDATE_NO_PASSED) {
            // 如果有未通过表单验证的子表，就自动跳转到它所在的tab
            that.activeKey = e.index == null ? that.activeKey : that.refKeys[e.index]
          }
        })
    },
    requestMethods(formData, type) {
      this.confirmLoading = true
      // 所有参数
      let params = Object.assign({}, this.model, formData)
      // 类型
      params.status = type
      // 知识目录id
      const len = formData.knowledgeCatIds.length - 1
      params.knowledgeCatId = formData.knowledgeCatIds[len]
      params.knowledgeCatIds = formData.knowledgeCatIds.join(',')
      //  服务目录
      params.serviceCatNames = formData.serviceCatNames.join(',')
      params.serviceCatId = formData.serviceCatId.join(',')
      // 知识关联服务分类集合
      let knowledgeServiceCatRelateList = []
      if (formData.serviceCatId.length > 0) {
        formData.serviceCatId.forEach((item, index) => {
          knowledgeServiceCatRelateList.push({
            serviceCatId: item,
            serviceCatName: formData.serviceCatNames[index],
          })
        })
      }
      params.knowledgeServiceCatRelateList = knowledgeServiceCatRelateList
      // 附件
      params.attachment = JSON.stringify(formData.orderAttachList)
      if (this.rowInfo.id) {
        params.id = this.rowInfo.id
      }
      // 方法
      const axo = this.rowInfo.id ? putAction(this.urls.knowledgeEdit, params) : postAction(this.urls.knowledgeAdd, params)
      axo
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
    },
  },
}
</script>

<style lang="less" scoped>
.radio-txt {
  display: inline-block;
  margin-left: 10px;
  color: #fec7a0;
}
/deep/ .ant-tag {
  padding: 4px 14px;
  font-size: 14px;
}
.title_info {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding-bottom: 0.5em;
  margin-bottom: 10px;
  border-bottom: 1px solid #e8e8e8;
  h2 {
    font-size: 16px;
    font-weight: bold;
    padding-bottom: 0;
  }
}
.box-bot {
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  left: 0;
  right: 0;
}
</style>