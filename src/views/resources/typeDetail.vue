<template>
   <a-card :bordered="false">
      <div style="font-weight: bold">{{ resourceTypeTitle }}</div>
      <div class="resourceTitle">基本信息</div>
      <div class="reLine"></div>
      <!-- 基本信息 -->
      <el-form ref="elForm" class="formContainer" :model="formData" :rules="rules" size="medium" label-width="100px">
         <el-form-item label="父类型" prop="fatherName">
            <el-input v-model="formData.fatherName" disabled placeholder="请选择父级类型" clearable :style="{width: '50%', marginRight: '20px'}">
            </el-input>
            <el-button type="primary" @click="checkParent"  v-if="theType !== 1">选择</el-button>
            <el-button type="primary" v-if="theType === 0" @click="checkHome">根类型</el-button>
         </el-form-item>
         <el-form-item label="序号" prop="code">
            <el-input v-model="formData.code" type="number" :disabled="theType === 1" placeholder="请输入序号" clearable :style="{width: '50%'}"></el-input>
            <span class="propTips" title="根据序号排列树结构中同级中的上下顺序">?</span>
         </el-form-item>
         <el-form-item label="名称" prop="name">
            <el-input v-model="formData.name" :disabled="theType === 1" placeholder="请输入名称" clearable :style="{width: '50%'}"></el-input>
         </el-form-item>
         <el-form-item label="描述" prop="disc">
            <el-input v-model="formData.disc" :disabled="theType === 1" type="textarea" placeholder="请输入描述" :autosize="{minRows: 4, maxRows: 4}"
               :style="{width: '50%'}"></el-input>
         </el-form-item>
         <el-form-item label="可继承" class="extendClass">
            <el-radio v-model="formData.radio" label="1" :disabled="theType === 1">是</el-radio>
            <el-radio v-model="formData.radio" label="0" :disabled="theType === 1">否</el-radio>
         </el-form-item>
      </el-form>
      <div class="resourceTitle">属性信息</div>
      <div class="reLine"></div>
      <div style="margin: 30px 0;" v-show="theType !== 1">
         <el-button type="primary" size="medium" @click="secOur">选择</el-button>
         <el-button type="primary" size="medium" @click="ourDel">删除</el-button>
      </div>
      <el-table
         :data="tableData"
         border
         @selection-change="handleSelectionChange"
         style="width: 100%">
         <el-table-column :selectable="handleIsCheck"  type="selection" width="55"></el-table-column>
         <el-table-column  prop="attrName"  label="属性名称"  ></el-table-column>
         <!-- <el-table-column  prop="date"  label="所属分组"  width="100"></el-table-column> -->
         <el-table-column  label="数据类型"  width="100">
            <template slot-scope="scope">
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
               </template>
         </el-table-column>
         <el-table-column  prop="optionalValue"  label="可选值" ></el-table-column>
         <el-table-column  prop="maxLength"  label="最大长度"  width="100"></el-table-column>
         <el-table-column  prop="describes"  label="描述" ></el-table-column>
         <!-- <el-table-column  label="操作" ></el-table-column> -->
      </el-table>
      <div style="margin: 30px 0; text-align: center" v-if="theType !== 1">
         <el-button size="medium"  @click="$router.push('/resources/type')">取消</el-button>
         <el-button type="primary" size="medium" @click="submitForm">确定</el-button>
      </div>
      <div style="margin: 30px 0; text-align: center" v-else>
         <el-button type="primary" size="medium" @click="$router.push('/resources/type')">返回</el-button>
      </div>

      <!-- 基本信息选择资源类型dialog -->
      <resourcesTree
         v-if="checkParentDialogVisible"
         :sourceId="sourceId" 
         :checkParentDialogVisible="checkParentDialogVisible"
         @closeCheckParent="closeCheckParent"
         @sureCheckParent="sureCheckParent"
      ></resourcesTree>

      <!-- 选择自定义属性信息dialog -->
      <resourcesOur
         v-if="ourDialogVisible" 
         :ourDialogVisible="ourDialogVisible"
         :propTree="tableData"
         @closeOur="closeOur"
         @sureOur="sureOur"
      ></resourcesOur>


   </a-card>
</template>

