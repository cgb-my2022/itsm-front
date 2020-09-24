<template>
  <a-card :bordered="false">
    <a-row>
      <a-col :span="10">
        <a-radio-group v-model="barType" @change="onChange">
          <!--<a-radio-button value="year">按年统计</a-radio-button>-->
          <a-radio-button value="day">按日统计</a-radio-button>
          <a-radio-button value="month">按月统计</a-radio-button>
        </a-radio-group>
      </a-col>
      <a-col :span="14">
        <a-form layout="inline" style="margin-top: -4px">
          <a-form-item label="当前日期" v-if="barType === 'day'">
            <a-date-picker :defaultValue="dateInit" placeholder="请选择日期" @change="handleDaySearch" />
          </a-form-item>
          <a-form-item label="当前月份" v-else-if="barType === 'month'">
            <a-month-picker :defaultValue="monthInit" placeholder="请选择月份" @change="handleMonthSearch" />
          </a-form-item>

        </a-form>
      </a-col>
    </a-row>
    <a-card title="部门工单统计图" >
      <a-row type="flex">
        <a-col :flex="5">
          <div>
            <v-chart :forceFit="true" :height="height" :data="departCountSource" :scale="scale">
              <v-tooltip :showTitle="false" dataKey="item*percent" />
              <v-axis />
              <v-legend dataKey="item" />
              <v-pie position="percent" color="item" :v-style="pieStyle" :label="labelConfig" />
              <v-coord type="theta" />
            </v-chart>
          </div>
        </a-col>
        <a-col :flex="2">
          <a-table :pagination="false" :columns="departColumns" :data-source="departCountSource">
          </a-table>
        </a-col>
      </a-row>
    </a-card>
    <a-card title="应用系统统计图" >
      <a-row type="flex">
        <a-col :flex="5">
          <div>
            <v-chart :forceFit="true" :height="height" :data="businessCountSource" :scale="scale">
              <v-tooltip :showTitle="false" dataKey="item*percent" />
              <v-axis />
              <v-legend dataKey="item" />
              <v-pie position="percent" color="item" :v-style="pieStyle" :label="labelConfig" />
              <v-coord type="theta" />
            </v-chart>
          </div>
        </a-col>
        <a-col :flex="2">
          <a-table :pagination="false" :columns="businessColumns" :data-source="businessCountSource">
          </a-table>
        </a-col>
      </a-row>
    </a-card>
    <!-- <a-card title="应用系统统计图" >
       <a-row type="flex">
         <a-col :flex="5">
           <div>
             <v-chart :forceFit="true" :height="height" :data="departCountSource" :scale="scale">
               <v-tooltip :showTitle="false" dataKey="item*percent" />
               <v-axis />
               <v-legend dataKey="item" />
               <v-pie position="percent" color="item" :v-style="pieStyle" :label="labelConfig" />
               <v-coord type="theta" />
             </v-chart>
           </div>
         </a-col>
         <a-col :flex="2">
           &lt;!&ndash;<a-table :pagination="false" :columns="columns" :data-source="ywCountSource">
           </a-table>&ndash;&gt;
         </a-col>
       </a-row>
     </a-card>-->
    <!--<a-card title="使用人员统计" >
      <a-row type="flex">
        <a-col :flex="5">
          <div>
            <v-chart :forceFit="true" height="200" :data="sourceData" :scale="scale">
              <v-tooltip :showTitle="false" dataKey="item*percent" />
              <v-axis />
              <v-legend dataKey="item" />
              <v-pie position="percent" color="item" :v-style="pieStyle" :label="labelConfig" />
              <v-coord type="theta" />
            </v-chart>
          </div>
        </a-col>
        <a-col :flex="2">
          <a-table :pagination="false" :columns="columns" :data-source="userCountSource">
          </a-table>
        </a-col>
      </a-row>
    </a-card>-->
  </a-card>
</template>

