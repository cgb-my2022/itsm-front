<template>
   <a-card :bordered="false">
     <div>
         <div class="resourceTitle">公共属性</div>
         <div class="reLine"></div>
         <div class="defalutBox">
            <div v-for="(item, index) in defalutData" :key="index" class="typeContainer">
               <div class="titleContianer" :title="item.attrName">{{ item.attrName }}</div>
               <div v-if="item.attrType == 1 && item.enName == 'use_user_name'" class="common">
                  <el-input style="width: 50%; margin-right: 10px" disabled v-model="item.values"></el-input>
                  <el-button type="primary" @click="checkUser(item, index)">选择</el-button>
               </div>
               <!-- 文本 -->
               <textType class="common" v-if="item.attrType == 1 && item.enName != 'use_user_name'" :propMaxLength="item.maxLength" :theIndex="index" @sonText="getText"></textType>
               <!-- 文本区域 -->
               <textAreaType v-if="item.attrType == 2" class="common" :propMaxLength="item.maxLength" :theIndex="index" @sonTextArea="getTextArea"></textAreaType>
               <!-- 下拉文本 -->
               <div class="common" v-if="item.attrType == 3">
                  <el-select v-model="item.values" placeholder="请选择">
                     <el-option
                        v-for="item in item.optionalValueList"
                        :key="item.key"
                        :label="item.value"
                        :value="item.key">
                     </el-option>
                  </el-select>
               </div>
               <!-- <selectMode v-if="item.type == 3" class="common" :getData="item.value" :theIndex="index" @sonSecMode="getSecMode"></selectMode> -->
               <!-- 树形下拉文本 -->
               <div class="common" v-if="item.attrType == 4">
                  <!-- <el-button type="primary" @click="openTreeDialog(item.optionalValue, index)">选择</el-button> -->
                  <el-select :value="item.values" :ref="`selectTree${index}`" placeholder="请选择">
                     <el-option
                        :label="item.values"
                        style="height: auto"
                        hidden
                        :value="item.values"/>
                        <el-tree
                           ref="tree"
                           :data="JSON.parse(item.optionalValue)"
                           :props="treeProps"
                           :node-key="treeProps.value"
                           @node-click="handleNodeClick(item, $event, index)"
                        ></el-tree>
                  </el-select>
               </div>
               <!-- 小数 -->
               <floatType v-if="item.attrType == 5" :isShowTip="isShowTip" class="common" :propMaxLength="item.maxLength" :theIndex="index" @sonFloat="getFloat"></floatType>
               <!-- 整数 -->
               <intType v-if="item.attrType == 6" class="common" :propMaxLength="item.maxLength" :theIndex="index" @sonInt="getInt"></intType>
               <!-- 密文 -->
               <secretType v-if="item.attrType == 7" :isSecret="isSecret"  class="common" :propMaxLength="item.maxLength"  :theIndex="index" @sonSecret="getSecret"></secretType>
               <!-- MAC -->
               <MACType v-if="item.attrType == 8" class="common" :propMaxLength="item.maxLength" :theIndex="index" @sonMAC="getMAC"></MACType>
               <!-- IP -->
               <ipType v-if="item.attrType == 9" class="common" :propMaxLength="item.maxLength" :theIndex="index" @sonIP="getIp"></ipType>
               <!-- url -->
               <urlType v-if="item.attrType == 10" class="common" :propMaxLength="item.maxLength"  :theIndex="index" @sonUrl="getUrl"></urlType>
               <!-- 日期格式 -->
               <div class="common" v-if="item.attrType == 11">
                  <el-date-picker
                     value-format="yyyy-MM-dd HH-mm-ss"
                     v-if="item.dateType == 2"
                     v-model="item.values"
                     type="datetime"
                     placeholder="选择日期时间">
                  </el-date-picker>
                  <el-date-picker
                     format="yyyy 年 MM 月 dd 日"
                     value-format="yyyy-MM-dd"
                     v-if="item.dateType == 1 || !item.dateType"
                     v-model="item.values"
                     type="date"
                     placeholder="选择日期">
                  </el-date-picker>
               </div>
               <!-- 附件 -->
               <div class="common" v-if="item.attrType == 12">
                  <!-- <el-upload
                     class="upload-demo"
                     :action="upUrl"
                     :headers="headers"
                     :on-remove="handleRemove.bind(null, {'index':index,'data':item})"
                     :limit="1"
                     :on-success="handleAvatarSuccess.bind(null, {'index':index,'data':item})"
                     >
                     <el-button type="primary">{{ item.attrName }}</el-button>
                  </el-upload> -->
                  <!-- <fileType v-if="item.type == 12" class="common" :getData="item.value" :theIndex="index" @sonFile="getFile"></fileType> -->
                  <a-upload
                     name="file"
                     :action="upUrl"
                     :headers="headers"
                     @change="info => handleAvatarSuccess(info, item)"
                  >
                     <a-button> <a-icon type="upload" />上 传</a-button>
                  </a-upload>
               
               </div>
            </div>
         </div>         
         <!-- 树形dialog -->
         <treeType
            v-if="treeDialogVisible"
            :getData="defalutTreeValue" 
            :treeDialogVisible="treeDialogVisible" 
            :theIndex="defalutTreeIndex"
            @treeCancleClose="treeCancleClose"
            @treeSureClose="treeSureClose"
         ></treeType>

         <userDialog 
            v-if="userDialogVisible" 
            :userDialogVisible="userDialogVisible"
            :theIndex="defaultUserIndex"
            @userCancle="userCancle"
            @userSure="userSure"
         ></userDialog>
     </div>
     <!-- 自定义部分 -->
     <div>
        <div class="resourceTitle">自定义属性</div>
         <div class="reLine"></div>
         <div class="defalutBox">
            <div v-for="(item, index) in ourData" :key="index" class="typeContainer">
               <div class="titleContianer" :title="item.attrName">{{ item.attrName }}</div>
               <!-- 文本 -->
               <textType class="common" v-if="item.attrType == 1" :propMaxLength="item.maxLength"  :theIndex="index" @sonText="ourgetText"></textType>
               <!-- 文本区域 -->
               <textAreaType v-if="item.attrType == 2" class="common" :propMaxLength="item.maxLength" :theIndex="index" @sonTextArea="ourgetTextArea"></textAreaType>
               <!-- 下拉文本 -->
               <div class="common" v-if="item.attrType == 3">
                  <el-select v-model="item.values" placeholder="请选择">
                     <el-option
                        v-for="item in item.optionalValueList"
                        :key="item.key"
                        :label="item.value"
                        :value="item.key">
                     </el-option>
                  </el-select>
               </div>
               <!-- <selectMode v-if="item.type == 3" class="common" :getData="item.value" :theIndex="index" @sonSecMode="getSecMode"></selectMode> -->
               <!-- 树形下拉文本 -->
               <div class="common" v-if="item.attrType == 4">
                  <!-- <el-button type="primary" @click="ouropenTreeDialog(item.optionalValue, index)">选择</el-button> -->
                  <el-select :value="item.values" :ref="`ourselectTree${index}`" placeholder="请选择">
                     <el-option
                        :label="item.values"
                        style="height: auto"
                        hidden
                        :value="item.values"/>
                        <el-tree
                           ref="tree"
                           :data="JSON.parse(item.optionalValue)"
                           :props="treeProps"
                           :node-key="treeProps.value"
                           @node-click="ourHandleNodeClick(item, $event, index)"
                        ></el-tree>
                  </el-select>
               </div>
               <!-- 小数 -->
               <floatType v-if="item.attrType == 5" :isShowTip="isShowTip" class="common" :propMaxLength="item.maxLength" :theIndex="index" @sonFloat="ourgetFloat"></floatType>
               <!-- 整数 -->
               <intType v-if="item.attrType == 6" class="common" :propMaxLength="item.maxLength" :theIndex="index" @sonInt="ourgetInt"></intType>
               <!-- 密文 -->
               <secretType v-if="item.attrType == 7" :isSecret="isSecret" class="common" :propMaxLength="item.maxLength" :theIndex="index" @sonSecret="ourgetSecret"></secretType>
               <!-- MAC -->
               <MACType v-if="item.attrType == 8" class="common" :propMaxLength="item.maxLength" :theIndex="index" @sonMAC="ourgetMAC"></MACType>
               <!-- IP -->
               <ipType v-if="item.attrType == 9" class="common" :propMaxLength="item.maxLength" :theIndex="index" @sonIP="ourgetIp"></ipType>
               <!-- url -->
               <urlType v-if="item.attrType == 10" class="common" :propMaxLength="item.maxLength" :theIndex="index" @sonUrl="ourgetUrl"></urlType>
               <!-- 日期格式 -->
               <div class="common" v-if="item.attrType == 11">
                  <el-date-picker
                     value-format="yyyy-MM-dd HH-mm-ss"
                     v-if="item.dateType == 2"
                     v-model="item.values"
                     type="datetime"
                     placeholder="选择日期时间">
                  </el-date-picker>
                  <el-date-picker
                     format="yyyy 年 MM 月 dd 日"
                     value-format="yyyy-MM-dd"
                     v-if="item.dateType == 1 || !item.dateType"
                     v-model="item.values"
                     type="date"
                     placeholder="选择日期">
                  </el-date-picker>
               </div>
               <!-- 附件 -->
               <div class="common" v-if="item.attrType == 12">
                  <!-- <el-upload
                     class="upload-demo"
                     :action="upUrl"
                     :headers="headers"
                     :on-remove="ourhandleRemove.bind(null, {'index':index,'data':item})"
                     :limit="1"
                     :on-success="ourhandleAvatarSuccess.bind(null, {'index':index,'data':item})"
                     >
                     <el-button type="primary">{{ item.attrName }}</el-button>
                  </el-upload> -->
                  <!-- <fileType v-if="item.type == 12" class="common" :getData="item.value" :theIndex="index" @sonFile="getFile"></fileType> -->
                  <a-upload
                     name="file"
                     :action="upUrl"
                     :headers="headers"
                     @change="value => ourhandleAvatarSuccess(value, item)"
                  >
                     <a-button> <a-icon type="upload" />上 传</a-button>
                  </a-upload>
               </div>
            </div>
         </div>         
         <!-- 树形dialog -->
         <treeType
            v-if="ourtreeDialogVisible"
            :getData="ourTreeValue" 
            :treeDialogVisible="ourtreeDialogVisible" 
            :theIndex="ourTreeIndex"
            @treeCancleClose="ourtreeCancleClose"
            @treeSureClose="ourtreeSureClose"
         ></treeType>
     </div>
     <div class="bottomSumbit">
        <el-button @click="cancleAddResource">取消</el-button>
        <el-button type="primary" @click="addSourceSure">确认</el-button>
     </div>
   </a-card>
