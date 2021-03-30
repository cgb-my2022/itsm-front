<template>
  <a-modal
    destroyOnClose
    :title="title"
    :width="1000"
    :visible="visible"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭">

    <div>
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
    </div>

    <biz-service-select-single-user-modal ref="selectSingleUserModal" @selectFinished="selectUserOK"></biz-service-select-single-user-modal>
  </a-modal>
</template>

<script>
  import BizServiceSelectSingleUserModal from './BizServiceSelectSingleUserModal.vue';

  export default {
    components: {
      BizServiceSelectSingleUserModal },
    name: 'BizServiceTaskSelectEntrusterModal',
    data() {
      return {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 2 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 }
        },
        title: '',
        visible: false,
        model: {
          userName: '',
          businessType: 1
        },
        userInfo: {},
        serviceParam: {
          flag: 1,
          companyCode: ''
        }
      }
    },
    created() {

    },
    methods: {
      handleCancel() {
        this.visible = false;
      },
      handleOk() {
        alert(this.model.businessType)
        this.$emit('selectFinished', this.model);
        this.visible = false;
      },
      selectUserOK: function(data) {
        this.model.userName = data.realname;
        this.userInfo = data;
      },

      select(flag, businessType) {
        this.visible = true;
        this.serviceParam.flag = flag;
        this.model.businessType = businessType;
      },
      handleSelect: function() {
        this.$refs.selectSingleUserModal.select(this.serviceParam.flag);
      },
      hqUserSelectReset() {
        // this.hqUserSelectList = {};
      }
    }
  }
</script>

<style scoped>

</style>
