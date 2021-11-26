<template>
  <div>
    <vxe-table
      border
      :data="tableData.slice((page.currentPage-1)*page.pageSize,page.currentPage*page.pageSize)"
      >
      <vxe-column field="createTime" title="变更时间" sortable></vxe-column>
      <vxe-column field="changeAttr" title="变更属性" sortable></vxe-column>
      <vxe-column field="changeDataBefore" title="变更前数据" show-overflow></vxe-column>
      <vxe-column field="changeDataAfter" title="变更后数据" show-overflow></vxe-column>
      <vxe-column field="updateName" title="变更人" sortable></vxe-column>
      <vxe-column field="changeReason" title="变更原因" show-overflow></vxe-column>
      <vxe-column title="操作">
        <template #default='{ row }'>
          <el-button type="primary" @click="toDetail(row)">查看详情</el-button>
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
import { searchResourceHis } from '@/api/conserResource'
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
    this.getHis(this.$route.query.id)
  },
  methods:{
    getHis(id){
      searchResourceHis({id})
        .then(res=>{
          // console.log(res);
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

    toDetail(row){
      this.$router.push({
        path: "/conserResource/conserDetailHome",
        query:{
          id: row.id
        }
      })
      this.$emit('changeKey', '1')
    }
  },
}
</script>
<style scoped>
</style>