<template>
  <a-modal
    :visible="visible"
    :title="title"
    width="900px"
    destroyOnClose
    :bodyStyle="bodyStyle"
    style="top: 0px"
    :footer="null"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <!-- 主表单区域 -->
        <a-row>
          <a-col :span="24">
            <a-form-item label="所属业务" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
              <a-input
                v-model="businessInfo.changeCatFullName"
                :disabled="true"
              ></a-input>
            </a-form-item>
          </a-col> 
        </a-row>
        <a-row>
          <a-col :xs="24" :sm="12">
            <a-form-item label="变更类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-select 
                placeholder="请选择" 
                v-decorator="['changeType', { initialValue: fromData.changeType, rules: validatorRules.changeType.rules }]"
                @change="bindChangeType">
                <a-select-option v-for="item in changeOptions" :key="item.value" :value="item.value">
                  <span style="display: inline-block; width: 100%" :title="item.text">
                    {{ item.text}}
                  </span>
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row v-if="businessInfo.changeType != 2">
          <a-col :xs="24" :sm="12">
            <a-form-item label="是否需要测试" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-radio-group
                name="radioGroup"
                v-model="businessInfo.changeTest"
              >
                <a-radio :value="1">是</a-radio>
                <a-radio :value="0">否</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col v-if="businessInfo.changeTest === 1" :span="24">
            <a-form-item class="change_order" label="关联测试工单" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
              <a-input
                v-decorator="['changeOrderIds', { initialValue: businessInfo.changeOrderIds, rules: validatorRules.changeOrderIds.rules }]"
                placeholder="输入测试工单账号(用英文,号隔开)"
                @click="handleSelect"
              ></a-input>
              <a-button type="primary" @click="handleSelect">选择</a-button>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24">
            <a-form-item label="变更标题" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
              <a-input
                v-decorator="['changeTitle', { initialValue: fromData.changeTitle, rules: validatorRules.changeTitle.rules }]"
                :maxLength="50"
                placeholder="请输入(有效长度1-50)"
              ></a-input>
            </a-form-item>
          </a-col>     
          <a-col :span="24">
            <a-form-item label="变更描述" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
              <a-textarea 
                :maxLength="300" 
                v-decorator="['changeDesc', { initialValue: fromData.changeDesc, rules: validatorRules.changeDesc.rules }]"
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
                v-decorator="['phoneNo', { initialValue: fromData.phoneNo, rules: validatorRules.phoneNo.rules }]"
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
        <a-button @click="handleCancel()">取消</a-button>
        <a-button @click="handleOkConfirm(11)">保存</a-button>
        <a-button @click="handleOkConfirm(2)" type="primary">提交</a-button>
      </a-space>
    </div>
    <!-- 选择负责人 -->
    <change-role ref="changeRole" type='radio' @checkSuccess="checkRoleSuccess"></change-role>
    <!-- 选择测试工单 -->
    <check-order ref="checkOrder" :serviceType='1' @checkSuccess="checkOrderSuccess"></check-order>
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
import ChangeRole from './AddressList.vue'
import CheckOrder from './CheckOrder.vue'

