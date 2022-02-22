<template>
  <!-- 问题办理 -->
  <common-list :source="3" :listUrl="url.list"></common-list>
</template>

<script>
import CommonList from './modules/CommonList.vue'
export default {
    name: "EventsList",
    components: { CommonList },
    data() {
        return {
          url: {
            list: '/sys/problem/dealList'
          }  
      }
    }
}
</script>