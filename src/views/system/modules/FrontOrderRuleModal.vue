<template>
  <a-drawer
    :title="title"
    :maskClosable="true"
    :width="drawerWidth"
    placement="right"
    :closable="true"
    @close="handleCancel"
    :visible="visible"
    style="height: 100%; overflow: auto; padding-bottom: 53px"
  >
    <template slot="title">
      <div style="width: 100%">
        <span>{{ title }}</span>
        <span style="display: inline-block; width: calc(100% - 51px); padding-right: 10px; text-align: right">
          <a-button @click="toggleScreen" icon="appstore" style="height: 20px; width: 20px; border: 0px"></a-button>
        </span>
      </div>
    </template>

    <a-spin :spinning="confirmLoading">
      <a-form :form="form" class="rule-form">
        <a-form-item label="用户账号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          {{ username }}
        </a-form-item>
        <a-form-item label="用户姓名" :labelCol="labelCol" :wrapperCol="wrapperCol">
          {{ realname }}
        </a-form-item>
        <!-- 搜索 -->
        <a-form-item label="工单类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select placeholder="全部" style="width: 200px" v-model="orderType">
            <a-select-option v-for="(item, key) in dictOptions" :key="key" :value="item.value">
              <span style="display: inline-block; width: 100%" :title="item.text || item.label">
                {{ item.text || item.label }}
              </span>
            </a-select-option>
          </a-select>
          <a-button type="primary" @click="initLoad" style="margin-left: 14px">搜索</a-button>
        </a-form-item>
        <a-row>
          <a-col :xs="24" :sm="3">
            <div class="btn-add">
              <a-button type="primary" @click="handleAdd">添加业务</a-button>
            </div>
          </a-col>
        </a-row>
        <!-- table区域-begin -->
        <a-table
          ref="table"
          bordered
          size="middle"
          rowKey="id"
          :columns="columns"
          :dataSource="dataSource"
          :loading="loading"
        >
          <!-- 工单类型 -->
          <template slot="orderType" slot-scope="text">
            <span>{{ setType(text) }}</span>
          </template>
          <!-- 是否接单 -->
          <!-- <template slot="ruleStatus" slot-scope="text">
            <a-switch disabled :checked="text === 1" />
          </template> -->
          <!-- 操作 -->
          <span slot="action" slot-scope="text, record">
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a-popconfirm title="确认删除该接单规则?" ok-text="确定" cancel-text="取消" @confirm="handleDel(record)">
              <a href="#">删除</a>
            </a-popconfirm>
          </span>
        </a-table>
        <!--部门分配-->
        <!-- <a-form-item label="接单区域" :labelCol="labelCol" :wrapperCol="wrapperCol" >
          <a-input-search
            placeholder="请选择接单区域"
            readOnly
            v-decorator="[ 'checkedDepartNameString', validatorRules.checkedDepartNameString]"
            @search="onSearch">
            <a-button slot="enterButton" icon="search">选择</a-button>
          </a-input-search>
        </a-form-item> -->
        <!-- <a-form-item label="业务类型" :labelCol="labelCol" :wrapperCol="wrapperCol" >
          <a-select
            mode="multiple"
            placeholder="请选择负责的业务类型"
            style="width: 200px"
            v-decorator="[ 'busTypes', validatorRules.busTypes]"
            @change="handleChange"
          >
            <a-select-option v-for="(item, key) in dictOptions" :key="key" :value="item.value">
              <span style="display: inline-block;width: 100%" :title=" item.text || item.label ">
                {{ item.text || item.label }}
              </span>
            </a-select-option>
          </a-select>
        </a-form-item> -->
        <!-- <a-form-item label="是否接单" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-switch :checked="defaultChecked" @click="switchChange" />
        </a-form-item> -->
      </a-form>
    </a-spin>
    <depart-window ref="departWindow" @ok="modalFormOk"></depart-window>

    <!-- <div class="drawer-bootom-button" v-show="!disableSubmit">
      <a-popconfirm title="确定放弃设置？" @confirm="handleCancel" okText="确定" cancelText="取消">
        <a-button style="margin-right: 0.8rem">取消</a-button>
      </a-popconfirm>
      <a-button @click="handleSubmit" type="primary" :loading="confirmLoading">提交</a-button>
    </div> -->
    <!-- 添加业务 -->
    <add-service ref="addService" @closeLoad="initLoad"></add-service>
  </a-drawer>
