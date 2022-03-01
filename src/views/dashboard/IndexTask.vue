<template>
  <div class="index-container-ty">
    <!-- 顶部提交事件 -->
    <div style="background-color: white; margin-bottom: 5px">
      <a-row type="flex">
        <a-col :flex="5">
          <!-- <div class="tu" @click="handleSubmit('提交工单')" style="cursor: pointer">-->
          <a-card-grid class="tubg" style="cursor: pointer" @click="visibleStaff = true">
            <div><a-icon type="form" style="margin-right: 5px" />提交工单</div>
          </a-card-grid>
          <!--</div>-->
        </a-col>
        <a-col :flex="5">
          <a-card-grid class="tubg" @click="goPage('/service/StaffServiceOrderList')" style="cursor: pointer">
            <div><a-icon type="clock-circle" style="margin-right: 5px" /><span>历史事件</span></div>
          </a-card-grid>
        </a-col>
        <a-col :flex="5">
          <a-card-grid class="tubg" @click="goPage('/account/center')" style="cursor: pointer">
            <div><a-icon type="user" style="margin-right: 5px" /><span>个人信息维护</span></div>
          </a-card-grid>
        </a-col>
      </a-row>
    </div>
    <!-- 表格内容 -->
    <a-row type="flex" justify="start" :gutter="3">
      <!-- 我的待办 -->
      <my-dealing 
        ref="myDealing1" 
        :source="1" 
        :listUrl="url.myWillDeal"
        :orderType="orderType"
        :loadIndex="loadIndex"
        @loadAll="loadAll">
      </my-dealing>
      <!-- 我的在办 -->
      <my-dealing 
        ref="myDealing2" 
        :source="2" 
        :listUrl="url.myDealing"
        :orderType="orderType"
        :loadIndex="loadIndex"
        @loadAll="loadAll">
      </my-dealing>
      <!-- 常用知识 -->
      <a-col style="padding-top: 10px" :sm="24" :lg="24">
        <div class="card-head">
          <p class="card-head-p1">
            <span class="card-head-p1-span1">常用知识</span>
          </p>
          <p class="card-head-p2" @click="goPage('/knowledge/list')">更多 <a-icon type="double-right" /></p>
        </div>
        <div class="card-tb1">
          <a-table :columns="columns" :data-source="dataSource3" rowKey="id" :pagination="false">
            <span slot="action" slot-scope="text, record">
              <a @click="showDetailKnowledge(record.id)">详情</a>
            </span>
          </a-table>
        </div>
      </a-col>
    </a-row>
    <!-- 知识详情 -->
    <knowledge-detail ref="KnowledgeDetail" :rowInfo="rowInfo" @closeLoad="getKnowledge()"></knowledge-detail>
    <!-- 快速发起 -->
    <staff-service-order-modal ref="modalForm" @closeLoad="loadData"></staff-service-order-modal>
    <!-- 服务目录 -->
    <staff-service-catalog ref="serviceCatalog" @closeLoad="loadData"></staff-service-catalog>
    <!-- 提交工单 -->
    <a-modal title="提交工单" :visible="visibleStaff" @cancel="visibleStaff = false">
      <div class="staff-box">
        <a-button @click="handleSubmitStaff('请求目录', 'serviceCatalog')" type="primary">请求目录</a-button>
        <a-button @click="handleSubmitStaff('快速发起', 'modalForm')" type="primary" style="margin-left: 30px"
          >快速发起</a-button
        >
      </div>
      <template slot="footer">
        <a-button key="back" @click="visibleStaff = false"> 关闭 </a-button>
      </template>
    </a-modal>
  </div>
</template>

<script>
import { ajaxGetDictItems, getDictItemsFromCache } from '@/api/api'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import StaffServiceOrderModal from '../modules/service/staff/modules/StaffServiceOrderModal'
import StaffServiceCatalog from '../modules/service/staff/modules/StaffServiceCatalog'
import KnowledgeDetail from '@/views/modules/knowledge/common/KnowledgeDetail.vue'
import { getAction, postAction } from '@/api/manage'
import MyDealing from './modules/MyDealing.vue'

