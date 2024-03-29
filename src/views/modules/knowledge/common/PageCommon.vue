<template>
  <a-row type="flex" :gutter="16">
    <!-- 左侧目录 -->
    <a-col :md="5" :sm="24">
      <a-card :loading="cardLoading" :bordered="false" style="height: 90vh; overflow: auto">
        <a-spin :spinning="loadingTree" style="overflow-x: 'auto'">
          <a-button v-if="source === 1" type="primary" @click="addRow(1)" icon="plus">添加目录</a-button>
          <div class="tab-all">
            <span @click="checkAll" :class="{ 'tab-all_active': selectedKeys.length === 0 }">全部根目录</span>
          </div>
          <a-tree
            showLine
            :selectedKeys="selectedKeys"
            :dropdownStyle="{ maxHeight: '200px', overflow: 'auto' }"
            :expanded-keys.sync="expandedKeys"
            :tree-data="gData"
            @select="handleTreeSelect"
            class="tree_dropdown"
          >
            <template v-if="source === 1" #title="{ key: treeKey, title, catLevel, parentId, children }">
              <a-dropdown :trigger="['contextmenu']">
                <span class="dropdown-span">{{ title }}</span>
                <template #overlay>
                  <a-menu
                    @click="
                      ({ key: menuKey }) =>
                        onContextMenuClick(menuKey, { id: treeKey, catLevel, catName: title, parentId, children })
                    "
                  >
                    <a-menu-item key="1">
                      <a-icon type="edit" />
                      <span>编辑</span>
                    </a-menu-item>
                    <a-menu-item key="2">
                      <a-icon type="zoom-out" />
                      <span>删除</span>
                    </a-menu-item>
                    <a-menu-item key="3"  v-if="catLevel != 4">
                      <a-icon type="zoom-in" />
                      <span>添加下级</span>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </template>
          </a-tree>
        </a-spin>
      </a-card>
    </a-col>
    <!-- 右侧目录列表 -->
    <a-col :md="24 - 5" :sm="24">
      <a-card class="j-address-list-right-card-box" :bordered="false">
        <!-- 查询区域 -->
        <div class="table-page-search-wrapper">
          <a-form layout="inline" @keyup.enter.native="searchQuery" class="row_search">
            <a-row :gutter="24">
              <a-col :xl="6" :lg="7" :md="8" :sm="24">
                <a-form-item label="标题">
                  <a-input placeholder="请输入" v-model="queryParam.title"></a-input>
                </a-form-item>
              </a-col>
              <a-col :xl="6" :lg="7" :md="8" :sm="24">
                <a-form-item label="关键词">
                  <a-input placeholder="请输入" v-model="queryParam.keyWords"></a-input>
                </a-form-item>
              </a-col>
              <a-col :xl="6" :lg="7" :md="8" :sm="24">
                <a-form-item label="关联服务">
                  <a-cascader
                    placeholder="请选择"
                    :field-names="{ label: 'title', value: 'id', children: 'children' }"
                    :show-search="{ filter }"
                    v-model="serviceCatName"
                    :options="serviceOptions"
                    change-on-select
                    expand-trigger="hover"
                    @change="serviceChange"
                  />
                </a-form-item>
              </a-col>
              <a-col v-if="source === 1 || source === 2" :xl="6" :lg="7" :md="8" :sm="24">
                <a-form-item label="常用">
                  <a-select default-value="" v-model="queryParam.commonUse">
                    <a-select-option v-for="item in useOption" :key="item.id" :value="item.value">
                      {{ item.title }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col v-else :xl="6" :lg="7" :md="8" :sm="24">
                <a-form-item label="状态">
                  <a-select default-value="" v-model="queryParam.status">
                    <a-select-option v-for="item in statusOptions" :key="item.id" :value="item.value">
                      {{ item.title }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col>
                <a-form-item label="创建日期">
                  <j-date
                    :show-time="true"
                    :disableType="2"
                    date-format="YYYY-MM-DD HH:mm:ss"
                    placeholder="请选择开始时间"
                    class="query-group-cust"
                    v-model="queryParam.createTime_begin"
                  ></j-date>
                  <span class="query-group-split-cust"></span>
                  <j-date
                    :show-time="true"
                    :disableType="2"
                    date-format="YYYY-MM-DD HH:mm:ss"
                    placeholder="请选择结束时间"
                    class="query-group-cust"
                    v-model="queryParam.createTime_end"
                  ></j-date>
                </a-form-item>
              </a-col>
              <a-col>
                <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
                  <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
                  <a-button type="primary" @click="bindReset" icon="reload" style="margin-left: 8px">重置</a-button>
                </span>
              </a-col>
            </a-row>
          </a-form>
        </div>
        <!-- 批量删除 -->
        <div class="table-operator">
          <template v-if="source === 1">
            <a-button @click="bindList(1)" type="primary">删除</a-button>
            <a-button @click="bindList(2)" type="primary">移动</a-button>
          </template>
          <template v-if="source === 4">
            <a-button @click="bindRelease()" type="primary" icon="add">发布</a-button>
          </template>
        </div>
        <!-- table -->
        <a-table
          ref="table"
          size="middle"
          bordered
          rowKey="id"
          class="j-table-force-nowrap"
          :columns="columns"
          :dataSource="dataSource"
          :pagination="ipagination"
          :scroll="{ x: 1500 }"
          :loading="loading"
          :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
          @change="handleTableChange"
        >
          <!-- 状态 -->
          <template slot="status" slot-scope="text">
            <span>{{ setStatus(text) }}</span>
          </template>
          <!-- 常用 -->
          <template slot="commonUse" slot-scope="text">
            <span>{{ text === 1 ? '是' : '否' }}</span>
          </template>
          <!-- 操作 -->
          <template slot="action" slot-scope="text, record">
            <a @click="handeleAction(1, record)">详情</a>
            <template v-if="setRealname([1, 2, 3], record.status) && source !== 2">
              <a-divider type="vertical" />
              <a @click="handeleAction(2, record)">历史记录</a>
            </template>
            <!-- 知识管理 -->
            <span v-if="source === 1">
              <a-divider type="vertical" />
              <a @click="handeleAction(42, record)" style="color: orange">删除</a>
            </span>
            <!-- 知识审核 -->
            <span v-if="source === 3">
              <template v-if="record.status === 1">
                <a-divider type="vertical" />
                <a @click="handeleAction(31, record)" style="color: orange">审核</a>
              </template>
            </span>
            <!-- 知识发布操作 -->
            <span v-if="source === 4">
              <template v-if="setRealname([0, 2, 3], record.status)">
                <a-divider type="vertical" />
                <a @click="handeleAction(41, record)">修改</a>
              </template>
              <template v-if="setRealname([0, 2], record.status)">
                <a-divider type="vertical" />
                <a @click="handeleAction(42, record)" style="color: orange">删除</a>
              </template>
            </span>
          </template>
        </a-table>
      </a-card>
    </a-col>
    <!-- 知识管理 -->
    <template v-if="source === 1">
      <!-- 添加/编辑 服务目录 -->
      <service-info ref="modalForm" :rowInfo="rowInfo" :paramsInfo="paramsInfo" @closeLoad="closeLoad()"></service-info>
      <!-- 批量移动 -->
      <knowledge-move ref="KnowledgeMove" :gData="gData" :manageIds="selectedRowKeys" @closeLoad="closeLoad()"></knowledge-move>
    </template>
    <!-- 知识审核 -->
    <template v-if="source === 3">
      <knowledge-audit ref="KnowledgeAudit" :rowInfo="rowInfo" @closeLoad="closeLoad()"></knowledge-audit>
    </template>
    <!-- 添加/编辑 发布知识 -->
    <template v-if="source === 4">
      <knowledge-info
        ref="knowledgeInfo"
        :serviceOptions.sync="serviceOptions"
        :knowledgeOptions.sync="gData"
        :rowInfo="rowInfo"
        @closeLoad="closeLoad()"
      ></knowledge-info>
    </template>
    <!-- 历史记录 -->
    <knowledge-historyList ref="knowledgeHistoryList" :historyList="historyList"></knowledge-historyList>
    <!-- 详情 -->
    <knowledge-detail ref="KnowledgeDetail" :source="source" :statusOptions="statusOptions" :rowInfo="rowInfo" @closeLoad="closeLoad()"></knowledge-detail>
  </a-row>
</template>

<script>
import { postAction, getAction, deleteAction } from '@/api/manage'
import { getServiceCat } from '@/api/api'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import JDate from '@/components/jeecg/JDate.vue'
import ServiceInfo from './ServiceInfo.vue'
import KnowledgeMove from './KnowledgeMove.vue'
import KnowledgeInfo from './KnowledgeInfo.vue'
import knowledgeHistoryList from './KnowledgeHistory.vue'
import KnowledgeDetail from './KnowledgeDetail.vue'
import KnowledgeAudit from './KnowledgeAudit.vue'

export default {
  name: 'AddressList',
  components: {
    ServiceInfo,
    JDate,
    KnowledgeMove,
    KnowledgeInfo,
    knowledgeHistoryList,
    KnowledgeDetail,
    KnowledgeAudit,
  },
  mixins: [JeecgListMixin],
  props: {
    // 页面标识  1：管理 2：列表 3：审核 4：发布
    source: {
      type: Number,
      default: 1,
    },
    // 列表接口
    url: {
      type: Object,
    },
    // 不同的表头
    columnsDifferent: {
      type: Array,
    },
  },
  data() {
    return {
      description: '知识库页面',
      // 提示
      deleteInfo: {},
      // 左侧信息
      cardLoading: true,
      loadingTree: false,
      gData: [],
      dataList: [],
      selectedKeys: [],
      expandedKeys: [],
      // 添加目录信息
      rowInfo: {},
      paramsInfo: {},
      historyList: [],
      // 右侧信息
      disableMixinCreated: true,
      queryParam: {
        knowledgeCatId: "",
        status: "",
        commonUse: ""
      },
      columns: [
        {
          title: '标题',
          align: 'center',
          width: 180,
          ellipsis: true,
          dataIndex: 'title',
        },
        {
          title: '创建人',
          align: 'center',
          width: 100,
          ellipsis: true,
          dataIndex: 'createName',
        },
        {
          title: '账号',
          align: 'center',
          width: 100,
          ellipsis: true,
          dataIndex: 'userName',
        },
        {
          title: '类型',
          align: 'center',
          ellipsis: true,
          width: 180,
          dataIndex: 'knowledgeCatName',
        },
        {
          title: '关键字',
          align: 'center',
          ellipsis: true,
          dataIndex: 'keyWords',
        },
        {
          title: '创建时间',
          align: 'center',
          width: 200,
          sorter: true,
          dataIndex: 'createTime',
        },
        {
          title: '关联服务',
          align: 'center',
          width: 180,
          ellipsis: true,
          dataIndex: 'serviceCatNames',
        },
      ],
      urls: {
        treeList: '/know/knowledgeCat/treeList', // 分类查询
        treeDelete: '/know/knowledgeCat/delete', // 分类删除
        unReleaseDetail: '/know/knowledgeManage/detail/', //知识详情(其他)
        isReleaseDetail: '/know/knowledgeInfo/detail/', //知识详情(已发布)
        knowledgeDelete: '/know/knowledgeManage/delete', //知识删除
        allParentInfo: '/know/knowledgeCat/allParentInfo'
      },
      statusOptions: [
        { id: '1', title: '全部', value: '' },
        { id: '2', title: '草稿', value: 0 },
        { id: '3', title: '待审核', value: 1 },
        { id: '4', title: '已退回', value: 2 },
        { id: '5', title: '已发布', value: 3 },
      ],
      useOption: [
        { id: '1', title: '全部', value: '' },
        { id: '2', title: '否', value: 0 },
        { id: '3', title: '是', value: 1 },
      ],
      // 关联服务
      serviceOptions: [],
      serviceCatName: []
    }
  },
  watch: {
    // 合并表头
    columnsDifferent: {
      handler(newVal) {
        if (newVal) {
          this.columns = this.columns.concat(newVal)
        }
      },
      immediate: true,
    },
  },
  computed: {
    // 状态
    setStatus() {
      return function (status) {
        const findItem = this.statusOptions.find((item) => item.value === status)
        return findItem.title
      }
    },
    // 判断操作按钮
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
    // 获取服务
    this.initService()
    // 获取目录树
    this.getTreeData()
    // 查询关联列表信息
    this.getList()
  },
  methods: {
    // 初始化关联服务
    initService() {
      getServiceCat({ delFlag: 0, permissions: 2 }).then((res) => {
        if (res.success) {
          this.serviceOptions = res.result
        }
      })
    },
    // 搜索change
    serviceChange(value, selectedOptions) {
      const serviceCatId = value.length > 0 ? value[value.length - 1] : ''
      this.queryParam.serviceCatId = serviceCatId
    },
    //表单重置
    bindReset() {
      const keys = this.selectedKeys
      this.serviceCatName = []
      this.queryParam = {
        knowledgeCatId: keys.length > 0 ? keys[0] : "",
        status: "",
        commonUse: ""
      }
      this.loadData()
    },
    // 服务目录数据
    getTreeData() {
      this.loadingTree = true
      getAction(this.urls.treeList)
        .then((res) => {
          this.loadingTree = false
          if (res.success) {
            this.gData = res.result
          }
        })
        .finally(() => {
          this.loadingTree = false
          this.cardLoading = false
        })
    },
    // 查询关联列表信息
    getList() {
      const keys = this.selectedKeys
      this.queryParam.knowledgeCatId = keys.length > 0 ? keys[0] : ''
      this.loadData()
    },
    // 添加编辑完成
    closeLoad() {
      this.selectedRowKeys = []
      this.rowInfo = {}
      this.historyList = []
      this.paramsInfo = {}
      this.getTreeData()
      this.getList()
    },
    handleSubmit: function (ref, title) {
      this.$refs[ref].add()
      this.$refs[ref].title = title
      this.$refs[ref].disableSubmit = false
    },
    // 操作按钮
    handeleAction(type, info) {
      const that = this
      switch (type) {
        // 详情
        case 1:
          that.getDetailInfo(info).then((res) => {
            that.rowInfo = res.knowledgeManage
            that.handleSubmit('KnowledgeDetail', '知识详情')
          })
          break
        // 历史记录
        case 2:
          that.getDetailInfo(info).then((res) => {
            that.historyList = res.knowledgeHistoryList
            that.handleSubmit('knowledgeHistoryList', '知识记录')
          })
          break
        // 知识审核
        case 31:
          that.getDetailInfo(info).then((res) => {
            that.rowInfo = res.knowledgeManage
            that.handleSubmit('KnowledgeAudit', '知识审核')
          })
          break
        // 修改（发布）
        case 41:
          that.getDetailInfo(info).then((res) => {
            let result = res.knowledgeManage
            result.knowledgeCatIds = result.knowledgeCatIds.split(',')
            result.serviceCatId = result.serviceCatId ? result.serviceCatId.split(',') : result.serviceCatId
            that.rowInfo = result
            that.handleSubmit('knowledgeInfo', '知识信息修改')
          })
          break
        // 删除（发布）
        case 42:
          that.deleteKnowledge(info.id)
          break
        default:
          break
      }
    },
    // 删除知识
    deleteKnowledge(ids) {
      const that = this
      that.$confirm({
        title: '删除',
        content: '是否确认执行删除操作? 本操作不可撤销。',
        onOk: function () {
          deleteAction(that.urls.knowledgeDelete, {
            ids,
          }).then((res) => {
            if (res.success) {
              that.$message.success(res.message)
              that.getList()
            } else {
              that.$message.warning(res.message)
            }
          })
        },
      })
    },
    // 获取详情
    getDetailInfo(info) {
      let url = ''
      if (this.source === 1 || this.source === 2) {
        url = this.urls.isReleaseDetail
      } else {
        url = this.urls.unReleaseDetail
      }
      return new Promise((resolve) => {
        getAction(url + info.id).then((res) => {
          if (res.success) {
            resolve(res.result)
          }
        })
      })
    },
    /************* 知识目录 ********/
    // 选择全部
    checkAll() {
      this.selectedRowKeys = []
      this.selectedKeys = []
      this.getList()
    },
    // 刪除列表选择的
    bindList(type) {
      const len = this.selectedRowKeys.length
      if (len > 0) {
        if (type === 1) {
          const delList = this.selectedRowKeys.join(',')
          this.deleteKnowledge(delList)
        } else {
          this.handleSubmit('KnowledgeMove', '移动到')
        }
      } else {
        this.$message.warning('请勾选需要操作的知识列表！')
      }
    },
    // 添加目录
    addRow(catLevel = 1, info) {
      this.rowInfo = info ? info : {}
      this.paramsInfo = {
        catLevel, // 级别
        id: info ? info.id : null, // 编辑的id
        parentId: info ? info.parentId : null, // 父id
      }
      const title = info && info.id ? '编辑目录' : '新增目录'
      this.$nextTick(() => {
        this.handleSubmit('modalForm', title)
      })
    },
    // 选择事项 catLevel, title, parentId, children
    onContextMenuClick(menuKey, info) {
      switch (menuKey) {
        // 编辑
        case '1':
          this.addRow(info.catLevel, info)
          break
        // 删除
        case '2':
          const that = this
          const params = {
            pageNo: 1,
            pageSize: 2,
            knowledgeCatId: info.id
          }
          getAction(that.url.list, params)
            .then(res => {
              const total = res.result.total;
              if (total > 0) {
                that.$message.error('该目录下仍有知识，请处理后再来删除')
              } else {
                that.$confirm({
                  title: '删除',
                  content: '确定删除该目录?删除后不可恢复。',
                  okText: '确定',
                  cancelText: '取消',
                  type: 'warning',
                  onOk: async () => {
                    deleteAction(that.urls.treeDelete + '?ids=' + info.id)
                      .then(res => {
                        if (res.success) {
                          that.$message.success(res.message)
                          if (that.selectedKeys[0] == info.id) {
                            that.selectedKeys = []
                            that.getList()
                          }
                          that.getTreeData()
                        } else {
                          that.$message.error(res.message)
                        }
                      })
                  },
                  onCancel() {},
                })
              }
            })
          break
        // 添加
        case '3':
          const rowInfo = {
            id: null,
            parentId: info.id,
          }
          this.addRow(info.catLevel + 1, rowInfo)
          break
        default:
          break
      }
    },
    // 选择获取业务流程关联
    handleTreeSelect(selectedKeys, event) {
      if (selectedKeys.length > 0 && this.selectedKeys[0] !== selectedKeys[0]) {
        this.selectedKeys = [selectedKeys[0]]
        this.selectedRowKeys = []
        this.getList()

      }
    },
    /************* 知识发布 ********/
    // 发布知识
    bindRelease() {
      const id = this.selectedKeys[0]
      this.rowInfo = {}
      if (id) {
        getAction(this.urls.allParentInfo, { id: id }).then(res => {
          if (res.success) {
            this.rowInfo = {
              knowledgeCatIds: res.result.ids,
              knowledgeCatName: res.result.names
            }
          }
          this.handleSubmit('knowledgeInfo','发布知识')
        })
      } else {
        this.handleSubmit('knowledgeInfo','发布知识')
      }
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
.query-group-cust {
  width: 200px;
}
.r-h2 {
  font-size: 16px;
  margin-bottom: 18px;
}
.j-address-list-right-card-box {
  height: 100%;
  min-height: 300px;
}
.j-address-list-right-card-box .ant-table-placeholder {
  min-height: 46px;
}
.dropdown-span {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: inline-block;
  max-width: 300px;
}
.tree_dropdown >>> .ant-tree-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: inline-block;
  max-width: 300px;
}
.tab-all {
  margin-top: 8px;
}
.tab-all span {
  cursor: pointer;
  padding: 4px;
  display: inline-block;
}
.tab-all:hover span {
  background-color: rgb(230, 247, 255);
}
.tab-all_active {
  background-color: #bae7ff;
}
</style>