<template>
  <div>
    <vxe-table
      border
      :data="tableData.slice((page.currentPage-1)*page.pageSize,page.currentPage*page.pageSize)"
      >
      <vxe-column field="name" title="资源类型" sortable></vxe-column>
      <vxe-column field="sex" title="名称" sortable></vxe-column>
      <vxe-column field="age" title="描述"></vxe-column>
      <vxe-column field="age" title="状态"></vxe-column>
      <vxe-column field="age" title="使用人" sortable></vxe-column>
      <vxe-column title="查看">
        <template #default="{ row }">
          <vxe-button status="primary" content="详情" @click="detail(row)"></vxe-button>
          <vxe-button status="primary" content="关系" @click="connect(row)"></vxe-button>
        </template>
      </vxe-column>
    </vxe-table>
    <vxe-pager
      background
      @page-change="pageChange"
      :current-page.sync="page.currentPage"
      :page-size.sync="page.pageSize"
      :total="page.totalResult"
      :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'Sizes', 'FullJump', 'Total']">
    </vxe-pager>
  </div>
</template>

<script>
import { searchResourceAsso } from '@/api/conserResource'
export default {
  components:{},
  props:{},
  data(){
    return {
      tableData: [
        
      ],
      page: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0
      },
    }
  },
  mounted(){
    this.getAsso(this.$route.query.id)
  },
  methods:{
    getAsso(id){
      searchResourceAsso({id})
        .then(res=>{
          if(res.code == 200){
            this.tableData = res.result
            this.page.totalResult = res.result.length
          }else{
            this.$message.error('查询失败')
          }

        })
    },
    pageChange(type){
      this.page.currentPage = type.currentPage
      this.page.pageSize = type.pageSize
    },
    detail(row){
      console.log(row)
    },
    connect(row){
      console.log(row)
    },
  },
}
</script>
<style scoped>
</style>