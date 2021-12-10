<template>
   <a-card :bordered="false">
      <div>
         <el-button type="primary" @click="handleAdd">增加</el-button>
         <el-button type="primary" @click="delList(1)">删除</el-button>
         <div style="float: right;">
            <el-input 
            class="searchInput" 
            placeholder="请输入属性名称"
            suffix-icon="el-icon-search"
            v-model="searchValue"
            @keyup.enter.native="handleSearch"
            ></el-input>
            <el-button type="primary" @click="handleSearch">搜 索</el-button>
         </div>
         
      </div>
      <!-- 公共属性 -->
      <div class="toolTipsContainer"> 
         <div class="resourceTitle">公共属性</div>
         <div class="reLine"></div>
         <el-table
            :data="tableDataDefault.slice((searchPage.page-1)*searchPage.size,searchPage.page*searchPage.size)"
            border
            style="width: 100%; margin-top: 30px">
            <!-- <el-table-column type="selection" width="55"></el-table-column> -->
            <el-table-column prop="attrName" label="属性名称" width="100"></el-table-column>
            <el-table-column prop="enName" label="英文名称" width="100"></el-table-column>
            <el-table-column label="数据类型" width="100">
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
            <el-table-column prop="optionalValue" label="可选值" ></el-table-column>
            <el-table-column prop="maxLength" label="最大长度" ></el-table-column>
            <el-table-column prop="describes" label="描述" width="200" show-overflow-tooltip></el-table-column>
            <el-table-column label="操作" width="300">
               <template slot-scope="scope">
                  <el-button type="primary" size="mini" @click="relation(scope.row)">关联资源类型</el-button>
                  <el-button type="primary" size="mini" @click="Edit(scope.row)">修改</el-button>
                  <el-button type="danger" size="mini" @click="del(2, scope.row)">删除</el-button>
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
         <!-- <el-table
            class="toolTipsContainer"
            :data="tableDataSelf.slice((searchPageSelf.page-1)*searchPageSelf.size,searchPageSelf.page*searchPageSelf.size)"
            border
            @selection-change="handleSelectionChangeSelf"
            style="width: 100%; margin-top: 30px">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="attrName" label="属性名称" width="100"></el-table-column>
            <el-table-column prop="enName" label="英文名称" width="100"></el-table-column>
            <el-table-column label="数据类型" width="100">
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
            <el-table-column prop="optionalValue" label="可选值" ></el-table-column>
            <el-table-column prop="maxLength" label="最大长度" ></el-table-column>
            <el-table-column prop="describes" label="描述" width="200" show-overflow-tooltip	></el-table-column>
            <el-table-column label="操作" width="300">
               <template slot-scope="scope">
                  <el-button type="primary" size="mini" @click="relation(scope.row)">关联资源类型</el-button>
                  <el-button type="primary" size="mini" @click="Edit(scope.row)">修改</el-button>
                  <el-button type="danger" size="mini" @click="del(2, scope.row)">删除</el-button>
               </template>
            </el-table-column>
         </el-table> -->
         <vxe-table
            border
            ref="xTable1"
            :data="tableDataSelf.slice((searchPageSelf.page-1)*searchPageSelf.size,searchPageSelf.page*searchPageSelf.size)"
            >
            <vxe-column type="checkbox" width="60"></vxe-column>
            <vxe-column field="attrName" title="属性名称"  width="100"></vxe-column>
            <vxe-column field="enName" title="英文名称"  width="100"></vxe-column>
            <vxe-column title="数据类型">
               <template #default="{ row }">
                  <div class="ourClass">
                     {{ row.attrType == 1? "文本"
                     :row.attrType == 2? "文本区域"
                     :row.attrType == 3? "下拉文本"
                     :row.attrType == 4? "树形下拉文本"
                     :row.attrType == 5? "小数"
                     :row.attrType == 6? "整数"
                     :row.attrType == 7? "密文"
                     :row.attrType == 8? "MAC"
                     :row.attrType == 9? "IP"
                     :row.attrType == 10? "url"
                     :row.attrType == 11? "日期格式"
                     :row.attrType == 12?"附件"
                     : ""
                  }}
                  </div>
               </template>
            </vxe-column>
            <vxe-column field="optionalValue" title="可选值"></vxe-column>
            <vxe-column field="maxLength" title="最大长度"></vxe-column>
            <vxe-column field="describes" title="描述" show-overflow width="200"></vxe-column>
            <vxe-column title="数据类型" width="300">
               <template #default="{ row }">
                  <el-button type="primary" size="mini" @click="relation(row)">关联资源类型</el-button>
                  <el-button type="primary" size="mini" @click="Edit(row)">修改</el-button>
                  <el-button type="danger" size="mini" @click="del(2, row)">删除</el-button>
               </template>
            </vxe-column>
         </vxe-table>
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
            <el-table-column prop="describes" label="描述"></el-table-column>
            <el-table-column label="用户自定义" >
               <template slot-scope="scope">
                  {{ scope.row.builtIn == 0? '否': '是' }}
               </template>
            </el-table-column>
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
         v-if="addEditDialog"
         width="50%"
         :before-close="resetForm"
         >
         <el-form ref="elForm" :model="formData" :rules="rules" size="medium" label-width="100px">
            <el-form-item label="所属分组" prop="group">
               <el-select v-model="formData.group" :disabled="isAdd == 2" placeholder="请选择所属分组" clearable :style="{width: '80%'}">
                  <el-option v-for="(item, index) in groupOptions" :key="index" :label="item.name" :value="`${item.id},${item.name}`"
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
               <el-select v-model="typeGroup" :disabled="isAdd == 2" placeholder="请选择属性类型" clearable :style="{width: '80%'}" @change="handleTypeChange">
                  <el-option v-for="(item, index) in typeOptions" :key="index" :label="item.label" :value="item.value"
                  :disabled="item.disabled"></el-option>
               </el-select>
            </el-form-item>
            <el-form-item :label="activeTitle">
               <!-- 文本 -->
               <textType v-if="typeGroup == 1" :getData="this.activeData.textValue" @sonText="getText"></textType>
               <!-- 文本区域 -->
               <textAreaType v-if="typeGroup == 2" :getData="this.activeData.textAreaValue" @sonTextArea="getTextArea"></textAreaType>
               <!-- 下拉文本 -->
               <selectMode v-if="typeGroup == 3" :getData="this.activeData.textSecModeValue" @sonSecMode="getSecMode"></selectMode>
               <!-- 树形下拉文本 -->
               <el-button type="primary" v-if="typeGroup == 4" @click="openTreeDialog">编辑</el-button>
               <!-- 小数 -->
               <floatType v-if="typeGroup == 5" :getData="this.activeData.floatValue" @sonFloat="getFloat"></floatType>
                <!-- 整数 -->
               <intType v-if="typeGroup == 6" :getData="this.activeData.intValue" @sonInt="getInt"></intType>
               <!-- 密文 -->
               <secretType v-if="typeGroup == 7" :getData="this.activeData.secretValue" @sonSecret="getSecret"></secretType>
               <!-- MAC -->
               <MACType v-if="typeGroup == 8" :getData="this.activeData.MACValue" @sonMAC="getMAC"></MACType>
               <!-- IP -->
               <ipType v-if="typeGroup == 9" :getData="this.activeData.ipValue" @sonIP="getIp"></ipType>
               <!-- url -->
               <urlType v-if="typeGroup == 10" :getData="this.activeData.urlValue" @sonUrl="getUrl"></urlType>
               <!-- 日期格式 -->
               <dateTime v-if="typeGroup == 11" :getData="this.activeData.dateValue" @sonDate="getDate"></dateTime>
               <!-- 附件 -->
               <fileType v-if="typeGroup == 12" :getData="this.activeData.fileValue" @sonFile="getFile"></fileType>
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
         v-if="treeDialogVisible"
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

