<template>
  <!-- 变更审批 -->
  <common-list :source="2" :listUrl="listUrl" :columnsDifferent="columns"></common-list>
</template>

<script>
import CommonList from './modules/CommonList.vue'
export default {
  name: 'EventsList',
  components: { CommonList },
  data() {
    return {
      listUrl: '/sys/change/dealList',
      columns: [
        {
          title: '创建时间',
          align: 'center',
          width: 200,
          sorter: true,
          dataIndex: 'createTime',
        },
        {
          title: '结束时间',
          align: 'center',
          width: 200,
          sorter: true,
          dataIndex: 'solTime',
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          width: 180,
          fixed: 'right',
          scopedSlots: { customRender: 'action' },
        },
      ],
    }
  },
}
</script>