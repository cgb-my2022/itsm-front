<template>
  <a-form :form="form">
    <a-card id="staffCard" style="margin: 0 auto;max-width: 750px">
      <a-tag color="cyan">
        {{ statusName }}
      </a-tag>
      <template v-if="model.orderStatusDetail===4">
        <a-tag color="red">
          挂起原因：{{ model.frontPendingReason }}
        </a-tag>
      </template>
      <template v-if="model.orderStatusDetail===5||model.orderStatusDetail===6">
        <a-tag color="red">
          转二线原因：{{ model.transferReason }}
        </a-tag>
      </template>
      <template v-if="model.orderStatusDetail===7">
        <a-tag color="red">
          挂起原因：{{ model.supportPendingReason }}
        </a-tag>
      </template>
      <template v-if="model.orderStatusDetail===12||model.orderStatusDetail===13">
        <a-tag color="red">
          备注：{{ model.remark }}
        </a-tag>
      </template>
      <span id="staffLeaveTitle">服务请求</span>
      <span style="text-align: right;display: block;font-size: 12px;margin-bottom: 3px">编号:{{ model.id }}</span>
      <!--<div class="staffLeaveTableId" style="margin-bottom: 5px">
          <a-form-item
            :labelCol="{xs: { span: 24 },sm: { span: 10 }}"
            :wrapperCol="{xs: { span: 24 },sm: { span: 10 }}"
            label="编号:">{{model.id}}
            &lt;!&ndash;<a-input  class="fontiframe" v-model="model.id" readOnly/>&ndash;&gt;
          </a-form-item>
        </div>-->
      <j-form-container :disabled="true">
        <table border="1px" id="staffLeaveTable">
          <tr>
            <td class="firstTr">账号</td>
            <td class="firstTr">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol">
                <a-input class="text" v-decorator="[ 'name', {}]" />
              </a-form-item>
            </td>
            <!--<td class="firstTr">真实姓名</td>
            <td class="firstTr">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol">
                <a-input class="text" v-decorator="[ 'realName', {}]" />
              </a-form-item>
            </td>-->
            <td class="firstTr">电话号码</td>
          <td class="firstTr">
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol">
              <a-textarea class="text" v-decorator="[ 'phoneNo', {}]" />
            </a-form-item>
          </td>
            </tr>
          <tr>
            <td class="firstTr">业务类型</td>
            <td class="firstTr" colspan="5">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol">
                <a-input class="text" v-decorator="[ 'businessName', {}]" />
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td class="firstTr">所属部门名称</td>
            <td class="firstTr" colspan="5">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol">
                <a-textarea class="text" v-decorator="[ 'deptName', {}]" />
              </a-form-item>
            </td>
          </tr>

          <tr>
            <td class="firstTr">工作地点部门</td>
            <td class="firstTr" colspan="4">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol">
                <a-textarea class="text" v-decorator="[ 'workplaceDepartnames', {}]" />
              </a-form-item>
            </td>
          </tr>

          <tr>
            <td class="firstTr">详细工作地点</td>
            <td class="firstTr" colspan="4">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol">
                <a-textarea class="text" v-decorator="[ 'workplaceDetail', {}]" />
              </a-form-item>
            </td>
          </tr>

          <!--<tr>
            <td class="firstTr">设备信息</td>
            <td class="firstTr"  colspan="4">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol">
                <a-textarea class="text"  v-decorator="[ 'deviceInfo', {}]" />
              </a-form-item>
            </td>
          </tr>-->

          <tr>
            <td class="firstTr">事件内容</td>
            <td class="firstTr" colspan="4">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol">
                <a-textarea class="text" :autosize="true" v-decorator="[ 'eventContent', {}]" />
              </a-form-item>
            </td>
          </tr>
          <template v-if="model.orderStatusDetail===8||model.orderStatusDetail===9">
          <tr>
            <td class="firstTr">问题原因</td>
            <td class="firstTr" colspan="4">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol">
                <a-textarea class="text"  v-decorator="[ 'reason', {}]" />
              </a-form-item>
            </td>
          </tr>

          <tr>
            <td class="firstTr">解决方案</td>
            <td class="firstTr" colspan="4">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol">
                <a-textarea class="text" v-decorator="[ 'solution', {}]" />
              </a-form-item>
            </td>
          </tr>
          </template>
        </table>
      </j-form-container>
      <a-spin :spinning="confirmLoading">
        <!-- 子表单区域 -->
        <j-editable-table
          :ref="refKeys[0]"
          :loading="serviceOrderAttachTable.loading"
          :columns="serviceOrderAttachTable.columns"
          :dataSource="serviceOrderAttachTable.dataSource"
          :maxHeight="300"
          :rowNumber="true"
        />
      </a-spin>
    </a-card>
  </a-form>
</template>

