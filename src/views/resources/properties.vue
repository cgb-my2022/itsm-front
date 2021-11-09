<template>
   <a-card :bordered="false">
      <div>
         <el-button type="primary" @click="handleAdd">增加</el-button>
         <el-button type="primary" @click="delList">删除</el-button>
         <el-input 
            class="searchInput" 
            placeholder="请输入属性名称"
            suffix-icon="el-icon-search"
            v-model="searchValue"
            @keyup.enter.native="handleSearch"
            ></el-input>
      </div>
      <!-- 公共属性 -->
      <div>
         <div class="resourceTitle">公共属性</div>
         <div class="reLine"></div>
         <el-table
            :data="tableDataDefault.slice((searchPage.page-1)*searchPage.size,searchPage.page*searchPage.size)"
            border
            @selection-change="handleSelectionChange"
            style="width: 100%; margin-top: 30px">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="name" label="属性名称" width="100"></el-table-column>
            <el-table-column prop="date" label="英文名称" width="100"></el-table-column>
            <el-table-column prop="date" label="数据类型" width="100"></el-table-column>
            <el-table-column prop="date" label="可选值" ></el-table-column>
            <el-table-column prop="date" label="最大长度" ></el-table-column>
            <el-table-column prop="date" label="描述" ></el-table-column>
            <el-table-column label="操作" width="300">
               <template slot-scope="scope">
                  <el-button type="primary" size="mini" @click="relation(scope.row)">关联资源类型</el-button>
                  <el-button type="primary" size="mini" @click="Edit(scope.row)">修改</el-button>
                  <el-button type="primary" size="mini" @click="del(scope.row)">删除</el-button>
               </template>
            </el-table-column>
         </el-table>
         <el-pagination
            style="margin-top: 10px;float: right"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
            :current-page="searchPage.page"
            :page-size="searchPage.size"
            :page-sizes="[10, 20, 30]"
            layout="total, prev, pager, next, sizes, jumper"
            :total="searchPage.total">
         </el-pagination>
      </div>
      <br><br>
      <!-- 自定义属性 -->
      <div>
         <div class="resourceTitle">自定义属性</div>
         <div class="reLine"></div>
         <el-table
            :data="tableDataSelf.slice((searchPageSelf.page-1)*searchPageSelf.size,searchPageSelf.page*searchPageSelf.size)"
            border
            @selection-change="handleSelectionChangeSelf"
            style="width: 100%; margin-top: 30px">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="name" label="属性名称" width="100"></el-table-column>
            <el-table-column prop="date" label="英文名称" width="100"></el-table-column>
            <el-table-column prop="date" label="数据类型" width="100"></el-table-column>
            <el-table-column prop="date" label="可选值" ></el-table-column>
            <el-table-column prop="date" label="最大长度" ></el-table-column>
            <el-table-column prop="date" label="描述" ></el-table-column>
            <el-table-column label="操作" width="300">
               <template slot-scope="scope">
                  <el-button type="primary" size="mini" @click="relation(scope.row)">关联资源类型</el-button>
                  <el-button type="primary" size="mini" @click="Edit(scope.row)">修改</el-button>
                  <el-button type="primary" size="mini" @click="del(scope.row)">删除</el-button>
               </template>
            </el-table-column>
         </el-table>
         <el-pagination
            style="margin-top: 10px; float: right"
            @current-change="handleCurrentChangeSelf"
            @size-change="handleSizeChangeSelf"
            :current-page="searchPageSelf.page"
            :page-size="searchPageSelf.size"
            :page-sizes="[10, 20, 30]"
            layout="total, prev, pager, next,sizes, jumper"
            :total="searchPageSelf.total">
         </el-pagination>
      </div>
      <!-- 关联资源类型dialog -->
      <el-dialog
         title="使用该属性的资源类型"
         :visible.sync="relationDialog"
         width="50%"
         >
         <el-table
            :data="tableRelation"
            border
            style="width: 100%; margin-top: 30px">
            <el-table-column prop="name" label="资源类型名称"></el-table-column>
            <el-table-column prop="date" label="描述"></el-table-column>
            <el-table-column prop="date" label="用户自定义" ></el-table-column>
         </el-table>
         <div slot="footer" class="dialog-footer" style="text-align: center">
            <el-button @click="relationDialog = false">返 回</el-button>
         </div>
      </el-dialog>
      <!-- 删除 -->
      <el-dialog
         title="删除"
         :visible.sync="delDialog"
         width="30%"
         >
         <div style="text-align:center">是否确认执行删除操作？本操作不可撤销</div>
         <div slot="footer" class="dialog-footer" style="text-align: center">
            <el-button @click="delDialog = false">取 消</el-button>
            <el-button @click="delSure" type="primary">确 定</el-button>
         </div>
      </el-dialog>
      <!-- 新增、编辑 -->
      <el-dialog
         :title="isAdd==1?'新增属性': '修改属性'"
         :visible.sync="addEditDialog"
         width="50%"
         :before-close="resetForm"
         >
         <el-form ref="elForm" :model="formData" :rules="rules" size="medium" label-width="100px">
            <el-form-item label="所属分组" prop="group">
               <el-select v-model="formData.group" placeholder="请选择所属分组" clearable :style="{width: '80%'}">
                  <el-option v-for="(item, index) in groupOptions" :key="index" :label="item.label" :value="item.value"
                  :disabled="item.disabled"></el-option>
               </el-select>
            </el-form-item>
            <el-form-item label="属性名称" prop="name">
               <el-input v-model="formData.name" placeholder="请输入属性名称" :maxlength="64" show-word-limit clearable
                  :style="{width: '80%'}"></el-input>
            </el-form-item>
            <el-form-item label="英文名称" prop="ENAME">
               <el-input v-model="formData.ENAME" :disabled="isAdd == 2" placeholder="请输入英文名称" :maxlength="64" show-word-limit clearable
                  :style="{width: '80%'}"></el-input>
               <span class="propTips" title="属性的唯一标识，用于跟监控数据、服务管理等进行资源匹配。">?</span>
            </el-form-item>
            <el-form-item label="属性类型" prop="type">
               <el-select v-model="formData.type" placeholder="请选择属性类型" clearable :style="{width: '80%'}" @change="handleTypeChange">
                  <el-option v-for="(item, index) in typeOptions" :key="index" :label="item.label" :value="item.value"
                  :disabled="item.disabled"></el-option>
               </el-select>
            </el-form-item>
            <el-form-item :label="activeTitle">
               <!-- 文本 -->
               <textType v-if="formData.type == 1" :getData="this.activeData.textValue" @sonText="getText"></textType>
               <!-- 文本区域 -->
               <textAreaType v-if="formData.type == 2" :getData="this.activeData.textAreaValue" @sonTextArea="getTextArea"></textAreaType>
               <!-- 下拉文本 -->
               <selectMode v-if="formData.type == 3" :getData="this.activeData.textSecModeValue" @sonSecMode="getSecMode"></selectMode>
               <!-- 树形下拉文本 -->
               <el-button type="primary" v-if="formData.type == 4" @click="openTreeDialog">编辑</el-button>
               <!-- 小数 -->
               <floatType v-if="formData.type == 5" :getData="this.activeData.floatValue" @sonFloat="getFloat"></floatType>
                <!-- 整数 -->
               <intType v-if="formData.type == 6" :getData="this.activeData.intValue" @sonInt="getInt"></intType>
               <!-- 密文 -->
               <secretType v-if="formData.type == 7" :getData="this.activeData.secretValue" @sonSecret="getSecret"></secretType>
               <!-- MAC -->
               <MACType v-if="formData.type == 8" :getData="this.activeData.MACValue" @sonMAC="getMAC"></MACType>
               <!-- IP -->
               <ipType v-if="formData.type == 9" :getData="this.activeData.ipValue" @sonIP="getIp"></ipType>
               <!-- url -->
               <urlType v-if="formData.type == 10" :getData="this.activeData.urlValue" @sonUrl="getUrl"></urlType>
               <!-- 日期格式 -->
               <dateTime v-if="formData.type == 11" :getData="this.activeData.dateValue" @sonDate="getDate"></dateTime>
               <!-- 附件 -->
               <fileType v-if="formData.type == 12" :getData="this.activeData.fileValue" @sonFile="getFile"></fileType>
            </el-form-item>
            <el-form-item label="描述" prop="disc">
               <el-input v-model="formData.disc" type="textarea" placeholder="请输入描述" :autosize="{minRows: 4}"
                  :style="{width: '80%'}"></el-input>
            </el-form-item>
         </el-form>
         <div slot="footer" class="dialog-footer" style="text-align: center">
            <el-button @click="resetForm">取 消</el-button>
            <el-button @click="submitForm" type="primary">确 定</el-button>
         </div>
      </el-dialog>
      <!-- 树形dialog -->
      <treeType
         v-if="isShowTree"
         :getData="this.activeData.treeValue" 
         :treeDialogVisible="treeDialogVisible" 
         @treeCancleClose="treeCancleClose"
         @treeSureClose="treeSureClose"
      ></treeType>
   </a-card>
