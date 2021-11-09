<template>
  <a-card class="j-address-list-right-card-box" :bordered="false">
    <div class="table-page-search-wrapper">
        <h2 class="r-h2">业务流程关联</h2>
    </div>

    <a-table
      ref="table"
      size="middle"
      bordered
      rowKey="id"
      :columns="columns"
      :dataSource="dataSource"
      :loading="loading">
    </a-table>

  </a-card>
</template>

<script>
  import { getServiceProcess } from '@/api/api'
  import { mapGetters } from 'vuex'
  export default {
    name: 'ServiceRight',
    props: ['value'],
    data() {
      return {
        loading: false,
        dataSource: [],
        columns: [
          {
            title: '#',
            key: 'rowIndex',
            dataIndex: '',
            width: 60,
            align: 'center',
            customRender: (t, r, i) => parseInt(i) + 1
          },
          {
            title: '流程名称',
            width: '40%',
            align: 'center',
            dataIndex: 'process_name'
          },
          {
            title: '流程编码',
            width: '40%',
            align: 'center',
            dataIndex: 'process_key'
          }
        ]
      }
    },
    watch: {
      catalogId: {
        immediate: true,
        handler(id) {
          if(id) {
            this.getList()
          }
        }
      },
    },
    computed: {
      ...mapGetters(["catalogId"])
    },
    methods: {
      // 查询职务信息
      getList() {
        this.loading = true
        getServiceProcess({
          id: this.catalogId
        }).then(res => {
          this.loading = false;
          if (res.code === 200) {
            this.dataSource = res.result
          }
        }).finally(() => {
          this.loading = false
          return '';
        })
      }
    }
  }
</script>
<style>
  .j-address-list-right-card-box .ant-table-placeholder {
    min-height: 46px;
  }
</style>
<style scoped>
    .j-address-list-right-card-box {
        height: 100%;
        min-height: 300px;
    }
    .r-h2 {
        font-size: 16px;
        margin-bottom: 16px;
    }
</style>