<template>
  <a-form :form="form">
    <a-card id="staffCard" style="margin: 0 auto; max-width: 750px">
      <!-- 状态内容 -->
      <a-tag color="cyan">
        {{ statusName }}
      </a-tag>
      <template v-if="model.orderStatusDetail === 4">
        <a-tag color="red"> 挂起原因：{{ model.frontPendingReason }} </a-tag>
      </template>
      <template v-if="model.orderStatusDetail === 5 || model.orderStatusDetail === 6">
        <a-tag color="red"> 转二线原因：{{ model.transferReason }} </a-tag>
      </template>
      <template v-if="model.orderStatusDetail === 7">
        <a-tag color="red"> 挂起原因：{{ model.supportPendingReason }} </a-tag>
      </template>
      <template v-if="model.orderStatusDetail === 12 || model.orderStatusDetail === 13">
        <a-tag color="red"> 备注：{{ model.remark }} </a-tag>
      </template>
      <!-- 头部 -->
      <span id="staffLeaveTitle">服务请求</span>
      <div class="form-top">
        <ul>
          <li
            v-for="(item, index) in tabList"
            :key="index"
            :class="[index === tabIndex ? 'li-active1' : 'li-active2']"
            @click="chagenTab(index)"
          >
            {{ item }}
          </li>
        </ul>
        <span class="form-top_num">编号:{{ model.id }}</span>
      </div>
      <!-- 信息展示 -->
      <template v-if="tabIndex === 0">
        <j-form-container>
          <table border="1px" id="staffLeaveTable">
            <tr>
              <td class="firstTr">请求人</td>
              <td class="firstTr">
                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-input class="text" v-model="formData.serviceOrder.realName" />
                </a-form-item>
              </td>
              <td class="firstTr">创建时间</td>
              <td class="firstTr">
                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-input class="text" v-model="formData.serviceOrder.createTime" />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td class="firstTr">账号</td>
              <td class="firstTr">
                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-input class="text" v-model="formData.serviceOrder.userName" />
                </a-form-item>
              </td>
              <td class="firstTr">联系电话</td>
              <td class="firstTr">
                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-textarea class="text" v-model="formData.serviceOrder.phoneNo" />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td class="firstTr">所属部门</td>
              <td class="firstTr" colspan="5">
                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-textarea class="text" v-model="formData.serviceOrder.deptName" />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td class="firstTr">所在公司/园区</td>
              <td class="firstTr" colspan="4">
                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-textarea class="text" v-model="formData.serviceOrder.workplaceDepartnames" />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td class="firstTr">详细地址</td>
              <td class="firstTr" colspan="4">
                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-textarea class="text" v-model="formData.serviceOrder.workplaceDetail" />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td class="firstTr">请求内容</td>
              <td class="firstTr" colspan="4">
                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-textarea class="text" :autoSize="true" v-model="formData.serviceOrder.eventContent" />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td class="firstTr">所属业务</td>
              <td class="firstTr" colspan="5">
                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-input class="text" v-model="formData.serviceOrder.serviceCatFullName" />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td class="firstTr">相关资源</td>
              <td class="firstTr" colspan="5">
                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <span style="text-align: left">无</span>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td class="firstTr">服务工单附件</td>
              <td class="firstTr" colspan="5">
                <!-- 子表单区域 -->
                <a-spin :spinning="confirmLoading">
                  <j-editable-table
                    :ref="refKeys[0]"
                    :loading="serviceOrderAttachTable.loading"
                    :columns="serviceOrderAttachTable.columns"
                    :dataSource="formData.userAttaches || []"
                    :maxHeight="300"
                    :rowNumber="true"
                  />
                </a-spin>
              </td>
            </tr>
            <tr>
              <td class="firstTr">当前处理人</td>
              <td class="firstTr">
                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <span v-if="setRealname([2], model.orderStatusDetail)"></span>
                  <span v-else-if="setRealname([3, 4, 5, 12], model.orderStatusDetail)">{{
                    model.frontlineUserRealname
                  }}</span>
                  <span v-else-if="setRealname([10], model.orderStatusDetail)">{{ model.frontlineDelegateName }}</span>
                  <span v-else-if="setRealname([11], model.orderStatusDetail)">{{ model.supportDelegateName }}</span>
                  <span v-else-if="setRealname([8, 9, 14], model.orderStatusDetail)">{{ model.solRealName }}</span>
                  <span v-else-if="setRealname([6, 7, 13], model.orderStatusDetail)">{{
                    model.supportUserRealname
                  }}</span>
                  <span v-else></span>
                </a-form-item>
              </td>
              <td class="firstTr">处理时间</td>
              <td class="firstTr">
                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <span>{{formData.serviceOrder.comfirmTime}}</span>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td class="firstTr">问题原因</td>
              <td class="firstTr" colspan="4">
                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-textarea class="text" v-model="formData.serviceOrder.reason" />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td class="firstTr">解决方案</td>
              <td class="firstTr" colspan="4">
                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-textarea class="text" v-model="formData.serviceOrder.solution" />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td class="firstTr">解决工单附件</td>
              <td class="firstTr" colspan="5">
                <!-- 子表单区域 -->
                <a-spin :spinning="confirmLoading">
                  <j-editable-table
                    :ref="refKeys[0]"
                    :loading="serviceOrderAttachTable.loading"
                    :columns="serviceOrderAttachTable.columns"
                    :dataSource="formData.ywAttaches || []"
                    :maxHeight="300"
                    :rowNumber="true"
                  />
                </a-spin>
              </td>
            </tr>
            <tr>
              <td class="firstTr">服务满意度</td>
              <td class="firstTr" colspan="5">
                <span v-if="formData.orderEvaluation">
                  <a-rate v-model="value" style="color: red;"/>
                  <span class="ant-rate-text">{{formData.orderEvaluation.orderScore}}分</span>
                </span>
              </td>
            </tr>
            <tr>
              <td class="firstTr">评价留言</td>
              <td class="firstTr" colspan="5">
                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-textarea v-if="formData.orderEvaluation" class="text" v-model="formData.orderEvaluation.content" />
                </a-form-item>
              </td>
            </tr>
          </table>
        </j-form-container>
      </template>
      <!-- 流转记录 -->
      <template v-if="tabIndex === 1">
        <a-timeline v-if="formData.orderTracks && formData.orderTracks.length > 0" class="time-line">
          <template v-for="item in formData.orderTracks">
            <a-timeline-item :key="item.id">
              <div class="record-list">
                <p class="record-list_time">{{ item.createTime }}</p>
                <div class="record-list_right">
                  <p class="record-list_title">{{ item.title }}</p>
                  <p class="record-list_content" v-if="item.content">{{ item.content }}</p>
                </div>
              </div>
            </a-timeline-item>
          </template>
        </a-timeline>
        <p v-else class="record-null">暂无流转记录</p>
      </template>
    </a-card>
  </a-form>
