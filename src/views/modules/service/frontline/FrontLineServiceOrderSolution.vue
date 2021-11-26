<template>
  <a-spin :spinning="loading">
    <a-card title="" size="default" style="margin-top: 20px">
      <a-form-model
        :model="serviceOrderModel"
        ref="ruleForm"
        :rules="rules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-form-model-item ref="reason" label="选择业务" prop="serviceCatIds">
          <a-cascader
            placeholder="请选择"
            :field-names="{ label: 'title', value: 'id', children: 'children' }"
            :show-search="{ filter }"
            v-model="serviceOrderModel.serviceCatIds"
            :options="quickOptions"
            change-on-select
            expand-trigger="hover"
            :disabled="this.rowInfo.orderType==2"
            @change="catalogChange"
          />
        </a-form-model-item>
        <template v-if="showEvent">
          <a-form-model-item ref="eventType" label="事件类型：" prop="eventType">
            <j-dict-select-tag
              type="list"
              v-model="serviceOrderModel.eventType"
              @blur="
                () => {
                  $refs.eventType.onFieldBlur()
                }
              "
              dictCode="SERVICE_EVENT_TYPE"
            />
          </a-form-model-item>
        </template>
        <a-form-model-item ref="reason" label="问题原因" prop="reason">
          <a-textarea
            v-model="serviceOrderModel.reason"
            :maxLength="300"
            placeholder="请输入问题原因(有效长度1-300)"
            @blur="
              () => {
                $refs.reason.onFieldBlur()
              }
            "
          />
        </a-form-model-item>
        <a-form-model-item ref="solution" label="解决方案" prop="solution">
          <a-textarea
            v-model="serviceOrderModel.solution"
            :maxLength="300"
            placeholder="请输入解决方案(有效长度1-300)"
            @blur="
              () => {
                $refs.solution.onFieldBlur()
              }
            "
          />
        </a-form-model-item>
        <a-form-model-item ref="solution" label="相关资源" prop="solution">
          <a-table
            ref="table"
            bordered
            size="middle"
            rowKey="id"
            :columns="columns"
            :dataSource="dataSource"
            :loading="loadingTable"
          >
            <!-- 操作按钮 -->
            <span slot="action" slot-scope="text, record">
              <a @click="bindEdite(record.id)">编辑</a>
            </span>
          </a-table>
        </a-form-model-item>
        <!-- 子表单区域 -->
        <a-tabs v-model="activeKey" @change="handleChangeTabs">
          <a-tab-pane tab="服务工单附件" :key="refKeys[0]" :forceRender="true">
            <j-editable-table
              :ref="refKeys[0]"
              :loading="serviceOrderAttachTable.loading"
              :columns="serviceOrderAttachTable.columns"
              :dataSource="serviceOrderAttachTable.dataSource"
              :maxRow="5"
              :maxFile="10"
              :showAction="false"
              :maxHeight="300"
              :rowNumber="true"
              :rowSelection="true"
              :actionButton="true"
            />
          </a-tab-pane>
        </a-tabs>
      </a-form-model>

      <!--<a-list-item>
      <j-upload v-model="fileList" :returnUrl="false"></j-upload>
      <a-upload
        name="file"
        :multiple="false"
        :action="url.upload"
        :headers="headers"
        @change="handleChange">
      </a-upload>
    </a-list-item>-->
      <!-- 流转按钮 -->
      <div style="margin-top: 20px; text-align: center">
        <!-- 一线解决工单 -->
        <template v-if="formData.orderStatusDetail === 3 || formData.orderStatusDetail === 12">
          <a-button type="primary" @click="handleResolved('frontresolve')">已解决</a-button>
        </template>
        <!-- 二线解决工单 -->
        <template v-if="formData.orderStatusDetail === 6 || formData.orderStatusDetail === 13">
          <a-button type="primary" @click="handleResolved('supportresolve')">已解决</a-button>
        </template>
        <!-- 二线解决工单 -->
        <template v-if="formData.orderStatusDetail === 21 || formData.orderStatusDetail === 23">
          <a-button type="primary" @click="handleResolved('vipResolveOrder')">已解决</a-button>
        </template>
        <!--<template v-if="model.processModel==1">
        <template v-for="(item,index) in resultObj.transitionList">
          <a-button type="primary" @click="handleProcessComplete(item.nextnode)">{{ item.Transition }}</a-button>
        </template>
      </template>
      <template v-else>
        <a-button type="primary" @click="handleManyProcessComplete()">确认提交</a-button>
      </template>-->
        <!--<a-button type="primary" @click="handleProcessComplete(2)">同意</a-button>
      <a-button type="danger" @click="handleProcessComplete(6)">驳回</a-button>-->
      </div>
      <br />
    </a-card>
    <!-- 资源详情 -->
    <resources-detail 
      :detailId="detailId" 
      v-if="showDetail" 
      ref="resourcesDetail" 
      @closeDetail="closeDetail">
    </resources-detail>
  </a-spin>
