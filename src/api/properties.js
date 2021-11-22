import { getAction, deleteAction, putAction, postAction, httpAction } from '@/api/manage'

// const defaultProperties = (params)=>postAction("/sys/role/add",params);
// const editRole = (params)=>putAction("/sys/role/edit",params);
// const checkRoleCode = (params)=>getAction("/sys/role/checkRoleCode",params);
// const deleteLog = (params)=>deleteAction("/sys/log/delete",params);

// 获取公共属性列表、自定义属性列表
const defaultProperties = (params)=>getAction("/cmdb/resourceAttr/getResourceAttrInfo",params);
const addProperties = (params)=>postAction("/cmdb/resourceAttr/newAddResourceAttrInfo",params);
const delProperties = (params)=>deleteAction("/cmdb/resourceAttr/delResourceAttrInfo",params);
const delModeProperties = (params)=>deleteAction("/cmdb/resourceAttr/delResourceAttrInfos",params);
const editProperties = (params)=>putAction("/cmdb/resourceAttr/reviseResourceAttrInfo",params);
const connecetProperties = (params)=>getAction("/cmdb/resourceAttr/getAssociateResourceType",params);

export {
    defaultProperties,
    addProperties,
    delProperties,
    delModeProperties,
    editProperties,
    connecetProperties
}