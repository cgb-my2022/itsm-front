<template>
  <a-modal
    :title="title"
    :width="1200"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :okButtonProps="{ props: {disabled: disableSubmit} }"
    @ok="handleOkConfirm"
    @cancel="handleCancel"
    cancelText="关闭">
    <a-spin :spinning="confirmLoading">
      <!-- 主表单区域 -->
      <a-form :form="form">
        <a-row>

          <a-col :xs="24" :sm="12">
            <a-form-item label="用户名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['userName',{initialValue:userInfo().username}]" :disabled="true" placeholder="请输入用户名称"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="真实姓名" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['realName',{initialValue:userInfo().realname}]" :disabled="true" placeholder="请输入用户名称"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="电话号码" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['phoneNo',{initialValue:userInfo().phone}]" :disabled="true" placeholder="请输入电话号码"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="所属部门名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['deptName',{initialValue:userInfo().myDeptParentNames}]" :disabled="true" placeholder="请输入部门名称"></a-input>
              <a-input v-decorator="['sysOrgCode',{initialValue:userInfo().orgCode}]" type="hidden" ></a-input>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="工作地点部门" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-cascader
                v-decorator="['workplaceDepartids',{initialValue: defaultWorkplaceDeparts,rules: [
                  { type: 'array', required: true, message: '请选择工作地点部门' },
                ],},]"
                :options="departTree"
                :showSearch="true"
                :fieldNames="{ label: 'title', value: 'id', children: 'children' }"
                :show-search="{ filter }"
                placeholder="请选择部门"
                @change="onChange"
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="详细工作地点" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['workplaceDetail',{initialValue:userInfo().workplaceDetail}]" placeholder="请输入详细工作地点"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="业务类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag type="list" v-decorator="['businessType', validatorRules.businessType]" :trigger-change="true" dictCode="SERVICE_ORDER_BUSINESS_TYPE" placeholder="请选择业务类型"/>
            </a-form-item>
          </a-col>
         <!-- <a-col :xs="24" :sm="12">
            <a-form-item label="问题类别" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag type="list" v-decorator="['problemType', validatorRules.problemType]" :trigger-change="true" dictCode="problem_type" placeholder="请选择问题类别"/>
            </a-form-item>
          </a-col>-->
          <!--<a-col :span="24">
            <a-form-item label="设备信息" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
              <a-textarea v-decorator="['deviceInfo']" rows="4" placeholder="请输入设备信息"/>
            </a-form-item>
          </a-col>-->
          <a-col :span="24">
            <a-form-item label="事件内容" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
              <a-textarea v-decorator="['eventContent', validatorRules.eventContent]" rows="4" placeholder="请输入事件内容"/>
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
            :maxHeight="300"
            :rowNumber="true"
            :rowSelection="true"
            :actionButton="true"/>
        </a-tab-pane>

      </a-tabs>

    </a-spin>
  </a-modal>
</template>

