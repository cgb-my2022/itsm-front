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
        <a-tag v-if="source === 1 || source === 2" color="#87d068">已发布</a-tag>
        <a-tag v-else color="#87d068">{{ setStatus(rowInfo.status) }}</a-tag>
      </div>
      <div class="detail_main">
        <!-- 详情 -->
        <div class="left">
          <div class="left_title">
            <h2>标题：{{rowInfo.title}}</h2>
          </div>
          <div class="left_info">
            <span>创建人：{{rowInfo.createName}}</span>
            <span>创建时间：{{rowInfo.createTime}}</span>
            <span>常用知识：{{rowInfo.commonUse == 1 ? '是' : '否'}}</span>
            <span>关键字：{{rowInfo.keyWords}}</span>
          </div>
          <div class="left_main" v-html="rowInfo.content"></div>
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
        </div>
        <!-- 留言 -->
        <div class="right">
          <div class="right_top">
            <p class="title">留言板</p>
            <div class="number">
              <p class="like">
                <a-icon @click="bindLike" type="like" theme="twoTone" :two-tone-color="hasStar == 1 ? '#e71414' : '#A9A9A9'"/>
                <span>{{star}}</span>
              </p>
              <p>
                <a-icon type="message" theme="twoTone" two-tone-color="#1890FF"/>
                <span>{{ total }}</span>
              </p>
            </div>
          </div>
          <div class="right_main">
            <div v-if="contentList.length === 0" class="list list_null">
              <p>暂无评论</p>
            </div>
            <ul v-else class="list list_ul">
              <li v-for="item in contentList" :key="item.id">
                <p class="name">{{item.createName}}:</p>
                <p class="content">{{item.content}}</p>
              </li>
              <li v-if="setMore()" class="list_li">
                <p @click="getMore">
                  <span>查看更多</span>
                  <a-icon type="caret-down"/>
                </p>
              </li>
            </ul>
            <div class="opinion">
              <p>我的意见：</p>
              <div>
                <a-textarea :rows="4" v-model.trim="content" :maxLength="255" />
                <a-button class="btn" :loading="contentLoading" type="primary" @click="handleSubmit">提交</a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </a-modal>
</template>

