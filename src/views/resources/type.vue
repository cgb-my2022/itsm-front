<template>
  <a-card :bordered="false">
    <div>
      <el-button type="primary" @click="handleAdd">增加</el-button>
      <el-button type="primary" @click="modeDel">删除</el-button>
      <el-input 
          class="searchInput" 
          placeholder="请输入搜索内容"
          suffix-icon="el-icon-search"
          v-model="searchValue"
          @keyup.enter.native="handleSearch"
          ></el-input>
    </div>
    <br><br>
    <vxe-table
      resizable
      :loading="loading"
      show-overflow
      keep-source
      ref="xTree"
      row-id="id"
      border
      :checkbox-config="{checkStrictly: true}"
      :print-config="{}"
      :export-config="{}"
      :tree-config="treeConfig"
      :edit-config="{trigger: 'click', mode: 'row', showStatus: true}"
      :data="tableData">
      <vxe-table-column type="checkbox" width="60"></vxe-table-column>
      <vxe-table-column field="name" title="名称" tree-node></vxe-table-column>
      <vxe-table-column field="describes" title="描述"></vxe-table-column>
      <vxe-table-column field="" title="可继承" width="100">
        <template #default="{ row }">
          {{ row.inherit == 0? '否': '是' }}
        </template>
      </vxe-table-column>
      <vxe-table-column  title="用户自定义" width="100">
        <template #default="{ row }">
          {{ row.builtIn == 0? '否': '是' }}
        </template>
      </vxe-table-column>
      <vxe-table-column field="order" title="序号" width="100"></vxe-table-column>
      <vxe-table-column title="操作">
        <template #default="{ row }">
          <el-button type="primary" size="mini" @click="toDetail(row)">详情</el-button>
          <el-button type="primary" size="mini" @click="toEdit(row)">修改</el-button>
          <el-button type="danger" size="mini" @click="toDel(row)">删除</el-button>
        </template>
      </vxe-table-column>
    </vxe-table>
        
  </a-card>
</template>

<script>
import { resourceTree, delResource, delModeResource, searchResource } from '@/api/resourceType'
export default {
  components:{},
  props:{},
  data(){
    return {
      searchValue: "",
      loading: false,
      treeConfig: {
        children: 'children'
      },
      tableData: [],


    }
  },
  mounted(){
    this.initTree()
  },
  methods:{
    initTree(){
      resourceTree()
        .then(res=>{
          // console.log(res)
          this.tableData = res.result
        }).catch(err=>{ this.$message.error('获取数据失败') })
    },
    // 搜索框
    handleSearch(){
      searchResource({typeName: this.searchValue})
        .then(res=>{
          if(res.code == 200){
            this.tableData = res.result
          }else{
            this.$message.error('查询失败')
          }
        }).catch(()=>{ this.$message.error('查询失败') })
    },
    // 顶部新增按钮
    handleAdd(){
      this.$router.push({
        path:'/type/typeDetail',
        query:{
          type: 0
        }
      })
    },
    // 顶部批量删除按钮 
    modeDel(){
      let selectRecords = this.$refs.xTree.getCheckboxRecords();
      // console.log(selectRecords)
      if(selectRecords.length == 0){
        this.$message.error('请选择数据在进行删除')
        return
      }
      let ids = []
      selectRecords.forEach(item => {
        ids.push(item.id)
      });
      delModeResource({ids: ids.join(',')})
        .then(res=>{
          if(res.code == 200){
            this.$message.success('删除成功')
            this.initTree()
          }else{
            this.$message.error('删除失败')
          }
        })
    },
    // 表格操作
    toDetail(row){
      // console.log(row)
      this.$router.push({
        path:'/type/typeDetail',
        query:{
          type:1,
          id: row.id
        }
      })
    },
    toEdit(row){
      // console.log(row)
      this.$router.push({
        path:'/type/typeDetail',
        query:{
          type:2,
          id: row.id
        }
      })
    },
    toDel(row){
      // console.log(row)
      delResource({id: row.id})
        .then(res=>{
          if(res.code == 200){
            this.$message.success('删除成功')
            this.initTree()
          }else{
            this.$message.error('删除失败')
          }
        }).catch(()=>{this.$message.error('删除失败')})
    }

  },
}
</script>
<style scoped>
.searchInput {
   width: 200px;
   float: right;
}
</style>