</template>

<script>
import moment from 'moment'
import Vue from 'vue'
// 引入搜索部门弹出框的组件
import departWindow from './DepartWindow'
import JSelectPosition from '@/components/jeecgbiz/JSelectPosition'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { getAction, postAction, deleteAction  } from '@/api/manage'
import { queryUserRole, queryall, ajaxGetDictItems, getDictItemsFromCache } from '@/api/api'
import { disabledAuthFilter } from '@/utils/authFilter'

import JImageUpload from '../../../components/jeecg/JImageUpload'
import AddService from './AddService'

export default {
  name: 'UserModal',
  components: {
    JImageUpload,
    departWindow,
    JSelectPosition,
    AddService,
  },
  data() {
    return {
      operations: 1,
      orderType: '', //工单类型
      // 表格数据
      loading: false,
      dataSource: [],
      // 表头
      columns: [
        {
          title: '工单类型',
          dataIndex: 'orderType',
          ellipsis: true,
          align: 'center',
          scopedSlots: { customRender: 'orderType' },
        },
        {
          title: '负责业务',
          align: 'center',
          ellipsis: true,
          dataIndex: 'catNames',
        },
        {
          title: '负责公司/园区',
          align: 'center',
          ellipsis: true,
          dataIndex: 'departNames',
        },
        // {
        //   title: '是否接单',
        //   align: 'center',
        //   dataIndex: 'ruleStatus',
        //   scopedSlots: { customRender: 'ruleStatus' },
        // },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          width: 140,
          scopedSlots: { customRender: 'action' },
        },
      ],
      // 用户信息
      username: '',
      realname: '',
      defaultChecked: false,
      ruleStatus: 1,
      dictOptions: [],
      departDisabled: false, // 是否是我的部门调用该页面
      roleDisabled: false, // 是否是角色维护调用该页面
      modalWidth: 800,
      drawerWidth: 700,
      modaltoggleFlag: true,
      confirmDirty: false,
      selectedDepartKeys: [], // 保存用户选择部门id
      checkedDepartKeys: [],
      checkedDepartNames: [], // 保存部门的名称 =>title
      checkedDepartNameString: '', // 保存部门的名称 =>title
      resultDepartOptions: [],
      userId: '', // 保存用户id
      disableSubmit: false,
      userDepartModel: { userId: '', departIdList: [] }, // 保存SysUserDepart的用户部门中间表数据需要的对象
      dateFormat: 'YYYY-MM-DD',
      busTypes: [],
      departIdShow: false,
      departIds: [], // 负责部门id
      title: '一线接单规则',
      visible: false,
      model: {},
      roleList: [],
      selectedRole: [],
      labelCol: {
        xs: { span: 24 },
        sm: { span: 3 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      uploadLoading: false,
      confirmLoading: false,
      headers: {},
      form: this.$form.createForm(this),
      picUrl: '',
      url: {
        fileUpload: window._CONFIG['domianURL'] + '/sys/common/upload',
        usrRule: '/system/usrServiceOrderRule/usrRule', // 根据用户id查询接单规则
        userId: '/sys/user/generateUserId', // 引入生成添加用户情况下的url
        saveRule: '/system/usrServiceOrderRule/configFrontRule', // 保存接单规则
        delRule: '/system/userOrderRule/delete'  //删除接单规则
      },
      urls: [
        // 一线运维人员接单列表
        {
          list: '/system/userOrderRule/frontList',
        },
        // 二线运维人员接单列表
        {
          list: '/system/userOrderRule/supportList',
        },
      ],
      identity: '1',
      fileList: [],
      validatorRules: {
        busTypes: { rules: [{ required: true, message: '请选择负责的业务类型!' }] },
        checkedDepartNameString: { rules: [{ required: true, message: '请选择接单区域!' }] },
      },
    }
  },
  created() {
    const token = Vue.ls.get(ACCESS_TOKEN)
    this.headers = { 'X-Access-Token': token }
    this.initDictData()
  },
  computed: {
    uploadAction: function () {
      return this.url.fileUpload
    },
    setType() {
      return function (text) {
        const item = this.dictOptions.find((item) => item.value == text)
        return item.title || item.text
      }
    },
  },
  methods: {
    switchChange(checked) {
      this.defaultChecked = checked
    },
    // 初始化表单数据
    initLoad() {
      this.loading = true
      getAction(
        this.urls[this.operations - 1].list, 
        { 
          orderType: this.orderType,
          userId: this.userId
        }).then((res) => {
        this.loading = false
        if (res.code === 200) {
          this.dataSource = res.result
        }
      })
    },
    // 添加业务
    handleAdd() {
      this.$refs.addService.deal(this.dictOptions, this.operations, this.userId, null)
    },
    // 编辑业务
    handleEdit(record) {
      this.$refs.addService.deal(this.dictOptions, this.operations, this.userId, record)
    },
    // 删除业务
    handleDel(record) {
      deleteAction(
        this.url.delRule, 
        { ids: record.id}
      ).then(res => {
        if (res.code === 200) {
          this.initLoad()
          this.$message.success(res.message)
        } else {
          this.$message.warning(res.message)
        }
      })
    },
    // 初始化工单类型
    initDictData() {
      let dictCode = 'ORDER_TYPE'
      let dictOptions = []
      const firstOpion = {
        text: '全部',
        title: '全部',
        value: '',
      }
      // 优先从缓存中读取字典配置
      if (getDictItemsFromCache(dictCode)) {
        dictOptions = getDictItemsFromCache(dictCode)
        dictOptions.unshift(firstOpion)
        this.dictOptions = dictOptions
        return
      }

      // 根据字典Code, 初始化字典数组
      ajaxGetDictItems(dictCode, null).then((res) => {
        if (res.success) {
          dictOptions = res.result
          dictOptions.unshift(firstOpion)
          this.dictOptions = dictOptions
        }
      })
    },
    isDisabledAuth(code) {
      return disabledAuthFilter(code)
    },
    // 窗口最大化切换
    toggleScreen() {
      if (this.modaltoggleFlag) {
        this.modalWidth = window.innerWidth
      } else {
        this.modalWidth = 800
      }
      this.modaltoggleFlag = !this.modaltoggleFlag
    },
    initialRoleList() {
      queryall().then((res) => {
        if (res.success) {
          this.roleList = res.result
        } else {
          console.log(res.message)
        }
      })
    },
    loadUserRoles(userid) {
      queryUserRole({ userid: userid }).then((res) => {
        if (res.success) {
          this.selectedRole = res.result
        } else {
          console.log(res.message)
        }
      })
    },
    refresh() {
      this.selectedDepartKeys = []
      this.checkedDepartKeys = []
      this.checkedDepartNames = []
      this.checkedDepartNameString = ''
      this.userId = ''
      this.resultDepartOptions = []
      this.departId = []
      this.departIdShow = false
    },
    add() {
      this.picUrl = ''
      this.refresh()
      this.edit({ activitiSync: '1' })
    },
    edit(record, operations = 1) {
      console.log(record);
      if (this.dictOptions.length === 1) {
        this.initDictData()
      }
      this.operations = operations
      this.resetScreenSize() // 调用此方法,根据屏幕宽度自适应调整抽屉的宽度
      this.defaultChecked = false
      this.form.resetFields()
      this.userId = record.id
      this.username = record.username
      this.realname = record.realname
      // 调用查询用户对应的部门信息的方法
      this.checkedDepartKeys = []
      // this.loadRules(this.userId)
      this.initLoad()
      this.visible = true
    },
    //
    loadRules() {
      let that = this
      getAction(that.url.usrRule, { usrId: that.userId }).then((res) => {
        if (res.result) {
          that.checkedDepartKeys = res.result.frontRuleDepart.split(',')
          that.checkedDepartNameString = res.result.frontRuleDepartNames
          that.busTypes = res.result.frontRuleBustype.split(',')
          if (res.result.frontRuleStatus === 2) {
            that.defaultChecked = false
          } else {
            that.defaultChecked = true
          }
          this.form.setFieldsValue({ checkedDepartNameString: that.checkedDepartNameString })
          this.form.setFieldsValue({ busTypes: that.busTypes })
        }
      })
    },
    close() {
      this.$emit('close')
      this.visible = false
      this.disableSubmit = false
      this.selectedRole = []
      this.userDepartModel = { userId: '', departIdList: [] }
      this.checkedDepartNames = []
      this.checkedDepartNameString = ''
      this.checkedDepartKeys = []
      this.selectedDepartKeys = []
      this.resultDepartOptions = []
      this.departIds = []
      this.departIdShow = false
      this.identity = '1'
      this.fileList = []
    },
    moment,
    handleSubmit() {
      let that = this
      // 触发表单验证
      this.form.validateFields((err, values) => {
        if (!err) {
          if (that.defaultChecked) {
            that.ruleStatus = 1
          } else {
            that.ruleStatus = 2
          }
          var params =
            'busTypes=' +
            this.busTypes.join(',') +
            '&deptIds=' +
            this.checkedDepartKeys.join(',') +
            '&departNames=' +
            this.checkedDepartNameString +
            '&usrId=' +
            this.userId +
            '&ruleStatus=' +
            this.ruleStatus
          postAction(that.url.saveRule, params)
            .then((res) => {
              if (res.success) {
                that.$message.success(res.message)
              } else {
                that.$message.warning(res.message)
              }
              that.selectedDepartKeys = []
              that.checkedDepartKeys = []
              that.checkedDepartNames = []
              that.checkedDepartNameString = ''
              that.visible = false
              that.$emit('ok')
            })
            .finally(() => {
              that.visible = false
              that.$emit('ok')
            })
        }
      })
    },
    handleCancel() {
      this.selectedDepartKeys = []
      this.checkedDepartKeys = []
      this.checkedDepartNames = []
      this.checkedDepartNameString = ''
      this.close()
    },
    handleConfirmBlur(e) {
      const value = e.target.value
      this.confirmDirty = this.confirmDirty || !!value
    },

    normFile(e) {
      if (Array.isArray(e)) {
        return e
      }
      return e && e.fileList
    },
    beforeUpload: function (file) {
      var fileType = file.type
      if (fileType.indexOf('image') < 0) {
        this.$message.warning('请上传图片')
        return false
      }
      // TODO 验证文件大小
    },
    handleChange(val) {
      this.busTypes = val
    },
    // 搜索用户对应的部门API
    onSearch() {
      this.$refs.departWindow.add(this.checkedDepartKeys, this.userId)
    },

    // 获取用户对应部门弹出框提交给返回的数据
    modalFormOk(formData) {
      this.checkedDepartNames = []
      this.checkedDepartNameString = ''
      this.departIds = []
      for (let i = 0; i < formData.departIdList.length; i++) {
        this.checkedDepartNames.push(formData.departIdList[i].title)
        this.selectedDepartKeys.push(formData.departIdList[i].key)
        this.checkedDepartNameString = this.checkedDepartNames.join(',')
      }
      this.checkedDepartKeys = this.selectedDepartKeys // 更新当前的选择keys
      this.form.setFieldsValue({ checkedDepartNameString: this.checkedDepartNameString })
    },
    // 根据屏幕变化,设置抽屉尺寸
    resetScreenSize() {
      let screenWidth = document.body.clientWidth
      if (screenWidth < 500) {
        this.drawerWidth = screenWidth
      } else {
        this.drawerWidth = 700
      }
    },
    identityChange(e) {
      if (e.target.value === '1') {
        this.departIdShow = false
      } else {
        this.departIdShow = true
      }
    },
  },
}
</script>

<style scoped>
.btn-add {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  margin-left: 10px;
}
.rule-form >>> .ant-btn {
  padding: 0 11px;
}
.avatar-uploader > .ant-upload {
  width: 104px;
  height: 104px;
}
.ant-upload-select-picture-card i {
  font-size: 49px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}

.ant-table-tbody .ant-table-row td {
  padding-top: 10px;
  padding-bottom: 10px;
}

.drawer-bootom-button {
  position: absolute;
  bottom: -8px;
  width: 100%;
  border-top: 1px solid #e8e8e8;
  padding: 10px 16px;
  text-align: right;
  left: 0;
  background: #fff;
  border-radius: 0 0 2px 2px;
}
</style>