<script>
import { getAction, postAction } from '@/api/manage'
import { FormTypes, getRefPromise } from '@/utils/JEditableTableUtil'
import JEditableTable from '@/components/jeecg/JEditableTable'
export default {
  props: {
    // 页面来源
    source: {
      type: Number,
      default: 1,
    },
    // 详情内容
    rowInfo: {
      type: Object,
      default: () => {}
    },
    // 状态
    statusOptions: {
      type: Array,
      default: () => [
        { id: '1', title: '全部', value: '' },
        { id: '2', title: '草稿', value: 0 },
        { id: '3', title: '待审核', value: 1 },
        { id: '4', title: '已退回', value: 2 },
        { id: '5', title: '已发布', value: 3 },
      ]
    },
    showPage: {
      type: Boolean,
      default: false
    }
  },
  components: {
    JEditableTable
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
      urls: {
        addComment: "/know/knowledgeInfo/addComment", //添加评论
        commentList: "/know/knowledgeInfo/commentList", //评论列表
        star: "/know/knowledgeInfo/star/", //点赞或取消
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
      // 点赞
      hasStar: 0,
      star: 0,
      starLoading: false,
      // 评论
      pageNo: 1,
      pageSize: 20,
      total: 0,
      contentNext: false,
      contentList: [],
      content: "",
      contentLoading: false,
    }
  },
  watch: {
    rowInfo: {
      handler(newVal) {
        if (newVal.createTime) {
          this.serviceOrderAttachTable.dataSource = JSON.parse(newVal.attachment)
          this.hasStar = newVal.hasStar
          this.star = newVal.star
          if(newVal.hasPublish) {
            this.pageNo = 1
            this.getCommentList()
          }
        }
      },
      immediate: true,
    },
    showPage: {
      handler(newVal) {
        if (newVal) {
          this.visible = true
        }
      },
      immediate: true
    }
  },
  computed: {
    // 状态
    setStatus() {
      return function (status) {
        const findItem = this.statusOptions.find((item) => item.value === status)
        return findItem.title
      }
    },
    setFlie() {
      return function (list) {
        let file = []
        if (list && list.length > 0) {
          file = list.filter((item) => item.attachUrl != null)
        }
        return file || []
      }
    },
    setMore() {
      return function() {
        return this.pageNo * this.pageSize < this.total
      }
    }
  },
  methods: {
    // 获取评论列表
    getCommentList() {
      getAction(
        this.urls.commentList,
        {
          manageId: this.rowInfo.id,
          pageNo: this.pageNo,
          pageSize: this.pageSize
        }
      ).then(res => {
        if (res.success) {
          const { total, records } = res.result
          this.total = total
          if (this.pageNo === 1) {
            this.contentList = records
          } else {
            this.contentList = this.contentList.concat(records)
          }
        }
      })
    },
    // 查看更多
    getMore() {
      this.pageNo += 1
      this.getCommentList()
    },
    // 评论 
    handleSubmit() {
      if (this.contentLoading) return
      this.contentLoading = true
      if (this.rowInfo.hasPublish === 0) {
        this.contentLoading = false
        this.$notification['error']({
          message: '提示',
          description: '发布知识后才可以评论！'
        })
      } else {
        if (!this.content) {
          this.contentLoading = false
          this.$notification['error']({
            message: '提示',
            description: '请填写评论内容！'
          })
          return;
        }
        postAction(
          this.urls.addComment,
          {
            manageId: this.rowInfo.id,
            content: this.content
          }
        ).then(res => {
          this.contentLoading = false
          if (res.success) {
            this.$notification['success']({
              message: '提示',
              description: '评论完成！'
            })
            this.content = ""
            this.pageNo = 1
            this.getCommentList()
          }
        }).catch( () => {
          this.contentLoading = false
        })
      } 
    },
    // 点赞
    bindLike() {
      if (this.starLoading) return
      this.starLoading = true
      if (this.rowInfo.hasPublish === 0) {
        this.starLoading = false
        this.$notification['error']({
          message: '提示',
          description: '发布知识后才可以点赞！'
        })
      } else {
        getAction(this.urls.star + this.rowInfo.id).then(res => {
          this.starLoading = false
          if (res.success) {
            if (this.hasStar === 0) {
              this.hasStar = 1
              this.star += 1
            } else {
              this.hasStar = 0
              this.star -= 1
            }
          }
        }).catch( () => {
          this.starLoading = false
        })
      }
    },
    add() {
      this.visible = true
    },
    handleCancel() {
      this.visible = false
      this.$emit("service")
      if (this.star != this.rowInfo.star) {
        this.$emit("closeLoad")
      }
    },
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
    width: 60%;
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
      }
      span {
        color: red;
        margin-bottom: 0px;
        font-size: 14px;
        margin-left: 20px;
      }
    }
    .left_info {
      line-height: 32px;
      font-size: 14px;
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      align-items: center;
      width: 90%;
      span {
        display: inline-block;
        margin-right: 40px;
      }
    }
    .left_main {
      max-height: 500px;
      overflow: auto;
      margin: 30px 0;
    }
  }
  .right {
    width: 35%;
    display: flex;
    flex-direction: column;
    .right_top {
      margin-top: 10px;
      padding-top: 20px;
      background: rgba(242, 242, 242, 1);
      .title {
        font-size: 18px;
        font-weight: bold;
        text-align: center;
      }
      .number {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .like {
          i {
            cursor: pointer;
          }
        }
        p {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          width: 100%;
          span {
            margin-left: 16px;
          }
        }
      }
    }
    .right_main {
      flex: 1;
      border: 1px solid rgba(215, 215, 215, 1);
      padding: 0 15px;
      display: flex;
      flex-direction: column;
      .list {
        flex: 1;
        overflow: auto;
        padding: 0px;
        li {
          display: flex;
          font-size: 14px;
          line-height: 1.5;
          border-bottom: 1px solid rgba(215, 215, 215, 1);
          padding: 10px 0;
          p {
            margin-bottom: 0px;
          }
          .name {
            flex-shrink: 0;
          }
          .content {
            flex: 1;
            padding-left: 10px;
            word-break: break-all;
            white-space: pre-wrap;
          }
        }
      }
      .list_ul {
        max-height: 500px;
        overflow: auto;
        .list_li {
          border-bottom: 0px;
          p {
            margin: 0 auto;
            padding: 6px 10px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            i {
              line-height: 22px;
              padding-left: 10px;
            }
          }
        }
      }
      .list_null {
        p {
          text-align: center;
          line-height: 90px;
        }
      }
      .opinion {
        min-height: 150px;
        display: flex;
        width: 100%;
        margin-top: 10px;
        p {
          width: 75px;
        }
        div {
          flex: 1;
          textarea {
            resize: none;
          }
          .btn {
            margin: 10px auto;
          }
        }
      }
    }
  }
}
</style>