<template>
  <a-modal
    :width="modalWidth"
    :visible="visible"
    title="部门搜索"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
    cancelText="关闭"
    wrapClassName="ant-modal-cust-warp"
    >
    <!--部门树-->
    <template>
      <a-form :form="form">
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="部门">
        <a-tree
          v-model="checkedKeys"
          checkable
          :tree-data="departTree"
          @check="onCheck"
        />
     <!-- <a-tree
        multiple
        treeCheckable="tree"
        checkable
        @expand="onExpand"
        :expanded-keys="expandedKeysss"
        :checkedKeys="checkedKeys"
        allowClear="true"
        :checkStrictly="false"
        @check="onCheck"
        :dropdownStyle="{maxHeight:'200px',overflow:'auto'}"
        :treeData="departTree"
        placeholder="请选择上级部门"
        >
      </a-tree>-->
      </a-form-item>
      </a-form>
    </template>
  </a-modal>
</template>

<script>
  import pick from 'lodash.pick'
  import { getAction } from '@/api/manage'
  import { queryIdTree } from '@/api/api'
  import userModal from './UserModal'
  export default {
    name: "DepartWindow",
    props: {
      twoType: {
        type: Number,
        default: 2
      }
    },
    components: {
      userModal,
    },
    data () {
      return {
        autoExpandParent: true,
        selectedKeys: [],
        checkedKeys:[], // 存储选中的部门id
        expandedKeysss:[],//展开的节点
        userId:"", // 存储用户id
        model:{}, // 存储SysUserDepartsVO表
        userDepartModel:{userId:'',departIdList:[]}, // 存储用户id一对多部门信息的对象
        departList:[], // 存储部门信息
        modalWidth:400,
        departTree:[],
        title:"操作",
        visible: false,
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        confirmLoading: false,
        headers:{},
        form:this.$form.createForm(this),
        url: {
          userId:"/sys/user/generateUserId", // 引入生成添加用户情况下的url
        },
      }
    },
    methods: {
      add (checkedDepartKeys,userId) {
        this.checkedKeys = checkedDepartKeys;
        this.userId = userId;
        this.edit({});
      },
      edit (record) {
        this.departList = [];
        this.queryDepartTree();
        this.form.resetFields();
        this.visible = true;
        this.model = Object.assign({}, record);
        let filedsVal = pick(this.model,'id','userId','departIdList');
        this.$nextTick(() => {
          this.form.setFieldsValue(filedsVal);
        });
      },
      close () {
        this.$emit('close');
        this.visible = false;
        this.departList = [];
        this.checkedKeys = [];
      },
      handleSubmit () {
        const that = this;
        // 触发表单验证
        this.form.validateFields((err) => {
          if (!err) {
            that.confirmLoading = true;
            if(this.userId == null){
              getAction(this.url.userId).then((res)=>{
                if(res.success){
                  let formData = {userId:res.result,
                  departIdList:this.departList}
                  that.$emit('ok', formData);
                }
              }).finally(() => {
                that.departList = [];
                that.confirmLoading = false;
                that.close();
              })
            }else {
              let formData = {userId:this.userId,
                departIdList:this.departList}
              that.departList = [];
              that.$emit('ok', formData);
              that.confirmLoading = false;
              that.close();
            }
          }
        })
      },
      handleCancel () {
        this.close()
      },
      // 选择部门时作用的API
      onCheck(checkedKeys, info){
        this.departList = [];
        let checkedNodes = info.checkedNodes;
        for (let i = 0; i < checkedNodes.length; i++) {
          let depart = {};
          depart.key = checkedNodes[i].key;
          depart.title = checkedNodes[i].data.props.title;
          this.departList.push(depart);
        }
      },
      queryDepartTree(){
        queryIdTree().then((res)=>{
          if(res.success){
            if (this.twoType === 1) {
              const result = res.result
              let list = []
              result.forEach((item, index) => {
                list.push({
                  children: [],
                  key: item.key,
                  title: item.title
                })
                item.children.forEach(citem => {
                  list[index].children.push({
                    key: citem.key,
                    title: citem.title
                  })
                })
              })
              this.departTree = list
            } else {
              this.departTree = res.result;
            }
          }
        })
      },
      modalFormOk(){

      }
      },
  }
</script>

<style scoped>
  .ant-table-tbody .ant-table-row td{
    padding-top:10px;
    padding-bottom:10px;
  }
</style>