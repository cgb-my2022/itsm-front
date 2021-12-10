<template>
  <a-row type="flex" :gutter="16">
    <!-- 左侧目录 -->
    <a-col :md="5" :sm="24">
      <a-card :loading="cardLoading" :bordered="false" style="height: 100%; overflow-x: auto">
        <h2 class="r-h2">服务目录</h2>
        <a-spin :spinning="loadingTree" style="overflow-x: 'auto'">
          <a-button type="primary" @click="addRow(1)" icon="plus" style="margin-bottom: 18px">添加目录</a-button>
          <a-input-search
            v-model="searchData.catName"
            @search="getTreeData"
            style="width: 100%"
            placeholder="输入目录名称..."
            allow-clear
            enterButton
          />
          <div class="tab-all">
            <span @click="checkAll" :class="{ 'tab-all_active': showAll }">全部根目录</span>
          </div>
          <a-tree
            showLine
            :selectedKeys="selectedKeys"
            :dropdownStyle="{ maxHeight: '200px', overflow: 'auto' }"
            :expanded-keys.sync="expandedKeys"
            :tree-data="gData"
            @select="handleTreeSelect"
          >
            <template #title="{ key: treeKey, title, catLevel, children}">
              <a-dropdown :trigger="['contextmenu']">
                <span class="dropdown-span" :title="title">{{ title }}</span>
                <template #overlay>
                  <a-menu @click="({ key: menuKey }) => onContextMenuClick(treeKey, menuKey, catLevel,children)">
                    <a-menu-item key="1">
                      <a-icon type="edit" />
                      <span>编辑</span>
                    </a-menu-item>
                    <a-menu-item key="2">
                      <a-icon type="zoom-out" />
                      <span>删除</span>
                    </a-menu-item>
                    <a-menu-item key="3">
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
        <div class="table-page-search-wrapper">
          <h2 class="r-h2">服务目录列表</h2>
        </div>
        <!-- 批量删除 -->
        <div class="table-operator">
          <!-- selectedRowKeys.length -->
          <a-button @click="deleteList" type="primary">删除</a-button>
        </div>
        <a-table
          ref="table"
          size="middle"
          bordered
          rowKey="id"
          class="j-table-force-nowrap"
          :pagination="false"
          :columns="columns"
          :dataSource="dataSource"
          :loading="loadingList"
          :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        >
          <!-- 权限 -->
          <template slot="permission" slot-scope="text">
            <span>{{ text === 1 ? '公有' : '私有' }}</span>
          </template>
          <!-- 操作 -->
          <!-- <span slot="action" slot-scope="text, record">
            <a @click="onContextMenuClick(record.id, '3', record.catLevel, record)">添加下级</a>
            <a-divider type="vertical" />
            <a @click="onContextMenuClick(record.id, '1', record.catLevel)">编辑</a>
            <a-divider type="vertical" />
            <a @click="onContextMenuClick(record.id, '2', record.catLevel)">删除</a>
          </span> -->
        </a-table>
      </a-card>
    </a-col>
    <!-- 删除含有子集的目录提示 -->
    <a-modal
      title="提示"
      :visible="visible"
      @ok="delServiceMethods(deleteInfo.ids, deleteInfo.type)"
      @cancel="visible=false"
    >
      <p v-if="deleteInfo.type === 2">该目录下存在<span style="color: red;">{{deleteInfo.len}}个子级</span>，确认要删除该目录及全部子级？删除后数据不可恢复，请谨慎操作！</p>
      <p v-if="deleteInfo.type === 1">您确认删除选中的<span style="color: red;">{{deleteInfo.len}}条目录及其下的全部子级？</span>删除后数据不可恢复，请谨慎操作！</p>
    </a-modal>
    <!-- 添加/编辑 服务目录 -->
    <service-info
      ref="modalForm"
      :serviceInfo="selectInfo"
      :rowInfo="rowInfo"
      :paramsInfo="paramsInfo"
      @closeLoad="closeLoad()"
    ></service-info>
  </a-row>
</template>

<script>
import { getServiceCat, getServiceInfo, delServiceInfo } from '@/api/api'
import ServiceInfo from './modules/ServiceInfo.vue'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { getAction } from '@/api/manage'