</template>

<script>
import Vue from 'vue'
import { ACCESS_TOKEN } from "@/store/mutation-types"
import { getAddDetail, AddResource } from '@/api/conserResource'

import textType from './conserComp/textType.vue'
import textAreaType from './conserComp/textAreaType.vue'
import selectMode from './conserComp/selectMode.vue'
import treeType from './conserComp/treeType.vue'
import intType from './conserComp/intType.vue'
import floatType from './conserComp/floatType.vue'
import secretType from './conserComp/secretType.vue'
import MACType from './conserComp/MACType.vue'
import ipType from './conserComp/ipType.vue'
import urlType from './conserComp/urlType.vue'
import dateTime from './conserComp/dateTime.vue'
import fileType from './conserComp/fileType.vue'
import userDialog from './conserComp/userDialog.vue' 

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
      fileType,
      userDialog
  },
  props:{},
  data(){
    return {
       isSecret: false,
       isShowTip: true,
       treeProps:{
          value: 'id',
          label: 'label',
          children: 'children'
       },
      replaceFields: {
        children: 'children',
        title: 'label',
        key: 'id'
      },
      upUrl: window._CONFIG['domianURL'] + '/sys/common/upload',
      headers:{},
      resourceId: null,
      defalutData:[
         // { type: 1, name:'姓名', value: "" },
         // { type: 2, name:'文本区域1', value: "" },
         // { type: 3, name:'下拉文本11', value: "" },
         // { type: 3, name:'下拉文本22', value: "" },
         // { type: 4, 
         //   name:'树形', 
         //   value: [{
         //    id: 1,
         //    label: '一级 1',
         //    children: [{
         //       id: 4,
         //       label: '二级 1-1',
         //       children: [{
         //             id: 9,
         //             label: '三级 1-1-1'
         //          }, {
         //             id: 10,
         //             label: '三级 1-1-2'
         //          }]
         //       }]
         //    }]
         // },
         // { type: 11, name:'选择日期时间', dateType: 1,  value: "2021-11-08 02-01-01" },
         // { type: 12, name:'我的上传',  value: "" },
         // { type: 4, 
         //   name:'树形1111', 
         //   value: [{
         //    id: 1,
         //    label: '天马',
         //    children: [{
         //       id: 4,
         //       label: '冰河',
         //       children: [{
         //             id: 9,
         //             label: '舜'
         //          }, {
         //             id: 10,
         //             label: '大雨'
         //          }]
         //       }]
         //    }]
         // },
      ],
      defalutTreeValue: null,
      defalutTreeIndex: null,
      treeDialogVisible: false,

      // 下拉文本数据
      SecValue: "",
      SecOptions: [], 
      
      dateTimeValue: "",// 日期时间
      dateValue:"", //日期

      // 自定义属性
      ourData:[
         // { type: 1, name:'姓名', value: "" },
         // { type: 2, name:'文本区域1', value: "" },
         // { type: 3, name:'下拉文本11', value: "" },
         // { type: 3, name:'下拉文本22', value: "" },
         // { type: 4, 
         //   name:'树形', 
         //   value: [{
         //    id: 1,
         //    label: '自定义',
         //    children: [{
         //       id: 4,
         //       label: '自定义二级 1-1',
         //       children: [{
         //             id: 9,
         //             label: '自定义三级 1-1-1'
         //          }, {
         //             id: 10,
         //             label: '自定义三级 1-1-2'
         //          }]
         //       }]
         //    }]
         // },
         // { type: 11, name:'选择日期时间', dateType: 1,  value: "2021-11-08 02-01-01" },
         // { type: 12, name:'我的上传',  value: "" },
         // { type: 4, 
         //   name:'自定义树形1111', 
         //   value: [{
         //    id: 1,
         //    label: '自定义天马',
         //    children: [{
         //       id: 4,
         //       label: '自定义冰河',
         //       children: [{
         //             id: 9,
         //             label: '自定义舜'
         //          }, {
         //             id: 10,
         //             label: '自定义大雨'
         //          }]
         //       }]
         //    }]
         // },
      ],
      ourTreeValue: null,
      ourTreeIndex: null,
      ourtreeDialogVisible: false,

      ourSecOptions: [], 
      userDialogVisible: false,
      userID: null,
      defaultUserIndex: null

    }
  },
  mounted(){
      const token = Vue.ls.get(ACCESS_TOKEN);
      this.headers = {"X-Access-Token":token}

      let secID = sessionStorage.getItem('treeid')
      this.resourceId = sessionStorage.getItem('treeid')
      this.getType(secID)
  },
  methods:{
      getType(id){
         getAddDetail({id})
            .then(res=>{
               if(res.code == 200){

                  res.result.publicAttr.forEach(item=>{
                     item.values = ""
                  })
                  this.defalutData = res.result.publicAttr
                  res.result.customizeAttr? res.result.customizeAttr : []
                  res.result.customizeAttr.forEach(item=>{
                     item.values = ""
                  })
                  this.ourData = res.result.customizeAttr 
               }else{
                  this.$message.error('获取信息失败')
               }
            })
      },
      // 公共属性部分----------------------------------------------
      checkUser(item, index){
         this.defaultUserIndex = index
         this.userDialogVisible = true
      },
      userCancle(flag){
         this.userDialogVisible = flag
      },
      userSure(flag, row, index){
         this.userDialogVisible = flag
         this.defalutData[index].values = row.realname
         this.userID = row.id
      },
      handleAvatarSuccess(obj, res, file){
         // res.values = JSON.stringify(obj.fileList)
         if(obj.file.status == "done"){
            res.values = obj.file.response.message
         }
         res.fileList = JSON.stringify(obj.fileList)
      },
      // // 打开tree的dialog
         // openTreeDialog(row, index){
         //    // console.log(row)
         //    this.defalutTreeValue = row
         //    this.defalutTreeIndex = index
         //    this.treeDialogVisible = true
         // },
         // treeCancleClose(val, index){
         //    this.treeDialogVisible = val.flag
         //    this.defalutData[index].values =JSON.stringify(val.treeDatas)
         // },
         // // 树形结构数据
         // treeSureClose(val, index){
         //    this.treeDialogVisible = val.flag
         //    // this.defalutTreeValue = val.treeDatas
         //    this.defalutData[index].values = JSON.stringify(val.treeDatas)
      // },

      // 树形
      handleNodeClick(data, res, index){
         this.defalutData[index].values = res.label
         this.$refs[`selectTree${index}`][0].blur()
      },
      // 文本
      getText(val, index){
         this.defalutData[index].values = val
      },
      // 文本区域
      getTextArea(val, index){
         this.defalutData[index].values = val
      },
      // 整数
      getInt(val, index){
         this.defalutData[index].values = val
      },
      // 小数
      getFloat(val, index){
         this.defalutData[index].values = val
      },
      // 密文
      getSecret(val, index){
         this.defalutData[index].values = val
      },
      //MAC 
      getMAC(val, index){
         this.defalutData[index].values = val
      },
      // ip
      getIp(val, index){
         this.defalutData[index].values = val
      },
      // url
      getUrl(val, index){
         this.defalutData[index].values = val
      },



      // 自定义属性部分----------------------------------------------
      ourhandleAvatarSuccess(obj, res, file){
         // res.values = JSON.stringify(obj.fileList)
         if(obj.file.status == "done"){
            res.values = obj.file.response.message
         }
         res.fileList = JSON.stringify(obj.fileList)
      },
      // 打开tree的dialog
      // ouropenTreeDialog(row, index){
         //    this.ourTreeValue = row
         //    this.ourTreeIndex = index
         //    this.ourtreeDialogVisible = true
         // },
         // ourtreeCancleClose(val, index){
         //    this.ourtreeDialogVisible = val.flag
         //    this.ourData[index].values = JSON.stringify(val.treeDatas)
         // },
         // // 树形结构数据
         // ourtreeSureClose(val, index){
         //    this.ourtreeDialogVisible = val.flag
         //    console.log(val)
         //    this.ourData[index].values = JSON.stringify(val.treeDatas)
      // },

      ourHandleNodeClick(data, res, index){
         this.ourData[index].values = res.label
         this.$refs[`ourselectTree${index}`][0].blur()
      },

      // 文本
      ourgetText(val, index){
         this.ourData[index].values = val
      },
      // 文本区域
      ourgetTextArea(val, index){
         this.ourData[index].values = val
      },
      // 整数
      ourgetInt(val, index){
         this.ourData[index].values = val
      },
      // 小数
      ourgetFloat(val, index){
         this.ourData[index].values = val
      },
      // 密文
      ourgetSecret(val, index){
         // this.activeData.secretValue = val
         this.ourData[index].values = val
      },
      //MAC 
      ourgetMAC(val, index){
         this.ourData[index].values = val
      },
      // ip
      ourgetIp(val, index){
         this.ourData[index].values = val
      },
      // url
      ourgetUrl(val, index){
         this.ourData[index].values = val
      },

      // 确认按钮
      addSourceSure(){
         // let defaultFlag = false
         // let ourDataFlag = false
         // this.defalutData.forEach((item) => {
         //    if (!item.values || item.values == "[]") {
         //       defaultFlag = true
         //    }
         // })
         // this.ourData.forEach((item) => {
         //    if (!item.values || item.values == "[]") {
         //       ourDataFlag = true
         //    }
         // })
         // if (defaultFlag || ourDataFlag) {
         //    this.$message.error('请完善属性信息')
         //    return
         // }

         let fetchObj = {
            publicResourceMap: this.defalutData,
            customizeResourceMap: this.ourData.length > 0? this.ourData : null,
            allResourceMap: this.defalutData.concat(this.ourData),
            resourceTypeId: this.resourceId,
            useUser: this.userID
         }
         
         AddResource(fetchObj)
            .then(res=>{
               // console.log(res)
               if(res.code==200){
                  this.$message.success('新增成功')
                  this.$router.push({
                     name:'conserResource-conserResource',
                     params:{
                        orderid : this.resourceId
                     }
                  })
               }else{
                  this.$message.error('新增失败')
               }
            }).catch(err=>{
               console.log(err);
            })
      },
      cancleAddResource(){
         this.$router.push({
            name:'conserResource-conserResource',
         })
      }      
  },
}
</script>
<style scoped>
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
.defalutBox {
   display: flex;
   flex-wrap: wrap;
}
.titleContianer {
   width: 80px;
   text-align: right;
   margin-right: 15px;
   overflow: hidden;
   text-overflow: ellipsis;
   white-space: nowrap;
}
.defalutBox .typeContainer {
   width: 48%;
   display: flex;
   justify-content: center;
   align-items: flex-start;
   margin: 20px 0;
}
.defalutBox .common {
   width: 90%;
}
.bottomSumbit {
   margin-top: 30px;
   /* border-top: 1px solid #ccc; */
   text-align: center;
   padding: 60px 0 30px;
}
.bottomSumbit .el-button {
   margin-right: 30px;
   width: 10%;
}
</style>