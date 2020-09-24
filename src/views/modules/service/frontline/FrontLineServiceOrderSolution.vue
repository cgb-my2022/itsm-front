<template>
  <a-spin :spinning="loading">
  <a-card title="" size="default" style="margin-top:20px">
    <a-form-model
      :model="serviceOrderModel"
      ref="ruleForm"
      :rules="rules"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
    >
      <a-form-model-item ref="problemType" label="问题类别：" prop="problemType">
        <j-dict-select-tag
          type="list"
          v-model="serviceOrderModel.problemType"
          @blur="
          () => {
            $refs.problemType.onFieldBlur();
          }"
           dictCode="problem_type" />
      </a-form-model-item>
        <a-form-model-item ref="reason" label="问题原因：" prop="reason">
        <a-textarea
          v-model="serviceOrderModel.reason"
          @blur="
          () => {
            $refs.reason.onFieldBlur();
          }
        "
        />
      </a-form-model-item>
      <a-form-model-item ref="solution" label="解决方案：" prop="solution">
        <a-textarea
          v-model="serviceOrderModel.solution"
          @blur="
          () => {
            $refs.solution.onFieldBlur();
          }
        "
        />
      </a-form-model-item>
    </a-form-model>
   <!-- <div style="width: 100%;margin-top:20px">
      <div style="margin-bottom: 5px">
        问题原因：
      </div>
      <a-textarea rows="3" v-model="serviceOrderModel.reason" />
    </div>
    <div style="width: 100%;margin-top:20px">
      <div style="margin-bottom: 5px">
        解决方案：
      </div>
      <a-textarea rows="3" v-model="serviceOrderModel.solution" />
    </div>-->
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
    <div style="margin-top:20px;text-align:center">
      <template v-if="formData.orderStatusDetail===3">
        <a-button type="primary" @click="handlefrontProcessResolved()">已解决</a-button>
      </template>
      <template v-if="formData.orderStatusDetail===6">
        <a-button type="primary" @click="handlesupportProcessResolved()">已解决</a-button>
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
    <br>
  </a-card>
  </a-spin>
</template>

<script>
  import AListItem from 'ant-design-vue/es/list/Item';
  import JEllipsis from '@/components/jeecg/JEllipsis.vue';
  import JUpload from '@/components/jeecg/JUpload'
  import { initDictOptions } from '@/components/dict/JDictSelectUtil'
  import { postAction } from '@/api/manage'
  import ATextarea from 'ant-design-vue/es/input/TextArea'

  export default {
    components: {
      ATextarea,
      JUpload,
      JEllipsis,
      AListItem },
    name: 'ServiceOrderFormFrontLine',
    props: ['formData'],
    data() {
      return {
        labelCol: { span: 4 },
        wrapperCol: { span: 14 },
        rules: {
          reason: [
            { required: true, message: '请输入问题原因', trigger: 'blur' },
            { max: 500, message: '最多500个字符', trigger: 'blur' }
          ],
          solution: [
            { required: true, message: '请输入解决方案', trigger: 'blur' },
            { max: 500, message: '最多500个字符', trigger: 'blur' }
          ],
          problemType: [
            { required: true, message: '请选择问题类别', trigger: 'blur' },
          ],
        },
        remnant: 500,
        url: {
          upload: window._CONFIG['domianURL'] + '/sys/common/upload',
          frontresolve: '/system/serviceOrder/frontresolveOrder',
          supportresolve: '/system/serviceOrder/supportresolveOrder'
        },
        fileList: [],
        headers: {},
        desc: {},
        serviceOrderModel: {
          id: '',
          version: 1,
          problemType: 1,
          reason: '',
          solution: ''
        },
        remarksDictOptions: [],
        loading: false
      }
    },
    methods: {
      initDictConfig() {
        // 初始化字典 - 性别
        initDictOptions('approval_remarks').then((res) => {
          if (res.success) {
            this.remarksDictOptions = res.result;
          }
        });
      },
      handleChange(info) {
        this.fileList = [];
        let fileList = info.fileList;
        // fileList = fileList.slice(-2);
        fileList = fileList.map((file) => {
          if (file.response) {
            file.url = file.response.message;
          }
          return file;
        });
        fileList = fileList.filter((file) => {
          console.log('-----fileList response-----', file.response);
          if (file.response) {
            return file.response.success === true;
          }
          return false;
        }).map((file) => {
          var fileJson = {
            fileName: file.name,
            filePath: file.url,
            fileSize: file.size
          };
          this.fileList.push(fileJson);
        });
        this.model.fileList = JSON.stringify(this.fileList)
        console.log('-----fileList-----', this.model.fileList);
      },
      // 已解决
      handlefrontProcessResolved () {
        const that = this;
        this.$refs.ruleForm.validate(valid => {
          if (valid) {
            this.$confirm({
              title: '提示',
              content: '确认提交吗?',
              onOk: function() {
                that.loading = true;
                console.log(that.formData);
                that.serviceOrderModel.id = that.formData.id
                that.serviceOrderModel.version = that.formData.version
                postAction(that.url.frontresolve, that.serviceOrderModel).then((res) => {
                  that.loading = false;
                  if (res.success) {
                    if (res.success) {
                      that.$message.success(res.message);
                      that.$emit('complete');
                    } else {
                      that.$message.warning(res.message);
                    }
                  } else {
                    that.$message.warning(res.message);
                  }
                })
              }
            });
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      handlesupportProcessResolved () {
        const that = this;
        this.$refs.ruleForm.validate(valid => {
          if (valid) {
            this.$confirm({
              title: '提示',
              content: '确认提交吗?',
              onOk: function() {
                that.loading = true;
                console.log(that.formData);
                that.serviceOrderModel.id = that.formData.id
                that.serviceOrderModel.version = that.formData.version
                postAction(that.url.supportresolve, that.serviceOrderModel).then((res) => {
                  that.loading = false;
                  if (res.success) {
                    if (res.success) {
                      that.$message.success(res.message);
                      that.$emit('complete');
                    } else {
                      that.$message.warning(res.message);
                    }
                  } else {
                    that.$message.warning(res.message);
                  }
                })
              }
            });
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      }
    },
    created() {
      /*const token = Vue.ls.get(ACCESS_TOKEN);
      this.headers = { 'X-Access-Token': token };*/
      console.log('任务办理组件数据2：', this.formData);
      /*this.currTask = this.formData.bizTaskList[0];
      this.model.taskId = this.currTask.id;
      this.getProcessTaskTransInfo(this.formData); */
      this.serviceOrderModel.problemType = this.formData.problemType;
      this.initDictConfig();
    }
  }
</script>

<style >

</style>
