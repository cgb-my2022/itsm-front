<template>
  <a-form :form="form">
    <a-card id="staffCard" style="margin: 0 auto; max-width: 750px">
      <!-- 状态内容 -->
      <a-tag color="cyan">
        {{ setStatus(formData.orderStatus) }}
      </a-tag>
      <template v-if="formData.orderStatus === 3">
        <a-tag color="red" class="tag-beyond"> 已转给{{formData.currentUserName}}处理 </a-tag>
      </template>
      <!-- 头部 -->
      <span id="staffLeaveTitle">事件工单</span>
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
        <span class="form-top_num">事件ID：{{formData.id}}</span>
      </div>
      <!-- 信息展示 -->
      <template v-if="tabIndex === 0">
        <j-form-container>
          <table border="1px" id="staffLeaveTable">
            <tr>
              <td class="firstTr">发起人</td>
              <td class="firstTr">
                <span class="fs-12">{{formData.createName}}</span>
              </td>
              <td class="firstTr">事件发生日期</td>
              <td class="firstTr">
                <span class="fs-12">{{formData.eventTime}}</span>
              </td>
            </tr>
            <tr>
              <td class="firstTr">办公电话</td>
              <td class="firstTr">
                <span class="fs-12">{{formData.phoneNo}}</span>
              </td>
              <td class="firstTr">开单方式</td>
              <td class="firstTr">
                <span class="fs-12">{{formData.openType === 1 ? '正常开单' : '事后补单'}}</span>
              </td>
            </tr>
            <tr>
              <td class="firstTr">部门</td>
              <td class="firstTr" colspan="5">
                <span class="fs-12 text-left">{{formData.deptName}}</span>
              </td>
            </tr>
            <tr>
              <td class="firstTr">地点</td>
              <td class="firstTr" colspan="4">
                <span class="fs-12 text-left">{{formData.workplaceDetail}}</span>
              </td>
            </tr>
            <tr>
              <td class="firstTr">事件来源</td>
              <td class="firstTr">
                <span class="fs-12">{{formData.eventSource === 1 ? '监控平台 ' : '用户报告'}}</span>
              </td>
              <td class="firstTr">事件分类</td>
              <td class="firstTr">
                <span class="fs-12">{{formData.eventCatFullName}}</span>
              </td>
            </tr>
            <tr>
              <td class="firstTr">紧急程度</td>
              <td class="firstTr" colspan="4">
                <span class="td-left" v-if="formData.eventLevel == 1" style="color:red;">{{setLevel(formData.eventLevel)}}</span>
                <span class="td-left" v-if="formData.eventLevel == 2" style="color:orange;">{{setLevel(formData.eventLevel)}}</span>
                <span class="td-left" v-if="formData.eventLevel == 3" style="color:blue;">{{setLevel(formData.eventLevel)}}</span>
              </td>
            </tr>
            <tr>
              <td class="firstTr">事件标题</td>
              <td class="firstTr" colspan="5">
                <span class="fs-12 text-left">{{formData.eventTitle}}</span>
              </td>
            </tr>
            <tr>
              <td class="firstTr">事件描述</td>
              <td class="firstTr" colspan="5">
                <span class="fs-12 text-left">{{formData.eventDesc}}</span>
              </td>
            </tr>
            <tr>
              <td class="firstTr">关联资源</td>
              <td class="firstTr" colspan="5">
                <!-- <div class="td-flex">
                  <span>路由器0987、路由器0943</span>
                  <a-button type="primary">查看详细资源</a-button>
                </div> -->
              </td>
            </tr>
            <tr>
              <td class="firstTr">处理人</td>
              <td class="firstTr">
                <span class="fs-12">{{formData.currentUserName}}</span>
              </td>
              <td class="firstTr">处理时间</td>
              <td class="firstTr">
                <span class="fs-12">{{formData.solTime}}</span>
              </td>
            </tr>
            <tr>
              <td class="firstTr">问题原因</td>
              <td class="firstTr" colspan="4">
                <span class="fs-12 text-left">{{formData.reason}}</span>
              </td>
            </tr>
            <tr>
              <td class="firstTr">解决方案</td>
              <td class="firstTr" colspan="4">
                <span class="fs-12 text-left">{{formData.solution}}</span>
              </td>
            </tr>
            <tr>
              <td class="firstTr">解决事件工单附件</td>
              <td class="firstTr" colspan="5">
                <!-- 子表单区域 -->
                <a-spin :spinning="confirmLoading">
                  <j-editable-table
                    :ref="refKeys[0]"
                    :loading="serviceOrderAttachTable.loading"
                    :columns="serviceOrderAttachTable.columns"
                    :dataSource="setFlie(formData.ywAttaches)"
                    :maxHeight="300"
                    :rowNumber="true"
                  />
                </a-spin>
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
  props: ["formData", "dictStatus", "dictOptions"],
  mixins: [JEditableTableMixin],
  components: {
    JDictSelectTag,
  },
  data() {
    return {
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
    setFlie() {
      return function(list) {
        let file = []
        if (list && list.length > 0) {
          file = list.filter(item => item.attachUrl != null)
        }
        return file || []
      }
    },
    // 根据等级id设置等级
    setLevel() {
      return function (text) {
        if (this.dictOptions.length > 0) {
          const findItem = this.dictOptions.find(item => item.value == text)
          return findItem.text || findItem.title
        } else {
          return ""
        }
      }
    },
    // 设置工单状态
    setStatus() {
      return function (text) {
        if (this.dictStatus.length > 0) {
          const findItem = this.dictStatus.find(item => item.value == text)
          return findItem.text || findItem.title
        } else {
          return ""
        }
      }
    }
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
      // this.statusName = this.getStatus(this.formData.serviceOrder.orderStatus)
      this.statusName = "已接单"
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
.firstTr {
  padding: 12px;
}
.text-left {
  text-align: left;
  display: inline-block;
  width: 100%;
}
.fs-12 {
  color: rgba(0, 0, 0, 0.65);
  font-size: 12px;
}
.td-left {
  width: 100%;
  text-align: left;
  display: inline-block;
  padding: 0 10px;
  box-sizing: border-box;
}
.td-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 10px;
  box-sizing: border-box;
}
.tag-beyond {
  word-wrap: break-word;
  white-space: pre-wrap;
}
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
.record-list .record-list_time {
  width: 130px;
}
.record-list .record-list_right {
  flex: 1;
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
