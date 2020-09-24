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
    <a-card title="运维人员工单处理量统计" >
    <a-row type="flex">
      <a-col :flex="5">
          <bar class="statistic" yaxisText="数量"  :dataSource="ywCountSource" :height="200"/>
      </a-col>
      <a-col :flex="2">
        <a-table :pagination="false" :columns="columns" :data-source="ywCountSource">
        </a-table>
      </a-col>
    </a-row>
    </a-card>
    <a-card title="使用人员统计" >
    <a-row type="flex">
      <a-col :flex="5">
        <bar class="statistic" yaxisText="数量" :dataSource="userCountSource" :height="200"/>
      </a-col>
      <a-col :flex="2">
        <a-table :pagination="false" :columns="columns" :data-source="userCountSource">
        </a-table>
      </a-col>
    </a-row>
  </a-card>
  </a-card>
</template>

<script>
  import Bar from '@/components/chart/Bar'
  import moment from 'moment'
  import { getAction } from '@/api/manage'
  import ARow from 'ant-design-vue/es/grid/Row'
  import ACol from 'ant-design-vue/es/grid/Col'

  export default {
    name: 'ServiceOrderUserChart',
    components: {
      ACol,
      ARow,
      Bar
    },
    data() {
      return {
        description: '档案统计页面',
        // 查询条件
        queryParam: {},
        // 数据集
        ywCountSource: [],
        userCountSource: [],
        // 柱状图
        barType: 'day',
        url: {
          userDayCountInfo: '/system/serviceOrder/userStaticsByDay',
          userMonthCountInfo: '/system/serviceOrder/userStaticsByMonth',
          ywDayCountInfo: '/system/serviceOrder/ywStaticsByDay',
          ywMonthCountInfo: '/system/serviceOrder/ywStaticsByMonth'
        },
        dateInit: '',
        monthInit: '',
        columns: [
          {
            title: '用户',
            dataIndex: 'x',
            key: 'x'
          },
          {
            title: '数量',
            dataIndex: 'y',
            key: 'y'
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
        getAction(this.url.userDayCountInfo, params).then((res) => {
          if (res.success) {
            this.userCountSource = res.result;
          }
        })
        getAction(this.url.ywDayCountInfo, params).then((res) => {
          if (res.success) {
            this.ywCountSource = res.result;
          }
        })
      },
      handleMonthSearch(value, str) {
        let params = { month: str }
        getAction(this.url.userMonthCountInfo, params).then((res) => {
          if (res.success) {
            this.userCountSource = res.result;
          }
        })
        getAction(this.url.ywMonthCountInfo, params).then((res) => {
          if (res.success) {
            this.ywCountSource = res.result;
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
