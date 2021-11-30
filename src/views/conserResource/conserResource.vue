<template>
  <div class="conserResContainer">
    <div class="conserResourceLeftContianer">
      <el-input 
        class="searchInput" 
        placeholder=""
        suffix-icon="el-icon-search"
        v-model="searchLeftValue"
        @keyup.enter.native="handleSearchLeft"
        ></el-input>
        <!-- 左侧树形结构 -->
        <!-- <a-tree
          @select="onSelect"
          :tree-data="treeData"
          :defaultExpandedKeys="defaultSelectedKeys"
          :defaultSelectedKeys="defaultSelectedKeys"
          :replace-fields="replaceFields"
        ></a-tree> -->
        <el-tree 
          :data="treeData" 
          default-expand-all	
          :props="replaceFields"
          @node-click="onSelect"
          node-key="id"
          ref="viewTree"
          :highlight-current="highLight"	
          ></el-tree>
    </div>
    <div class="conserResourceRightContianer">
      <div class="top">
        <el-button type="primary"  :disabled="isdisable" @click="conserResAdd">增加</el-button>
        <el-button type="primary"  :disabled="isdisable" @click="modeDel">删除</el-button>
        <el-button type="primary" :disabled="isdisable" @click="inResourceFile">导入</el-button>
        <el-button type="primary" :disabled="isdisable" @click="outResourceFile">导出</el-button>
        <div class="searchContianer">
          <el-input v-model="searchRightValue" placeholder="请输入搜索值"></el-input>
          <el-button type="primary" @click="rightSearch">查询</el-button>
        </div>
      </div>
      <div class="bottom">
        <vxe-table
          border
          ref="xTable1"
          :data="tableData.slice((page.currentPage-1)*page.pageSize,page.currentPage*page.pageSize)"
          >
          <vxe-column type="checkbox" fixed="left"></vxe-column>
          <vxe-column 
            v-for="(item, index) in tableHead"
            show-overflow
            :key="index"
            width="180"
            :field="item.prop" :title="item.name">
          </vxe-column>
          <vxe-column title="操作" fixed="right" width="260">
            <template #default="{ row }">
              <vxe-button status="primary" content="详情" @click="toDetail(row)"></vxe-button>
              <vxe-button status="primary" content="修改" @click="toEdit(row)"></vxe-button>
              <vxe-button status="primary" content="删除" @click="del(row)"></vxe-button>
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
      <!-- 删除dialog -->
      <el-dialog
        title="删除"
        :visible.sync="delDialogVisible"
        width="30%"
        >
        <span>是否确认执行删除操作？本操作不可撤销。</span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="delDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleDelSure">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 导入dialog -->
      <el-dialog
        title="导入资源"
        :visible.sync="uploadDialogVisible"
        width="30%"
        >
        <div>
          <div @click="handleDownXls" style="color: #409EFF; cursor: pointer;">下载模板</div>
          <br>
          <el-upload
            class="upload-demo"
            :action="upUrl"
            :headers="headers"
            :data="upData"
            :on-remove="handleUploadRemove"
            :limit="1"
            :on-error="handleUpError"
            :on-success="handleUpSuccess"
            :before-upload="beforeAvatarUpload"
            :file-list="fileList">
            <el-button type="primary">选择并上传</el-button>
            <div slot="tip" style="color: red" class="el-upload__tip">支持.xlsx或.xls类型的Excel文件。</div>
          </el-upload>
          <!-- <a-upload
            name="file"
            :multiple="true"
            :action="upUrl"
            :headers="headers"
            @change="handleUploadChange"
          >
            <a-button> <a-icon type="upload" /> 上 传 </a-button>
          </a-upload> -->
          <br>
          <!-- <div>
            <span style="margin-right: 20px">主键重复操作</span>
            <el-radio v-model="upRadio" label="1">覆盖</el-radio>
            <el-radio v-model="upRadio" label="2">忽略</el-radio>
          </div> -->
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="handleUploadCancle">取 消</el-button>
          <!-- <el-button type="primary" @click="handleUploadSure">导 入</el-button> -->
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { getIntTree, searchIntTree, getTreeIdInfo, delResource, delModeResource, outResource, downResource, importResource } from '@/api/conserResource'
import Vue from 'vue'
import { ACCESS_TOKEN } from "@/store/mutation-types"
export default {
  components:{},
  props:{},
  data(){
    return {
      searchLeftValue: "",
      replaceFields: {
        children: 'children',
        label: 'name'
      },
      treeData : [],
      // 右侧数据
      searchRightValue: "",
      tableData: [],
      tableHead:[],
      page: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0
      },
      secID: null,
      defaultSelectedKeys: [],
      highLight: false,
      isdisable: false,

      // 删除dialog
      delDialogVisible: false,
      delID: null,
      delType: null,

      // 导入
      headers:{},
      upUrl: window._CONFIG['domianURL'] + '/cmdb/resource/importExcel',
      fileList:[],
      uploadDialogVisible: false,
      upRadio: "1",
      upFile: null,
      upData: {
        id: null
      },

      outPutId: null
    }
  },
  mounted(){
    this.getDefaultTree(sessionStorage.getItem('treeid'))

    const token = Vue.ls.get(ACCESS_TOKEN);
    this.headers = {"X-Access-Token":token}
  },
  methods:{
    // 左侧tree
    getDefaultTree(orderid){
      // this.defaultSelectedKeys = []
      getIntTree()
        .then(res=>{
          // console.log(res)
          if(res.code == 200){
            this.treeData = res.result
            let porpid = {
              id: orderid ? orderid : res.result[0].id
            }
            this.onSelect(porpid)
          }else{
            this.$message.error('加载列表繁忙')
          }
        }).catch((err)=>{
          // console.log(err)
          this.$message.error('加载列表繁忙')
        })
    },
    // 左侧搜索input
    handleSearchLeft(){
      if(this.searchLeftValue){
        searchIntTree({ typeName	: this.searchLeftValue})
          .then(res=>{
            if(res.code == 200){
              this.treeData = res.result
            }else{
              this.$message.error('查询失败')
            }
          }).catch(()=>{
              this.$message.error('查询失败')
          })
      }else{
        this.getDefaultTree(this.$route.params.orderid)
      }
      
    },

    // tree操作
    onSelect(data, res) {
      let flag = true
      sessionStorage.setItem('treeid', data.id)
      this.upData.id = data.id
      this.treeData.forEach(item=>{
        if(item.id == data.id){
          flag = false
        }
      })
      if(data.classLevel && data.classLevel == '2'){
          flag = true
      }
      if(!flag){
        this.isdisable = true
      }else{
        this.isdisable = false
      }
      
      this.$nextTick(()=>{
        this.highLight = true
        this.$refs.viewTree.setCurrentKey(data.id);
      })
      this.tableHead = []
      this.tableData = []
      this.secID = data.id
      getTreeIdInfo({id: data.id, sortName: ""})
        .then(res=>{
          // console.log(res)
          if(res.code == 200){
            if(res.result){
              this.tableHead = res.result.mapTitle
              this.tableData = res.result.mapBody
              this.page.totalResult = res.result.mapBody.length
            }else{
              this.$message.error('暂无数据')
            }
          }else{
            this.$message.error('查询失败')
          }
        }).catch((err)=>{
            console.log(err);
            this.$message.error('查询失败')
        })
    },

    // table
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
      sessionStorage.setItem('resourceTableID', row.id)
    },
    toEdit(row){
      this.$router.push({
        path: "/conserResource/conserEdit",
        query:{
          id: row.id
        }
      })
    },
    del(row){
      // console.log(row)
      this.delDialogVisible = true
      this.delID = row.id
      this.delType = 1
    },

    // 批量删除
    modeDel(){
      let selectRecords = this.$refs.xTable1.getCheckboxRecords()
      if(selectRecords.length === 0){
        this.$message.error('请选择数据进行删除')
        return
      }
      this.delDialogVisible = true
      this.delType = 2
    },
    // 删除确认按钮
    handleDelSure(){
      if(this.delType == 1){
        delResource({id: this.delID})
          .then(res=>{
            if(res.code == 200){
              this.$message.success('删除成功')
              this.getDefaultTree(sessionStorage.getItem('treeid'))
            }else{
              this.$message.success('删除失败')
            }
            this.delDialogVisible = false
          })
      }else {
        let secData = this.$refs.xTable1.getCheckboxRecords()
        let ids = []
         for(var i = 0; i < secData.length; i++){
            ids.push(secData[i].id)
         }
         ids = ids.join(',')

        delModeResource({ids})
          .then(res=>{
            if(res.code == 200){
              this.$message.success('删除成功')
              this.getDefaultTree(sessionStorage.getItem('treeid'))
            }else{
              this.$message.success('删除失败')
            }
            this.delDialogVisible = false
          })
      }

    },

    // 顶部新增按钮conserResource/conserAdd
    conserResAdd(){
      this.$router.push({
        path: "/conserResource/conserAdd",
      })
      sessionStorage.setItem('treeid', this.secID)
    },
    rightSearch(){
      getTreeIdInfo({id: sessionStorage.getItem('treeid'), sortName: this.searchRightValue})
        .then(res=>{
          // console.log(res)
          if(res.code == 200){
            if(res.result){
              this.tableHead = res.result.mapTitle
              this.tableData = res.result.mapBody
            }else{
              this.$message.error('暂无数据')
            }
          }else{
            this.$message.error('查询失败')
          }
        }).catch((err)=>{
            console.log(err);
            this.$message.error('查询失败')
        })
    },

    outResourceFile(){
      // this.outPutId = null
      // let selectRecords = this.$refs.xTable1.getCheckboxRecords()
      // if(selectRecords.length == 0){
      //   this.$message.error('请选择数据')
      //   return
      // }
      // if(selectRecords.length > 1){
      //   this.$message.error('不支持批量导出')
      //   return
      // }
      // this.outPutId = selectRecords[0].id
      outResource({id: sessionStorage.getItem('treeid')})
        .then(res=>{
          const _res = res;
          let blob = new Blob([_res], {type: 'application/x-download;charset=UTF-8'});
          let downloadElement = document.createElement("a");
          let href = window.URL.createObjectURL(blob); //创建下载的链接
          downloadElement.href = href;
          // downloadElement.download = fileName; //下载后文件名x
          downloadElement.download = "CMDB.xls"; //下载后文件名
          document.body.appendChild(downloadElement);
          downloadElement.click(); //点击下载
          document.body.removeChild(downloadElement); //下载完成移除元素
          window.URL.revokeObjectURL(href); //释放掉blob对象
        }).catch((err)=>{
          console.log(err)
          this.$message.error('导出失败')
        })
    },
    // 下载模板
    handleDownXls(){
      downResource({id: sessionStorage.getItem('treeid')})
        .then(res=>{
          const _res = res;
          let blob = new Blob([_res], {type: 'application/x-download;charset=UTF-8'});
          let downloadElement = document.createElement("a");
          let href = window.URL.createObjectURL(blob); //创建下载的链接
          downloadElement.href = href;
          // downloadElement.download = fileName; //下载后文件名x
          downloadElement.download = "CMDB模板.xls"; //下载后文件名
          document.body.appendChild(downloadElement);
          downloadElement.click(); //点击下载
          document.body.removeChild(downloadElement); //下载完成移除元素
          window.URL.revokeObjectURL(href); //释放掉blob对象
        }).catch((err)=>{
          console.log(err)
          this.$message.error('下载模板失败')
        })
    },
    beforeAvatarUpload(file) {
      var testmsg = file.name.substring(file.name.lastIndexOf('.')+1)
      const extension = testmsg === 'xls'
      const extension2 = testmsg === 'xlsx'
      // const isLt2M = file.size / 1024 / 1024 < 10
      if(!extension && !extension2) {
          this.$message.error('上传文件只能是 xls、xlsx格式!')
      }
      return extension || extension2
    },
    handleUpSuccess(res, file){
      if(res.code == 500){
        this.$message.error('导入失败')
        this.uploadDialogVisible = false
        return
      }
      this.uploadDialogVisible = false
      this.fileList = []
      this.upFile = null
      this.getDefaultTree(sessionStorage.getItem('treeid'))
      this.$message.success('导入成功')
      
    },
    handleUpError(res, file, fileList){
      this.$message.error('上传失败')
    },

    // handleUploadChange(info){
    //   console.log(info)
    //   this.upFile = info.file
    //   if (info.file.status === 'done') {
    //     this.upFile = info.fileList
    //   }
    // },
    // upload移除
    handleUploadRemove(){
      this.fileList = []
      this.upFile = null
    },
    inResourceFile(){
      this.uploadDialogVisible = true
    },
    handleUploadCancle(){
      this.uploadDialogVisible = false
      this.fileList = []
      this.upFile = null
    },
    handleUploadSure(){
      if(!this.upFile){
        this.$message.error('请选择文件')
        return
      }
      var formData_o = new FormData();
      formData_o.append("file",this.upFile);
      formData_o.append("id",sessionStorage.getItem('treeid'));
      var that = this;
      $.ajax({ 
        url: window._CONFIG['domianURL'] +"/cmdb/resource/importExcel",
        type: 'POST', 
        headers: this.headers,
        data: formData_o,
        // dataType: 'json', 
        mimeType: "multipart/form-data",
        async: false,
        cache: false, 
        contentType: false, 
        processData: false, 
        success: function (returndata) { 
          console.log(returndata)
        }, 
        error: function (returndata) { 
        }
      }) 
      // let obj = {
      //   fileUrl: this.upUrl,
      //   id: sessionStorage.getItem('treeid')
      // }
      // importResource(obj)
      //   .then(res=>{
      //     console.log(res);
      //   })
    }

  },
}
</script>
<style scoped>
.conserResContainer {
  display: flex;
}
.conserResourceLeftContianer {
  height: 80vh;
  width: 20%;
  padding: 0 20px;
  background-color: #fff;
  overflow-y: auto;
  margin-right: 20px;
  box-sizing: border-box;
}
.conserResourceLeftContianer .searchInput{
  margin-top: 20px;
  margin-bottom: 20px;
}
.conserResourceLeftContianer .ant-tree>>>li {
  overflow: hidden; 
  text-overflow: ellipsis;
  word-break: break-all;
}
.conserResourceRightContianer {
  width: 80%;
}
.conserResourceRightContianer .top {
  width: 100%;
  background-color: #fff;
  padding: 30px 20px;
  box-sizing: border-box;
  overflow: hidden;
}
.conserResourceRightContianer .top .searchContianer{
  float: right;
}
.conserResourceRightContianer .top .el-input {
  width: 200px;
  margin-right: 5px;
}
.conserResourceRightContianer .bottom {
  width: 100%;
  padding: 20px;
  margin-top: 20px;
  background-color: #fff;
}
.conserResourceLeftContianer >>> .ant-tree li .ant-tree-node-content-wrapper{
    width: 80%;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    white-space: nowrap;
}


</style>