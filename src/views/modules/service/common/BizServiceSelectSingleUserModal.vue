<template>
  <div>
    <a-modal
      centered
      :title="title"
      :width="750"
      :visible="visible"
      @ok="handleOk"
      @cancel="handleCancel"
      cancelText="关闭">
          <a-card title="选择人员" :bordered=true>
            <!-- 查询区域 -->
            <div class="table-page-search-wrapper">
              <a-form layout="inline">
                <a-row :gutter="24">

                  <a-col :xs="24" :sm="10">
                    <a-form-item label="用户姓名">
                      <a-input placeholder="请输入姓名" v-model="queryParam.realname"></a-input>
                    </a-form-item>
                  </a-col>
                  <a-col :xs="24" :sm="12">
                    <span>
                      <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
                      <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
                    </span>
                  </a-col>

                </a-row>
              </a-form>
            </div>
            <!-- table区域-begin -->
            <div>
              <a-table
                size="middle"
                bordered
                rowKey="id"
                :columns="columns1"
                :dataSource="dataSource1"
                :loading="loading"
                :rowSelection="{selectedRowKeys: selectedRowKeys,onSelect:onSelect,onChange: onSelectChange,type: type}"
                >

               <span slot="username" slot-scope="text">
                  <j-ellipsis :value="text" :length="15"/>
                </span>
                <span slot="realname" slot-scope="text">
                  <j-ellipsis :value="text" :length="10"/>
                </span>
              </a-table>
            </div>
            <!-- table区域-end -->
          </a-card>
        <!--<a-col :xs="24" :sm="8">
          <a-card title="用户选择" :bordered=true>
            &lt;!&ndash; table区域-begin &ndash;&gt;
            <div>
              <a-table
                size="middle"
                bordered
                rowKey="id"
                :columns="columns2"
                :dataSource="dataSource2"
                :loading="loading"
                :scroll="{ y: 240 }"
              >
                <span slot="action" slot-scope="text, record">
                  <a-button type="primary" size="small" @click="handleDelete(record)" icon="delete">删除</a-button>
                </span>
              </a-table>
            </div>
            &lt;!&ndash; table区域-end &ndash;&gt;
          </a-card>
        </a-col>-->
    </a-modal>
  </div>
</template>

<script>
 import { filterObj } from '@/utils/util'
 import { getAction } from '@/api/manage'
 import JEllipsis from '@/components/jeecg/JEllipsis'

  export default {
    name: "BizSelectSingleUserModal",
    components: {JEllipsis},
    props: {
      url: {
        type: String,
        default: "/sys/user/serviceUserlist"
      }
    },
    data () {
      return {
        title: "用户列表",
        names: [],
        visible: false,
        placement: 'right',
        description: '人员管理页面',
        // 查询条件
        queryParam: {},
        // 表头
        columns1: [
          {
            title: '#',
            dataIndex: '',
            key:'rowIndex',
            width: "10%",
            align:"center",
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
          },
          {
            title: '用户账号',
            align: "center",
            dataIndex: 'username',
            width: "40%",
            scopedSlots: { customRender: 'username' },
          },
          {
            title: '用户姓名',
            align: "center",
            width: "40%",
            dataIndex: 'realname',
            scopedSlots: { customRender: 'realname' },
          }
        ],
        columns2: [

          {
            title: '用户姓名',
            align:"center",
            width: "60%",
            dataIndex: 'realname'
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            width:"60%",
            scopedSlots: { customRender: 'action' },
          }
        ],
        //数据集
        dataSource1:[],
        dataSource2:[],
        isorter:{
          column: 'createTime',
          order: 'desc',
        },
        loading:false,
        selectedRowKeys: [],
        selectedRows: [],
        type: "radio",
        eventParams: {}
      }
    },
    created() {

    },
    methods: {
      searchQuery(){
        this.loadData(1);
      },
      searchReset(){
        this.queryParam={};
        this.loadData(1);
      },
      handleCancel() {
        this.visible = false;
      },
      handleOk() {
          if(this.dataSource2.length<=0){
          this.$message.warning("请选用户信息");
          return;
        }
          this.$emit("selectFinished",this.dataSource2[0]);
          this.visible = false;
      },
      select(flag) {
        this.visible = true;
        this.loadData(flag);
      },
      loadData (flag){

        var params = this.getQueryParams();//查询条件
        if(flag){
          params.flag = flag;
        }
        getAction(this.url,params).then((res)=>{
          if(res.success){
            this.dataSource1 = res.result;
          }
        })
      },
      getQueryParams(){
        var param = Object.assign({}, this.queryParam,this.isorter);
        param.field = this.getQueryField();
        return filterObj(param);
      },
      getQueryField(){
        //TODO 字段权限控制
      },
      onSelect (record,selected) {
        if(selected===true){
          this.dataSource2 = [];
          this.dataSource2.push(record);
        }else{
          this.dataSource2 = [];
        }
      },
      onSelectChange (selectedRowKeys,selectedRows) {
        this.selectedRowKeys = selectedRowKeys;
        this.selectionRows = selectedRows;
      },
      onClearSelected(){
        this.selectedRowKeys = [];
        this.selectionRows = [];
      },
      handleDelete: function(record){
        this.dataSource2 = [];
      }
    }
  }
</script>
<style lang="less" scoped>
  .ant-card-body .table-operator{
    margin-bottom: 18px;
  }
  .ant-table-tbody .ant-table-row td{
    padding-top:15px;
    padding-bottom:15px;
  }
  .anty-row-operator button{margin: 0 5px}
  .ant-btn-danger{background-color: #ffffff}

  .ant-modal-cust-warp{height: 100%}
  .ant-modal-cust-warp .ant-modal-body{height:calc(100% - 110px) !important;overflow-y: auto}
  .ant-modal-cust-warp .ant-modal-content{height:90% !important;overflow-y: hidden}
</style>