</template>

<script>
import AListItem from 'ant-design-vue/es/list/Item'
import JEllipsis from '@/components/jeecg/JEllipsis.vue'
import JUpload from '@/components/jeecg/JUpload'
import { initDictOptions } from '@/components/dict/JDictSelectUtil'
import { postAction } from '@/api/manage'
import ATextarea from 'ant-design-vue/es/input/TextArea'
import { ServiceMixin } from '@/views/modules/service/mixins/ServiceMixin'
import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
import { FormTypes, getRefPromise, validateFormAndTables } from '@/utils/JEditableTableUtil'
import { validateTables, VALIDATE_NO_PASSED } from '@/utils/JEditableTableUtil'
import { getAction } from '../../../../api/manage'
import ResourcesDetail from '../common/ResourcesDetail'

export default {
  mixins: [ServiceMixin, JEditableTableMixin],
  components: {
    ATextarea,
    JUpload,
    JEllipsis,
    AListItem,
  },
  name: 'ServiceOrderFormFrontLine',
  props: ['formData'],
  components: { ResourcesDetail },
  data() {
    return {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
      rules: {
        serviceCatIds: [{ required: true, message: '请选择业务', trigger: 'change' }],
        reason: [
          { required: true, message: '请输入问题原因', trigger: 'blur' },
          { max: 500, message: '最多500个字符', trigger: 'blur' },
        ],
        solution: [
          { required: true, message: '请输入解决方案', trigger: 'blur' },
          { max: 500, message: '最多500个字符', trigger: 'blur' },
        ],
        eventType: [{ required: true, message: '请选择事件类型', trigger: 'blur' }],
      },
      remnant: 500,
      url: {
        upload: window._CONFIG['domianURL'] + '/sys/common/upload',
        frontresolve: '/system/serviceOrder/frontresolveOrder',  //一线解决
        supportresolve: '/system/serviceOrder/supportresolveOrder', //二线解决
        vipResolveOrder: '/system/serviceOrderVip/vipResolveOrder', //二线解决
        getResourceListById: 'cmdb/resource/getResourceListById',   //获取关联资源
      },
      fileList: [],
      headers: {},
      desc: {},
      serviceOrderModel: {
        id: '',
        version: '',
        eventType: '',
        reason: '',
        solution: '',
        serviceCatIds: [],
      },
      remarksDictOptions: [],
      loading: false,
      rowInfo: {
        orderType: null,
      },
      ncList: [],
      showEvent: false,
      // 新增时子表默认添加几行空数据
      addDefaultRowNum: 1,
      refKeys: ['serviceOrderAttach'],
      tableKeys: ['serviceOrderAttach'],
      activeKey: 'serviceOrderAttach',
      // 服务工单附件
      serviceOrderAttachTable: {
        loading: false,
        dataSource: [],
        columns: [
          {
            title: '附件地址',
            key: 'attachUrl',
            type: FormTypes.file,
            token: true,
            responseName: 'message',
            width: '100%',
            placeholder: '请输入${title}',
            defaultValue: '',
          },
        ],
      },
      // 相关资源表头
      loadingTable: false,
      dataSource: [],
      columns: [
        {
          title: '资源名称',
          dataIndex: 'name',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '资源描述',
          align: 'center',
          ellipsis: true,
          dataIndex: 'describes',
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          width: 140,
          scopedSlots: { customRender: 'action' },
        },
      ],
      showDetail: false,
      detailId: ""
    }
  },
  watch: {
    'serviceOrderModel.serviceCatIds': {
      handler(newVal) {
        this.setNc(newVal)
      },
      immediate: true,
    },
    formData: {
      handler(newVal) {
        this.setCatalog(newVal)
        if (newVal.orderType) {
          this.rowInfo.orderType = newVal.orderType
        }
      },
      immediate: true,
    },
  },
  methods: {
    // 回显服务
    setCatalog(item) {
      this.$nextTick(() => {
          this.serviceOrderModel.serviceCatIds = JSON.parse(item.serviceCatIds)
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
    setNc(newVal) {
      if (newVal.length > 1) {
        const ncId = newVal[1]
        if (this.ncList.indexOf(ncId) != -1) {
          this.showEvent = true
        } else {
          this.showEvent = false
        }
      } else {
        this.showEvent = false
      }
    },
    initDictConfig() {
      // 初始化字典 - 性别
      initDictOptions('approval_remarks').then((res) => {
        if (res.success) {
          this.remarksDictOptions = res.result
        }
      })
    },
    handleChange(info) {
      this.fileList = []
      let fileList = info.fileList
      // fileList = fileList.slice(-2);
      fileList = fileList.map((file) => {
        if (file.response) {
          file.url = file.response.message
        }
        return file
      })
      fileList = fileList
        .filter((file) => {
          console.log('-----fileList response-----', file.response)
          if (file.response) {
            return file.response.success === true
          }
          return false
        })
        .map((file) => {
          var fileJson = {
            fileName: file.name,
            filePath: file.url,
            fileSize: file.size,
          }
          this.fileList.push(fileJson)
        })
      this.model.fileList = JSON.stringify(this.fileList)
      console.log('-----fileList-----', this.model.fileList)
    },
    // 已解决(type 1:一线  2：二线 3：vip)
    handleResolved(url) {
      const that = this
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.$confirm({
            title: '提示',
            content: '确认提交吗?',
            onOk: function () {
              that.okConfirm(url)
            }
          })
        } else {
          return false
        }
      })
    },
    // 提交
    okConfirm(url) {
      // 封装cases
      const that = this
      let cases = []
      cases.push(that.$refs[that.refKeys[0]])
      // 同时验证并获取多个实例的值
      validateTables(cases)
        .then((all) => {
          // all 是一个数组，每项都对应传入cases的下标，包含values和deleteIds
          that.loading = true
          that.serviceOrderModel.id = that.formData.id
          that.serviceOrderModel.version = that.formData.version
          let params = Object.assign({}, that.serviceOrderModel, that.rowInfo)
          delete params.orderType
          params.orderAttachList = all[0].values
          postAction(that.url[url], params)
            .then((res) => {
              that.loading = false
              if (res.success) {
                if (res.success) {
                  that.$message.success(res.message)
                  that.$emit('complete')
                } else {
                  that.$message.warning(res.message)
                }
              } else {
                that.$message.warning(res.message)
              }
            })
            .finally(() => {
              that.loading = false
            })
        })
        .catch((e = {}) => {
          // 判断表单验证是否未通过
          if (e.error === VALIDATE_NO_PASSED) {
            console.log('未通过验证的实例下标:', e.index)
          } else {
            console.error('发生异常:', e)
          }
        })
    },
    // 找出所有是NC的
    getNc(data) {
      let ncList = []
      if (data.length > 0) {
        data.forEach((item) => {
          if (item.children.length > 0) {
            item.children.forEach((citem) => {
              const title = citem.title.toLowerCase()
              if (title === 'nc') {
                ncList.push(citem.id)
              }
            })
          }
        })
      }
      this.ncList = ncList
      this.setNc(this.serviceOrderModel.serviceCatIds)
      return ncList;
    },
    // 获取相关资源
    getResources() {
      this.loadingTable = true
      getAction(
        this.url.getResourceListById,
        { id: this.userInfo.id }
      ).then(res => {
        this.loadingTable = false
        if (res.result) {
          this.dataSource = res.result
        }
      }).finally( () => {
        this.loadingTable = false
      })
    },
    //先关资源编辑
    bindEdite(id) {
      this.detailId = id
      this.showDetail = true
    },
    closeDetail(data) {
      if (data === '2') {
        this.getResources()
      }
      this.showDetail = false
    }
  },
  created() {
    /*const token = Vue.ls.get(ACCESS_TOKEN);
      this.headers = { 'X-Access-Token': token };*/
    // console.log('任务办理组件数据2：', this.formData)
    /*this.currTask = this.formData.bizTaskList[0];
      this.model.taskId = this.currTask.id;
      this.getProcessTaskTransInfo(this.formData); */
    // 获取相关资源
    this.getResources()
    // 获取业务
    this.getCatalog(3)
    // 获取二级业务
    this.getCatalogLevel().then((res) => {
      this.getNc(res)
    })
    this.serviceOrderModel.eventType = this.formData.eventType
    this.serviceOrderModel.reason = this.formData.reason
    this.serviceOrderModel.solution = this.formData.solution
    this.serviceOrderModel.eventType = this.formData.eventType
    this.serviceOrderAttachTable.dataSource = this.formData.ywAttaches || []
    this.initDictConfig()
  },
}
</script>

<style >
</style>
