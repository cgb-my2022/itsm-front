import { getAction, deleteAction, putAction, postAction, httpAction } from '@/api/manage'

// const defaultProperties = (params)=>postAction("/sys/role/add",params);
// const editRole = (params)=>putAction("/sys/role/edit",params);
// const checkRoleCode = (params)=>getAction("/sys/role/checkRoleCode",params);
// const deleteLog = (params)=>deleteAction("/sys/log/delete",params);

// 获取tree
const resourceTree = (params)=>getAction("/cmdb/resourceType/getResourceTypeInfoByTree",params);
const addResource = (params)=>postAction("/cmdb/resourceType/newAddResourceTypeInfo",params);
const editResource = (params)=>putAction("/cmdb/resourceType/reviseResourceTypeInfos",params);
const infoResource = (params)=>getAction("/cmdb/resourceType/getResourceTypeInfoById",params);
const delResource = (params)=>deleteAction("/cmdb/resourceType/removeResourceTypeInfo",params);
const delModeResource = (params)=>deleteAction("/cmdb/resourceType/removeResourceTypeInfos",params);
const searchResource = (params)=>getAction("/cmdb/resourceType/getResourceTypeInfo",params);

export {
    resourceTree,
    addResource,
    infoResource,
    editResource,
    delResource,
    delModeResource,
    searchResource
}