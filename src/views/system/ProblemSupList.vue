<template>
  <!-- 问题经理 -->
  <sup-common role="PROBLEM_SUP" :url="url" title="问题经理"></sup-common>
</template>

<script>
import SupCommon from './modules/SupCommon.vue'
export default {
  components: { SupCommon },
  data() {
    return {
      url: {
        list: '/sys/user/userListByRole'
      }   
    }
  }
}
</script>