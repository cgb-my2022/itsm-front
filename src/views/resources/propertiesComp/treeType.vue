<template>
   <div>
      <el-dialog
         title="树形下拉文本内容编辑"
         :visible.sync="treeDialogVisible"
         width="30%"
         :close-on-click-modal="false"
         :before-close="treeCancle"
         >
         <el-button type="primary"  size="mini" style="margin-bottom: 20px" @click="addFirstNode">增加一级节点</el-button>
         <el-tree
            :data="treeDatas"
            node-key="id"
            default-expand-all
            :expand-on-click-node="false">
            <span class="custom-tree-node" slot-scope="{ node, data }">
               <span>{{ node.label }}</span>
               <span>
                  <el-button
                     style="margin-left: 30px"
                     type="text"
                     size="mini"
                     @click="() => append(data)">
                     增加子节点
                  </el-button>
                  <el-button
                     type="text"
                     size="mini"
                     @click="() => reName(node, data)">
                     修改名称
                  </el-button>
                  <el-button
                     type="text"
                     size="mini"
                     @click="() => remove(node, data)">
                     删除
                  </el-button>
               </span>
            </span>
         </el-tree>
         <span slot="footer" class="dialog-footer">
            <el-button @click="treeCancle">取 消</el-button>
            <el-button type="primary" @click="treeSure">确 定</el-button>
         </span>
      </el-dialog>
      <!-- 修改name -->
      <el-dialog
         title="修改名称"
         :visible.sync="dialogName"
         width="30%"
         >
         <el-input v-model="relName"></el-input>
         <span slot="footer" class="dialog-footer">
            <el-button @click="dialogName = false">取 消</el-button>
            <el-button type="primary" @click="handleRelName">确 定</el-button>
         </span>
      </el-dialog>
   </div>
</template>

<script>
let id = 1000;
var beforeTreeData
export default {
  components:{},
  props:{
      treeDialogVisible: false,
      getData: null,
      theIndex: null
  },
  data(){
      return {
         treeDatas:[],
         relName: "",
         dialogName: false,
         reNameID: null
      }
  },
  mounted(){
      // 在父级页面调用接口，获取tree数据，通过getData传入此组件
      if(this.getData){
         beforeTreeData = JSON.stringify(this.getData)
         this.treeDatas = this.getData
      }else{
         beforeTreeData = []
         this.treeDatas = []
      }
  },
  methods:{
      append(data) {
         const newChild = { id: this.getMathID(), label: 'testtest', children: [] };
         if (!data.children) {
         this.$set(data, 'children', []);
         }
         data.children.push(newChild);
      },

      remove(node, data) {
         const parent = node.parent;
         const children = parent.data.children || parent.data;
         const index = children.findIndex(d => d.id === data.id);
         children.splice(index, 1);
      },
      addFirstNode(){
         this.treeDatas.push({
            id: this.getMathID(),
            label: '新增子节点',
            children:[]
         })
      },
      reName(node, data){
         // console.log(node)
         console.log(data)
         this.dialogName = true
         this.relName = data.label
         this.reNameID = data.id
      },
      // dialog 取消按钮
      treeCancle(){
         let res = {
            treeDatas: beforeTreeData.length == 0 ? [] : JSON.parse(beforeTreeData),
            flag: false
         }
         this.$emit('treeCancleClose', res, this.theIndex)
      },
      treeSure(){
         let res = {
            treeDatas: this.treeDatas,
            flag: false
         }
         this.$emit('treeSureClose', res, this.theIndex)
      },
      handleRelName(){
         let res = this.getTreeItem(this.treeDatas, this.reNameID)
         // console.log(res)
         res.label = this.relName
         this.dialogName = false
      },

      getTreeItem(list, id){
         let _this = this
         for( let i = 0; i < list.length; i++ ){
            let a = list[i]
            if(a.id === id){
               return a
            }else {
               if(a.children && a.children.length > 0){
                  let res = _this.getTreeItem(a.children, id)
                  if(res){
                     return res
                  }
               }
            }
         }
      },
      // 随机数
      getMathID(){
         return Number(Math.random().toString().substr(3, 10) + Date.now()).toString(36)
      }
  },
}
</script>
<style scoped>
</style>