<template>
  <el-dialog
      title="选择资源类型"
      :visible.sync="checkParentDialogVisible"
      width="50%"
      :before-close="checkParentCancle">
      <vxe-table
         border
         ref="xTable1"
         height="300"
         :data="sourceTableData"
         :radio-config="{highlight: true}"
         >
         <vxe-column type="radio" width="60"></vxe-column>
         <vxe-table-column field="name" title="名称"></vxe-table-column>
         <vxe-table-column field="describes" title="描述"></vxe-table-column>
         <!-- <vxe-table-column field="" title="可继承" width="100">
            <template #default="{ row }">
               {{ row.inherit == 0? '否': '是' }}
            </template>
         </vxe-table-column> -->
         <vxe-table-column  title="用户自定义" width="100">
            <template #default="{ row }">
               {{ row.builtIn == 0? '否': '是' }}
            </template>
         </vxe-table-column>
      </vxe-table>
      <span slot="footer" class="dialog-footer">
         <el-button @click="checkParentCancle">取 消</el-button>
         <el-button type="primary" @click="checkParentSure">确 定</el-button>
      </span>
   </el-dialog>
</template>

<script>
import { resourceTree } from '@/api/resourceType'
export default {
  components:{},
  props:{
     sourceId: null,
     checkParentDialogVisible: false
  },
  data(){
    return {
      sourceTableData: []
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
          this.sourceTableData = res.result
          this.sourceTableData.forEach((item, index) => {
             if(item.id == this.sourceId){
               this.$nextTick(()=>{
                  this.$refs.xTable1.setRadioRow(this.sourceTableData[index])
               })
             }
          });
        }).catch(err=>{ 
           console.log(err)
           this.$message.error('获取数据失败') 
         })
    },
     checkParentCancle(){
        this.$emit('closeCheckParent', false)
     },
     checkParentSure(){
        let res = {
           resCheck: this.$refs.xTable1.getRadioRecord(),
           flag: false
        }
        this.$emit('sureCheckParent', res)
     }
  },
}
</script>
<style scoped>
</style>