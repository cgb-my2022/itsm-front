<template>
  <!-- 变更审批 -->
  <common-list :source="2" :listUrl="listUrl"></common-list>
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