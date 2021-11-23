<template>
   <el-dialog
      title="选择用户"
      :visible.sync="userDialogVisible"
      width="25%"
      >
      <vxe-table
         border
         ref="xTable1"
         height="300"
         :data="tableData"
         :radio-config="{highlight: true}"
         >
         <vxe-column type="radio" width="60"></vxe-column>
         <vxe-column field="realname" title="姓名"></vxe-column>
      </vxe-table>
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
       tableData:[]
    }
  },
  mounted(){
     this.getUser()
  },
  methods:{
     getUser(){
        userResourceList()
         .then(res=>{
            this.tableData = res.result.records
         })
     },
     userCancle(){
        this.$emit('userCancle', false)
     },
     userSure(){
        this.$emit('userSure', false, this.$refs.xTable1.getRadioRecord(), this.theIndex)
     }

  },
}
</script>
<style scoped>
</style>