</template>

<script>
import { getAction } from '@/api/manage'
import pick from 'lodash.pick'
import { FormTypes, getRefPromise } from '@/utils/JEditableTableUtil'
import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
import JDictSelectTag from '@/components/dict/JDictSelectTag'
import { queryIdTree, queryDepartTreeList } from '@/api/api'
import { filterDictTextByCache } from '@/components/dict/JDictSelectUtil'

export default {
  name: 'ServiceOrderForm',
  props: ['formData'],
  mixins: [JEditableTableMixin],
  components: {
    JDictSelectTag,
  },
  data() {
    return {
      value: 5,
      tabList: ['信息展示', '流转记录'],
      tabIndex: 0,
      statusName: '',
      disableSubmit: false,
      departTree: [],
      labelCol: {
        xs: { span: 24 },
        sm: { span: 3 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 21 },
      },
      // 新增时子表默认添加几行空数据
      addDefaultRowNum: 1,
      validatorRules: {
        workplaceCompany: {
          rules: [{ required: true, message: '请输入工作地点公司!' }],
        },
        businessType: {
          rules: [{ required: true, message: '请输入业务类型!' }],
        },
        eventContent: {
          rules: [{ required: true, message: '请输入事件内容!' }],
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
            title: '附件下载地址',
            key: 'attachUrl',
            type: FormTypes.fileView,
            token: true,
            responseName: 'message',
            width: '200px',
            placeholder: '请输入${title}',
            defaultValue: '',
            actionButton: false,
          },
        ],
      },
      url: {
        queryById: '/system/serviceOrder/queryById',
        add: '/system/serviceOrder/add',
        edit: '/system/serviceOrder/edit',
        serviceOrderAttach: {
          list: '/system/serviceOrder/queryServiceOrderAttachByMainId',
        },
      },
    }
  },
  computed: {
    setRealname() {
      return function (arr, status) {
        if (arr.indexOf(status) != -1) {
          return true
        }
        return false
      }
    },
  },
  created() {
    this.queryDepartTree()
    this.edit(this.formData.serviceOrder)
  },
  methods: {
    // 切换内容
    chagenTab(index) {
      if (this.tabIndex === index) return
      this.tabIndex = index
    },
    getStatus(statusCode) {
      return filterDictTextByCache('service_order_status', statusCode)
    },
    getProblemType(problemType) {
      return filterDictTextByCache('problem_type', problemType)
    },
    // 三级地址选择
    handleAddressFun: function (e, form, thsAreaCode) {
      // thsAreaCode = this.form.areaCode    // 注意1：获取value值
      thsAreaCode = this.$refs['cascaderAddr'].currentLabels // 注意2： 获取label值
      alert(thsAreaCode) // 注意3： 最终结果是个一维数组对象
    },
    loadTreeData() {
      var that = this
      queryIdTree().then((res) => {
        if (res.success) {
          that.departTree = []
          for (let i = 0; i < res.result.length; i++) {
            let temp = res.result[i]
            that.departTree.push(temp)
          }
        }
      })
    },
    onChange(value, selectedOptions) {
      console.log(value, selectedOptions)
    },
    filter(inputValue, path) {
      return path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1)
    },
    getAllTable() {
      let values = this.tableKeys.map((key) => getRefPromise(this, key))
      return Promise.all(values)
    },
    /** 调用完edit()方法之后会自动调用此方法 */
    editAfter() {
      // let fieldval = pick(this.model, 'userName', 'realName', 'phoneNo', 'deptName', 'workplaceDepartids', 'workplaceDepartnames', 'workplaceDetail', 'businessType', 'businessName', 'deviceInfo', 'eventContent', 'bpmStatus', 'createTime', 'orderStatus', 'reason', 'solution', 'problemType', 'remark')

      this.statusName = this.getStatus(this.formData.serviceOrder.orderStatus)
      let orderStatusDetail = this.model.orderStatusDetail
      if (orderStatusDetail === 3 || orderStatusDetail === 4 || orderStatusDetail === 12) {
        this.statusName += '(' + this.model.frontlineUserRealname + ')'
      } else if (orderStatusDetail === 6 || orderStatusDetail === 7 || orderStatusDetail === 13) {
        this.statusName += '(' + this.model.supportUserRealname + ')'
      } else if (orderStatusDetail === 8 || orderStatusDetail === 9) {
        this.statusName += '(' + this.model.realName + ')'
      }

      // let workplaceDepartids = fieldval.workplaceDepartids;
      // fieldval.workplaceDepartids = JSON.parse(workplaceDepartids);

      // fieldval.name = fieldval.userName + '(' + fieldval.realName + ')';
      // fieldval.problemTypeName = this.getProblemType(fieldval.problemType);
      // this.$nextTick(() => {
      //   this.form.setFieldsValue(fieldval)
      // })
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
        serviceOrderAttachList: allValues.tablesValue[0].values,
      }
    },
    validateError(msg) {
      this.$message.error(msg)
    },
    queryDepartTree() {
      queryDepartTreeList().then((res) => {
        if (res.success) {
          this.departTree = res.result
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
/* 流转记录 */
.record-null {
  font-size: 16px;
  text-align: center;
  line-height: 30px;
  color: #000000;
}
.record-list {
  display: flex;
  line-height: 20px;
}
.record-list .record-list_right {
  margin-left: 20px;
}
.record-list .record-list_content {
  margin-top: 14px;
}
/* 头部内容切换 */
.form-top {
  display: flex;
  justify-content: space-between;
}
.form-top > ul {
  padding-inline-start: 0 !important;
  display: flex;
}
.form-top .form-top_num {
  text-align: right;
  display: block;
  font-size: 12px;
  margin-bottom: 3px;
}
.form-top ul li {
  font-size: 16px;
  font-weight: bold;
  padding: 6px;
  margin-right: 10px;
  cursor: pointer;
  display: flex;
}
.form-top ul .li-active1 {
  color: #1890ff;
}
.form-top ul .li-active2 {
  color: #000000;
}
.time-line {
  padding: 20px 0 0 20px;
}
#staffCard {
  border: 1px solid white;
  box-shadow: 0px 0px 1px 1px #aaa, 3px 0px 5px 0px #aaa, 0px 4px 7px 0px #aaa;
}

#staffLeaveTitle {
  margin-top: 1px;
  font-weight: bold;
  text-align: center;
  display: block;
  color: black;
  font-size: 24px;
}

#staffLeaveTable {
  width: 100%;
  font-size: 12px;
  text-align: center;
  background-color: #ffffff;
}

#staffLeaveTable td {
  font-family: '微软雅黑';
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
  background-color: #ffffff;
}

.staffLeaveTableId .ant-input {
  border: 0px solid black !important;
  border-radius: 0px;
  display: inherit;
  background-color: #ffffff;
  margin: 0px;
  width: 255px;
}

.staffLeaveTableId {
  margin-right: 87px;
  float: right;
  height: 35px;
}

#staffLeaveTable .text {
  border: 0px solid black !important;
  border-radius: 0px;
  background-color: #ffffff;
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
#staffLeaveTable .fifthTr .ant-form-item-control-wrapper {
  width: 50%;
}
.ant-form label {
  font-size: 12px;
}
#staffLeaveTable .smallText .ant-input-number-input {
  background-color: #ffffff;
  margin: 0px;
}
#staffLeaveTable .lineHeight .ant-form-item-control {
  line-height: 0px;
}
</style>
