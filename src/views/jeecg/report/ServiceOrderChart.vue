<template>
  <a-card :bordered="false">
    <a-tabs defaultActiveKey="1">
      <!-- 柱状图 -->
      <a-tab-pane tab="人员统计" key="1">
       <service-order-user-chart></service-order-user-chart>
      </a-tab-pane>
      <!-- 多列柱状图 -->
      <a-tab-pane tab="来源统计" key="2">
        <service-order-origon-chart></service-order-origon-chart>
      </a-tab-pane>
      <a-tab-pane tab="响应时间" key="3">
        <service-order-yw-deal-time-chart></service-order-yw-deal-time-chart>
      </a-tab-pane>
      <a-tab-pane tab="完成状态" key="4">
        <service-order-completion-chart></service-order-completion-chart>
      </a-tab-pane>
      <a-tab-pane tab="业务汇总" key="5">
        <service-order-problem-chart></service-order-problem-chart>
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<script>
  import ServiceOrderOrigonChart from './ServiceOrderOrigonChart'
  import ServiceOrderUserChart from './ServiceOrderUserChart'
  import ServiceOrderYwDealTimeChart from './ServiceOrderYwDealTimeChart'
  import ServiceOrderCompletionChart from './ServiceOrderCompletionChart'
  import ServiceOrderProblemChart from './ServiceOrderProblemChart'

  export default {
    name: 'ViserChartDemo',
    components: {
      ServiceOrderUserChart,
      ServiceOrderOrigonChart,
      ServiceOrderYwDealTimeChart,
      ServiceOrderCompletionChart,
      ServiceOrderProblemChart
    },
    data() {
      return {
      }
    },
    created() {
    },
    methods: {
    }
  }
</script>

<style scoped>

</style>
