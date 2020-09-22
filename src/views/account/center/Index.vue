<template>
  <div class="page-header-index-wide page-header-wrapper-grid-content-main">

    <a-card :bordered="false" width="750px">
      <div class="account-center-avatarHolder">
        <div class="avatar">
          <img :src="getAvatar()"/>
        </div>
        <div class="username">{{ nickname() }}</div>
        <!--<div class="bio">海纳百川，有容乃大</div>-->
      </div>
      <div class="account-center-detail">
        <!-- <p>
              <i class="title"></i>交互专家
            </p>-->
        <p style="text-align: center">
          <a-icon type="cluster" style="margin-right: 5px;"/><label>{{ userInfo().myDeptParentNames }}</label>
        </p>
        <!--<p>
              <i class="address"></i><span>浙江省</span><span>杭州市</span>
            </p>-->
        <a-divider :dashed="true" />

        <p>
          <a-form :form="form" @submit="handleSubmit">
            <a-form-item label="手机号" v-bind="formItemLayout">
              <a-input
                v-decorator="['phone',{initialValue:userInfo().phone,rules: [
                  { required: true, message: '请输入手机号' },
                ]}]"
                placeholder="请输入手机号"></a-input>
            </a-form-item>
            <a-form-item label="工作地点部门" v-bind="formItemLayout">
              <a-cascader
                v-decorator="['workplaceDepartids',{initialValue: defaultWorkplaceDeparts,rules: [
                  { type: 'array', required: true, message: '请选择工作地点部门' },
                ],},]"
                :options="departTree"
                :showSearch="true"
                :fieldNames="{ label: 'title', value: 'id', children: 'children' }"
                :show-search="{ filter }"
                placeholder="请选择部门"
                @change="onChange"
              />
            </a-form-item>
            <a-form-item label="详细工作地点" v-bind="formItemLayout">
              <a-input v-decorator="['workplaceDetail',{initialValue:userInfo().workplaceDetail}]" placeholder="请输入详细工作地点"></a-input>
            </a-form-item>
            <a-form-item v-bind="tailFormItemLayout">
              <a-button type="primary" html-type="submit">
                保存
              </a-button>
            </a-form-item>
          </a-form>

        </p>
      </div>

    </a-card>

  </div>
</template>