</template>

<script>
import textType from './propertiesComp/textType.vue'
import textAreaType from './propertiesComp/textAreaType.vue'
import selectMode from './propertiesComp/selectMode.vue'
import treeType from './propertiesComp/treeType.vue'
import intType from './propertiesComp/intType.vue'
import floatType from './propertiesComp/floatType.vue'
import secretType from './propertiesComp/secretType.vue'
import MACType from './propertiesComp/MACType.vue'
import ipType from './propertiesComp/ipType.vue'
import urlType from './propertiesComp/urlType.vue'
import dateTime from './propertiesComp/dateTime.vue'
import fileType from './propertiesComp/fileType.vue'
export default {
   
  components:{
     textType,
     textAreaType,
     selectMode,
     treeType,
     intType,
     floatType,
     secretType,
     MACType,
     ipType,
     urlType,
     dateTime,
     fileType
   },
  props:{},
  data(){
    return {
      searchValue: "",
      // 新增编辑弹框
      isAdd: 1,
      addEditDialog: false,

      tableDataDefault: [{
         date: '2016-05-02',
         name: '王小虎'
      },{
         date: '2016-05-02',
         name: '王小虎33'
      }],
      multipleSelectionDefault: [], //多选框
      searchPage: {
         size: 10,
         page: 1,
         total: 2
      },

      // 自定义数据部分---------------------------------------
      tableDataSelf: [{
         date: '2016-05-02',
         name: '王小虎333'
      }],
      multipleSelectionSelf: [], //多选框自定义
      searchPageSelf: {
         size: 10,
         page: 1,
         total: 1
      },
      // 资源关联
      relationDialog: false,
      tableRelation: [
         {
            date: '2016-05-02',
            name: '王小虎33'
         }
      ],
      // 删除
      delDialog: false,

      // 新增/编辑dialog数据
      formData: {
        group: undefined,
        name: undefined,
        ENAME: undefined,
        type: undefined,
        disc: undefined,
      },
      rules: {
        group: [{
          required: true,
          message: '请选择所属分组',
          trigger: 'change'
        }],
        name: [{
          required: true,
          message: '请输入属性名称',
          trigger: 'blur'
        }],
        ENAME: [{
          required: true,
          message: '请输入英文名称',
          trigger: 'blur'
        }],
        type: [{
          required: true,
          message: '请选择属性类型',
          trigger: 'change'
        }],
        disc: [],
      },
      groupOptions: [{
         "label": "公共属性",
         "value": 1
         }, {
         "label": "自定义属性",
         "value": 2
      }],
      typeOptions: [{
         "label": "文本",
         "value": 1
         }, {
         "label": "文本区域",
         "value": 2
         }, {
         "label": "下拉文本",
         "value": 3
         },{
         "label": "树形下拉文本",
         "value": 4
         }, {
         "label": "小数",
         "value": 5
         }, {
         "label": "整数",
         "value": 6
         },{
         "label": "密文",
         "value": 7
         },{
         "label": "MAC地址",
         "value": 8
         }, {
         "label": "IP地址",
         "value": 9
         },{
         "label": "URL",
         "value": 10
         }, {
         "label": "日期/时间",
         "value": 11
         },{
         "label": "附件",
         "value": 12
         }
      ],

      // 动态行标题
      activeTitle: "",
      // 动态数据
      activeData:{
         textValue: "", //文本
         textAreaValue: "", //文本区域
         textSecModeValue:"", //下拉文本
         treeValue: null, //树形
         intValue: "",// 整数
         floatValue:"",//小数
         secretValue:"", //密文
         MACValue:"",
         ipValue: "",
         urlValue: "",
         dateValue: "",
         fileValue: ""
      },
      treeDialogVisible: false, //树形dialog
      isShowTree: false
      
    }
  },
  mounted(){},
  methods:{
      handleSearch(){
         console.log(this.searchValue)
      },
      // 新增按钮
      handleAdd(){
         this.isAdd = 1
         for( var k in this.activeData ){
            this.activeData[k] = ""
         }
         this.formData.type = null
         this.activeTitle = ""
         this.addEditDialog = true
      },
      // 多选
      handleSelectionChange(val){
         this.multipleSelectionDefault = val
      },
      // 编辑
      Edit(row){
         this.isAdd = 2
         this.addEditDialog = true
         // 后台返回对应类型id
         this.formData.type = 4
         this.activeData.treeValue = 'file文件'
      },
      // 系统分页
      handleCurrentChange(val) {
         this.searchPage.page = val
      },
      handleSizeChange(val){
         this.searchPage.size = val
      },

      // 自定义操作部分-----------------------------------

      // 自定义分页
      handleCurrentChangeSelf(val){
         this.searchPageSelf.page = val
      },
      handleSizeChangeSelf(val){
         this.searchPageSelf.size = val
      },
      // 多选
      handleSelectionChangeSelf(val){
         this.multipleSelectionSelf = val
      },
      // 关联资源类型
      relation(row){
         this.relationDialog = true
      },
      // 删除
      del(row){
         this.delDialog = true
      },
      // 删除确认按钮
      delSure(){
         this.delDialog = false
      },
      // 批量删除
      delList(){
         this.delDialog = true
      },

      // 新增编辑确认按钮
      submitForm() {
         console.log(this.activeData)
         this.$refs['elForm'].validate(valid => {
         if (!valid) return
         // TODO 提交表单
         let regEn = /^[a-zA-Z]$/
         if(!regEn.test(this.formData.ENAME)){
            this.$message.error('请输入正确的英文名称')
            return
         }
         if(this.formData.type == 3){
            if(this.activeData.textSecModeValue.split(',').length > 30){
               this.$message.error('可选值最多不超过30个')
            }
         }
         if(this.formData.type == 5){
            let reg = /^-?([1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0)$/;
            if(!reg.test(Number(this.activeData.floatValue))){
               this.$message.error('只能输入小数')
               return
            }
         }
         if(this.formData.type == 6){
            let reg = /^[1-9]\d*$/;
            if(!reg.test(Number(this.activeData.intValue))){
               this.$message.error('只能输入整数')
               return
            }
         }
         if(this.formData.type == 9){
            let reg = /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/;
            if(!reg.test(Number(this.activeData.ipValue))){
               this.$message.error('请输入正确的ip地址')
               return
            }
         }
         if(this.formData.type == 10){
            let reg = /(^(http|https):\/\/([\w\-]+\.)+[\w\-]+(\/[\w\u4e00-\u9fa5\-\.\/?\@\%\!\&=\+\~\:\#\;\,]*)?)/;
            if(!reg.test(Number(this.activeData.urlValue))){
               this.$message.error('请输入正确的url地址')
               return
            }
         }
         if(this.formData.type == 8){
            let reg = /([A-Fa-f0-9]{2}-){5}[A-Fa-f0-9]{2}/;
            if(!reg.test(Number(this.activeData.MACValue))){
               this.$message.error('请输入正确的MAC地址')
               return
            }
         }
         this.addEditDialog = false
            
         })
      },
      resetForm() {
         this.$refs['elForm'].resetFields()
         this.activeTitle = ""
         this.formData.type = null
         this.addEditDialog = false
      },

      // 组件数据传值------------------------------
      // 类型选择
      handleTypeChange(){
         switch(this.formData.type){
            case 1:
               // 文本
               this.activeTitle = "最大长度"
               break;
            case 2:
               // 文本区域
               this.activeTitle = "最大长度"
               break;
            case 3:
               // 下拉文本
               this.activeTitle = "可选值"
               break;
            case 4:
               // 树形下拉文本
               this.activeTitle = ""
               break;
            case 5:
               // 整数
               this.activeTitle = "最大长度"
               break;
            case 6:
               // 小数
               this.activeTitle = "最大长度"
               break;
            case 7:
               // 密文
               this.activeTitle = "最大长度"
               break;
            case 8:
               // MAC
               this.activeTitle = "最大长度"
               break;
            case 9:
               // ip
               this.activeTitle = "最大长度"
               break;
            case 10:
               // url
               this.activeTitle = "最大长度"
               break;
            case 11:
               // 日期
               this.activeTitle = "时间格式"
               break;
            case 12:
               // 附件
               this.activeTitle = "按钮名称"
               break;
            default:
               this.activeTitle = ""
         }
      },
      // 打开tree的dialog
      openTreeDialog(){
         this.treeDialogVisible = true
         this.isShowTree = true
      },
      treeCancleClose(val){
         this.treeDialogVisible = val
      },
      // 树形结构数据
      treeSureClose(val){
         this.treeDialogVisible = val.flag
         this.activeData.treeValue = val.treeDatas
      },
      // 文本
      getText(val){
         this.activeData.textValue = val
      },
      // 文本区域
      getTextArea(val){
         this.activeData.textAreaValue = val
      },
      // 下拉文本
      getSecMode(val){
         this.activeData.textSecModeValue = val
      },
      // 整数
      getInt(val){
         this.activeData.intValue = val
      },
      // 小数
      getFloat(val){
         this.activeData.floatValue = val
      },
      // 密文
      getSecret(val){
         this.activeData.secretValue = val
      },
      //MAC 
      getMAC(val){
         this.activeData.MACValue = val
      },
      // ip
      getIp(val){
         this.activeData.ipValue = val
      },
      // url
      getUrl(val){
         this.activeData.urlValue = val
      },
      getDate(val){
         this.activeData.dateValue = val
      },
      getFile(val){
         this.activeData.fileValue = val
      }
         
  },
}
</script>
<style scoped>
.searchInput {
   width: 200px;
   float: right;
}
.resourceTitle {
   padding: 30px 0 10px;
   font-size: 20px;
   font-weight: 700;
}
.reLine {
   width: 100%;
   padding: 1px 0 0;
   background: #ccc;
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