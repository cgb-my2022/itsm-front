<template>
  <a-modal
    :visible="visible"
    title="添加业务"
    destroyOnClose
    :bodyStyle="bodyStyle"
    :width="600"
    :maskClosable="false"
    :confirmLoading="confirmLoading"
    @ok="handleOkConfirm"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <a-spin :spinning="confirmLoading" style="margin-top: 20px">
      <!-- 主表单区域 -->
      <a-form-model :model="fromData" :rules="rules" ref="ruleForm" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="工单类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-select placeholder="全部" style="width: 200px" v-model="fromData.orderType" @change="changeType">
                <a-select-option v-for="(item, key) in dictOptions" :key="key" :value="item.value">
                  <span style="display: inline-block; width: 100%" :title="item.text || item.label">
                    {{ item.text || item.label }}
                  </span>
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col> 
          <a-col v-if="fromData.orderType == 1" :span="24">
            <a-form-model-item ref="catIds" label="负责业务" prop="catIds">
              <a-tree-select
                show-search
                style="width: 100%"
                :value="fromData.catIds"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                placeholder="请选择"
                allow-clear
                multiple
                :maxTagCount="4"
                :tree-data="quickOptions"
                tree-checkable
                tree-default-expand-all
                :replace-fields="{ title: 'title', value: 'id', key: 'id', children: 'children' }"
                :filterTreeNode="searchFilterTreeNode"
                @change="changeCat"
                @blur="
                  () => {
                    $refs.catIds.onFieldBlur()
                  }
                ">
              </a-tree-select>
            </a-form-model-item>
          </a-col>
          <a-col v-if="fromData.orderType == 2" :span="24">
            <a-form-model-item ref="catIds" label="事件类型" prop="catIds">
              <a-tree-select
                show-search
                style="width: 100%"
                :value="fromData.catIds"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                placeholder="请选择"
                allow-clear
                multiple
                :maxTagCount="4"
                :tree-data="categoryOptions"
                tree-checkable
                tree-default-expand-all
                :replace-fields="{ title: 'title', value: 'id', key: 'id', children: 'children' }"
                :filterTreeNode="searchFilterTreeNode"
                @change="changeCat"
                @blur="
                  () => {
                    $refs.catIds.onFieldBlur()
                  }
                ">
              </a-tree-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item ref="departIds" label="负责公司/园区" prop="departIds">
              <a-tree-select
                show-search
                style="width: 100%"
                :value="fromData.departIds"
                :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
                placeholder="请选择"
                allow-clear
                multiple
                :maxTagCount="4"
                :tree-data="departTree"
                tree-checkable
                tree-default-expand-all
                :replace-fields="{ title: 'title', value: 'key', key: 'key', children: 'children' }"
                :filterTreeNode="searchFilterTreeNode"
                @change="changeDepart"
                @blur="
                  () => {
                    $refs.departIds.onFieldBlur()
                  }
                "
              >
              </a-tree-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item ref="ruleStatus" label="是否接单" prop="ruleStatus">
              <a-switch default-checked v-model="fromData.ruleStatus" @change="onChange" />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
import { postAction, putAction } from '@/api/manage'
import { ServiceMixin } from '@/views/modules/service/staff/mixins/ServiceMixin'
import { ajaxGetCategoryItems, getDictItemsFromCache, queryIdTree } from '@/api/api'

