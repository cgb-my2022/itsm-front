<template>
  <div>
    <a-form :form="form">
      <a-card id="staffCard" style="margin: 0 auto; max-width: 750px">
        <!-- 状态内容 -->
        <a-tag color="cyan">
          {{ setStatus(formData.orderStatus) }}
        </a-tag>
        <!-- 头部 -->
        <span id="staffLeaveTitle">问题工单</span>
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
          <span class="form-top_num">事件ID：{{ formData.id }}</span>
        </div>
        <!-- 信息展示 -->
        <template v-if="tabIndex === 0">
          <j-form-container :disabled="false">
            <table slot="detail" border="1px" id="staffLeaveTable">
              <tr>
                <td class="firstTr">发起人</td>
                <td class="firstTr">
                  <span class="fs-12">{{ formData.createName }}</span>
                </td>
                <td class="firstTr">创建日期</td>
                <td class="firstTr">
                  <span class="fs-12">{{ formData.createTime }}</span>
                </td>
              </tr>
              <tr>
                <td class="firstTr">账号</td>
                <td class="firstTr">
                  <span class="fs-12">{{ formData.createUserName }}</span>
                </td>
                <td class="firstTr">电话</td>
                <td class="firstTr">
                  <span class="fs-12">{{ formData.phoneNo }}</span>
                </td>
              </tr>
              <tr>
                <td class="firstTr">所属部门</td>
                <td class="firstTr" colspan="4">
                  <span class="fs-12 text-left">{{ formData.deptName }}</span>
                </td>
              </tr>
              <tr>
                <td class="firstTr">问题标题</td>
                <td class="firstTr" colspan="5">
                  <span class="fs-12 text-left">{{ formData.problemTitle }}</span>
                </td>
              </tr>
              <tr>
                <td class="firstTr">问题描述</td>
                <td class="firstTr" colspan="5">
                  <span class="fs-12 text-left">{{ formData.problemDesc }}</span>
                </td>
              </tr>
              <tr>
                <td class="firstTr">问题分类</td>
                <td class="firstTr" colspan="5">
                  <span class="fs-12 text-left">{{ formData.problemCatFullName }}</span>
                </td>
              </tr>
              <tr>
                <td class="firstTr">问题来源</td>
                <td class="firstTr">
                  <span class="fs-12">{{ setSource(formData.problemSource) }}</span>
                </td>
                <td class="firstTr">优先级</td>
                <td class="firstTr">
                  <span class="fs-12">{{ setLevel(formData.problemLevel) }}</span>
                </td>
              </tr>
              <tr>
                <td class="firstTr">关联事件</td>
                <td class="firstTr" colspan="5">
                  <span class="fs-12 text-left">{{ formData.eventCatFullName }}</span>
                </td>
              </tr>
              <tr>
                <td class="firstTr">关联变更</td>
                <td class="firstTr" colspan="5">
                  <span class="fs-12 text-left">{{ formData.changeOrderIds }}</span>
                </td>
              </tr>
              <tr>
                <td class="firstTr">问题附件</td>
                <td class="firstTr" colspan="5">
                  <!-- 子表单区域 -->
                  <a-spin :spinning="confirmLoading">
                    <j-editable-table
                      :ref="refKeys[0]"
                      :loading="serviceOrderAttachTable.loading"
                      :columns="serviceOrderAttachTable.columns"
                      :dataSource="setFlie(formData.userAttaches)"
                      :maxHeight="300"
                      :rowNumber="true"
                    />
                  </a-spin>
                </td>
              </tr>
              <tr>
                <td class="firstTr">处理人</td>
                <td class="firstTr">
                  <span class="fs-12">{{ formData.solRealName }}</span>
                </td>
                <td class="firstTr">完成日期</td>
                <td class="firstTr">
                  <span class="fs-12">{{ formData.confirmTime }}</span>
                </td>
              </tr>
              <tr>
                <td class="firstTr">问题原因</td>
                <td class="firstTr" colspan="4">
                  <span class="fs-12 text-left">{{ formData.reason }}</span>
                </td>
              </tr>
              <tr>
                <td class="firstTr">解决方案</td>
                <td class="firstTr" colspan="4">
                  <span class="fs-12 text-left">{{ formData.solution }}</span>
                </td>
              </tr>
              <tr>
                <td class="firstTr">问题处理附件</td>
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
              <tr>
                <td class="firstTr">服务满意度</td>
                <td class="firstTr" colspan="5">
                  <span v-if="formData.orderEvaluation">
                    <a-rate disabled v-model="formData.orderEvaluation.orderScore" style="color: red" />
                    <span class="ant-rate-text">{{ formData.orderEvaluation.orderScore }}分</span>
                  </span>
                </td>
              </tr>
              <tr>
                <td class="firstTr">评价留言</td>
                <td class="firstTr" colspan="5">
                  <span v-if="formData.orderEvaluation" class="text text-left">{{
                    formData.orderEvaluation.content
                  }}</span>
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
  </div>
</template>

<script>
import { FormTypes, getRefPromise } from '@/utils/JEditableTableUtil'
import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
import JDictSelectTag from '@/components/dict/JDictSelectTag'

export default {
  name: 'ServiceOrderForm',
  props: {
    // 内容
    formData: {
      type: Object,
      default: () => {},
    },
    // 工单状态
    dictStatus: {
      type: Array,
      default: () => [],
    },
    // 优先级
    dictOptions: {
      type: Array,
      default: () => [],
    }
  },
  mixins: [JEditableTableMixin],
  components: {
    JDictSelectTag,
  },
  data() {
    return {
      sourceOptions: {}, // 问题来源
      tabList: ['信息展示', '流转记录'],
      tabIndex: 0,
      statusName: '',
      disableSubmit: false,
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
            width: '100%',
            placeholder: '请输入${title}',
            defaultValue: '',
            actionButton: false,
          },
        ],
      },
    }
  },
  computed: {
    setFlie() {
      return function (list) {
        let file = []
        if (list && list.length > 0) {
          file = list.filter((item) => item.attachUrl != null)
        }
        return file || []
      }
    },
    // 根据等级id设置等级
    setLevel() {
      return function (text) {
        if (this.dictOptions.length > 0) {
          const findItem = this.dictOptions.find((item) => item.value == text)
          return findItem.text || findItem.title
        } else {
          return ''
        }
      }
    },
    // 设置工单状态
    setStatus() {
      return function (text) {
        if (this.dictStatus.length > 0) {
          const findItem = this.dictStatus.find((item) => item.value == text)
          return findItem.text || findItem.title
        } else {
          return ''
        }
      }
    },
    // 问题来源
    setSource() {
      return function (text) {
        if (this.sourceOptions.length > 0) {
          const findItem = this.sourceOptions.find((item) => item.value == text)
          return findItem.text || findItem.title
        } else {
          return ''
        }
      }
    }
  },
  created() {
    // 问题来源
    this.initDictData('problem_source', 'sourceOptions')  
    this.edit(this.formData.serviceOrder)
  },
  methods: {
    // 切换内容
    chagenTab(index) {
      if (this.tabIndex === index) return
      this.tabIndex = index
    },
  }
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