<script>
  import { putAction, getFileAccessHttpUrl } from '@/api/manage'
  import PageLayout from '@/components/page/PageLayout'
  import RouteView from '@/components/layouts/RouteView'
  import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
  import { mapGetters } from 'vuex'

  import { queryIdTree, queryDepartTreeList } from '@/api/api'
  import AFormItem from 'ant-design-vue/es/form/FormItem'

  import Vue from 'vue'
  import { USER_INFO } from '@/store/mutation-types'
  import store from '@/store/'

  export default {
    mixins: [JEditableTableMixin],
    components: {
      AFormItem,
      RouteView,
      PageLayout,
      putAction
    },
    data() {
      return {
        defaultWorkplaceDeparts: [],
        tagInputVisible: false,
        tagInputValue: '',
        departTree: [],
        teams: [],
        teamSpinning: true,
        formItemLayout: {
          labelCol: {
            xs: { span: 24 },
            sm: { span: 8 }
          },
          wrapperCol: {
            xs: { span: 24 },
            sm: { span: 16 }
          }
        },
        tailFormItemLayout: {
          wrapperCol: {
            xs: {
              span: 24,
              offset: 0
            },
            sm: {
              span: 16,
              offset: 8
            }
          }
        },
        noTitleKey: 'app'
      }
    },
    mounted () {
      this.getTeams()
    },
    created() {
      this.queryDepartTree();
      this.defaultWorkplaceDeparts = JSON.parse(this.userInfo().workplaceDeptParentIdes);
    },
    methods: {
      ...mapGetters(['nickname', 'avatar', 'userInfo']),
      queryDepartTree() {
        queryDepartTreeList().then((res) => {
          if (res.success) {
            this.departTree = res.result;
          }
        })
      },
      onChange(value, selectedOptions) {
        console.log(value, selectedOptions);
      },
      filter(inputValue, path) {
        return path.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
      },
      loadTreeData() {
        var that = this;
        queryIdTree().then((res) => {
          if (res.success) {
            that.departTree = [];
            for (let i = 0; i < res.result.length; i++) {
              let temp = res.result[i];
              that.departTree.push(temp);
            }
          }
        })
      },
      getAvatar() {
          return getFileAccessHttpUrl(this.avatar());
      },
      getTeams() {
        this.$http.get('/api/workplace/teams')
          .then(res => {
            this.teams = res.result
            this.teamSpinning = false
          })
      },

      handleTabChange (key, type) {
        this[type] = key
      },

      handleTagClose (removeTag) {
        const tags = this.tags.filter(tag => tag != removeTag)
        this.tags = tags
      },

      showTagInput () {
        this.tagInputVisible = true
        this.$nextTick(() => {
          this.$refs.tagInput.focus()
        })
      },

      handleInputChange (e) {
        this.tagInputValue = e.target.value
      },

      handleTagInputConfirm () {
        const inputValue = this.tagInputValue
        let tags = this.tags
        if (inputValue && tags.indexOf(inputValue) === -1) {
          tags = [...tags, inputValue]
        }

        Object.assign(this, {
          tags,
          tagInputVisible: false,
          tagInputValue: ''
        })
      },
      handleSubmit(e) {
        e.preventDefault();
        this.form.validateFieldsAndScroll((err, values) => {
          if (!err) {
            console.log('Received values of form: ', values);
            let url = '/sys/user/updateWorkInfo';
            let that = this;
            putAction(url, values).then((res) => {
              if (res.success) {
                that.$message.success(res.message);
                let userInfo = that.userInfo();
                userInfo.workplaceDepartid = res.result.workplaceDepartid;
                userInfo.workplaceDeptParentIdes = res.result.workplaceDeptParentIdes;
                userInfo.workplaceDetail = res.result.workplaceDetail;
                Vue.ls.set(USER_INFO, userInfo, 7 * 24 * 60 * 60 * 1000);
                store.commit('SET_INFO', userInfo);
              } else {
                that.$message.warning(res.message);
              }
            })
          }
        });
      }

    }
  }
</script>

<style lang="less" scoped>
  .page-header-wrapper-grid-content-main {
    width: 100%;
    height: 100%;
    min-height: 100%;
    transition: .3s;

    .account-center-avatarHolder {
      text-align: center;
      margin-bottom: 24px;

      & > .avatar {
        margin: 0 auto;
        width: 104px;
        height: 104px;
        margin-bottom: 20px;
        border-radius: 50%;
        overflow: hidden;
        img {
          height: 100%;
          width: 100%;
        }
      }

      .username {
        color: rgba(0, 0, 0, 0.85);
        font-size: 20px;
        line-height: 28px;
        font-weight: 500;
        margin-bottom: 4px;
      }
    }

    .account-center-detail {

      p {
        margin-bottom: 8px;
        padding-left: 26px;
        position: relative;
      }

      .title {
        background-position: 0 0;
      }
      .group {
        background-position: 0 -22px;
        text-align: center;
      }
      .address {
        background-position: 0 -44px;
      }
    }

    .account-center-tags {
      .ant-tag {
        margin-bottom: 8px;
      }
    }

    .account-center-team {

      .members {
        a {
          display: block;
          margin: 12px 0;
          line-height: 24px;
          height: 24px;
          .member {
            font-size: 14px;
            color: rgba(0, 0, 0, .65);
            line-height: 24px;
            max-width: 100px;
            vertical-align: top;
            margin-left: 12px;
            transition: all 0.3s;
            display: inline-block;
          }
          &:hover {
            span {
              color: #1890ff;
            }
          }
        }
      }
    }

    .tagsTitle, .teamTitle {
      font-weight: 500;
      color: rgba(0,0,0,.85);
      margin-bottom: 12px;
    }

  }

</style>
