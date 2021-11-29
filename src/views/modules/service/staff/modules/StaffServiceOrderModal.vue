<template>
  <a-modal
    :title="title"
    :width="1200"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :okButtonProps="{ props: { disabled: disableSubmit } }"
    @ok="handleOkConfirm"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <a-spin :spinning="confirmLoading">
      <!-- 主表单区域 -->
      <a-form :form="form">
        <a-row>
          <a-col :xs="24" :sm="12">
            <a-form-item label="选择业务" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-cascader
                placeholder="请选择"
                :field-names="{ label: 'title', value: 'id', children: 'children' }"
                :show-search="{ filter }"
                v-decorator="[
                  'serviceCatIds',
                  {
                    rules: [{ required: true, message: '请选择业务!' }],
                  },
                ]"
                :options="quickOptions"
                change-on-select
                expand-trigger="hover"
                @change="catalogChange"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24">
            <a-form-item label="请求内容" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
              <a-textarea
                v-decorator="['eventContent', validatorRules.eventContent]"
                rows="4"
                :maxLength="300"
                placeholder="请输入请求内容(有效长度1-300)"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="相关知识" :labelCol="labelCol2" :wrapperCol="labelCol2">
              <div class="des-catalog">暂无相关知识</div>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="优先级" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
              <a-radio-group
                name="radioGroup"
                :disabled="disabledLevel"
                v-decorator="['serviceLevel', { initialValue: serviceLevel, rules: [{ required: true, message: '请选择优先级!' }] }]"
              >
                <template v-for="item in dictOptions">
                  <a-radio :key="item.value" :value="item.value">{{item.text || item.title}}</a-radio>
                </template>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
        <p class="line"></p>
        <a-row>
          <a-col :xs="24" :sm="12">
            <a-form-item label="请求人" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input
                v-decorator="['realName', { initialValue: userInfo.realname }]"
                :disabled="true"
                placeholder="请输入账号"
              ></a-input>
              <!-- <a-input v-decorator="['userName',{initialValue:userInfo.username}]" type="hidden"></a-input> -->
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-button type="primary" @click="handleSelectUser()" icon="user">代理</a-button>
          </a-col>
        </a-row>
        <a-row>
          <a-col :xs="24" :sm="12">
            <a-form-item label="所属部门" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input
                v-decorator="['deptName', { initialValue: userInfo.myDeptParentNames }]"
                :disabled="true"
                placeholder="请输入部门名称"
              ></a-input>
              <!-- <a-input v-decorator="['sysOrgCode',{initialValue:userInfo.orgCode}]" type="hidden" ></a-input> -->
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="电话号码" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input
                v-decorator="[
                  'phoneNo',
                  { initialValue: userInfo.phone, rules: [{ required: true, message: '请输入电话号码！' }] },
                ]"
                placeholder="请输入电话号码"
              ></a-input>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="当前所在公司/园区" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-cascader
                v-decorator="[
                  'workplaceDepartids',
                  {
                    initialValue: defaultWorkplaceDeparts,
                    rules: [{ type: 'array', required: true, message: '请选择当前所在公司/园区' }],
                  },
                ]"
                autocomplete='off'
                :options="departTree"
                :showSearch="true"
                :fieldNames="{ label: 'title', value: 'id', children: 'children' }"
                :show-search="{ filterDepart }"
                placeholder="请选择部门"
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="详细地址" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input
                v-decorator="['workplaceDetail', { initialValue: userInfo.workplaceDetail }]"
                :maxLength="200"
                placeholder="请输入详细地址"
              ></a-input>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
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
    </a-spin>
    <biz-select-single-user-modal
      ref="selectSingleUserModal"
      @selectFinished="selectUserOK"
    ></biz-select-single-user-modal>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'
