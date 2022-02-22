<template>
    <a-modal
    :title="title"
    :width="450"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :okButtonProps="{ props: {disabled: disableSubmit} }"
    disableSubmit
    @ok="handleOkConfirm"
    @cancel="handleCancel"
    cancelText="关闭">
        <a-spin :spinning="confirmLoading">
            <!-- 主表单区域 -->
            <a-form :form="form">
                <a-row>
                    <a-col :span="24">
                        <a-form-item label="目录名称" :labelCol="labelCol1" :wrapperCol="wrapperCol1">
                            <a-input v-decorator="['catName', { initialValue: rowInfo.catName || '', rules: [{ required: true, message: '请输入目录名称(有效长度1-15)' }] }]" :maxLength="15" placeholder="请输入目录名称(有效长度1-15)"></a-input>
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-form>
        </a-spin>
    </a-modal>
</template>

<script>
import { postAction, putAction } from '@/api/manage'
import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
import ARow from 'ant-design-vue/es/grid/Row'
import pick from 'lodash.pick'
export default {
    name: "ServiceInfo",
    props: {
        paramsInfo: {
            type: Object,
        },
        rowInfo: {
            type: Object,
        }
    },
    mixins: [JEditableTableMixin],
    components: { ARow },
    data() {
        return {
            disableSubmit: false,
            refKeys: ['serviceOrderAttach' ],
            labelCol1: {
                xs: { span: 24 },
                sm: { span: 6 }
            },
            wrapperCol1: {
                xs: { span: 24 },
                sm: { span: 18 }
            },
            disabled: false,
            addDefaultRowNum: 1,
            urls: {
                treeAdd: '/know/knowledgeCat/add', // 分类新增
                treeEdit: '/know/knowledgeCat/edit', // 分类编辑
            }
        }
    },
    methods: {
         /** 调用完edit()方法之后会自动调用此方法 */
        editAfter() {
            let fieldval = pick(
                this.model,
                'catName',
            )
            this.$nextTick(() => {
                this.form.setFieldsValue(fieldval)
            })
        },
        // 提交
        handleOkConfirm(e) {
            e.preventDefault();
            this.form.validateFields((err, values) => {
                if (!err) {
                   this.requestMethods(values)
                }
            });
        },
        requestMethods(values){
            this.confirmLoading = true
            let params = Object.assign({}, this.paramsInfo, values) 
            const axo = this.paramsInfo.id ? 
                putAction(this.urls.treeEdit, params) :
                postAction(this.urls.treeAdd, params)
            axo.then(res => {
                this.confirmLoading = false
                if (res.success) {
                    this.visible = false
                    this.$emit('closeLoad')
                } else {
                    this.$message.warning(res.message)
                }
            }).finally(() => {
                this.confirmLoading = false
                return '';
            })
        }
    }
}
</script>