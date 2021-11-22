<template>
  <a-modal
    title="事件工单"
    :width="1200"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :okButtonProps="{ props: { disabled: disableSubmit } }"
    @ok="handleOkConfirm"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <!-- 主表单区域 -->
        <a-row>
          <a-col :xs="24" :sm="12">
            <a-form-item label="事件发生日期" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-date
                :disableType="2"
                :show-time="true"
                date-format="YYYY-MM-DD"
                placeholder="请选择"
                class="query-group-cust"
                v-decorator="['eventTime', validatorRules.eventTime]"
              ></j-date>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="发起人" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input
                v-decorator="['realName', { initialValue: userInfo.realname }]"
                :disabled="true"
                placeholder="发起人"
              ></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :xs="24" :sm="12">
            <a-form-item label="事件来源" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-select placeholder="请选择" disabled v-decorator="['eventFrom', { initialValue: 'jack' }]">
                <a-select-option value="jack"> 用户报告 </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="办公电话" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input
                v-decorator="['phoneNo', { initialValue: userInfo.phone, rules: validatorRules.phoneNo.rules }]"
                :maxLength="16"
                placeholder="请输入"
              ></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :xs="24" :sm="12">
            <a-form-item label="事件分类" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-tree-select
                style="width: 100%"
                v-decorator="['catIds', validatorRules.catIds]"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                placeholder="请选择"
                allow-clear
                :tree-data="categoryOptions"
                tree-default-expand-all
                :replace-fields="{ title: 'title', value: 'id', key: 'id', children: 'children' }"
              >
              </a-tree-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="部门" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input
                v-decorator="['deptName', { initialValue: userInfo.myDeptParentNames }]"
                :disabled="true"
                placeholder="请选择"
              ></a-input>
              <!-- <a-input v-decorator="['sysOrgCode',{initialValue:userInfo.orgCode}]" type="hidden" ></a-input> -->
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :xs="24" :sm="12">
            <a-form-item label="紧急程度" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-select placeholder="请选择" v-decorator="['eventmergency', validatorRules.eventmergency]">
                <a-select-option value="1"> 紧急 </a-select-option>
                <a-select-option value="2"> 重要 </a-select-option>
                <a-select-option value="3"> 一般 </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="地点" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input
                v-decorator="[
                  'workplaceDetail',
                  { initialValue: userInfo.workplaceDetail, rules: validatorRules.workplaceDetail.rules },
                ]"
                placeholder="请输入地点(有效长度1-100)"
                :maxLength="100"
              ></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :xs="24" :sm="12">
            <a-form-item label="事件标题" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input
                v-decorator="['eventTitle', validatorRules.eventTitle]"
                :maxLength="32"
                placeholder="请输入(有效长度1-32)"
              ></a-input>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="开单方式" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-radio-group
                name="radioGroup"
                v-decorator="['eventWay', { initialValue: 1, rules: validatorRules.eventWay.rules }]"
              >
                <a-radio :value="1">正常开单</a-radio>
                <a-radio :value="2">事后补单</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24">
            <a-form-item label="事件描述" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
              <a-textarea v-decorator="['eventContent']" rows="4" placeholder="请输入事件描述(有效长度1-200)" />
            </a-form-item>
          </a-col>
        </a-row>
        <!-- 关联资源 -->
        <a-row>
          <a-col :xs="24" :sm="12">
            <a-form-item label="关联资源" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-button @click="handleAdd()" type="primary">添加</a-button>
              <a-button @click="handleDel()" type="primary" style="margin-left: 10px">删除</a-button>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24" class="col-item">
            <a-form-item label="资源表格" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
              <a-table
                ref="table"
                bordered
                size="middle"
                rowKey="id"
                :columns="columns"
                :dataSource="dataSource"
                :pagination="ipagination"
                :loading="loading"
                :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
                @change="handleTableChange"
              >
                <template slot="dictText" slot-scope="text">
                  <span>{{text}}</span>
                </template>
                <span slot="action" slot-scope="text, record">
                  <a @click="handleDetail(record)">详情</a>
                  <a-divider type="vertical" />
                  <a-popconfirm
                    title="确认删除该接单规则?"
                    ok-text="确定"
                    cancel-text="取消"
                    @confirm="handleDel(record)"
                  >
                    <a href="#" style="color: red">删除</a>
                  </a-popconfirm>
                </span>
              </a-table>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :xs="24" :sm="12">
            <a-form-item label="处理人" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input
                v-decorator="['eventPerson', validatorRules.eventPerson]"
                :maxLength="32"
                placeholder="请输入处理人(有效长度1-32)"
              ></a-input>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'