<script>

  import pick from 'lodash.pick'
  import { FormTypes, getRefPromise } from '@/utils/JEditableTableUtil'
  import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
  import JDictSelectTag from '@/components/dict/JDictSelectTag'
  import { mapGetters } from 'vuex'
  import { queryIdTree, queryDepartTreeList } from '@/api/api'

  export default {
    name: 'ServiceOrderModal',
    mixins: [JEditableTableMixin],
    components: {
      JDictSelectTag
    },
    data() {
      return {
        disableSubmit: false,
        flowCode: 'onl_service_order',
        defaultWorkplaceDeparts: [],
        departTree: [],
        labelCol: {
          xs: { span: 24 },
          sm: { span: 6 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 }
        },
        labelCol2: {
          xs: { span: 24 },
          sm: { span: 3 }
        },
        wrapperCol2: {
          xs: { span: 24 },
          sm: { span: 20 }
        },
        // 新增时子表默认添加几行空数据
        addDefaultRowNum: 1,
        validatorRules: {
            workplaceCompany: {
            rules: [
              { required: true, message: '请输入工作地点公司!' }
            ]
          },
          businessType: {
            rules: [
              { required: true, message: '请选择业务类型!' }
            ]
          },
          problemType: {
            rules: [
              { required: true, message: '请选择问题类别!' }
            ]
          },
          eventContent: {
            rules: [
              { required: true, message: '请输入事件内容!' }
            ]
          }
        },
        refKeys: ['serviceOrderAttach' ],
        tableKeys: ['serviceOrderAttach' ],
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
              width: '200px',
              placeholder: '请输入${title}',
              defaultValue: ''
            }
          ]
        },
        url: {
          add: '/system/serviceOrder/addAndSubmit',
          edit: '/system/serviceOrder/edit',
          startProcess: '/process/extActProcess/startMutilProcess',
          serviceOrderAttach: {
            list: '/system/serviceOrder/queryServiceOrderAttachByMainId'
          }
        }
      }
    },
    created() {
      this.queryDepartTree();
      this.defaultWorkplaceDeparts = JSON.parse(this.userInfo().workplaceDeptParentIdes);
    },
    methods: {
      ...mapGetters(['userInfo']),
      handleOkConfirm: function() {
        let that = this;
        this.$confirm({
          title: '提示',
          content: '确认提交流程吗?',
          onOk: function() {
            that.handleOk();
          }
        });
      },
      // 三级地址选择
      handleAddressFun: function(e, form, thsAreaCode) {
        // thsAreaCode = this.form.areaCode    // 注意1：获取value值
        thsAreaCode = this.$refs['cascaderAddr'].currentLabels // 注意2： 获取label值
        alert(thsAreaCode) // 注意3： 最终结果是个一维数组对象
      },
      loadTreeData() {
        var that = this;
        queryIdTree().then((res) => {
          if (res.success) {
            that.departTree = [];
            for (let i = 0; i < res.result.length; i++) {
              let temp = res.result[i];
              that.departTree.push(temp);
            }
          }
        })
      },
      onChange(value, selectedOptions) {
        console.log(value, selectedOptions);
      },
      filter(inputValue, path) {
        return path.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
      },
      getAllTable() {
        let values = this.tableKeys.map(key => getRefPromise(this, key))
        return Promise.all(values)
      },
      /** 调用完edit()方法之后会自动调用此方法 */
      editAfter() {
        let fieldval = pick(this.model, 'userName', 'realName', 'phoneNo', 'deptName', 'workplaceDepartids', 'workplaceDetail', 'businessType', 'deviceInfo', 'eventContent', 'bpmStatus', 'createTime')
        let workplaceDepartids = fieldval.workplaceDepartids;
        if (workplaceDepartids) {
          fieldval.workplaceDepartids = JSON.parse(workplaceDepartids);
        }
        this.$nextTick(() => {
          this.form.setFieldsValue(fieldval)
        })
        // 加载子表数据
        if (this.model.id) {
          let params = { id: this.model.id }
          this.requestSubTableData(this.url.serviceOrderAttach.list, params, this.serviceOrderAttachTable)
        }
      },
      /** 整理成formData */
      classifyIntoFormData(allValues) {
        let main = Object.assign(this.model, allValues.formValue)
        return {
          ...main, // 展开
          serviceOrderAttachList: allValues.tablesValue[0].values
        }
      },
      validateError(msg) {
        this.$message.error(msg)
      },
      popupCallback(row) {
        this.form.setFieldsValue(pick(row, 'userName', 'realName', 'phoneNo', 'deptName', 'workplaceDepartids', 'workplaceDetail', 'businessType', 'deviceInfo', 'eventContent', 'bpmStatus', 'createTime'))
      },
      queryDepartTree() {
        queryDepartTreeList().then((res) => {
          if (res.success) {
            this.departTree = res.result;
          }
        })
      },
      updateElCascaderStyle(value) {
        // 效果：项目名称的input框随着内容的长度而自适应，设置 el_cascader 标签的width
        var el_cascader_element = document.querySelector('#el-cascader')
        var length = value.join('.').length + 1
        var num = length * 9 + 'px'
        el_cascader_element.style.width = num
      }

    }
  }
</script>

<style scoped>
</style>
