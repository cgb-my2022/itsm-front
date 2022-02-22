<template>
  <!-- 我的变更 -->
  <common-list :source="1" :listUrl="listUrl"></common-list>
</template>

<script>
import CommonList from './modules/CommonList.vue'
export default {
    name: "EventsList",
    components: { CommonList },
    data() {
        return {
          listUrl: '/sys/problem/dealList'
      }
    }
}
</script>