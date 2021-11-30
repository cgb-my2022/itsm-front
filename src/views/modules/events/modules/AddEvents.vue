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
    okText="提交"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <!-- 主表单区域 -->
        <a-row>
          <a-col :xs="24" :sm="12">
            <a-form-item label="事件发生日期" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-date
                :disableType="2"
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
              <a-select placeholder="请选择" disabled v-decorator="['eventSource', { initialValue: 2 }]">
                <a-select-option :value="2"> 用户报告 </a-select-option>
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
                v-decorator="['eventCatId', validatorRules.eventCatId]"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                placeholder="请选择"
                allow-clear
                :tree-data="categoryOptions"
                tree-default-expand-all
                :replace-fields="{ title: 'title', value: 'id', key: 'id', children: 'children' }"
                @change="changeCat"
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
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :xs="24" :sm="12">
            <a-form-item label="紧急程度" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-select placeholder="请选择" v-decorator="['eventLevel', validatorRules.eventLevel]">
                <a-select-option v-for="(item, key) in dictOptions" :key="key" :value="item.value">
                  <span style="display: inline-block; width: 100%" :title="item.text || item.label">
                    {{ item.text || item.label }}
                  </span>
                </a-select-option>
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
                v-decorator="['openType', { initialValue: 1, rules: validatorRules.openType.rules }]"
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
              <a-textarea v-decorator="['eventDesc']" rows="4" placeholder="请输入事件描述(有效长度1-200)" />
            </a-form-item>
          </a-col>
        </a-row>
        <!-- 关联资源 -->
        <a-row>
          <a-col :xs="24" :sm="12">
            <a-form-item label="关联资源" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-button @click="handleAdd()" type="primary">添加</a-button>
              <a-button @click="handleDel(1)" type="primary" style="margin-left: 10px">删除</a-button>
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
                :scroll="scroll"
                :columns="columns"
                :dataSource="dataSource"
                :pagination="false"
                :loading="loading"
                :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
                @change="handleTableChange"
              >
                <span slot="action" slot-scope="text, record">
                  <a @click="handleDetail(record.id)">详情</a>
                  <a-divider type="vertical" />
                  <a href="#" @click="handleDel(2, record.id)" style="color: red">删除</a>
                </span>
              </a-table>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24">
            <a-form-item label="处理人" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
              <div style="display:flex;">
                <a-input
                  :disabled="disabledName"
                  style="width: 200px;"
                  autocomplete="off"
                  @click="handleSelect"
                  placeholder="点击选择处理人"
                  v-decorator="['currentUserName', validatorRules.currentUserName]">
                </a-input>
                <a-button icon="search" @click="handleSelect">选择</a-button>
              </div>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <!-- 选择处理人 -->
      <events-user ref="eventsUser" @selectFinished="selectUserOK"></events-user>
      <!-- 资源列表 -->
      <resources-list ref="resourcesList" @selectOk="selectOk"></resources-list>
      <!-- 资源详情 -->
      <resources-detail 
        :detailId="detailId" 
        v-if="showDetail" 
        ref="resourcesDetail" 
        @closeDetail="showDetail=false">
      </resources-detail>
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
import ResourcesList from './ResourcesList'
import ResourcesDetail from './ResourcesDetail'
import EventsUser from './EventsUser'

