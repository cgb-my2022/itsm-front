<template>
  <a-modal
    destroyOnClose
    :title="title"
    :width="600"
    :visible="visible"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭">
      <a-spin :spinning="confirmLoading">
        <!-- 主表单区域 -->
        <a-form :form="form">
            <a-row>
              <a-col :span="24">
                <a-form-item label="选择业务" :labelCol="labelCol" :wrapperCol="wrapperCol">
                    <!-- :disabled="this.rowInfo.orderType==2" -->
                  <a-cascader 
                    :allowClear="false"
                    placeholder="请选择"  
                    :field-names="{ label: 'title', value: 'id', children: 'children' }"
                    :show-search="{ filter }"
                    v-decorator="['serviceCatIds', {
                        rules: [{ required: true, message: '请选择业务!' }]
                    }]"
                    :options="quickOptions"
                    change-on-select 
                    expand-trigger="hover"
                    @change="catalogChange"/>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="24">
                <a-form-item label="用户名" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <div style="display:flex;">
                    <a-input
                      autocomplete="off"
                      @click="handleSelect"
                      placeholder="点击选择用户"
                      v-decorator="['userName', {
                        rules: [{ required: true, message: '请选择用户!' }]
                      }]">
                    </a-input>
                    <a-button icon="search" @click="handleSelect">选择</a-button>
                  </div>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row v-if="setStatus([10, 11], orderStatusDetail)">
                <a-col :span="24">
                  <a-form-item label="转办原因" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                    <a-textarea 
                    v-decorator="['transferReason', {
                      rules: [{ required: true, message: '请输入转办原因!' }]
                    }]"
                    :maxLength="300"
                    rows="4" 
                    placeholder="请输入转办原因(有效长度1-300)"/>
                  </a-form-item>
                </a-col>
            </a-row>
        </a-form>
      </a-spin>
    <!-- <div>
      <a-form-item label="业务类型：" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
        <j-dict-select-tag
          type="list"
          v-model="model.businessType"
          dictCode="SERVICE_ORDER_BUSINESS_TYPE" />
      </a-form-item>
      <a-form-item label="用户名：" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
        <a-input-search placeholder="点击选择用户" @search="handleSelect" v-model="model.userName">
          <a-button slot="enterButton" icon="search">选择</a-button>
        </a-input-search>
      </a-form-item>
    </div> -->
    <!-- 其他人员选择 -->
    <biz-service-select-single-user-modal ref="selectSingleUserModal" @selectFinished="selectUserOK"></biz-service-select-single-user-modal>
    <!-- vip人员选择 -->
    <service-user :url="vipUrl" ref="serviceUser" @selectFinished="selectUserOK"></service-user>
  </a-modal>
</template>

<script>
  import BizServiceSelectSingleUserModal from './BizServiceSelectSingleUserModal.vue';
  import ServiceUser from '@/views/modules/events/modules/EventsUser'
  import { ServiceMixin } from '@/views/modules/service/mixins/ServiceMixin'
  import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
  import ARow from 'ant-design-vue/es/grid/Row'
  import pick from 'lodash.pick'
  export default {
    mixins: [ServiceMixin, JEditableTableMixin],
    components: { BizServiceSelectSingleUserModal, ARow, ServiceUser },
    name: 'BizServiceTaskSelectEntrusterModal',
    props: {
      isVip: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        disableSubmit: false,
        refKeys: ['serviceOrderAttach' ],
        addDefaultRowNum: 1,
        labelCol: {
          xs: { span: 24 },
          sm: { span: 4 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 }
        },
        labelCol2: {
          xs: { span: 24 },
          sm: { span: 4 }
        },
        wrapperCol2: {
          xs: { span: 24 },
          sm: { span: 20 }
        },
        userData: {},
        serviceParam: {
          flag: 1,
          companyCode: ''
        },
        rowInfo: {
          orderType: ""
        },
        orderStatusDetail: 0,
        vipUrl: "/system/usrServiceOrderRule/frontSup",
        vipParams: null
      }
    },
    computed: {
      setStatus() {
        return function(arr, status) {
          if(arr.indexOf(status) != -1) {
            return false
          }
          return true
        }
      }
    },
    created() {
      this.getCatalog(3)
    },
    methods: {
      handleCancel() {
        this.visible = false; 
      },
      handleOk(e) {
        e.preventDefault();
        this.form.validateFields((err, values) => {
          if (!err) {
            let rowInfo = JSON.parse(JSON.stringify(this.rowInfo))
            delete rowInfo.orderType
            rowInfo.transferReason = values.transferReason
            rowInfo.username = this.userData.username
            rowInfo.flag = this.serviceParam.flag
            this.$emit('selectFinished', rowInfo);
            this.visible = false;
          }
        });
      },
      selectUserOK: function(data) {
        console.log(data);
        let fieldval = pick(this.model)
        fieldval.userName = data.realname
        this.$nextTick(() => {
            this.form.setFieldsValue(fieldval)
        })
        this.userData = data;
      },

      select(flag, formData, vipUrl) {
        this.visible = true;
        this.serviceParam.flag = flag;
        this.rowInfo.orderType = formData.orderType
        this.orderStatusDetail = formData.orderStatusDetail
        if (vipUrl) {
          this.vipUrl =  vipUrl
          if (flag === 1) {
            this.vipParams = {
              deptId: formData.sysComCode
            }
          } else {
            this.vipParams = {
              departId: formData.sysComCode,
              catId: formData.serviceCatId,
              role: 'FRONTLINE_PERSONNEL'
            }
          }
        }
        this.showCatalog(formData)
      },
      handleSelect(e) {
        e.srcElement.blur()
        if (this.isVip) {
          // 选择主管
          if (this.serviceParam.flag != 1 && !this.vipParams.catId) {
            this.$message.warn("请先选择事件分类！")
            return
          } else {
            this.$refs.serviceUser.select(this.vipParams)
          }
        } else {
          this.$refs.selectSingleUserModal.select(this.serviceParam.flag)
        }
      },
      hqUserSelectReset() {
        // this.hqUserSelectList = {};
      }
    }
  }
</script>

<style scoped>

</style>
