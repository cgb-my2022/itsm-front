
// 服务请求的公共列表表头
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { ServiceMixin } from './ServiceMixin'
import JDictSelectTag from '@/components/dict/JDictSelectTag.vue'
import JDate from '@/components/jeecg/JDate.vue'
import '@/assets/less/TableExpand.less'
import StaffServiceOrderModal from '../staff/modules/StaffServiceOrderModal'
import ServiceProcessInstPicModal from '../common/ServiceProcessInstPicModal'
import ServiceTaskDealModal from '../common/ServiceTaskDealModal'
import ServiceTaskDetailModal from '../common/ServiceTaskDetailModal'
export const ServiceColumns = {
    mixins: [JeecgListMixin, ServiceMixin],
    components: {
        JDictSelectTag,
        JDate,
        StaffServiceOrderModal,
        ServiceProcessInstPicModal,
        ServiceTaskDealModal,
        ServiceTaskDetailModal,
      },
    data() {
        return {
            // 表头
            columns: [
                {
                    title: '编号',
                    dataIndex: 'id',
                    align: 'center',
                    width: 190,
                },
                {
                    title: '请求内容',
                    dataIndex: 'eventContent',
                    ellipsis: true,
                    align: 'center',
                },
                {
                    title: '所属业务',
                    align: 'center',
                    ellipsis: true,
                    dataIndex: 'serviceCatFullName',
                },
                {
                    title: '优先级',
                    align: 'center',
                    dataIndex: 'serviceLevel',
                    width: 140,
                    sorter: true,
                    scopedSlots: { customRender: 'serviceLevel' },
                },
                {
                    title: '工单状态',
                    align: 'center',
                    dataIndex: 'orderStatus_dictText',
                    width: 140,
                    scopedSlots: { customRender: 'status' },
                },
                {
                    title: '发起人',
                    align: 'center',
                    dataIndex: 'realName',
                },
                {
                    title: '发起公司/园区',
                    align: 'center',
                    dataIndex: 'deptName',
                    ellipsis: true,
                },
                {
                    title: '创建日期',
                    align: 'center',
                    sorter: true,
                    dataIndex: 'createTime',
                },
                {
                    title: '处理人',
                    align: 'center',
                    dataIndex: 'frontlineUserRealname',
                    scopedSlots: { customRender: 'realname' },
                },
                {
                    title: '操作',
                    dataIndex: 'action',
                    align: 'center',
                    fixed: 'right',
                    width: 150,
                    scopedSlots: { customRender: 'action' },
                }
            ],
            optionLevel: []
        }
    },
    created() {
        this.setDic("service_level", 'optionLevel')
        this.getCatalog()
    },
    computed: {
        importExcelUrl: function () {
            return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
        },
        // 处理人
        setRealname() {
            return function (arr, status) {
            if (arr.indexOf(status) != -1) {
                return true
            }
            return false
            }
        },
        // 根据等级id设置等级
        setLevel() {
            return function (text) {
                if (this.dictOptions.length > 0) {
                    const findItem = this.optionLevel.find(item => item.value == text)
                    return findItem.text || findItem.title
                } else {
                    return ""
                }
            }
        },
    }
}