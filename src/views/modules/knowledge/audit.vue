<template>
    <!-- 知识审核 -->
    <page-common :source="3" :url="url" :columnsDifferent="columns"></page-common>
</template>

<script>
import PageCommon from './common/PageCommon'
export default {
    components: { PageCommon },
    data() {
        return {
            url: {
                list: '/know/knowledgeManage/manageList'
            },
            columns: [
                {
                    title: '状态',
                    width: 120,
                    align: 'center',
                    dataIndex: 'status',
                    sorter: true,
                    scopedSlots: { customRender: 'status' }
                },
                {
                    title: '常用',
                    align: 'center',
                    width: 100,
                    dataIndex: 'commonUse',
                    scopedSlots: { customRender: 'commonUse' }
                },
                {
                    title: '操作',
                    dataIndex: 'action',
                    align: 'center',
                    width: 210,
                    fixed: 'right',
                    scopedSlots: { customRender: 'action' },
                }
            ]
        }
    },
}
</script>