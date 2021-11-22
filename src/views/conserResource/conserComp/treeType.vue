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
var beforeTreeData
export default {
  components:{},
  props:{
      treeDialogVisible: false,
      getData: null,
      theIndex: null
  },
  data(){
      // const treeData = [{
         //    id: 1,
         //    label: '一级 1',
         //    children: [{
         //    id: 4,
         //    label: '二级 1-1',
         //    children: [{
         //       id: 9,
         //       label: '三级 1-1-1'
         //    }, {
         //       id: 10,
         //       label: '三级 1-1-2'
         //    }]
         //    }]
         //    }, {
         //       id: 2,
         //       label: '一级 2',
         //       children: [{
         //       id: 5,
         //       label: '二级 2-1'
         //       }, {
         //       id: 6,
         //       label: '二级 2-2'
         //       }]
         //    }, {
         //       id: 3,
         //       label: '一级 3',
         //       children: [{
         //       id: 7,
         //       label: '二级 3-1'
         //       }, {
         //       id: 8,
         //       label: '二级 3-2'
         //       }]
      // }];
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
         beforeTreeData = this.getData
         this.treeDatas = JSON.parse(this.getData)
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
         // console.log(data)
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