import { mapGetters } from 'vuex'
import { getPropertiesGroup, defaultProperties, addProperties, delProperties, delModeProperties, editProperties, connecetProperties } from '@/api/properties'
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

      tableDataDefault: [],
      // multipleSelectionDefault: [], //多选框
      searchPage: {
         size: 10,
         page: 1,
         total: 0
      },

      // 自定义数据部分---------------------------------------
      tableDataSelf: [],
      multipleSelectionSelf: [], //多选框自定义
      searchPageSelf: {
         size: 10,
         page: 1,
         total: 0
      },
      // 资源关联
      relationDialog: false,
      tableRelation: [],
      // 删除
      delDialog: false,
      delId: null, //单个删除的id
      delIndex: null,
      modeDel: null,

      editId: null,
      // 新增/编辑dialog数据
      formData: {
        group: undefined,
        name: undefined,
        ENAME: undefined,
        //type: undefined,
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
         //   type: [{
         //     required: true,
         //     message: '请选择属性类型',
         //     trigger: 'change'
         //   }],
        disc: [],
      },
      typeGroup: null,
      groupOptions: [],
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
  mounted(){
     this.initTable()
     this.initGroup()
  },
  methods:{
      ...mapGetters(['userInfo']),
      // 初始加载表格数据
      initTable(){
         defaultProperties({ attrName: this.searchValue })
            .then(res=>{
               // console.log(res)
               if(JSON.stringify(res.result)=="{}"){
                  this.tableDataDefault = []
                  this.searchPage.total = 0
                  this.tableDataSelf = []
                  this.searchPageSelf.total = 0
               }else{
                  this.tableDataDefault = res.result.public
                  this.searchPage.total = res.result.public.length
                  this.tableDataSelf = res.result.customize
                  this.searchPageSelf.total = res.result.customize.length
               }
            })
            .catch(err=>err)
      },
      // 加载下拉框分组类型
      initGroup(){
         getPropertiesGroup()
            .then(res=>{
               if(res.code == 200){
                  this.groupOptions = res.result
               }
            })
            .catch(err=>err)
      },
      handleSearch(){
         // console.log(this.searchValue)
         this.initTable()
      },
      // 新增按钮
      handleAdd(){
         this.isAdd = 1
         this.formData = {
            group: null,
            name: null,
            ENAME: null,
            disc: null,
         }
         this.typeGroup = null
         for(var k in this.activeData){
            this.activeData[k] = ""
         }
         // console.log(this.formData)
         this.activeTitle = ""
         this.addEditDialog = true
         this.$nextTick(()=>{
            this.$refs['elForm'].resetFields()
         })
      },
      // 编辑
      Edit(row){
         this.editId = row.id
         // console.log(row)
         this.isAdd = 2
         this.addEditDialog = true
         // 后台返回对应类型id
         this.typeGroup = Number(row.attrType)
         this.formData = {
            group: row.groupId +','+ row.groupName,
            name: row.attrName,
            ENAME: row.enName,
            disc: row.describes
         }
         this.handleTypeChange()
         this.activeData = {
            textValue: row.attrType == 1? row.maxLength:"" ,//文本
            textAreaValue:  row.attrType == 2? row.maxLength:"" , //文本区域
            textSecModeValue: row.attrType == 3? row.optionalValue:"" , //下拉文本
            treeValue: row.attrType == 4? JSON.parse(row.optionalValue): null , //树形
            floatValue: row.attrType == 5? row.maxLength:"",// 小数
            intValue: row.attrType == 6? row.maxLength:"",//整数
            secretValue: row.attrType == 7? row.maxLength:"", //密文
            MACValue: row.attrType == 8? row.maxLength:"",
            ipValue: row.attrType == 9? row.maxLength:"",
            urlValue: row.attrType == 10? row.maxLength:"",
            dateValue: row.attrType == 11? row.dateType:"",
            fileValue: row.attrType == 12? row.buttonName:""
         }
         
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
         connecetProperties({id: row.id})
            .then(res=>{
               if(res.code == 200){
                  this.tableRelation = res.result
               }
            }).catch(err=>{ this.$message.error('获取关联资源失败') })
      },
      // 删除
      del(index, row){
         this.delDialog = true
         // console.log(row)
         this.delIndex = index
         this.delId = row.id
      },
      // 删除确认按钮
      delSure(){
         let ids = []
         if(this.delIndex == 1){
            for(var i = 0; i < this.modeDel.length; i++){
               ids.push(this.modeDel[i].id)
            }
            ids = ids.join(',')
         }

         let fetch = this.delIndex == 2? delProperties({id: this.delId}) : delModeProperties({ids})
            fetch.then(res =>{
               // console.log(res)
               if(res.code == 200){
                  this.$message.success('删除成功')
                  this.initTable()
               }else{
                  this.$message.success('删除失败')
               }
               this.delDialog = false
            }).catch(err=>{
               this.$message.error('删除失败')
               this.delDialog = false
            })
      },
      // 批量删除
      delList(index){
         let selectRecords = this.$refs.xTable1.getCheckboxRecords()
         if(selectRecords.length == 0){
            this.$message.error('请选择数据再进行批量删除')
            return
         }
         this.delIndex = index
         this.modeDel = selectRecords
         this.delDialog = true
      },

      // 新增编辑确认按钮
      submitForm() {
         // console.log(this.formData)
         // console.log(this.activeData)
         // console.log(this.userInfo())
         this.$refs['elForm'].validate(valid => {
            if (!valid) return
            // TODO 提交表单
            var re = new RegExp("^[a-zA-Z-_]+$");
            if(!re.test(this.formData.ENAME)){
               this.$message.error('请输入正确的英文名称')
               return
            }
            if(!this.typeGroup){
               this.$message.error('请选择属性类型')
               return
            }
            if(this.typeGroup == 3){
               let secLength = this.activeData.textSecModeValue.split(',')
               if(secLength.length == 0){
                  this.$message.error('请输入可选值')
                  return
               }
               if( secLength.length > 30){
                  this.$message.error('可选值最多不超过30个')
                  return
               }
               for(var i = 0; i < secLength.length; i++){
                  if(!secLength[i]){
                     this.$message.error('请输入可选值')
                     return
                  }
                  if(secLength[i].length > 50){
                     this.$message.error('单个可选值长度不超过50个字符')
                     return
                  }
               }
            }

            let fetchObj = {
               groupId: this.formData.group.split(',')[0], //分组id
               groupName: this.formData.group.split(',')[1], //分组名称
               attrName: this.formData.name, //属性名称
               enName: this.formData.ENAME, //英文名称
               attrType: this.typeGroup, //属性类型
               describes: this.formData.disc, //描述
               maxLength:"", // 最大长度
               optionalValue:"", //可选值、树形
               dateType:"",  //时间类型 1 年月日 2 年月日时分秒
               buttonName:"", //按钮名称
            }
            if(this.typeGroup == 3){
               // 文本下拉
               fetchObj.optionalValue = this.activeData.textSecModeValue
            }else if(this.typeGroup == 4){
               // 树形
               fetchObj.optionalValue = JSON.stringify(this.activeData.treeValue)
            }else if(this.typeGroup == 11){
               // 日期
               fetchObj.dateType = this.activeData.dateValue
            }else if(this.typeGroup == 12){
               // 文件上传
               if(!this.activeData.fileValue){
                  this.$message.error('请输入按钮名称')
                  return
               }
               fetchObj.buttonName = this.activeData.fileValue
            }else{
               for(var k in this.activeData){
                  if(this.activeData[k]){
                     fetchObj.maxLength = this.activeData[k]
                  }
               }
               if(!fetchObj.maxLength){
                  this.$message.error('请输入最大长度')
                  return
               }
            }  

            if(this.isAdd == 1){
               addProperties(fetchObj).then(res=>{
                  // console.log(res)
                  if(res.code == 500){
                     this.$message.error(res.message)
                  }else{
                     this.$message.success('新增成功')
                  }
                  this.initTable()
                  this.addEditDialog = false
               }).catch(err=>{
                  this.$message.error('新增失败')
                  this.addEditDialog = false
               })
            }else {
               fetchObj.id = this.editId
               editProperties(fetchObj).then(res=>{
                  // console.log(res)
                  if(res.code == 500){
                     this.$message.error('修改失败')
                  }else{
                     this.$message.success('修改成功')
                  }
                  this.initTable()
                  this.addEditDialog = false
               }).catch(err=>{
                  this.$message.error('修改失败')
                  this.addEditDialog = false
               })
            }
            
            
         })
      },
      resetForm() {
         this.$refs['elForm'].resetFields()
         this.typeGroup = null
         this.activeTitle = ""
         // this.typeGroup = null
         this.addEditDialog = false
      },

      // 组件数据传值------------------------------
      // 类型选择
      handleTypeChange(){
         for(var k in this.activeData){
            this.activeData[k] = ""
         }
         switch(this.typeGroup){
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
      },
      treeCancleClose(val){
         this.treeDialogVisible = val.flag
         this.activeData.treeValue = val.treeDatas
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
   margin-right: 5px;
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
.ourClass{
   height: 40px;
   line-height: 15px;
}

</style>