export default {
  name: 'ServiceOrderModal',
  mixins: [JEditableTableMixin, JeecgListMixin],
  components: {
    ARow,
    JDictSelectTag,
    JDate,
    ResourcesList,
    ResourcesDetail,
    EventsUser
  },
  props: ['categoryOptions'],
  data() {
    return {
      refKeys: ['serviceOrderAttach'],
      dictOptions: [],
      scroll: { y: 230 },
      columns: [
       {
          title: '名称 ',
          align: 'center',
          dataIndex: 'name',
          ellipsis: true,
        },
        {
          title: '描述',
          align: 'center',
          dataIndex: 'describes',
          ellipsis: true,
        },
        {
          title: '资源类型',
          align: 'center',
          dataIndex: 'resourceTypeId',
          ellipsis: true,
        },
        {
          title: '使用人',
          align: 'center',
          dataIndex: 'useUserName',
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' },
          align: 'center',
          width: 170,
        },
      ],
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
      // 新增时子表默认添加几行空数据
      addDefaultRowNum: 1,
      validatorRules: {
        eventTime: {
          rules: [{ required: true, message: '请选择事件发生日期!' }],
        },
        phoneNo: {
          rules: [{ required: true, message: '请输入办公电话！' }],
        },
        eventCatId: {
          rules: [{ required: true, message: '请选择事件分类!' }],
        },
        eventLevel: {
          rules: [{ required: true, message: '请选择紧急程度!' }],
        },
        workplaceDetail: {
          rules: [{ required: true, message: '请输入地点!' }],
        },
        eventTitle: {
          rules: [{ required: true, message: '请输入地点事件标题!' }],
        },
        openType: {
          rules: [{ required: true, message: '请选择开单方式!' }],
        },
        currentUserName: {
          rules: [{ required: true, message: '请选择处理人!' }],
        },
      },
      url: {
        userInfo: '/sys/user/userInfo',
        add: '/sys/event/addAndSubmit'
      },
      fromData: {
        eventCatFullName: '',
        currentUserId: ''
      },
      disabledName: true,
      dataSource: [],
      selectedRowKeys: [],
      detailId: "",
      showDetail: false
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
  },
  created() {
    this.initDictData("EVENT_LEVEL")
  },
  methods: {
    //  初始页面内容
    add() {
      this.visible = true
      this.form.resetFields()
      this.dataSource = []
      this.selectedRowKeys = []
      this.fromData = {
        eventCatFullName: '',
        currentUserId: ''
      }
      this.$nextTick(() => {
         this.$refs.resourcesList.initData()
      })
    },
    // 选项业务
    changeCat(value, label) {
      this.fromData.eventCatFullName = label.join(' ')
      this.disabledName = value ? false : true
      this.selectUserOK({
        realname: "",
        currentUserId: ""
      })
    },
    // 添加资源
    handleAdd() {
      let list = []
      if (this.dataSource.length > 0) {
        this.dataSource.forEach(item => {
          list.push(item.id)
        })
      }
      this.$refs.resourcesList.add(list)
    },
    selectOk(data) {
      this.dataSource = JSON.parse(JSON.stringify(data))
    },
    // 删除资源
    handleDel(type, id) {
      let list = []
      if(type === 1) {
        if (this.selectedRowKeys.length > 0) {
          list = JSON.parse(JSON.stringify(this.selectedRowKeys))
        } else {
          this.$message.warning("请勾选需要删除的关联资源！")
        }
      } else {
        list = [id]
      }
      if (list.length === 0) return
      list.forEach(item => {
        const findIndex = this.dataSource.findIndex(citem => citem.id === item)
        this.dataSource.splice(findIndex, 1)
        const findIndex1 = this.selectedRowKeys.findIndex(citem => citem === item)
        this.selectedRowKeys.splice(findIndex1, 1)
      })
    },
    // 查看资源
    handleDetail(id) {
      this.detailId = id
      this.showDetail = true
    },
    // 选择处理人
    handleSelect(e) {
      e.srcElement.blur()
      this.form.validateFields(['eventCatId'], (err, values) => {
        if (!err) {
          const myDeptParentIdes = JSON.parse(this.userInfo.myDeptParentIdes)
          const params = {
            catId: values.eventCatId,
            companyCode: myDeptParentIdes[1]
          }
          this.$refs.eventsUser.select(params);
        } else {
          this.$message.warn("请先选择事件分类！")
        }
      })
    },
    selectUserOK(data) {
      let fieldval = pick(this.model)
      fieldval.currentUserName = data.realname
      this.$nextTick(() => {
          this.form.setFieldsValue(fieldval)
      })
      this.fromData.currentUserId = data.id
    },
    // 提交
    handleOkConfirm(e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          let params = JSON.parse(JSON.stringify(values))
          params.eventTime = params.eventTime + ' ' + '00:00:00'
          params.sysOrgCode = this.userInfo.orgCode
          params.deptName = this.userInfo.myDeptParentNames
          // 关联资源内容
          if (this.dataSource.length > 0) {
            let relateSource = [], relateSourceNames = []
            this.dataSource.forEach(item => {
              relateSource.push(item.id)
              relateSourceNames.push(item.name)
            })
            params.relateSource = relateSource.join(",")
            params.relateSourceNames = relateSourceNames.join("、")
          }
          Object.assign(params, this.fromData)
          this.confirmLoading = true
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
        }
      })
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
