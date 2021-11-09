<template>
  <a-row type="flex" :gutter="16">
    <a-col :md="5" :sm="24">
      <service-left v-model="currentOrgCode"/>
    </a-col>
    <a-col :md="24-5" :sm="24">
      <service-right v-model="currentOrgCode"/>
    </a-col>
  </a-row>
</template>

<script>
  import ServiceLeft from './modules/ServiceLeft'
  import ServiceRight from './modules/ServiceRight'

  export default {
    name: 'AddressList',
    components: { ServiceLeft, ServiceRight },
    data() {
      return {
        description: '服务目录页面',
        currentOrgCode: ''
      }
    },

    methods: {}
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>