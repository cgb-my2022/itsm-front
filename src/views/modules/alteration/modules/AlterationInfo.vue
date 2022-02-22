<template>
  <a-modal
    title="新增变更"
    :width="1000"
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
            <a-form-item label="所属业务" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
              <a-input
                v-model="businessInfo.businessFullName"
                :disabled="true"
              ></a-input>
            </a-form-item>
          </a-col> 
        </a-row>
        <a-row>
          <a-col :xs="24" :sm="12">
            <a-form-item label="变更类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-select placeholder="请选择" v-decorator="['problemSource', validatorRules.problemSource]">
                <a-select-option v-for="item in typeOptions" :key="item.value" :value="item.value">
                  <span style="display: inline-block; width: 100%" :title="item.text">
                    {{ item.text}}
                  </span>
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :xs="24" :sm="12">
            <a-form-item label="是否需要测试" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-radio-group
                name="radioGroup"
                v-decorator="[
                  'problemLevel',
                  { initialValue: 1, rules: validatorRules.problemLevel.rules },
                ]"
              >
                <a-radio :value="1">是</a-radio>
                <a-radio :value="0">否</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24">
            <a-form-item label="变更标题" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
              <a-input
                v-decorator="['problemTitle', validatorRules.problemTitle]"
                :maxLength="50"
                placeholder="请输入(有效长度1-50)"
              ></a-input>
            </a-form-item>
          </a-col>     
          <a-col :span="24">
            <a-form-item label="变更描述" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
              <a-textarea 
                :maxLength="300" 
                v-decorator="['problemDesc', validatorRules.problemDesc]" 
                rows="4" 
                placeholder="请输入(有效长度1-300)" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="申请人" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input
                v-model="userInfo.realname"
                :disabled="true"
                placeholder="申请人"
              ></a-input>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="所属部门" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input
                v-model="userInfo.myDeptParentNames"
                :disabled="true"
                placeholder="请选择"
              ></a-input>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="申请人电话" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input
                v-decorator="['phoneNo', { initialValue: userInfo.phone, rules: validatorRules.phoneNo.rules }]"
                :maxLength="16"
                placeholder="请输入"
              ></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="变更附件" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
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
import { FormTypes } from '@/utils/JEditableTableUtil'
import pick from 'lodash.pick'
import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
import JDictSelectTag from '@/components/dict/JDictSelectTag'
import ARow from 'ant-design-vue/es/grid/Row'
import { postAction } from '@/api/manage'
import { mapGetters } from 'vuex'

export default {
  name: 'ServiceOrderModal',
  mixins: [JEditableTableMixin],
  components: {
    ARow,
    JDictSelectTag
  },
  props: {
    
  },
  data() {
    return {
      refKeys: ['serviceOrderAttach'],
      disableMixinCreated: true,
      disableSubmit: false,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      labelCol2: {
        xs: { span: 24 },
        sm: { span: 3 },
      },
      wrapperCol2: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
      validatorRules: {
        problemSource: {
          rules: [{ required: true, message: '请选择变更来源!' }],
        },
        problemCatIds: {
          rules: [{ required: true, message: '请选择变更分类!' }],
        },
        problemLevel: {
          rules: [{ required: true, message: '请选择是否需要测试！' }]
        },
        phoneNo: {
          rules: [{ required: true, message: '请输入办公电话！' }],
        },
        problemTitle: {
          rules: [{ required: true, message: '请输入变更标题!' }],
        },
        problemDesc: {
          rules: [{ required: true, message: '请输入变更描述!' }],
        }
      },
      url: {
        add: '/sys/problem/addAndSubmit'
      },
      fromData: {
        problemCatId: '',  //变更分类id
        problemCatFullName: '', //变更分类全名称
        eventCatFullName: '',  //事件分类名称
      },
      businessInfo: {
        businessFullName: ''
      },
      typeOptions: [],  //变更类型 
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
      }
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
  },
  created() {
    // 变更来源
    this.initDictData('problem_source', 'typeOptions')  
  },
  methods: {
    //  初始页面内容
    add(businessInfo) {
      this.businessInfo = businessInfo
      this.visible = true
      this.form.resetFields()
      Object.keys(this.fromData).forEach(item => {
        this.fromData[item] = ""
      })
    },
    // 选择变更分类
    serviceChange(value, label) {
      let problemCatId = '', problemCatFullName = []
      if (value.length > 0) {
        problemCatId = value[value.length - 1]
        label.forEach(item => {
          problemCatFullName.push(item.title)
        })
      }
      this.fromData.problemCatId = problemCatId
      this.fromData.problemCatFullName = problemCatFullName.join("/")
    },
    // 提交
    request(formData) {
      let params = Object.assign({}, formData, this.fromData)
      params.problemCatIds = JSON.stringify(formData.problemCatIds)
      // 所属部门
      params.sysOrgCode = this.userInfo.orgCode
      params.deptName = this.userInfo.myDeptParentNames
      this.confirmLoading = true
      postAction(this.url.add, params).then((res) => {
        if (res.success) {
          this.$message.success(res.message)
          this.$emit('ok')
          this.close()
        } else {
          this.$message.warning(res.message)
        }
      }).finally(() => {
        this.confirmLoading = false
      })
    },
    /** 调用完edit()方法之后会自动调用此方法 */
    editAfter() {
      let fieldval = pick(
        this.model,
        'realName',
        'phoneNo',
        'deptName'
      )
      this.$nextTick(() => {
        this.form.setFieldsValue(fieldval)
      })
    }
  }
}
</script>

<style scoped>
.des-catalog {
  font-size: 12px;
}
.query-group-cust {
  width: 100%;
}
.col-item >>> .ant-form-item-label > label {
  color: #fff;
}
</style>
