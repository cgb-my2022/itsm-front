/**
 * 新增修改完成调用 modalFormOk方法 编辑弹框组件ref定义为modalForm
 * 高级查询按钮调用 superQuery方法  高级查询组件ref定义为superQueryModal
 * data中url定义 list为查询列表  delete为删除单条记录  deleteBatch为批量删除
 */
import { filterObj } from '@/utils/util';
import { deleteAction, getAction, downFile, getFileAccessHttpUrl } from '@/api/manage'
import Vue from 'vue'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { ajaxGetDictItems, getDictItemsFromCache, ajaxGetCategoryItems } from '@/api/api'
// 发布知识使用
import KnowledgeInfo from '@/views/modules/service/common/KnowledgeInfo.vue'

export const JeecgListMixin = {
  components: { KnowledgeInfo },
  data() {
    return {
      // token header
      tokenHeader: { 'X-Access-Token': Vue.ls.get(ACCESS_TOKEN) },
      /* 查询条件-请不要在queryParam中声明非字符串值的属性 */
      queryParam: {},
      /* 数据源 */
      dataSource: [],
      /* 分页参数 */
      ipagination: {
        current: 1,
        pageSize: 10,
        pageSizeOptions: ['10', '20', '30'],
        showTotal: (total, range) => {
          return range[0] + '-' + range[1] + ' 共' + total + '条'
        },
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0
      },
      /* 排序参数 */
      isorter: {
       /* column: 'createTime',
        order: 'desc'*/
      },
      /* 筛选参数 */
      filters: {},
      /* table加载状态 */
      loading: false,
      /* table选中keys */
      selectedRowKeys: [],
      /* table选中records */
      selectionRows: [],
      /* 查询折叠 */
      toggleSearchStatus: false,
      /* 高级查询条件生效状态 */
      superQueryFlag: false,
      /* 高级查询条件 */
      superQueryParams: '',
      /** 高级查询拼接方式 */
      superQueryMatchType: 'and'
    }
  },
  created() {
      if (!this.disableMixinCreated) {
        console.log(' -- mixin created -- ')
        this.loadData();
        // 初始化字典配置 在自己页面定义
        this.initDictConfig();
      }
  },
  methods: {
    /**
     * 获取数据字典的内容
     * @param {*} dictCode 数据字典的key
     * @param {*} obj       data对应的key
     * @param {*} type      对应数据字典数据的取值对象   0：sysAllDictItems  1：sysAllCategoryItems
     * @returns 
     */
    setDic(dictCode, obj="dictOptions", type=0) {
      let data = {}
      //优先从缓存中读取字典配置
      if (getDictItemsFromCache(dictCode, type)) {
        if (type === 0) {
          data[obj] = getDictItemsFromCache(dictCode, type)
        } else if (type === 1){
          data[obj] = getDictItemsFromCache(dictCode, type).children
        }
        Object.assign(this, data)
        return
      }
      //根据字典Code, 初始化字典数组
      if (type === 0) {
        ajaxGetDictItems(dictCode, null).then((res) => {
          if (res.success) {
            data[obj] = res.result
            Object.assign(this, data)
          }
        })
      } else if (type === 1) {
        ajaxGetCategoryItems().then((res) => {
          if (res.success) {
            data[obj] = res.result[dictCode].children
            Object.assign(this, data)
          }
        })
      }  
    },
    // 过滤
    filter(inputValue, path) {
      return path.some((option) => option.title.toLowerCase().indexOf(inputValue.toLowerCase()) > -1)
    },
    // 初始化列表数据
    loadData(arg) {
      if (!this.url.list) {
        this.$message.error('请设置url.list属性!')
        return
      }
      // 加载数据 若传入参数1则加载第一页的内容
      if (arg === 1) {
        this.ipagination.current = 1;
      }
      var params = this.getQueryParams();// 查询条件
      this.loading = true;
      getAction(this.url.list, params).then((res) => {
        if (res.success) {
          this.dataSource = res.result.records;
          this.ipagination.total = res.result.total;
        }
        if (res.code === 510) {
          this.$message.warning(res.message)
        }
        this.loading = false;
      })
    },
    //多选搜索过滤
    searchFilterTreeNode(inputValue, treeNode){
      return (
        treeNode.componentOptions.propsData.title.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
      );
    },
    initDictConfig() {
      console.log('--这是一个假的方法!')
    },
    handleSuperQuery(params, matchType) {
      // 高级查询方法
      if (!params) {
        this.superQueryParams = ''
        this.superQueryFlag = false
      } else {
        this.superQueryFlag = true
        this.superQueryParams = JSON.stringify(params)
        this.superQueryMatchType = matchType
      }
      this.loadData(1)
    },
    getQueryParams() {
      // 获取查询条件
      let sqp = {}
      if (this.superQueryParams) {
        sqp['superQueryParams'] = encodeURI(this.superQueryParams)
        sqp['superQueryMatchType'] = this.superQueryMatchType
      }
      var param = Object.assign(sqp, this.queryParam, this.isorter, this.filters);
      param.field = this.getQueryField();
      param.pageNo = this.ipagination.current;
      param.pageSize = this.ipagination.pageSize;
      return filterObj(param);
    },
    getQueryField() {
      // TODO 字段权限控制
      var str = 'id,';
      this.columns.forEach(function (value) {
        str += ',' + value.dataIndex;
      });
      return str;
    },

    onSelectChange(selectedRowKeys, selectionRows) {
      this.selectedRowKeys = selectedRowKeys;
      this.selectionRows = selectionRows;
    },
    onClearSelected() {
      this.selectedRowKeys = [];
      this.selectionRows = [];
    },
    searchQuery() {
      this.loadData(1);
    },
    superQuery() {
      this.$refs.superQueryModal.show();
    },
    searchReset() {
      this.queryParam = {}
      this.loadData(1);
    },
    batchDel: function () {
      if (!this.url.deleteBatch) {
        this.$message.error('请设置url.deleteBatch属性!')
        return
      }
      if (this.selectedRowKeys.length <= 0) {
        this.$message.warning('请选择一条记录！');
      } else {
        var ids = '';
        for (var a = 0; a < this.selectedRowKeys.length; a++) {
          ids += this.selectedRowKeys[a] + ',';
        }
        var that = this;
        this.$confirm({
          title: '确认删除',
          content: '是否删除选中数据?',
          onOk: function () {
            that.loading = true;
            deleteAction(that.url.deleteBatch, { ids: ids }).then((res) => {
              if (res.success) {
                that.$message.success(res.message);
                that.loadData();
                that.onClearSelected();
              } else {
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.loading = false;
            });
          }
        });
      }
    },
    handleDelete: function (id) {
      if (!this.url.delete) {
        this.$message.error('请设置url.delete属性!')
        return
      }
      var that = this;
      deleteAction(that.url.delete, { id: id }).then((res) => {
        if (res.success) {
          that.$message.success(res.message);
          that.loadData();
        } else {
          that.$message.warning(res.message);
        }
      });
    },
    handleEdit: function (record) {
      this.$refs.modalForm.edit(record);
      this.$refs.modalForm.title = '编辑';
      this.$refs.modalForm.disableSubmit = false;
    },
    handleAdd: function () {
      this.$refs.modalForm.add();
      this.$refs.modalForm.title = '新增';
      this.$refs.modalForm.disableSubmit = false;
    },
    handleSubmit: function (title) {
      this.$refs.modalForm.add();
      this.$refs.modalForm.title = title;
      this.$refs.modalForm.disableSubmit = false;
    },
    handleTableChange(pagination, filters, sorter) {
      // 分页、排序、筛选变化时触发
      // TODO 筛选
      if (Object.keys(sorter).length > 0) {
        // 是否需要中文排序
        if (this.sortName) {
          if (sorter.field === 'createName' || sorter.field === 'currentUserName') {
            this.isorter.column = `convert(${sorter.field} using 'gbk')`;
          } else {
            this.isorter.column = sorter.field;
          }
        } else {
          this.isorter.column = sorter.field;
        }
        this.isorter.order = sorter.order == 'ascend' ? 
          'asc' : sorter.order == 'descend' ?
          'desc' : ''
      }
      this.ipagination = pagination;
      this.loadData();
    },
    handleToggleSearch() {
      this.toggleSearchStatus = !this.toggleSearchStatus;
    },
    // 给popup查询使用(查询区域不支持回填多个字段，限制只返回一个字段)
    getPopupField(fields) {
      return fields.split(',')[0]
    },
    modalFormOk() {
      // 新增/修改 成功时，重载列表
      this.loadData();
    },
    handleDetail: function(record) {
      this.$refs.modalForm.edit(record);
      this.$refs.modalForm.title = '详情';
      this.$refs.modalForm.disableSubmit = true;
    },
    /* 导出 */
    handleExportXls2() {
      let paramsStr = encodeURI(JSON.stringify(this.getQueryParams()));
      let url = `${window._CONFIG['domianURL']}/${this.url.exportXlsUrl}?paramsStr=${paramsStr}`;
      window.location.href = url;
    },
    handleExportXls(fileName) {
      if (!fileName || typeof fileName !== 'string') {
        fileName = '导出文件'
      }
      let param = { ...this.queryParam };
      if (this.selectedRowKeys && this.selectedRowKeys.length > 0) {
        param['selections'] = this.selectedRowKeys.join(',')
      }
      console.log('导出参数', param)
      downFile(this.url.exportXlsUrl, param).then((data) => {
        if (!data) {
          this.$message.warning('文件下载失败')
          return
        }
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          window.navigator.msSaveBlob(new Blob([data], { type: 'application/vnd.ms-excel' }), fileName + '.xls')
        } else {
          let url = window.URL.createObjectURL(new Blob([data], { type: 'application/vnd.ms-excel' }))
          let link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.setAttribute('download', fileName + '.xls')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link); // 下载完成移除元素
          window.URL.revokeObjectURL(url); // 释放掉blob对象
        }
      })
    },
    /* 导入 */
    handleImportExcel(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        if (info.file.response.success) {
          // this.$message.success(`${info.file.name} 文件上传成功`);
          if (info.file.response.code === 201) {
            let { message, result: { msg, fileUrl, fileName } } = info.file.response
            let href = window._CONFIG['domianURL'] + fileUrl
            this.$warning({
              title: message,
              content: (
                <div>
                  <span>{msg}</span><br/>
                  <span>具体详情请 <a href={href} target="_blank" download={fileName}>点击下载</a> </span>
                </div>
              )
            })
          } else {
            this.$message.success(info.file.response.message || `${info.file.name} 文件上传成功`)
          }
          this.loadData()
        } else {
          this.$message.error(`${info.file.name} ${info.file.response.message}.`);
        }
      } else if (info.file.status === 'error') {
        this.$message.error(`文件上传失败: ${info.file.msg} `);
      }
    },
    /* 图片预览 */
    getImgView(text) {
      if (text && text.indexOf(',') > 0) {
        text = text.substring(0, text.indexOf(','))
      }
      return getFileAccessHttpUrl(text)
    },
    /* 文件下载 */
    uploadFile(text) {
      if (!text) {
        this.$message.warning('未知的文件')
        return;
      }
      if (text.indexOf(',') > 0) {
        text = text.substring(0, text.indexOf(','))
      }
      let url = getFileAccessHttpUrl(text)
      window.open(url);
    },
    // 转为知识
    bindKnowledge(id, url, infoKeys, titleKeys='eventContent') {
      const that = this
      that.loadData()
      that.$confirm({
          title: '处理成功',
          content: '知识的点滴积累汇集成磅礴之力，您是否愿意将处理方案发布至知识库?',
          okText: '发布知识',
          cancelText: '取消',
          onOk: function () {
            that.releaseKnowledge(id, url, infoKeys, titleKeys)
          },
          onCancel() {
            return
          }
      })    
    },
    // 获取详情
    releaseKnowledge(id, url, infoKeys, titleKeys='eventContent') {
      if (!url) return
      getAction(url, { id }).then((res) => {
          if (res.code === 200) {
            let ywAttaches = res.result.ywAttaches
            let orderInfo = res.result[infoKeys]
            let reason = orderInfo.reason ?  orderInfo.reason : ""
            let solution = orderInfo.solution ?  orderInfo.solution : ""
            let rowInfo = {
              // 附件
              attachment: ywAttaches ? ywAttaches : [],
              // 标题
              title: orderInfo[titleKeys], 
              // 知识明细
              content: "<p>【问题原因】</p>\n<p style=\"padding-left: 40px;\">"+ reason +"</p>\n<p>【解决方案】</p>\n<p style=\"margin: 0px; padding: 3px 0px 3px 40px; outline: none; line-height: 30px; color: #222222; font-family: tahoma, arial, 'Microsoft YaHei'; font-size: 16px; background-color: #ffffff;\">"+ solution +"</p>"
            }
            // 关联服务
            if (orderInfo.serviceCatFullName) {
                let name = orderInfo.serviceCatFullName.split("/")
                rowInfo.serviceCatNames =  name[name.length - 1]
                rowInfo.serviceCatId = [orderInfo.serviceCatId]
            }
            this.$refs['knowledgeInfo'].initOptionsData(rowInfo)
            this.$refs['knowledgeInfo'].add()
            this.$refs['knowledgeInfo'].title = "发布知识"
            this.$refs['knowledgeInfo'].disableSubmit = false
          }
      })  
    }
  }
}
