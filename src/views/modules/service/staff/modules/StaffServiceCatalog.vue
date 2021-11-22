<template>
    <a-modal
    :title="title"
    :width="600"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOkConfirm"
    @cancel="handleCancel"
    cancelText="关闭">
        <a-spin :spinning="confirmLoading">
            <!-- 主表单区域 -->
            <a-form :form="form">
                <a-row>
                    <a-col :span="24" v-if="mostService.length > 0">
                        <a-form-item label="最常请求" :labelCol="labelCol1" :wrapperCol="wrapperCol1">
                            <template v-for="item in mostService">
                                <a-tag :key="item.serviceCatId" @click="checkTag(item)">
                                    {{item.catName}}
                                </a-tag>
                            </template>
                        </a-form-item>
                    </a-col>
                    <a-col :span="24">
                        <a-form-item label="请求目录" :labelCol="labelCol1" :wrapperCol="wrapperCol1">
                            <a-cascader 
                                placeholder="请选择"  
                                :field-names="{ label: 'title', value: 'id', children: 'children' }"
                                :show-search="{ filter }"
                                v-decorator="['catalogCatName', {
                                    rules: [{ required: true, message: '请选择请求目录!' }]
                                }]"
                                autocomplete="off"
                                :options="catalogOptions"
                                @change="catalogChange" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="24">
                        <a-form-item label="目录描述" :labelCol="labelCol1" :wrapperCol="wrapperCol1">
                            <div class="des-catalog">暂无相关知识</div>
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-form>
        </a-spin>
    </a-modal>
</template>

<script>
import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
import { ServiceMixin } from '../mixins/ServiceMixin'
import ARow from 'ant-design-vue/es/grid/Row'
import {  postAction, getAction } from '@/api/manage'
import pick from 'lodash.pick'
export default {
    name: "StaffServiceCatalog",
    mixins: [JEditableTableMixin, ServiceMixin],
    components: { ARow },
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
            url: {
                add: '/system/serviceOrder/addAndSubmit',
                mostServiceCat: '/system/serviceOrder/mostServiceCat'
            },
            rowInfo: {
                orderType: 2,
                eventContent: "" //事件内容
            },
            mostService: []
        }
    },
    created() {
        this.getServiceCat()
        this.getCatalog(2)
    },
    methods: {
        // 获取常用请求
        getServiceCat() {
            getAction(this.url.mostServiceCat).then(res => {
                if(res.code === 200) {
                    this.mostService = res.result
                }
            })
        },
        // 选择常用请求
        checkTag(item) {
            let fieldval = pick(this.model)
            fieldval.catalogCatName = JSON.parse(item.serviceCatIds)
            this.$nextTick(() => {
                this.form.setFieldsValue(fieldval)
                const info = {
                    serviceCatIds: item.serviceCatIds,
                    serviceCatId: item.serviceCatId,
                    serviceCatFullName: item.serviceCatFullName,
                    eventContent: item.catName
                }
                Object.keys(info).forEach(item => {
                    this.rowInfo[item] = info[item]
                })
            })
        },
        // 提交
        handleOkConfirm(e) {
            e.preventDefault();
            this.form.validateFields((err, values) => {
                if (!err) {
                    this.confirmLoading = true
                    const { id, username, realname, phone, myDeptParentNames,orgCode, workplaceDeptParentIdes, workplaceDetail } = this.userInfo
                    if (!workplaceDeptParentIdes || workplaceDeptParentIdes.length === 0) {
                        this.$message.warning("工作地点未设置")
                        return;
                    }
                    const userParams = {
                        userId: id,
                        userName: username,  //账户
                        realName: realname,  //真实姓名
                        phoneNo: phone,    //电话号码
                        deptName: myDeptParentNames,  //部门名称
                        sysOrgCode: orgCode, //所属部门
                        workplaceDepartids: workplaceDeptParentIdes ? JSON.parse(workplaceDeptParentIdes).slice(0, 2) : [], //工作地点部门级联id
                        workplaceDetail: workplaceDetail  //详细工作地点
                    }
                    const params = Object.assign({}, this.rowInfo, userParams)
                    postAction(
                        this.url.add, 
                        params
                    ).then(res => {
                        this.confirmLoading = false
                        if (res.success) {
                            this.$message.success(res.message)
                            this.$emit('closeLoad')
                            this.close()
                        } else {
                            this.$message.warning(res.message)
                        }
                    }).finally(() => {
                        this.confirmLoading = false
                        return '';
                    })
                }
            });
        }
    }
}
</script>

<style scoped>
.des-catalog {
    font-size: 12px;
}
</style>