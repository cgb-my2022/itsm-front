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
    <a-card title="运维人员平均处理时效表" >
      <a-row type="flex">
        <a-col :flex="5">
          <div>
            <v-chart :force-fit="true" :height="height" :data="data" :scale="scale">
              <v-tooltip />
              <v-axis />
              <v-legend />
              <v-line position="name*temperature" color="city" />
              <v-point position="name*temperature" color="city" :size="4" :v-style="style" :shape="'circle'" />
            </v-chart>
          </div>
        </a-col>
         <a-col :flex="1">
           <a-table :pagination="false" :columns="ywAvgResponseColumns" :data-source="ywResponseAvgSourceDetail">
           </a-table>
         </a-col>
      </a-row>
    </a-card>
    <a-card title="运维人员处理时效记录" >
      <a-table :pagination="false" :columns="ywResponseColumns" :data-source="ywResponseSourceDetail">
      </a-table>
    </a-card>
  </a-card>
</template>

<script>
  import { ChartEventMixins } from '../../../components/chart/mixins/ChartMixins'
  import moment from 'moment'
  import { getAction } from '@/api/manage'
  import ARow from 'ant-design-vue/es/grid/Row'
  import ACol from 'ant-design-vue/es/grid/Col'
  const DataSet = require('@antv/data-set')

  export default {
    name: 'ServiceOrderUserChart',
    mixins: [ChartEventMixins],
    components: {
      ACol,
      ARow
    },
    data() {
      return {
        // 数据集
        ywResponseAvgSource: [],
        ywResponseAvgSourceDetail: [],
        ywResponseSourceDetail: [],
        // 柱状图
        barType: 'day',
        url: {
          ywResponseAvgByDay: '/system/serviceOrder/ywResponseAvgByDay',
          ywResponseAvgByMonth: '/system/serviceOrder/ywResponseAvgByMonth',
          ywResponseByDay: '/system/serviceOrder/ywResponseByDay',
          ywResponseByMonth: '/system/serviceOrder/ywResponseByMonth'
        },
        dateInit: '',
        monthInit: '',
        ywAvgResponseColumns: [
          {
            title: '运维人员',
            dataIndex: 'name',
            key: 'name'
          },
          {
            title: '平均接单时间',
            dataIndex: '平均接单时间min/次',
            key: '平均接单时间min/次'
          },
          {
            title: '平均处理时间',
            dataIndex: '平均处理时间min/次',
            key: '平均处理时间min/次'
          }],
        ywResponseColumns: [
          {
            title: '运维人员',
            dataIndex: 'name',
            key: 'name'
          },
          {
            title: '接单时间(分钟)',
            dataIndex: 'receiveMin',
            key: 'receiveMin'
          },
          {
            title: '处理时间(分钟)',
            dataIndex: 'dealMin',
            key: 'dealMin'
          }],
        scale: [{
          dataKey: 'name',
          min: 0,
          max: 1
        }],
        height: 300,
        data: [],
        style: { stroke: '#fff', lineWidth: 1 }
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
        let that = this;
        getAction(this.url.ywResponseAvgByDay, params).then((res) => {
          if (res.success) {
            that.ywResponseAvgSourceDetail = res.result;
            const dv = new DataSet.View().source(res.result);
            dv.transform({
              type: 'fold',
              fields: ['平均接单时间min/次', '平均处理时间min/次'],
              key: 'city',
              value: 'temperature'
            });
            that.data = dv.rows;
          }
        })

        getAction(this.url.ywResponseByDay, params).then((res) => {
          if (res.success) {
            that.ywResponseSourceDetail = res.result;
          }
        })
      },
      handleMonthSearch(value, str) {
        let params = { month: str }
        let that = this;
        getAction(this.url.ywResponseAvgByMonth, params).then((res) => {
          if (res.success) {
            that.ywResponseAvgSourceDetail = res.result;
            const dv = new DataSet.View().source(res.result);
            dv.transform({
              type: 'fold',
              fields: ['平均接单时间min/次', '平均处理时间min/次'],
              key: 'city',
              value: 'temperature'
            });
            that.data = dv.rows;
          }
        })

        getAction(this.url.ywResponseByMonth, params).then((res) => {
          if (res.success) {
            that.ywResponseSourceDetail = res.result;
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