export default {
  name: 'StaffServiceEvaluation',
  mixins: [ServiceMixin],
  data() {
    return {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      visible: false,
      confirmLoading: false,
      bodyStyle: {
        padding: '0',
        'overflow-y': 'auto',
      },
      rules: {
        catIds: [{ required: true, message: '请选择负责业务', trigger: 'change' }],
        departIds: [{ required: true, message: '请选择负责公司/园区', trigger: 'change' }],
      },
      fromData: {
        id: null,
        userId: null,
        orderType: '',
        catIds: [],
        catNames: '',
        departIds: [],
        departNames: '',
        ruleStatus: true,
      }, 
      operations: 1,
      url: [
        //一线运维人员新增接单规则
        {
          add: '/system/userOrderRule/frontAdd',   
          edit: '/system/userOrderRule/edit'
        },
        //二线运维人员新增接单规则
        {
          add: '/system/userOrderRule/supportAdd',   
          edit: '/system/userOrderRule/edit'
        }
      ],
      dictUrl: '/sys/category/treeMap',
      departTree: [],
      dictOptions: [], // 工单类型
      categoryOptions: []  //事件类型内容
    }
  },
  created() {
    this.getCatalog(3)
    this.initDictData()
    this.queryDepartTree()
  },
  methods: {
    // 初始化工单类型
    initDictData() {
      let dictCode = 'B04'
      // 优先从缓存中读取字典配置
      if (getDictItemsFromCache(dictCode, 1)) {
        this.categoryOptions = getDictItemsFromCache(dictCode, 1).children      
        return
      }
      // 根据字典Code, 初始化字典数组
      ajaxGetCategoryItems().then((res) => {
        if (res.success) {
          this.categoryOptions = res.result[dictCode].children
        }
      })
    },
    // 获取公司/园区
    queryDepartTree(){
      queryIdTree().then((res)=>{
        if(res.success){
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
        }
      })
    },
    // 切换类型
    changeType() {
      this.fromData.catIds = []
      this.fromData.catNames = ""  
    },
    // 添加初始化
    deal(dictOptions, operations, userId, record) {
      const option = JSON.parse(JSON.stringify(dictOptions))
      const arr = option.splice(1, option.length - 1)
      this.dictOptions = arr
      if (arr.length > 0) {
        if (record) {
          Object.keys(this.fromData).forEach(item => {
            if(item.indexOf("Ids") != -1) {
              this.fromData[item] = record[item].split(",")
            } else if (item === 'ruleStatus') {
              this.fromData[item] = record[item] === 1 ? true : false
            } else if (item === 'orderType'){
              this.fromData[item] = record[item] + ''
            } else {
              this.fromData[item] = record[item]
            }
          })
        } else {
          this.fromData = {
            id: null,
            userId: userId,
            orderType: arr[0].value,
            catIds: [],
            catNames: '',
            departIds: [],
            departNames: '',
            ruleStatus: true,
          }
        }
      }
      this.operations = operations
      this.visible = true
    },
    //多选搜索过滤
    searchFilterTreeNode(inputValue, treeNode){
        return (
            treeNode.componentOptions.propsData.title.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
        );
    },
    // 选择部门 
    changeDepart(value, label) {
      this.fromData.departIds = value
      this.fromData.departNames = label.join(";")
    },
    // 选项业务
    changeCat(value, label) {
      this.fromData.catIds = value
      this.fromData.catNames = label.join(";")
    },
    // 是否接单
    onChange(value) {
      this.fromData.ruleStatus = value
    },
    setObj(data) {
      return JSON.parse(JSON.stringify(data))
    },
    // 提交
    handleOkConfirm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          const urls = this.url[this.operations-1]
          let params = this.setObj(this.fromData)
          params.catIds = params.catIds.join(",")
          params.departIds = params.departIds.join(",")
          params.ruleStatus = params.ruleStatus ? 1 : 0
          this.confirmLoading = true
          const url = params.id ? urls.edit :  urls.add
          const axo =  params.id ? putAction(url, params) : postAction(url, params)
          axo.then((res) => {
              this.confirmLoading = false
              if (res.code === 200) {
                this.$message.success(res.message)
                this.handleCancel()
                this.$emit('closeLoad')
              } else {
                this.$message.warning(res.message)
              }
            })
            .finally(() => {
              this.confirmLoading = false
              return ''
            })
        } else {
          return false
        }
      })
    },
    handleCancel() {
      this.$refs.ruleForm.resetFields()
      this.visible = false
    },
  },
}
</script>