import { FormTypes, getRefPromise, validateFormAndTables } from '@/utils/JEditableTableUtil'
import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import JDictSelectTag from '@/components/dict/JDictSelectTag'
import ARow from 'ant-design-vue/es/grid/Row'
import { postAction } from '@/api/manage'
import { mapGetters } from 'vuex'
import JDate from '@/components/jeecg/JDate.vue'

export default {
  name: 'ServiceOrderModal',
  mixins: [JEditableTableMixin, JeecgListMixin],
  components: {
    ARow,
    JDictSelectTag,
    JDate,
  },
  props: ['categoryOptions'],
  data() {
    return {
      refKeys: ['serviceOrderAttach'],
      columns: [
        {
          title: '名称 ',
          align: 'center',
          dataIndex: 'username',
          ellipsis: true
        },
        {
          title: '描述',
          align: 'center',
          dataIndex: 'realname',
          ellipsis: true
        },
        {
          title: 'IP',
          align: 'center',
          dataIndex: 'avatar'
        },

        {
          title: '资源类型',
          align: 'center',
          dataIndex: 'sex_dictText',
          ellipsis: true
        },
        {
          title: '资源分组',
          align: 'center',
          dataIndex: 'birthday',
          ellipsis: true
        },
        {
          title: '状态',
          align: 'center',
          width: 80,
          dataIndex: 'dictText',
          scopedSlots: { customRender: 'dictText' }
        },
        {
          title: '使用人',
          align: 'center',
          dataIndex: 'person'
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' },
          align: 'center',
          width: 170
        },
      ],
      disableMixinCreated: true,
      disableSubmit: false,
      flowCode: 'onl_service_order',
      defaultWorkplaceDeparts: [],
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
      // 新增时子表默认添加几行空数据
      addDefaultRowNum: 1,
      validatorRules: {
        eventTime: {
          rules: [{ required: true, message: '请选择事件发生日期!' }],
        },
        phoneNo: {
          rules: [{ required: true, message: '请输入办公电话！' }],
        },
        catIds: {
          rules: [{ required: true, message: '请选择事件分类!' }],
        },
        eventmergency: {
          rules: [{ required: true, message: '请选择紧急程度!' }],
        },
        workplaceDetail: {
          rules: [{ required: true, message: '请输入地点!' }],
        },
        eventTitle: {
          rules: [{ required: true, message: '请输入地点事件标题!' }],
        },
        eventWay: {
          rules: [{ required: true, message: '请选择开单方式!' }],
        },
        eventPerson: {
          rules: [{ required: true, message: '请输入处理人!' }],
        },
      },
      url: {
        userInfo: '/sys/user/userInfo',
        add: '/system/serviceOrder/addAndSubmit',
      },
      rowInfo: {
        orderType: 1,
        userName: '',
        sysOrgCode: '',
      },
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
  },
  methods: {
    //  初始页面内容
    add() {
      const { workplaceDeptParentIdes, username, orgCode } = this.userInfo
      this.visible = true
      this.form.resetFields()
      this.defaultWorkplaceDeparts = JSON.parse(workplaceDeptParentIdes).slice(0, 2)
      this.rowInfo.userName = username
      this.rowInfo.sysOrgCode = orgCode
    },
    // 选项业务
    changeCat(value, label) {
      this.catIds = value
    },
    // 添加资源
    handleAdd() {},
    // 删除资源
    handleDel() {},
    // 查看资源
    handleDetail() {},
    handleOkConfirm: function () {
      let that = this
      this.$confirm({
        title: '提示',
        content: '确认提交流程吗?',
        onOk: function () {
          that.okConfirm()
        },
      })
    },
    // 提交
    okConfirm() {},
    /** 调用完edit()方法之后会自动调用此方法 */
    editAfter() {
      let fieldval = pick(
        this.model,
        'userName',
        'realName',
        'phoneNo',
        'deptName',
        'workplaceDepartids',
        'workplaceDetail',
        'deviceInfo',
        'bpmStatus',
        'createTime'
      )
      let workplaceDepartids = fieldval.workplaceDepartids
      if (workplaceDepartids) {
        fieldval.workplaceDepartids = JSON.parse(workplaceDepartids)
      }
      this.$nextTick(() => {
        this.form.setFieldsValue(fieldval)
      })
    },
  },
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