export default {
  name: 'AddressList',
  components: { ServiceInfo },
  mixins: [JeecgListMixin],
  data() {
    return {
      description: '服务目录页面',
      // 提示
      visible: false,
      deleteInfo: {},
      // 左侧信息
      searchData: {
        catName: '',
        delFlag: 0,
        permissions: 2,
      },
      cardLoading: true,
      loadingTree: false,
      gData: [],
      dataList: [],
      selectedKeys: [],
      expandedKeys: [],
      searchValue: '',
      rowInfo: {},
      selectInfo: {},   //关联内容
      paramsInfo: {
        catLevel: 1, // 级别
        id: null, // 编辑的id
        parentId: null // 父id
      },
      showAll: false,
      // 右侧信息
      loadingList: false,
      dataSource: [],
      disableMixinCreated: true,
      columns: [
        {
          title: '目录名称',
          align: 'center',
          dataIndex: 'catName',
        },
        {
          title: '调用权限',
          align: 'center',
          dataIndex: 'permission',
          scopedSlots: { customRender: 'permission' },
        },
        {
          title: '关联流程',
          align: 'center',
          dataIndex: 'processName',
        },
        // {
        //   title: '操作',
        //   dataIndex: 'action',
        //   align: 'center',
        //   width: 180,
        //   scopedSlots: { customRender: 'action' },
        // },
      ],
      url: '/sys/serviceCat/listByPid',
    }
  },
  created() {
    this.getTreeData()
  },
  methods: {
    // 服务目录数据
    getTreeData() {
      this.loadingTree = true
      getServiceCat(this.searchData)
        .then((res) => {
          this.loadingTree = false
          if (res.success) {
            const result = res.result
            this.gData = result
            if (this.selectedKeys.length === 0 && result.length > 0 && !this.showAll) {
              this.selectedKeys = [result[0].id]
              this.getList()
            }
          }
        })
        .finally(() => {
          this.loadingTree = false
          this.cardLoading = false
        })
    },
    // 查询关联列表信息
    getList() {
      this.loadingList = true
      const keys = this.selectedKeys
      getAction(this.url, {
        pid: keys.length > 0 ? keys[0] : '',
      })
        .then((res) => {
          this.loadingList = false
          if (res.code === 200) {
            this.dataSource = res.result
          }
        })
        .finally(() => {
          this.loadingList = false
          return ''
        })
    },
    // 添加编辑完成
    closeLoad() {
      this.getTreeData()
      this.getList()
    },
    // 选择全部
    checkAll() {
      this.selectedRowKeys = []
      this.selectedKeys = []
      this.showAll = true
      this.getList()
    },
    // 刪除列表选择的
    deleteList() {
      const len = this.selectedRowKeys.length
      if ( len > 0) {
        const delList = this.selectedRowKeys.join(",")
        this.deleteInfo = {
          ids: delList, type: 1, len: len
        }
        this.visible = true
      } else {
        this.$message.warning("请勾选需要删除的服务目录！")
      }
    },
    // 删除提示
    delMethods(ids, type, content) {
      this.$confirm({
        title: '删除',
        content,
        okText: '确定',
        cancelText: '取消',
        type: 'warning',
        onOk: async () => {
          this.delServiceMethods(ids, type)
        },
        onCancel() {},
      })
    },
    // 公用删除方法
    delServiceMethods(ids, type) {
      delServiceInfo({ ids }).then((res) => {
        if (type === 1) {
          this.selectedRowKeys = []
        } else {
          if (this.selectedKeys[0] === ids) {
            this.selectedKeys = []
          }
        }
        this.visible = false
        this.deleteInfo = {}
        this.closeLoad()
      })
    },
    handleSubmit: function (title) {
      this.$refs.modalForm.add()
      this.$refs.modalForm.title = title
      this.$refs.modalForm.disableSubmit = false
    },
    // 添加目录
    addRow(catLevel = 1, parentId = null, info = null, id = null) {
      if (!id) {
        this.rowInfo = {}
      }
      this.paramsInfo = {
        catLevel, // 级别
        id, // 编辑的id
        parentId // 父id
      }
      this.selectInfo = {
        processId: info ? info.processId : "", 
        processName: info ? info.processName : "", 
        processRelationCode: info ? info.processRelationCode : ""
      }
      const title = id ? '编辑目录' : '新增目录'
      this.handleSubmit(title)
    },
    // 选择事项
    onContextMenuClick(treeKey, menuKey, catLevel, children) {
      switch (menuKey) {
        // 编辑
        case '1':
          this.detailMethods(treeKey, catLevel, menuKey)
          break
        // 删除
        case '2':
          if (children && children.length > 0) {
            // 存在子集
            const lenArr = this.setArr(children, [])
            this.deleteInfo = {
              ids: treeKey, type: 2, len: lenArr.length
            }
            this.visible = true
          } else {
            // 没有子集
            this.delMethods(treeKey, 2, '确定删除该目录?')
          }
          break
        // 添加
        case '3':
          this.detailMethods(treeKey, catLevel + 1, menuKey)
          break
        default:
          break
      }
    },
    setArr(data, arr) {
      if (data && data.length > 0) {
        data.forEach( item => {
          arr.push(item.id)
          this.setArr(item.children, arr)
        })
      } 
      return arr;
    },
    // 获取详情
    detailMethods(id, catLevel, menuKey) {
      getServiceInfo({ id }).then((res) => {
        if (res.code === 200) {
          const result = res.result
          const selectInfo = {
            processId: result.processId, 
            processName: result.processName, 
            processRelationCode: result.processRelationCode
          }
          if (menuKey === '1') {
            this.rowInfo = result
            this.addRow(catLevel, result.parentId, selectInfo, result.id)
          } else {
            this.addRow(catLevel, id, selectInfo)
          }
        }
      })
    },
    // 选择获取业务流程关联
    handleTreeSelect(selectedKeys, event) {
      if (selectedKeys.length > 0 && this.selectedKeys[0] !== selectedKeys[0]) {
        this.selectedKeys = [selectedKeys[0]]
        this.selectedRowKeys = []
        this.showAll = false
        this.getList()
      }
    },
  },
}
</script>
<style scoped>
@import '~@assets/less/common.less';
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
  max-width: 200px;
}
.tab-all {
  margin-top: 8px;
}
.tab-all span {
  cursor: pointer;
  padding: 4px 0;
  display: inline-block;
}
.tab-all:hover span{
  background-color: rgb(230, 247, 255);
}
.tab-all_active {
  background-color: #bae7ff;
}
</style>