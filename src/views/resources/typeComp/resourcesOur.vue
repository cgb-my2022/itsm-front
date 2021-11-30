<template>
  <el-dialog
      title="选择属性"
      :visible.sync="ourDialogVisible"
      width="50%"
      :before-close="ourCancle">
      <vxe-table
         border
         ref="xTableOur"
         resizable
         highlight-hover-row
         highlight-current-row
         height="300"
         :data="tableData"
         >
         <vxe-column type="checkbox" width="60"></vxe-column>
         <vxe-column field="attrName" title="属性名称"></vxe-column>
         <vxe-column title="数据类型">
            <template slot-scope="scope">
                  <div class="ourClass">
                  {{ scope.row.attrType == 1? "文本"
                     : scope.row.attrType == 2? "文本区域"
                     : scope.row.attrType == 3? "下拉文本"
                     : scope.row.attrType == 4? "树形下拉文本"
                     : scope.row.attrType == 5? "小数"
                     : scope.row.attrType == 6? "整数"
                     : scope.row.attrType == 7? "密文"
                     : scope.row.attrType == 8? "MAC"
                     : scope.row.attrType == 9? "IP"
                     : scope.row.attrType == 10? "url"
                     : scope.row.attrType == 11? "日期格式"
                     : scope.row.attrType == 12?"附件"
                     : ""
                  }}
                  </div>
               </template>
         </vxe-column>
         <vxe-column field="optionalValue" title="可选值"></vxe-column>
         <vxe-column field="maxLength" title="最大长度"></vxe-column>
         <vxe-column field="describes" title="描述" show-overflow></vxe-column>
      </vxe-table>
      <span slot="footer" class="dialog-footer">
         <el-button @click="ourCancle">取 消</el-button>
         <el-button type="primary" @click="ourtSure">确 定</el-button>
      </span>
   </el-dialog>
</template>

<script>
import { defaultProperties} from '@/api/properties'
export default {
  components:{},
  props:{
     ourDialogVisible: false,
     propTree: null
  },
  data(){
    return {
      tableData: []
    }
  },
  mounted(){
     this.initTable()
   //   console.log(this.propTree)
     
  },
  methods:{
     // 初始加载表格数据
      initTable(){
         let secTable = []
         defaultProperties({ attrName: ""})
            .then(res=>{
               // console.log(res)
               if(JSON.stringify(res.result)=="{}"){
                  this.tableData = []
               }else{
                  this.tableData = res.result.customize
                  this.tableData.forEach((item, index) => {
                     item.order = index
                  });
                  if(this.propTree && this.propTree.length > 0){
                     for(var i = 0; i < this.tableData.length; i++){
                        for(var k = 0; k < this.propTree.length; k++){
                           if(this.tableData[i].id == this.propTree[k].id){
                              secTable.push(this.tableData[i])
                           }
                        }
                     }
                  }
                  this.$nextTick(()=>{
                     this.$refs.xTableOur.setCheckboxRow(secTable, true)
                  })
                 
               }
            })
            .catch(err=>err)
      },
     ourCancle(){
        this.$emit('closeOur', false)
     },
     ourtSure(){
      //   if(this.$refs.xTableOur.getCheckboxRecords().length == 0){
      //      this.$message.error('请选择属性')
      //      return
      //   }
        let res = {
           resCheck: this.$refs.xTableOur.getCheckboxRecords(),
           flag: false
        }
        this.$emit('sureOur', res)
     }
  },
}
</script>
<style scoped>
.ourClass{
   height: 40px;
   line-height: 15px;
}
</style>