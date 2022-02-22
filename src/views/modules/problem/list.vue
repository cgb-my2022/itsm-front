<template>
  <!-- 问题列表 -->
  <common-list :source="2" :listUrl="url.list"></common-list>
</template>

<script>
import CommonList from './modules/CommonList.vue'
export default {
    name: "EventsList",
    components: { CommonList },
    data() {
        return {
          url: {
            list: '/sys/problem/supList'
          }
        }
    }
}
</script>