export default {
  name: 'ServiceOrderModal',
  mixins: [JEditableTableMixin],
  components: {
    ARow,
    JDictSelectTag,
    ChangeRole,
    CheckOrder
  },
  props: {
    // 变更类型
    changeOptions: {
      type: Array,
      default: () => []
    }
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
      bodyStyle: {
        paddingBottom: '70px',
        height: window.innerHeight - 200 + 'px',
        'overflow-y': 'auto',
      },
      validatorRules: {
        changeType: {
          rules: [{ required: true, message: '请选择变更类型!' }],
        },
        phoneNo: {
          rules: [{ required: true, message: '请输入办公电话！' }],
        },
        changeOrderIds: {
          rules: [{ required: true, message: '请选择关联测试工单！' }],
        },
        changeTitle: {
          rules: [{ required: true, message: '请输入变更标题!' }],
        },
        changeDesc: {
          rules: [{ required: true, message: '请输入变更描述!' }],
        }
      },
      url: {
        add: '/sys/change/addAndSubmit'
      },
      fromData: {},
      businessInfo: {
        changeCatFullName: '',   // 所属业务
        changeType: '',  //选择变更类型
        changeOrderIds: "", // 关联测试工单
        changeTest: 1,  //是否需要测试
        orderStatus: null,   //变更工单状态
        currentUserId: null, //当前处理人员id
      },
      changeOrderIds: [], 
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
  methods: {
    //  初始页面内容
    add(businessInfo, fromData) {
      console.log(businessInfo);
      if (fromData) {
        this.fromData = {
          changeType: Number(fromData.changeType),
          changeTitle: fromData.changeTitle,
          changeDesc: fromData.changeDesc,
          phoneNo: fromData.phoneNo,
          id: fromData.id,       
        }
        this.serviceOrderAttachTable.dataSource = fromData.userAttaches ? fromData.userAttaches : []
        this.changeOrderIds = fromData.changeOrderIds ? fromData.changeOrderIds.split(",") : []
      } else {
        this.fromData = {
          phoneNo: this.userInfo.phone
        }
        this.serviceOrderAttachTable.dataSource = []
        // this.businessInfo.changeOrderIds = ""
        this.changeOrderIds = []
      }
      this.businessInfo = Object.assign(this.businessInfo, businessInfo)
      this.visible = true
      this.form.resetFields()  
    },
    // 选择变更类型
    bindChangeType(value) {
      this.businessInfo.changeType = value
    },
    // 选择测试工单
    handleSelect(e) {
      e.srcElement.blur()
      const queryParam = {
        orderStatus: 7,   // 订单状态（已结束）
        changeType: this.businessInfo.changeType,   //变更类型
        changeCatId: this.businessInfo.changeCatId  //所属业务
      }
      this.$refs.checkOrder.add('关联测试变更', queryParam, this.changeOrderIds);
    },
    // 选择测试工单完成
    checkOrderSuccess(value) {
      this.form.setFieldsValue({
        changeOrderIds: value.join(",")
      })
      this.businessInfo.changeOrderIds = value.join(",")
      this.changeOrderIds = value
    },
    /**
     * 提交
     * type: 11-草稿 2-提交
     */
    handleOkConfirm(type) {
      this.businessInfo.orderStatus = type
      this.handleOk()
    },
    // 选择人员完成
    checkRoleSuccess(value) {
      this.businessInfo.currentUserId = value.ids.join(",")
      this.handleOkConfirm(2)
    },
    // 提交
    request(formData) {
      if (this.confirmLoading) return
      const { orderStatus, currentUserId, changeType, changeTest } = this.businessInfo
      // 选择负责人
      if (changeType === 1 && orderStatus === 2 && !currentUserId) {
        this.$refs.changeRole.add('选择审批人', null)
        return
      }
      
      let params = Object.assign({}, formData, this.businessInfo)
      // 不是正式的时候清空
      if (changeType != 1) {
        params.changeOrderIds = ""
      }
      // 选择否的时候清空
      if(changeTest === 0) {
        params.changeOrderIds = ""
      }
      // 所属部门
      params.sysOrgCode = this.userInfo.orgCode
      params.deptName = this.userInfo.myDeptParentNames
      //变更类型中文说明
      const findItem = this.changeOptions.find( item => item.value == params.changeType)
      params.changeTypeInfo = findItem.text 
      delete params.changeTest
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
        this.businessInfo.currentUserId = ""
        this.confirmLoading = false
      })
    },
    /** 调用完edit()方法之后会自动调用此方法 */
    editAfter() {
      let fieldval = pick(
        this.model,
        'realName',
        'phoneNo',
        'deptName',
        'changeType',
        'changeOrderIds',
        'changeTitle',
        'changeDesc'
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
.change_order >>> .ant-form-item-children {
  display: flex;
}
.box-bot {
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  left: 0;
  right: 0;
}
</style>
