<template>
   <el-dialog
      title="选择用户"
      :visible.sync="userDialogVisible"
      width="50%"
      >
      <vxe-table
         border
         ref="xTable1"
         :data="tableData"
         :radio-config="{highlight: true}"
         >
         <vxe-column type="radio" width="60"></vxe-column>
         <vxe-column field="realname" title="姓名"></vxe-column>
      </vxe-table>
      <br>
      <vxe-pager
         background
         @page-change="pageChange"
         :current-page.sync="page.currentPage"
         :page-size.sync="page.pageSize"
         :total="page.totalResult"
         :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'Sizes', 'FullJump', 'Total']">
      </vxe-pager>
      <span slot="footer" class="dialog-footer">
         <el-button @click="userCancle">取 消</el-button>
         <el-button type="primary" @click="userSure">确 定</el-button>
      </span>
   </el-dialog>
</template>

<script>
import { userResourceList } from '@/api/conserResource'
export default {
  components:{},
  props:{
     userDialogVisible: false,
     theIndex: null
  },
  data(){
    return {
      tableData:[],
      page: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0
      },
    }
  },
  mounted(){
     this.getUser()
  },
  methods:{
     getUser(){
        userResourceList({
           pageNo: this.page.currentPage,
           pageSize: this.page.pageSize,
        })
         .then(res=>{
            this.tableData = res.result.records
            this.page.totalResult = res.result.total
         })
     },
     userCancle(){
        this.$emit('userCancle', false)
     },
     userSure(){
        this.$emit('userSure', false, this.$refs.xTable1.getRadioRecord(), this.theIndex)
     },

     pageChange(type){
      this.page.currentPage = type.currentPage
      this.page.pageSize = type.pageSize
      this.getUser()
    },

  },
}
</script>
<style scoped>
</style>