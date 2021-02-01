<template>
  <a-drawer
    :title="title"
    :maskClosable="true"
    :width="drawerWidth"
    placement="right"
    :closable="true"
    @close="handleCancel"
    :visible="visible"
    style="height: calc(100% - 55px);overflow: auto;padding-bottom: 53px;">

    <template slot="title">
      <div style="width: 100%;">
        <span>{{ title }}</span>
        <span style="display:inline-block;width:calc(100% - 51px);padding-right:10px;text-align: right">
          <a-button @click="toggleScreen" icon="appstore" style="height:20px;width:20px;border:0px"></a-button>
        </span>
      </div>

    </template>

    <a-spin :spinning="confirmLoading">
      <a-form :form="form">

        <a-form-item label="用户账号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          {{ username }}
        </a-form-item>

        <a-form-item label="用户姓名" :labelCol="labelCol" :wrapperCol="wrapperCol" >
          {{ realname }}
        </a-form-item>

        <!--部门分配-->
        <a-form-item label="负责区域" :labelCol="labelCol" :wrapperCol="wrapperCol" >
          <a-input-search
            placeholder="请选择负责区域"
            readOnly
            v-decorator="[ 'checkedDepartNameString', validatorRules.checkedDepartNameString]"
            @search="onSearch">
            <a-button slot="enterButton" icon="search">选择</a-button>
          </a-input-search>
        </a-form-item>
      </a-form>
    </a-spin>
    <depart-window ref="departWindow" @ok="modalFormOk"></depart-window>

    <div class="drawer-bootom-button" v-show="!disableSubmit">
      <a-popconfirm title="确定放弃设置？" @confirm="handleCancel" okText="确定" cancelText="取消">
        <a-button style="margin-right: .8rem">取消</a-button>
      </a-popconfirm>
      <a-button @click="handleSubmit" type="primary" :loading="confirmLoading">提交</a-button>
    </div>
  </a-drawer>
</template>

