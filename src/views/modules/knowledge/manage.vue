<template>
    <!-- 知识管理 -->
    <page-common :url="url" :columnsDifferent="columns"></page-common>
</template>

<script>
import PageCommon from './common/PageCommon'
export default {
    components: { PageCommon },
    data() {
        return {
            url: {
                list: '/know/knowledgeInfo/infoList'
            },
            columns: [
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
                    scopedSlots: { customRender: 'commonUse' }
                },
                {
                    title: '操作',
                    dataIndex: 'action',
                    align: 'center',
                    width: 180,
                    fixed: 'right',
                    scopedSlots: { customRender: 'action' },
                }
            ]
        }
    },
}
</script>