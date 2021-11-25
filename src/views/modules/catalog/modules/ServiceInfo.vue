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
                        <a-form-item label="关联流程" :labelCol="labelCol1" :wrapperCol="wrapperCol1">
                            <div style="display:flex;">
                                <a-input
                                autocomplete="off"
                                @click="handleSelect"
                                placeholder="点击选择关联流程"
                                v-decorator="['processName', {
                                    initialValue: rowInfo.processName || '',
                                    rules: [{ required: true, message: '请选择关联流程!' }]
                                }]">
                                </a-input>
                                <a-button icon="search" @click="handleSelect">选择</a-button>
                            </div>
                        </a-form-item>
                    </a-col>
                    <a-col :span="24">
                        <a-form-item label="调用权限" :labelCol="labelCol1" :wrapperCol="wrapperCol1">
                            <a-radio-group :disabled="disabled" name="radioGroup" v-decorator="['permission', {initialValue:  permission,  rules: [{ required: true, message: '请选择调用权限!' }] }]">
                                <a-radio :value="1" style="margin:10px 0;">公有</a-radio><br/>
                                <a-radio :value="0">
                                    <span>私有</span>
                                    <span class="radio-txt">通过服务目录发起服务请求时，不可使用！</span>
                                </a-radio>
                            </a-radio-group>
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-form>
        </a-spin>
        <associated-process ref="associatedProcess" @selectFinished="selectFinished"></associated-process>
    </a-modal>
</template>

<script>
import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
import ARow from 'ant-design-vue/es/grid/Row'
import { addServiceCat, putServiceCat, getServiceInfo } from '@/api/api'
import AssociatedProcess from './AssociatedProcess'
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
    components: { ARow, AssociatedProcess },
    watch: {
       paramsInfo: {
            handler(newVal) {
                if (newVal.catLevel !== 1) {
                    this.initPermission()   
                } else {
                    this.disabled = false
                    this.permission = newVal.id ? this.rowInfo.permission : 1
                }
                Object.keys(this.selectInfo).forEach(item => {
                    this.selectInfo[item] = newVal.id ? this.rowInfo[item] : ""
                })
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
            permission: 1,
            selectInfo: {
                processId: '', 
                processName: '', 
                processRelationCode: ''
            }
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
        // 选择关联流程
        handleSelect(e) {
            e.srcElement.blur()
            this.$refs.associatedProcess.select(this.selectInfo.processId);
        },
        selectFinished(data) {
            this.selectInfo = JSON.parse(JSON.stringify(data))
            this.form.setFieldsValue({
                processName: data.processName
            })
        },
         /** 调用完edit()方法之后会自动调用此方法 */
        editAfter() {
            let fieldval = pick(
                this.model,
                'catName',
                'processName',
                'catInfo'
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
            let params = Object.assign({}, this.paramsInfo, values, this.selectInfo) 
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

<style scoped>
.radio-txt {
    display: inline-block;
    margin-left: 10px;
    color: #FEC7A0;
}
</style>