<script>
import resourcesTree from './typeComp/resourcesTree'
import resourcesOur from './typeComp/resourcesOur'
import { addResource, infoResource, editResource } from '@/api/resourceType'
import { defaultProperties} from '@/api/properties'
export default {
  components:{
     resourcesTree,
     resourcesOur
  },
  props:{},
  data(){
    return {
      theType: null,//跳转的类型
      infoId: null,
      sourceId: null, //tree 选中
      parentName: "",
      resourceTypeTitle:"增加资源类型",
      formData: {
         fatherName: undefined,
         fatherId: null,
         code: undefined,
         name: undefined,
         disc: undefined,
         radio: '1'
      },
      rules: {
         fatherName: [{
            required: true,
            message: '请选择父级类型',
            trigger: 'blur'
         }],
         code: [{
            required: true,
            message: '请输入序号',
            trigger: 'blur'
         }],
         name: [{
            required: true,
            message: '请输入名称',
            trigger: 'blur'
         }],
         disc: [],
      },
      tableData: [],
      // 选择父级弹框props
      checkParentDialogVisible: false,

      // 选择自定义属性信息
      ourDialogVisible: false,

      // 底部多选数组
      multipleSelection: [],
    }
  },
  mounted(){
      this.theType = Number(this.$route.query.type)
      this.infoId = this.$route.query.id
      //如果不是新增
      if(this.theType != 0){
         this.getInitInfo()
      }else{
         this.initTable()
      }
  },
  methods:{
     // 初始加载表格数据
      initTable(){
         defaultProperties({ attrName: ""})
            .then(res=>{
               console.log(res)
               if(JSON.stringify(res.result)=="{}"){
                  this.tableData = []
               }else{
                  this.tableData = res.result.public
               }
            })
            .catch(err=>err)
      },
      // 根据id获取详情
      getInitInfo(){
         infoResource({id: this.infoId})
            .then(res=>{
               console.log(res)
               if(res.code == 200){
                  this.formData = {
                     fatherName: res.result.parentName,
                     fatherId: res.result.parentId,
                     code: res.result.order,
                     name: res.result.name,
                     disc: res.result.describes,
                     radio: res.result.inherit
                  }
                  this.tableData = res.result.attrList
                  this.sourceId = res.result.parentId
               }
            })
      },
      handleIsCheck(row){
         let isChecked = true
         if(row.groupName == '自定义属性'){
            isChecked = true
         }else{
            isChecked = false
         }
         return isChecked
      },
      // 选择父级----------------------------------------------------------
      checkParent(){
         this.checkParentDialogVisible = true
      },
      closeCheckParent(row){
         this.checkParentDialogVisible = row
      },
      // 父级选择组件
      sureCheckParent(row){
         // console.log(row.resCheck)
         this.checkParentDialogVisible = row.flag
         this.formData.fatherName = row.resCheck.name
         this.formData.fatherId = row.resCheck.id
      },
      checkHome(){
         this.formData.fatherName = '根目录'
         this.formData.fatherId = 0
      },

      // 选择自定义属性信息---------------------------------------------
      secOur(){
         this.ourDialogVisible = true
      },
      closeOur(row){
         this.ourDialogVisible = row
      },
      sureOur(row){
         // console.log(row.resCheck)
         this.tableData = this.tableData.concat(row.resCheck)
         this.ourDialogVisible = row.flag
      },
      // 底部多选删除按钮
      handleSelectionChange(val){
         this.multipleSelection = val
      },
      ourDel(){
         if(this.multipleSelection.length === 0){
            this.$message.error('请选择自定属性')
            return
         }
         for(var i = 0; i < this.tableData.length; i++){
             for(var k = 0; k < this.multipleSelection.length; k++){
               if(this.tableData[i].id == this.multipleSelection[k].id){
                  this.tableData.splice(i, 1)
               }
            }
         }

      },


      submitForm() {
         this.$refs['elForm'].validate(valid => {
            if (!valid)return
            if(this.tableData.length == 0){
               this.$message.error('请选择属性信息')
               return
            }
            // TODO 提交表单
            this.tableData.forEach(item=>{
               item.resourceAttrId = item.id
            })
            let fetchObj = {
               parentId: this.formData.fatherId,
               name: this.formData.name,
               order: this.formData.code,
               describes: this.formData.disc,
               inherit: this.formData.radio,
               classLevel: this.formData.fatherId == 0? '1':'2',
               builtIn: '1',
               typeAttrs: this.tableData,
               parentName: this.formData.fatherName
            }
            if(this.theType == 0){
               addResource(fetchObj)
                  .then(res=>{
                     // console.log(res)
                     if(res.code == 200){
                        this.$message.success('新增成功')
                        this.$router.push('/resources/type')
                     }else{
                        this.$message.error('新增失败')
                     }
                  }).catch(err=>{
                     console.log(err)
                  })
            }else{
               fetchObj.id = this.infoId
               editResource(fetchObj)
                  .then(res=>{
                     // console.log(res)
                     if(res.code == 200){
                        this.$message.success('修改成功')
                        this.$router.push('/resources/type')
                     }else{
                        this.$message.error('修改失败')
                     }
                  }).catch(err=>{
                     console.log(err)
                  })
            }
            

         })
      },
  },
}
</script>
<style scoped>
.resourceTitle {
   padding: 30px 0 10px;
   font-size: 18px;
   font-weight: 700;
}
.reLine {
   width: 100%;
   padding: 1px 0 0;
   background: #ccc;
}
.formContainer {
   display: flex;
   flex-wrap: wrap;
   position: relative;
}
.formContainer .el-form-item {
   width: 50%;
   margin: 20px 0;
}
.formContainer .extendClass {
   position: absolute;
   left: 0;
   bottom: 0;
}
.propTips {
   display: inline-block;
   font-weight: bold;
   width: 20px;
   height: 20px;
   line-height: 18px;
   text-align: center;
   border: 1px solid #000;
   border-radius: 50%;
   margin-left: 20px;
   cursor: pointer;
}
</style>