<script>
  import { getAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import { FormTypes, getRefPromise } from '@/utils/JEditableTableUtil'
  import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
  import JDictSelectTag from '@/components/dict/JDictSelectTag'
  import { mapGetters } from 'vuex'
  import { queryIdTree, queryDepartTreeList } from '@/api/api'
  import { filterDictTextByCache } from '@/components/dict/JDictSelectUtil'

  export default {
    name: 'ServiceOrderForm',
    props: ['formData'],
    mixins: [JEditableTableMixin],
    components: {
      JDictSelectTag
    },
    data() {
      return {
        statusName: '',
        disableSubmit: false,
        departTree: [],
        labelCol: {
          xs: { span: 24 },
          sm: { span: 3 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 21 }
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
              { required: true, message: '请输入业务类型!' }
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
              title: '附件',
              key: 'attachUrl',
              type: FormTypes.fileView,
              token: true,
              responseName: 'message',
              width: '200px',
              placeholder: '请输入${title}',
              defaultValue: '',
              actionButton: false
            }
          ]
        },
        url: {
          queryById: '/system/serviceOrder/queryById',
          add: '/system/serviceOrder/add',
          edit: '/system/serviceOrder/edit',
          serviceOrderAttach: {
            list: '/system/serviceOrder/queryServiceOrderAttachByMainId'
          }
        }
      }
    },
    created() {
      this.queryDepartTree();
      this.edit(this.formData);
    },
    methods: {
      ...mapGetters(['userInfo']),
      getStatus(statusCode) {
        return filterDictTextByCache('service_order_status', statusCode);
      },
      getProblemType(problemType) {
        return filterDictTextByCache('problem_type', problemType);
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
        let fieldval = pick(this.model, 'userName', 'realName', 'phoneNo', 'deptName', 'workplaceDepartids', 'workplaceDepartnames', 'workplaceDetail', 'businessType', 'businessName', 'deviceInfo', 'eventContent', 'bpmStatus', 'createTime', 'orderStatus', 'reason', 'solution', 'problemType', 'remark')

        this.statusName = this.getStatus(fieldval.orderStatus);
        let orderStatusDetail = this.model.orderStatusDetail
        if (orderStatusDetail === 3 || orderStatusDetail === 4 || orderStatusDetail === 12) {
          this.statusName += '(' + this.model.frontlineUserRealname + ')';
        } else if (orderStatusDetail === 6 || orderStatusDetail === 7 || orderStatusDetail === 13) {
          this.statusName += '(' + this.model.supportUserRealname + ')';
        }else if (orderStatusDetail === 8 || orderStatusDetail === 9) {
          this.statusName += '(' + this.model.realName + ')';
        }

        let workplaceDepartids = fieldval.workplaceDepartids;
        fieldval.workplaceDepartids = JSON.parse(workplaceDepartids);

        fieldval.name = fieldval.userName + '(' + fieldval.realName + ')';
        fieldval.problemTypeName = this.getProblemType(fieldval.problemType);
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

<style >
  #staffCard {
    border: 1px solid white;
    box-shadow: 0px 0px 1px 1px #aaa,
    3px 0px 5px 0px #aaa,
    0px 4px 7px 0px #aaa;
  }

  #staffLeaveTitle {
    margin-top: 1px;
    font-weight: bold;
    text-align: center;
    display: block;
    color: black;
    font-size: 24px;;
  }

  #staffLeaveTable {
    width: 100%;
    font-size: 12px;
    text-align: center;
    background-color: #FFFFFF;
  }

  #staffLeaveTable td {
    font-family: "微软雅黑";
    color: #000000;
  }

  #staffLeaveTable .fontiframe {
    font-size: 12px;
  }
  #staffLeaveTable .ant-form-item {
    margin: 0px;
  }

  #staffLeaveTable .input .ant-input {
    border: 0px solid black !important;
    border-radius: 0px;
    display: inherit;
    background-color: #FFFFFF;
  }

  .staffLeaveTableId  .ant-input {
    border: 0px solid black !important;
    border-radius: 0px;
    display: inherit;
    background-color: #ffffff;
    margin: 0px;
    width:255px;
  }

  .staffLeaveTableId{
    margin-right: 87px;
    float: right;
    height: 35px;
  }

  #staffLeaveTable .text{
    border: 0px solid black !important;
    border-radius: 0px;
    background-color: #FFFFFF;
    margin: 0px;
    width: 100%;
    font-size: 12px;
  }

  #staffLeaveTable .colfirst {
    width: 90px;
  }

  #staffLeaveTable .colfour {
    width: 90px;
  }

  #staffLeaveTable .firstTr {
    width: 16%;
  }
  #staffLeaveTable .fifthTr .ant-form-item-control-wrapper{
    width:50%;
  }
  .ant-form label {
    font-size: 12px;
  }
  #staffLeaveTable .smallText .ant-input-number-input{
    background-color: #FFFFFF;
    margin: 0px
  }
  #staffLeaveTable .lineHeight .ant-form-item-control{
    line-height: 0px;
  }
</style>