<script>
  const DataSet = require('@antv/data-set')
  import { ChartEventMixins } from '../../../components/chart/mixins/ChartMixins'
  import moment from 'moment'
  import { getAction } from '@/api/manage'
  import ARow from 'ant-design-vue/es/grid/Row'
  import ACol from 'ant-design-vue/es/grid/Col'

  export default {
    name: 'ServiceOrderUserChart',
    mixins: [ChartEventMixins],
    components: {
      ACol,
      ARow
    },
    data() {
      return {
        description: '档案统计页面',
        // 查询条件
        queryParam: {},
        // 数据集
        businessCountSource: [],
        businessCountSourceDetail: [],
        departCountSource: [],
        departCountSourceDetail: [],
        // 柱状图
        barType: 'day',
        url: {
          departCountChartByDay: '/system/serviceOrder/departCountChartByDay',
          departCountChartByMonth: '/system/serviceOrder/departCountChartByMonth',
          businessCountChartByDay: '/system/serviceOrder/businessCountChartByDay',
          businessCountChartByMonth: '/system/serviceOrder/businessCountChartByMonth'
        },
        dateInit: '',
        monthInit: '',
        departColumns: [
          {
            title: '部门',
            dataIndex: 'item',
            key: 'item'
          },
          {
            title: '数量',
            dataIndex: 'count',
            key: 'count'
          }],
        businessColumns: [
          {
            title: '业务类型',
            dataIndex: 'item',
            key: 'item'
          },
          {
            title: '数量',
            dataIndex: 'count',
            key: 'count'
          }],
        scale: [{
          dataKey: 'percent',
          min: 0,
          formatter: '.0%'
        }],
        height: 400,
        pieStyle: {
          stroke: "#fff",
          lineWidth: 1
        },
        labelConfig: ['percent', {
          formatter: (val, item) => {
            return item.point.item + ': ' + val;
          }
        }]
      }
    },
    created() {
      this.initTime();
    },
    methods: {
      initTime() {
        var aData = new Date();
        this.dateInit = moment(aData).format('YYYY-MM-DD');
        this.monthInit = moment(aData).format('YYYY-MM');

        this.handleDaySearch('', this.dateInit);
        // this.handleMonthSearch('', this.monthInit);
      },
      // 选择月份日期
      handleDaySearch(value, str) {
        let params = { day: str }
        getAction(this.url.departCountChartByDay, params).then((res) => {
          if (res.success) {
            this.departCountSourceDetail = res.result;
            const dv = new DataSet.View().source(res.result);
            dv.transform({
              type: 'percent',
              field: 'count',
              dimension: 'item',
              as: 'percent'
            });
            this.departCountSource = dv.rows;
          }
        })

        getAction(this.url.businessCountChartByDay, params).then((res) => {
          if (res.success) {
            this.businessCountSourceDetail = res.result;
            const dv = new DataSet.View().source(res.result);
            dv.transform({
              type: 'percent',
              field: 'count',
              dimension: 'item',
              as: 'percent'
            });
            this.businessCountSource = dv.rows;
          }
        })
      },
      handleMonthSearch(value, str) {
        let params = { month: str }
        getAction(this.url.departCountChartByMonth, params).then((res) => {
          if (res.success) {
            this.departCountSourceDetail = res.result;
            const dv = new DataSet.View().source(res.result);
            dv.transform({
              type: 'percent',
              field: 'count',
              dimension: 'item',
              as: 'percent'
            });
            this.departCountSource = dv.rows;
          }
        })

        getAction(this.url.businessCountChartByMonth, params).then((res) => {
          if (res.success) {
            this.businessCountSourceDetail = res.result;
            const dv = new DataSet.View().source(res.result);
            dv.transform({
              type: 'percent',
              field: 'count',
              dimension: 'item',
              as: 'percent'
            });
            this.businessCountSource = dv.rows;
          }
        })
      },
      onChange(e) {
        let val = e.target.value;
        if (val === 'month') {
          this.handleMonthSearch('', this.monthInit);
        } else if (val === 'day') {
          this.handleDaySearch('', this.dateInit);
        }
      }
    }
  }
</script>
<style scoped>
  .ant-card-body .table-operator {
    margin-bottom: 18px;
  }

  .ant-table-tbody .ant-table-row td {
    padding-top: 15px;
    padding-bottom: 15px;
  }

  .anty-row-operator button {
    margin: 0 5px
  }

  .ant-btn-danger {
    background-color: #ffffff
  }

  .ant-modal-cust-warp {
    height: 100%
  }

  .ant-modal-cust-warp .ant-modal-body {
    height: calc(100% - 110px) !important;
    overflow-y: auto
  }

  .ant-modal-cust-warp .ant-modal-content {
    height: 90% !important;
    overflow-y: hidden
  }

  .statistic {
    padding: 0px !important;
    margin-top: 50px;
  }

  .statistic h4 {
    margin-bottom: 20px;
    text-align: center !important;
    font-size: 24px !important;;
  }

  .statistic #canvas_1 {
    width: 100% !important;
  }
</style>
