<template>
    <!-- 知识发布 -->
    <page-common :source="4" :url="url" :columnsDifferent="columns"></page-common>
</template>

<script>
import PageCommon from './common/PageCommon'
export default {
    components: { PageCommon },
    data() {
        return {
            url: {
                list: '/know/knowledgeManage/myManageList'
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
                    title: '点赞数',
                    width: 100,
                    align: 'center',
                    sorter: true,
                    dataIndex: 'star',
                },
                {
                    title: '常用',
                    align: 'center',
                    width: 100,
                    dataIndex: 'commonUse',
                    sorter: true,
                    scopedSlots: { customRender: 'commonUse' }
                },
                {
                    title: '操作',
                    dataIndex: 'action',
                    align: 'center',
                    width: 220,
                    fixed: 'right',
                    scopedSlots: { customRender: 'action' },
                }
            ]
        }
    },
}
</script>