<script>
  import moment from 'moment'
  import Vue from 'vue'
  // 引入搜索部门弹出框的组件
  import departWindow from './DepartWindow'
  import JSelectPosition from '@/components/jeecgbiz/JSelectPosition'
  import { ACCESS_TOKEN } from '@/store/mutation-types'
  import { getAction, postAction } from '@/api/manage'
  import { queryUserRole, queryall, ajaxGetDictItems, getDictItemsFromCache } from '@/api/api'
  import { disabledAuthFilter } from '@/utils/authFilter'

  import JImageUpload from '../../../components/jeecg/JImageUpload'

  export default {
    name: 'UserModal',
    components: {
      JImageUpload,
      departWindow,
      JSelectPosition
    },
    data () {
      return {
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
        title: '一线主管负责区域',
        visible: false,
        model: {},
        roleList: [],
        selectedRole: [],
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 }
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
          saveRule: '/system/usrServiceOrderRule/configFrontSupRule' // 保存接单规则
        },
        identity: '1',
        fileList: [],
        validatorRules: {
          checkedDepartNameString:{rules: [{ required: true, message: '请选择负责区域!' }]},
        },
      }
    },
    created () {
      const token = Vue.ls.get(ACCESS_TOKEN);
      this.headers = { 'X-Access-Token': token }
    },
    computed: {
      uploadAction: function () {
        return this.url.fileUpload;
      }
    },
    methods: {
      switchChange(checked) {
        this.defaultChecked = checked;

      },
      initDictData() {
        let dictCode = 'SERVICE_ORDER_BUSINESS_TYPE';
        // 优先从缓存中读取字典配置
        if (getDictItemsFromCache(dictCode)) {
          this.dictOptions = getDictItemsFromCache(dictCode);
          return
        }

        // 根据字典Code, 初始化字典数组
        ajaxGetDictItems(dictCode, null).then((res) => {
          if (res.success) {
//                console.log(res.result);
            this.dictOptions = res.result;
          }
        })
      },
      isDisabledAuth(code) {
        return disabledAuthFilter(code);
      },
      // 窗口最大化切换
      toggleScreen() {
        if (this.modaltoggleFlag) {
          this.modalWidth = window.innerWidth;
        } else {
          this.modalWidth = 800;
        }
        this.modaltoggleFlag = !this.modaltoggleFlag;
      },
      initialRoleList() {
        queryall().then((res) => {
          if (res.success) {
            this.roleList = res.result;
          } else {
            console.log(res.message);
          }
        });
      },
      loadUserRoles(userid) {
        queryUserRole({ userid: userid }).then((res) => {
          if (res.success) {
            this.selectedRole = res.result;
          } else {
            console.log(res.message);
          }
        });
      },
      refresh () {
          this.selectedDepartKeys = [];
          this.checkedDepartKeys = [];
          this.checkedDepartNames = [];
          this.checkedDepartNameString = '';
          this.userId = ''
          this.resultDepartOptions = [];
          this.departId = [];
          this.departIdShow = false;
      },
      add () {
        this.picUrl = '';
        this.refresh();
        this.edit({ activitiSync: '1' });
      },
      edit (record) {
        this.initDictData();
        this.resetScreenSize(); // 调用此方法,根据屏幕宽度自适应调整抽屉的宽度
        let that = this;
        that.form.resetFields();
        that.userId = record.id;
        that.username = record.username;
        that.realname = record.realname;
        that.visible = true;
        // 调用查询用户对应的部门信息的方法
        that.checkedDepartKeys = [];
        that.loadRules(that.userId);
      },
      //
      loadRules() {
        let that = this;
        getAction(that.url.usrRule, { usrId: that.userId }).then((res) => {
          if(res.result){
            that.checkedDepartKeys =  res.result.frontSupRuleDepart.split(',');
            that.checkedDepartNameString = res.result.frontSupRuleDepartNames;
            this.form.setFieldsValue({ checkedDepartNameString: that.checkedDepartNameString })
          }
        })
      },
      close () {
        this.$emit('close');
        this.visible = false;
        this.disableSubmit = false;
        this.selectedRole = [];
        this.userDepartModel = { userId: '', departIdList: [] };
        this.checkedDepartNames = [];
        this.checkedDepartNameString = '';
        this.checkedDepartKeys = [];
        this.selectedDepartKeys = [];
        this.resultDepartOptions = [];
        this.departIds = [];
        this.departIdShow = false;
        this.identity = '1';
        this.fileList = [];
      },
      moment,
      handleSubmit () {

        let that = this;
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            var params = '&deptIds=' + this.checkedDepartKeys.join(',') + '&departNames=' + this.checkedDepartNameString + '&usrId=' + this.userId ;
            postAction(that.url.saveRule, params).then((res) => {
              if (res.success) {
                that.$message.success(res.message);
              } else {
                that.$message.warning(res.message);
              }
              that.visible = false;
              that.$emit('ok');
            }).finally(() => {
              that.visible = false;
              that.$emit('ok');
            })
          }
        })
      },
      handleCancel () {
        this.close()
      },
      handleConfirmBlur  (e) {
        const value = e.target.value;
        this.confirmDirty = this.confirmDirty || !!value
      },

      normFile  (e) {
        console.log('Upload event:', e);
        if (Array.isArray(e)) {
          return e
        }
        return e && e.fileList
      },
      beforeUpload: function(file) {
        var fileType = file.type;
        if (fileType.indexOf('image') < 0) {
          this.$message.warning('请上传图片');
          return false;
        }
        // TODO 验证文件大小
      },
      handleChange (val) {
        this.busTypes = val;
      },
      // 搜索用户对应的部门API
      onSearch() {
        this.$refs.departWindow.add(this.checkedDepartKeys, this.userId);
      },

      // 获取用户对应部门弹出框提交给返回的数据
      modalFormOk (formData) {
        this.checkedDepartNames = [];
        this.checkedDepartNameString = '';
        this.departIds = [];
        for (let i = 0; i < formData.departIdList.length; i++) {
          this.checkedDepartNames.push(formData.departIdList[i].title);
          this.selectedDepartKeys.push(formData.departIdList[i].key);
          this.checkedDepartNameString = this.checkedDepartNames.join(',');
        }
        this.checkedDepartKeys = this.selectedDepartKeys // 更新当前的选择keys
        this.form.setFieldsValue({ checkedDepartNameString: this.checkedDepartNameString })
       },
      // 根据屏幕变化,设置抽屉尺寸
      resetScreenSize() {
        let screenWidth = document.body.clientWidth;
        if (screenWidth < 500) {
          this.drawerWidth = screenWidth;
        } else {
          this.drawerWidth = 700;
        }
      },
      identityChange(e) {
        if (e.target.value === '1') {
            this.departIdShow = false;
        } else {
            this.departIdShow = true;
        }
      }
    }
  }
</script>

<style scoped>
  .avatar-uploader > .ant-upload {
    width:104px;
    height:104px;
  }
  .ant-upload-select-picture-card i {
    font-size: 49px;
    color: #999;
  }

  .ant-upload-select-picture-card .ant-upload-text {
    margin-top: 8px;
    color: #666;
  }

  .ant-table-tbody .ant-table-row td{
    padding-top:10px;
    padding-bottom:10px;
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
