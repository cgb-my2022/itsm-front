<template>
  <a-card :loading="cardLoading" :bordered="false" style="height: 100%;overflow-x:auto;">
    <h2 class="r-h2">服务目录</h2>
    <a-spin :spinning="loading" style="overflow-x:'auto'">
      <a-button type="primary" @click="addRow(1)" icon="plus" style="margin-bottom: 18px;">添加目录</a-button>
      <a-input-search v-model="searchData.catName" @search="getTreeData" style="width:100%;" placeholder="输入目录名称..." allow-clear enterButton/>
      <a-tree
        showLine
        :selectedKeys="selectedKeys"
        :dropdownStyle="{maxHeight:'200px', overflow:'auto'}"
        :expanded-keys.sync="expandedKeys"
        :tree-data="gData"
        @select="handleTreeSelect">
          <template #title="{ key: treeKey, title, catLevel, children }">
            <a-dropdown :trigger="['contextmenu']">
              <p class="dropdown-span">{{ title }}</p>
              <template #overlay>
                <a-menu @click="({ key: menuKey }) => onContextMenuClick(treeKey, menuKey, catLevel)">
                  <a-menu-item key="1">
                    <a-icon type="edit"/>
                    <span>编辑</span>
                  </a-menu-item>
                  <a-menu-item v-show="children.length === 0" key="2">
                    <a-icon type="zoom-out"/>
                    <span>删除</span>
                  </a-menu-item>
                  <a-menu-item v-show="catLevel != 4" key="3">
                    <a-icon type="zoom-in"/>
                    <span>添加</span>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
      </a-tree>
    </a-spin>
    <!-- 添加/编辑 服务目录 -->
    <service-info ref="modalForm" :rowInfo="rowInfo" :paramsInfo="paramsInfo" @closeLoad="getTreeData()"></service-info>
  </a-card>
</template>

<script>
  import { getServiceCat, getServiceInfo, delServiceInfo } from '@/api/api'
  import ServiceInfo from "./ServiceInfo.vue"
  import { mapMutations } from "vuex"
  export default {
    name: 'ServiceLeft',
    props: ['value'],
    components: { ServiceInfo },
    data() {
      return {
        searchData: {
          catName: "",
          delFlag: 0,
          permissions: 2
        },
        cardLoading: true,
        loading: false,
        gData: [],
        dataList: [],
        selectedKeys: [],
        expandedKeys: [],
        searchValue: '',
        rowInfo: {},
        paramsInfo: {
          catLevel: 1,   // 级别
          id: null,      // 编辑的id
          parentId: null, // 父id
          processId:  "1302868279138656257"
        }
      }
    },
    created() {
      this.getTreeData()
    },
    methods: {
      ...mapMutations(["SET_CATALOG_ID"]),
      // 服务目录数据
      getTreeData() {
        this.loading = true
        getServiceCat(this.searchData).then(res => {
          this.loading = false
          if (res.success) {
            const result = res.result
            this.gData = result
            if (this.selectedKeys.length === 0 && result.length > 0) {
              this.SET_CATALOG_ID(result[0].id)
              this.selectedKeys = [result[0].id]
            }
          }
        }).finally(() => {
          this.loading = false
          this.cardLoading = false
        })
      },
      handleSubmit: function (title) {
        this.$refs.modalForm.add();
        this.$refs.modalForm.title = title;
        this.$refs.modalForm.disableSubmit = false;
      },
      // 添加目录
      addRow(catLevel=1, parentId=null, id=null, processId, name="新增目录") {
        if (!id) {
          this.rowInfo = {}
        }
        this.paramsInfo = {
          catLevel,   // 级别
          id,      // 编辑的id
          parentId, // 父id
          processId: processId ? processId : "1302868279138656257"
        }
        this.handleSubmit(name)     
      },
      // 选择事项
      onContextMenuClick(treeKey, menuKey, catLevel) {
        switch (menuKey) {
          // 编辑
          case "1":
            getServiceInfo({id: treeKey})
              .then(res => {
                if (res.code === 200) {
                  const result = res.result
                  this.rowInfo = result
                  this.addRow(result.catLevel, result.parentId, result.id, result.processId, "编辑目录")
                }
              })
            break;
          // 删除
          case "2":
            this.$confirm({
              title: "提示",
              content: "确定删除该目录?",
              okText: "确定",
              cancelText: "取消",
              type: "warning",
              onOk: async () => {
                delServiceInfo({ids: treeKey})
                    .then((res) => {
                        this.getTreeData();
                    })
              },
              onCancel() {},
            });
            break;
          // 添加
          case "3":
            this.addRow(catLevel + 1, treeKey)
            break;
          default:
            break;
        }
      },
      // 选择获取业务流程关联
      handleTreeSelect(selectedKeys, event) {
        if (selectedKeys.length > 0 && this.selectedKeys[0] !== selectedKeys[0]) {
          this.selectedKeys = [selectedKeys[0]]
          this.SET_CATALOG_ID(selectedKeys[0])
        }
      }
    }
  }
</script>

<style scoped>
.r-h2 {
  font-size: 16px;
  margin-bottom: 18px;
}
</style>