export default {
  name: 'IndexTask',
  mixins: [JeecgListMixin],
  components: {
    StaffServiceOrderModal,
    StaffServiceCatalog,
    KnowledgeDetail,
    MyDealing
  },
  data() {
    return {
      loading: false,
      flowCode: 'onl_service_order',
      // 常用知识
      dataSource3: [],
      dataSource32Size: 0,
      disableMixinCreated: true,
      visibleStaff: false,
      columns: [
        {
          title: '标题',
          align: 'center',
          ellipsis: true,
          dataIndex: 'title',
        },
        {
          title: '创建人',
          align: 'center',
          ellipsis: true,
          dataIndex: 'createName',
        },
        {
          title: '账号',
          align: 'center',
          ellipsis: true,
          dataIndex: 'userName',
        },
        {
          title: '类型',
          align: 'center',
          ellipsis: true,
          dataIndex: 'knowledgeCatName',
        },
        {
          title: '关键字',
          align: 'center',
          ellipsis: true,
          dataIndex: 'keyWords',
        },
        {
          title: '点赞数',
          align: 'center',
          dataIndex: 'star',
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          width: 150,
          fixed: 'right',
          scopedSlots: { customRender: 'action' },
        },
      ],
      url: {
        myUnfinished: '/system/serviceOrder/myUnfinish',
        list: '/system/serviceOrder/list',
        resolve: '/system/serviceOrder/confirmOrderResolved',
        knowledgeInfo: '/know/knowledgeInfo/indexList',
        knowledgeDetail: '/know/knowledgeManage/detail/', //知识详情
        myDealing: '/sys/index/myDealing', // 我的在办
        myWillDeal: '/sys/index/myWillDeal', // 我的待办
      },
      rowInfo: {},
      //工单类型(1->服务工单 2->事件工单 3->问题工单 4->变更工单·)
      orderType: [
        { text: '服务工单', dictCode: 'service_order_status', orderStatus: [] },
        { text: '事件工单', dictCode: 'service_order_status', orderStatus: [] },
        { text: '问题工单', dictCode: 'problem_order_status', orderStatus: [] },
        { text: '变更工单', dictCode: 'change_order_status', orderStatus: [] }
      ],
      loadIndex: 0
    }
  },
  created() {
    this.getKnowledge()
    this.getOrderStatus()
  },
  methods: {
    // 获取不同工单状态
    getOrderStatus() {
      this.orderType.forEach((item, index) => {
        this.setDic(item.dictCode, index)
      })
    },
    // 获取常用知识
    getKnowledge() {
      getAction(this.url.knowledgeInfo).then((res) => {
        if (res.success) {
          this.dataSource3 = res.result.records
        }
      })
    },
    loadAll() {
      this.loadIndex += 1
    },
    // 知识详情
    showDetailKnowledge(id) {
      getAction(this.url.knowledgeDetail + id).then((res) => {
        if (res.success) {
          this.rowInfo = res.result.knowledgeManage
          this.$refs['KnowledgeDetail'].add()
          this.$refs['KnowledgeDetail'].title = '知识详情'
          this.$refs['KnowledgeDetail'].disableSubmit = false
        }
      })
    },
    // 弹框方法
    handleSubmitStaff: function (title, ref) {
      this.visibleStaff = false
      this.$refs[ref].add()
      this.$refs[ref].title = title
      this.$refs[ref].disableSubmit = false
    },
    goPage(url) {
      this.$router.replace(url)
    },
    /**
     * 获取数据字典的内容
     * @param {*} dictCode 数据字典的key
     * @param {*} obj       data对应的key
     * @param {*} type      对应数据字典数据的取值对象   0：sysAllDictItems  1：sysAllCategoryItems
     * @returns 
     */
    setDic(dictCode, index, type=0) {
      //优先从缓存中读取字典配置
      if (getDictItemsFromCache(dictCode, type)) {
        this.orderType[index].orderStatus = getDictItemsFromCache(dictCode, type)
        return
      }
      //根据字典Code, 初始化字典数组
      if (type === 0) {
        ajaxGetDictItems(dictCode, null).then((res) => {
          if (res.success) {
            this.orderType[index].orderStatus = res.result
          }
        })
      } 
    }
  },
}
</script>
<style scoped>
.staff-box {
  display: flex;
  justify-content: center;
}
.tubg {
  text-align: center;
  line-height: 25px;
  width: 100%;
  font-size: 16px;
}
.tubg:hover {
  background-color: #1890ff;
  display: block;
  font-family: bold;
  opacity: 0.8;
  color: white;
  font-size: 16px;
}
.ant-table-tbody > tr > td {
  line-height: 10px;
}
.card-head {
  background-color: white;
  line-height: 45px;
  height: 45px;
}

.card-head-p1 {
  float: left;
  margin-left: 22px;
  margin-bottom: 6px;
}
.card-head-p2 {
  float: right;
  margin-right: 22px;
  margin-bottom: 6px;
  cursor: pointer;
}
.card-head-p1-span1 {
  font-weight: bold;
  font-size: 14px;
  line-height: 40px;
  margin-right: 5px;
}
.card-head-p1-span2 {
  color: gray;
  font-size: 12px;
}
.card-tb1 {
  background-color: white;
  padding-left: 15px;
  padding-right: 15px;
}
</style>