import { FormTypes, getRefPromise, validateFormAndTables } from '@/utils/JEditableTableUtil'
import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
import { ServiceMixin } from '@/views/modules/service/mixins/ServiceMixin'
import JDictSelectTag from '@/components/dict/JDictSelectTag'
import { queryIdTree, queryDepartTreeList } from '@/api/api'
import ARow from 'ant-design-vue/es/grid/Row'
import BizSelectSingleUserModal from './BizSelectSingleUserModal.vue'
import { postAction } from '@/api/manage'
export default {
  name: 'ServiceOrderModal',
  mixins: [JEditableTableMixin, ServiceMixin],
  components: {
    ARow,
    JDictSelectTag,
    BizSelectSingleUserModal,
  },
  data() {
    return {
      disableSubmit: false,
      flowCode: 'onl_service_order',
      defaultWorkplaceDeparts: [],
      departTree: [],
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
        workplaceCompany: {
          rules: [{ required: true, message: '请输入工作地点公司!' }],
        },
        businessType: {
          rules: [{ required: true, message: '请选择业务类型!' }],
        },
        phoneNo: {
          rules: [{ required: true, message: '请输入电话号码！' }],
        },
        problemType: {
          rules: [{ required: true, message: '请选择业务类型!' }],
        },
        eventContent: {
          rules: [{ required: true, message: '请输入请求内容!' }],
        },
      },
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
            width: '100%',
            placeholder: '请输入${title}',
            defaultValue: '',
          },
        ],
      },
      url: {
        userInfo: '/sys/user/userInfo',
        add: '/system/serviceOrder/addAndSubmit',
        edit: '/system/serviceOrder/edit',
        startProcess: '/process/extActProcess/startMutilProcess',
        serviceOrderAttach: {
          list: '/system/serviceOrder/queryServiceOrderAttachByMainId',
        },
      },
      rowInfo: {
        orderType: 1,
        userName: '',
        sysOrgCode: '',
      },
      // 优先级
      serviceLevel: "3", //默认值
      disabledLevel: false, //是否可修改
      dictOptions: []  //列表
    }
  },
  created() {
    this.initDictData("service_level")
    this.queryDepartTree()
    this.getCatalog(3)
  },
  methods: {
    add() {
      const { workplaceDeptParentIdes, username, orgCode, isLeader } = this.userInfo
      this.visible = true
      this.form.resetFields()
      if (isLeader) {
        this.serviceLevel ="1"
        this.disabledLevel = true
      } else {
        this.serviceLevel ="3"
        this.disabledLevel = false
      }
      this.defaultWorkplaceDeparts = JSON.parse(workplaceDeptParentIdes).slice(0, 2)
      this.rowInfo.userName = username
      this.rowInfo.sysOrgCode = orgCode
    },
    // 选择代理
    handleSelectUser() {
      this.$refs.selectSingleUserModal.select(0)
    },
    selectUserOK: function (data) {
      var params = '&username=' + data.username
      postAction(this.url.userInfo, params)
        .then((res) => {
          this.defaultWorkplaceDeparts = JSON.parse(res.result.workplaceDeptParentIdes).slice(0, 2)
          this.form.setFieldsValue({
            realName: data.realname,
            deptName: res.result.myDeptParentNames,
            workplaceDetail: res.result.workplaceDetail,
            workplaceDepartids: this.defaultWorkplaceDeparts,
          })
          this.rowInfo.userName = data.username
          this.rowInfo.sysOrgCode = res.result.orgCode
          const isLeader = res.result.isLeader
          if(isLeader) {
            this.serviceLevel = "1"
            this.disabledLevel = true
          } else {
            this.serviceLevel = "3"
            this.disabledLevel = false
          }
        })
        .finally(() => {})
    },
    // 提交内容
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
    // 提交方法
    okConfirm() {
      /** 触发表单验证 */
      this.getAllTable()
        .then((tables) => {
          /** 一次性验证主表和所有的次表 */
          return validateFormAndTables(this.form, tables)
        })
        .then((allValues) => {
          if (typeof this.classifyIntoFormData !== 'function') {
            throw this.throwNotFunction('classifyIntoFormData')
          }
          let formData = this.classifyIntoFormData(allValues)
          // 发起请求
          this.confirmLoading = true
          let params = Object.assign({}, this.rowInfo, formData)
          params.serviceCatIds = JSON.stringify(params.serviceCatIds)
          postAction(this.url.add, params)
            .then((res) => {
              this.confirmLoading = false
              if (res.success) {
                this.$message.success(res.message)
                this.$emit('closeLoad')
                this.close()
              } else {
                this.$message.warning(res.message)
              }
            })
            .finally(() => {
              this.confirmLoading = false
              return ''
            })
        })
        .catch((e) => {
          // this.$message.warning("请上传文件!")
          if (e.error === VALIDATE_NO_PASSED) {
            // 如果有未通过表单验证的子表，就自动跳转到它所在的tab
            this.activeKey = e.index == null ? this.activeKey : this.refKeys[e.index]
          }
        })
    },
    // 三级地址选择
    handleAddressFun: function (e, form, thsAreaCode) {
      // thsAreaCode = this.form.areaCode    // 注意1：获取value值
      thsAreaCode = this.$refs['cascaderAddr'].currentLabels // 注意2： 获取label值
      alert(thsAreaCode) // 注意3： 最终结果是个一维数组对象
    },
    filterDepart(inputValue, path) {
      return path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1)
    },
    getAllTable() {
      let values = this.tableKeys.map((key) => getRefPromise(this, key))
      return Promise.all(values)
    },
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
        'businessType',
        'deviceInfo',
        'eventContent',
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
      // 加载子表数据
      // 去掉加载服务工单附件
      // if (this.model.id) {
      //   let params = { id: this.model.id }
      //   this.requestSubTableData(this.url.serviceOrderAttach.list, params, this.serviceOrderAttachTable)
      // }
    },
    /** 整理成formData */
    classifyIntoFormData(allValues) {
      let main = Object.assign(this.model, allValues.formValue)
      return {
        ...main, // 展开
        orderAttachList: allValues.tablesValue[0].values,
      }
    },
    validateError(msg) {
      this.$message.error(msg)
    },
    popupCallback(row) {
      this.form.setFieldsValue(
        pick(
          row,
          'userName',
          'realName',
          'phoneNo',
          'deptName',
          'workplaceDepartids',
          'workplaceDetail',
          'businessType',
          'deviceInfo',
          'eventContent',
          'bpmStatus',
          'createTime'
        )
      )
    },
    queryDepartTree() {
      queryDepartTreeList().then((res) => {
        if (res.success) {
          const result = res.result
          let list = []
          result.forEach((item, index) => {
            list.push({
              children: [],
              id: item.key,
              title: item.title,
            })
            item.children.forEach((citem) => {
              list[index].children.push({
                id: citem.key,
                title: citem.title,
              })
            })
          })
          this.departTree = list
        }
      })
    },
    updateElCascaderStyle(value) {
      // 效果：项目名称的input框随着内容的长度而自适应，设置 el_cascader 标签的width
      var el_cascader_element = document.querySelector('#el-cascader')
      var length = value.join('.').length + 1
      var num = length * 9 + 'px'
      el_cascader_element.style.width = num
    },
  },
}
</script>

<style scoped>
.des-catalog {
  font-size: 12px;
}
.line {
  width: 100%;
  height: 1px;
  background: #e8e8e8;
}
</style>
