<template>
  <div>
    <div style="margin-bottom: 20px;height: 400px;overflow: hidden;overflow-y: auto;overflow-x: auto;">
      <img :src="imgPath" style="border:2px;cursor:hand;" alt="流程图" usemap="#planetmap">
      <map name="planetmap">
        <template v-for="(item, key, index) in nodePositionInfo.positionList">
         <area shape="rect" :coords="item.coords" title="Venus" @mouseover="showNodeInfo(nodePositionInfo.hisTasks,item.id)">
        </template>
      </map>
    </div>
    <a-card title="流程历史跟踪">
      <a-table
         rowKey="taskId"
        :loading="loading"
        :dataSource="dataSource"
        :columns="columns"
         :scroll="{ x: 750 }"
        size="small">
        <!-- 字符串超长截取省略号显示-->
        <span slot="remarks" slot-scope="text, record">
          <j-ellipsis :value="getNodeInfo(record)" :length="25"/>
        </span>
      </a-table>
    </a-card>

    <service-node-info-model ref="nodeInfoModel"></service-node-info-model>
  </div>
</template>

<script>
  import { getAction } from '@/api/manage'
  import qs from 'qs';
  import ServiceNodeInfoModel from './ServiceNodeInfoModel.vue';
  import JEllipsis from '@/components/jeecg/JEllipsis'

  export default {
    components: {
      ServiceNodeInfoModel,
      JEllipsis },
    name: 'BizProcessModule',
    props: ['taskData'],
    computed: {
      imgPath: function () {
        var params = qs.stringify({
          //'token': Cookies.get('token'),
          '_t': Date.parse(new Date())/1000,
          'processInstanceId': this.taskData.procInsId
        })
        return `${window._CONFIG['domianURL']}/act/task/traceImage?${params}`;
      }
    },
    data() {
      return {
        loading: true,
        dataSource: [],
        nodePositionInfo:{},
        url:{
          list:"/act/task/processHistoryList",
          getNodePositionInfo:"/act/task/getNodePositionInfo",
        },
        columns: [
          {
            title: '#',
            rowKey: (record, index) => index,
            width: 40,
            customRender(t, r, index) {
              return parseInt(index) + 1
            }
          },
          {
            title: '名称',
            dataIndex: 'name',
            width:100
          }, {
            title: '流程实例ID',
            dataIndex: 'processInstanceId',
            width:100
          }, {
            title: '开始时间',
            dataIndex: 'startTime',
            width:120
          }, {
            title: '结束时间',
            dataIndex: 'endTime',
            width:120
          }, {
            title: '负责人',
            dataIndex: 'assigneeName',
            width:80
          }, {
            title: '处理结果',
            dataIndex: 'deleteReason',
            width:80
          },{
            title: '处理意见',
            fixed: 'right',
            width: 100,
            dataIndex: 'remarks',
            scopedSlots: { customRender: 'remarks' }
          }
        ]
      }
    },
    methods: {
      // 查询数据
      requestData() {
        this.loading = true;
        var params = {processInstanceId:this.taskData.procInsId};//查询条件
        getAction(this.url.list,params).then(res => {
          if (res.success) {
            // console.log(res.result.records)
            this.dataSource = res.result.records
          } else {
            this.$message.warn('加载失败')
          }
        }).catch(e => {
          console.error(e)
        }).then(() => {
          this.loading = false
        })
      },
      // 查询坐标信息数据
      getNodePositionInfoData() {
        var params = {processInstanceId:this.taskData.procInsId};//查询条件
        getAction(this.url.getNodePositionInfo,params).then(res => {
          if (res.success) {
            this.nodePositionInfo = res.result
          }
        }).catch(e => {
          console.error(e)
        }).then(() => {
        })
      },
      showNodeInfo(data,taskId){
        this.$refs.nodeInfoModel.close();
        this.$refs.nodeInfoModel.showInfo(data,taskId);
      },
      getNodeInfo(record){
        var data = this.nodePositionInfo.hisTasks;
        for (var item of data) {
          if(item.id == record.id){
            return item.remarks;
          }
        }
        return "";
      },
    },
    created() {
      this.getNodePositionInfoData();
      this.requestData();
    }

  }
</script>

<style scoped>
</style>