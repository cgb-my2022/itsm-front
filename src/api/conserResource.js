import { getAction, deleteAction, putAction, postAction, downFile, uploadAction } from '@/api/manage'

// const defaultProperties = (params)=>postAction("/sys/role/add",params);

const getIntTree = (params)=>getAction("/cmdb/resourceType/getResourceTypeInfoByTree",params);
const searchIntTree = (params)=>getAction("/cmdb/resourceType/getResourceTypeInfo",params);
const getTreeIdInfo = (params)=>getAction("/cmdb/resource/getResourceInfoListById",params);
// 新增获取资源类型
const getAddDetail = (params)=>getAction("/cmdb/resource/getFrontAttrInfo",params);
// 新增确定按钮
const AddResource = (params)=>postAction("/cmdb/resource/newAddResource",params);
const detailResource = (params)=>getAction("/cmdb/resource/getResourceInfoById",params);
const editResource = (params)=>putAction("/cmdb/resource/updateResourceInfoById",params);
// 删除
const delResource = (params)=>deleteAction("/cmdb/resource/deleteResourceInfo",params);
const delModeResource = (params)=>deleteAction("/cmdb/resource/deleteResourceInfos",params);
// 查询变更历史
const searchResourceHis = (params)=>getAction("/cmdb/resource/getHistoryInfoList",params);
// 关联资源
const searchResourceAsso = (params)=>getAction("/cmdb/resourceAttr/getAssociateResourceType",params);
// 导出
const outResource = (params)=>downFile("/cmdb/resource/exportXls",params);
// 下载模板
const downResource = (params)=>downFile("/cmdb/resource/importTemplate",params);
// 导入数据
const importResource = (params)=>getAction("/cmdb/resource/importExcel",params);


export {
    getIntTree,
    searchIntTree,
    getTreeIdInfo,
    getAddDetail,
    AddResource,
    detailResource,
    delResource,
    delModeResource,
    editResource,
    searchResourceHis,
    searchResourceAsso,
    outResource,
    downResource,
    importResource
}