import { getServiceCat } from '@/api/api'
import { mapGetters } from 'vuex'
import pick from 'lodash.pick'

export const ServiceMixin = {
    data() {
        return {
            // 服务目录搜索条件
            delFlag: 0,         // 删除状态 (0-> 未删除 2-> 全部)
            permissions: 2,     // 权限 (1-> 公有 2-> 全部)
            serviceCatName: [],
            quickCatName: [],
            // 查询的业务类型(查询全部的目录)可选择任意一级
            serviceOptions: [],
            quickOptions: [],
            // 请求目录的类型(查询所有公有的)必须选到最后一级
            catalogOptions: [],
            rowInfo: {
                serviceCatId: "",  //服务目录id
                serviceCatIds: "",  //每一级别的id
                serviceCatFullName: "", // 服务目录全级名称
            }
        }
    },
    computed: {
        ...mapGetters(["userInfo"]),
        setRealname() {
            return function(arr, status) {
              if(arr.indexOf(status) != -1) {
                return true
              }
              return false
            }
        }
    },
    methods: {
        /**
         * 获取全部的服务目录
         *  @param type (1:搜索的 2:请求目录 3:快速发起)  
         **/ 
        getCatalog(type=1) {
            this.permissions = type === 2 ? 1 : 2
            let params = {
                delFlag: this.delFlag,
                permissions: this.permissions
            }
            getServiceCat(params).then(res =>{
                if (res.success) {
                    const result = res.result
                    if (type === 1) {
                        this.serviceOptions = result
                    } else if (type === 2) {
                        this.catalogOptions = result
                    } else if (type === 3) {
                        this.quickOptions = result
                    }
                }
            })
        },
        /**
         * 获取指定级别
         * @param {最大级别} maxLevel 
         * @param {权限 (1-> 公有 2-> 全部)} permissions 
         */
        getCatalogLevel(maxLevel=2, permissions=2) {
            return new Promise(resolve => {
                getServiceCat({maxLevel, permissions}).then(res =>{
                    if (res.success) {
                        const result = res.result || []
                        resolve(result)
                    }
                })
            })
        },
        // 业务请求回显
        showCatalog(item) {
            let fieldval = pick(this.model)
            fieldval.serviceCatIds = JSON.parse(item.serviceCatIds)
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
        // 选择服务目录处理数据
        catalogChange(value, selectedOptions) {
            const len = value.length
            const orderType = this.rowInfo.orderType
            let info = {}
            if(len > 0) {
                info.serviceCatIds = JSON.stringify(value)
                info.serviceCatId = value[len - 1]
                let serviceCatFullName = ""
                selectedOptions.forEach((item, index) => {
                    serviceCatFullName += item.catName
                    if (index < (len -1)) {
                        serviceCatFullName += "/"
                    }
                });
                info.serviceCatFullName = serviceCatFullName
                if (orderType === 2) {
                    info.eventContent = selectedOptions[len - 1].catName
                }
            } else {
                info.serviceCatIds = ""
                info.serviceCatId = ""
                info.serviceCatFullName = ""
                if (orderType === 2) {
                    info.eventContent = ""
                }
            }
            Object.keys(info).forEach(item => {
                this.rowInfo[item] = info[item]
            })
        },
        // 过滤服务目录
        filter(inputValue, path) {
            return path.some(option => option.title.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
        },
        // 搜索change
        serviceChange(value, selectedOptions) {
            const serviceCatId = value.length > 0 ? value[value.length - 1] : ""
            this.queryParam.serviceCatId = serviceCatId
        },
        //表单重置
        bindReset() {
            this.serviceCatName = []
            this.searchReset()
        },
        // 弹框方法
        handleSubmit: function (title, ref) {
            this.$refs[ref].add();
            this.$refs[ref].title = title;
            this.$refs[ref].disableSubmit = false;
        }
    }
}