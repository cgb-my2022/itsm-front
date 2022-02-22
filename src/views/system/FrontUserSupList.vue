<template>
  <!-- 一线运维主管 -->
  <sup-common role="FRONTLINE_SUP" :url="url" title="一线运维主管"></sup-common>
</template>

<script>
import SupCommon from './modules/SupCommon.vue'
export default {
  components: { SupCommon },
  data() {
    return {
      url: {
        list: '/sys/user/frontSuplist'
      }   
    }
  }
}
</script>