<template>
  <!-- 我的问题 -->
  <common-list :source="1" :listUrl="url.list"></common-list>
</template>

<script>
import CommonList from './modules/CommonList.vue'
export default {
    name: "EventsList",
    components: { CommonList },
    data() {
      return {
        url: {
          list: '/sys/problem/myList'
        }
      }
    }
}
</script>