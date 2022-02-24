<template>
  <a-modal
    :title="title"
    :visible="visible"
    :width="1200"
    destroyOnClose
    :footer="null"
    :bodyStyle="bodyStyle"
    @cancel="handleCancel"
  >
    <template v-if="rowInfo.createTime">  
      <div class="detail_top">
        <a-tag color="#87d068">审核中</a-tag>
      </div>
      <div class="detail_main">
        <!-- 详情 -->
        <div class="left">
          <!-- 头部内容 -->
          <div class="left_title">
            <h2>标题：{{rowInfo.title}}</h2>
          </div>
          <div class="left_info">
            <span>创建人：{{rowInfo.createName}}</span>
            <span>创建时间：{{rowInfo.createTime}}</span>
            <span>关键字：{{rowInfo.keyWords}}</span>
            <span>常用知识：{{rowInfo.commonUse == 1 ? '是' : '否'}}</span>
            <span>类型：{{rowInfo.knowledgeCatName}}</span>
            <span v-if="rowInfo.serviceCatNames">关联服务：{{rowInfo.serviceCatNames}}</span>
          </div>
          <!-- 富文本 -->
          <div v-if="rowInfo.content" class="left_main" v-html="rowInfo.content"></div>
          <div v-else class="left_main"></div>
          <!-- 文件 -->
          <div class="left_file">
             <j-editable-table
              :ref="refKeys[0]"
              :loading="serviceOrderAttachTable.loading"
              :columns="serviceOrderAttachTable.columns"
              :dataSource="setFlie(serviceOrderAttachTable.dataSource)"
              :maxHeight="300"
              :rowNumber="true"
            />
          </div>
          <!-- 修改说明 -->
          <div v-if="rowInfo.changeReason" class="left_reason">
            <h2>修改说明</h2>
            <div class="info">
              <p>
                <span class="sp1">修改原因：</span>
                <span class="sp2">{{rowInfo.changeReason}}</span>
              </p>
              <p v-if="rowInfo.changeDesc">
                <span class="sp1">详细描述：</span>
                <span class="sp2">{{rowInfo.changeDesc}}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <!-- 操作 -->
      <div
        class="box-bot"
        :style="{
          position: 'absolute',
          bottom: 0,
          borderTop: '1px solid #e9e9e9',
          padding: '10px 16px',
          background: '#fff',
          textAlign: 'left',
          zIndex: 99,
        }"
      >
        <a-space :size="8" align="center">
          <a-button v-loading="confirmLoading" @click="handleOkConfirm(0)">退回</a-button>
          <a-button v-loading="confirmLoading" @click="handleOkConfirm(1)" type="primary">通过</a-button>
        </a-space>
      </div>
      <!-- 是否常用 -->
      <knowledge-use ref="KnowledgeUse" :commonUse="rowInfo.commonUse" @bindOk="bindOk"></knowledge-use>
    </template>
  </a-modal>
</template>

<script>
import { putAction } from '@/api/manage'
import { FormTypes, getRefPromise } from '@/utils/JEditableTableUtil'
import JEditableTable from '@/components/jeecg/JEditableTable'
import KnowledgeUse from './KnowledgeUse.vue'

export default {
  props: {
    // 详情内容
    rowInfo: {
      type: Object,
      default: () => {}
    },
    // 状态
    statusOptions: {
      type: Array,
      default: () => []
    }
  },
  components: {
    JEditableTable, KnowledgeUse
  },
  data() {
    return {
      disableSubmit: false,
      title: '知识详情',
      visible: false,
      bodyStyle: {
        paddingBottom: '70px',
        height: window.innerHeight - 200 + 'px',
        'overflow-y': 'auto',
      },
      // 服务工单附件
      refKeys: ['serviceOrderAttach'],
      tableKeys: ['serviceOrderAttach'],
      activeKey: 'serviceOrderAttach',
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
        ]
      },
      urls: {
        knowledgeAudit: '/know/knowledgeManage/audit/', //知识审核
      },
      confirmLoading: false
    }
  },
  watch: {
    rowInfo: {
      handler(newVal) {
        if (newVal.createTime) {
          this.serviceOrderAttachTable.dataSource = JSON.parse(newVal.attachment)
        }
      },
      immediate: true,
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
  },
  methods: {
    /**
     * 提交
     * type: 0-退回 1-通过
     */
    handleOkConfirm(type) {
      if(type === 1) {
        this.$refs['KnowledgeUse'].add()
        this.$refs['KnowledgeUse'].disableSubmit = false
      } else {
        this.bindAudit(this.rowInfo, false)
      }
    },
    // 通过
    bindOk(value) {
      this.bindAudit(value, true)
    },
    // 审核
    bindAudit(info, flag) {
      if(this.confirmLoading) return
      this.confirmLoading = true
      let params = this.rowInfo.id + '?commonUse=' + info.commonUse + '&flag=' + flag
      putAction(
        this.urls.knowledgeAudit + params
      ).then(res => {
        this.confirmLoading = false
        if (res.success) {
          this.$message.success(res.message)
          this.$emit("closeLoad")
          this.visible = false
        } else {
          this.$message.warning(res.message)
        }
      }).finally(() => {
        this.confirmLoading = false
        return ''
      })
    },
    add() {
      this.visible = true
    },
    handleCancel() {
      this.visible = false
    }
  }
}
</script>

<style lang="less" scoped>
/deep/ .ant-tag {
  padding: 4px 14px;
  font-size: 14px;
}
/deep/ .icons-list .anticon {
  font-size: 24px;
}
.box-bot {
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  left: 0;
  right: 0;
}
.detail_top {
  padding-bottom: 6px;
  display: flex;
  justify-content: flex-end;
  border-bottom: 1px solid #e8e8e8;
}
.detail_main {
  display: flex;
  justify-content: space-between;
  min-height: 500px;
  .left {
    width: 100%;
    .left_title {
      display: flex;
      justify-content: center;
      align-items: center;
      line-height: 32px;
      padding: 10px;
      h2 {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 0px;
        text-align: center;
      }
    }
    .left_info {
      line-height: 32px;
      font-size: 14px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      width: 85%;
      margin: 0 auto;
      span {
        display: inline-block;
        margin-right: 40px;
      }
    }
    .left_main {
      max-height: 400px;
      overflow: auto;
      margin: 30px 0;
    }
    .left_reason {
      padding-top: 20px;
      h2 {
        font-size: 16px;
        font-weight: bold;
      }
      .info {
        padding-left: 50px;
        p {
          display: flex;
          .sp2 {
             flex: 1;
            flex-shrink: 0;
          }        
          span {
            margin-bottom: 0;
          }
        }
      }
    }
  }
}
</style>