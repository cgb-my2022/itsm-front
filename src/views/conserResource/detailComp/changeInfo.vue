<template>
  <div>
    <vxe-table
      border
      :data="tableData.slice((page.currentPage-1)*page.pageSize,page.currentPage*page.pageSize)"
      >
      <vxe-column field="createTime" title="变更时间" sortable></vxe-column>
      <!-- <vxe-column field="changeAttr" title="变更属性" sortable></vxe-column> -->
      <vxe-column title="变更前数据" >
        <template #default='{ row }'>
          <div class="showTips" @click="toDetail(row.changeDataBefore)"> {{ row.changeDataBefore }} </div>
        </template>
      </vxe-column>
      <vxe-column field="changeDataAfter" title="变更后数据" >
        <template #default='{ row }'>
          <div class="showTips" @click="toDetail(row.changeDataAfter)"> {{ row.changeDataAfter }} </div>
        </template>
      </vxe-column>
      <vxe-column field="updateName" title="变更人" sortable></vxe-column>
      <vxe-column field="changeReason" title="变更原因" show-overflow></vxe-column>
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
      tableData: [],
      page: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0
      },
    }
  },
  mounted(){
    if(sessionStorage.getItem('resourceTableID')){
      this.getHis(sessionStorage.getItem('resourceTableID'))
    }else{
      this.$message.error('获取变更日志失败')
    }
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
      // return
      this.$router.push({
        name: "conserResource-conserDetailHome",
        // params:{
        //   data: row
        // }
      })
      sessionStorage.setItem('changeInfoValues', row)
      this.$emit('changeKey', '1')
    }
  },
}
</script>
<style scoped>
.showTips {
  width: 200px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;
}
.showTips:hover {
  color: #409eff;
}
</style>