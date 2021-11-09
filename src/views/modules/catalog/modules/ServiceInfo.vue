<template>
    <a-modal
    :title="title"
    :width="600"
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
                            <a-input v-decorator="['catName', { initialValue: rowInfo.catName || '', rules: [{ required: true, message: '请输入目录名称!' }] }]" :maxLength="30" placeholder="请输入目录名称(有效长度1-30)"></a-input>
                        </a-form-item>
                    </a-col>
                    <a-col :span="24">
                        <a-form-item label="目录描述" :labelCol="labelCol1" :wrapperCol="wrapperCol1">
                            <a-textarea v-decorator="['catInfo', { initialValue: rowInfo.catInfo || '' }]" rows="4" :maxLength="300"  placeholder="请输入目录描述(有效长度1-300)"/>
                        </a-form-item>
                    </a-col>
                    <a-col :span="24">
                        <a-form-item label="服务目录权限" :labelCol="labelCol1" :wrapperCol="wrapperCol1">
                            <a-radio-group :disabled="disabled" name="radioGroup" v-decorator="['permission', {initialValue:  permission}]">
                                <a-radio :value="1">公有</a-radio>
                                <a-radio :value="0">私有</a-radio>
                            </a-radio-group>
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-form>
        </a-spin>
    </a-modal>
</template>

<script>
import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
import ARow from 'ant-design-vue/es/grid/Row'
import { addServiceCat, putServiceCat, getServiceInfo } from '@/api/api'
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
    watch: {
       paramsInfo: {
            handler(newVal) {
                if (newVal.catLevel !== 1) {
                    this.initPermission()   
                } else {
                    this.disabled = false
                    this.permission = 1
                }
            },
            immediate: true
        }
    },
    data() {
        return {
            disableSubmit: false,
            refKeys: ['serviceOrderAttach' ],
            labelCol1: {
                xs: { span: 24 },
                sm: { span: 4 }
            },
            wrapperCol1: {
                xs: { span: 24 },
                sm: { span: 20 }
            },
            addDefaultRowNum: 1,
            disabled: false,
            permission: 1
        }
    },
    methods: {
        // 获取父级权限
        initPermission() {
            const parentId = this.paramsInfo.parentId
            if (parentId) {
                this.confirmLoading = true
                getServiceInfo({id: parentId})
                    .then(res => {
                        if (res.code === 200) {
                            const permission = res.result.permission
                            this.disabled = permission === 0 ? true : false
                            if (this.paramsInfo.id) {
                                this.permission = this.rowInfo.permission
                            } else {
                                this.permission = permission
                            }
                            this.confirmLoading = false
                        }
                    })
                    .finally(() => {
                        this.confirmLoading = false
                    })
            } else {
                this.disabled = false
            }
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
                putServiceCat(params) :
                addServiceCat(params)
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