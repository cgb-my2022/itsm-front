<style scoped>
  .spin-content {
    border: 1px solid #91d5ff;
    background-color: #e6f7ff;
    padding: 30px;
  }
</style>
<template>
  <div>
    <a-spin tip="登陆中...">
      <div class="spin-content">
      </div>
    </a-spin>
  </div>
</template>
<script>
  import TwoStepCaptcha from '@/components/tools/TwoStepCaptcha'
  import { mapActions } from 'vuex'
  import { timeFix } from '@/utils/util'
  import Vue from 'vue'
  import { ACCESS_TOKEN, ENCRYPTED_STRING, USER_INFO } from '@/store/mutation-types'
  import { putAction, postAction, getAction, getAsyncAction } from '@/api/manage'
  import { encryption, getEncryptedString } from '@/utils/encryption/aesEncrypt'
  import store from '@/store/'

  export default {
    components: {
      TwoStepCaptcha
    },
    state: {
      code: '',
      state: ''
    },
    created () {
      localStorage.clear();
      let that = this;
      let token = that.GetQueryString(location.href, 'token');
      if (token) {
        that.ThirdLogin(token).then(res => {
          that.loginSuccess();
        }).catch(err => {
          that.requestFailed(err.message);
        })
      } else {
        let code = that.GetQueryString(location.href, 'code');
        let state = that.GetQueryString(location.href, 'state');
        if (code && state) {
          that.WxcodeToToken({ 'code': code, 'state': state }).then(response => {
            if (response.success) {
              token = response.result
              that.ThirdLogin(token).then(res => {
                setTimeout(() => {
                  that.loginSuccess();
                }, 3000)
              }).catch(err => {
                that.requestFailed(err.message);
              })
            } else {
              that.requestFailed(response.message);
            }
          })
        } else {
          setTimeout(() => {
            this.$router.push({ path: '/' })
          }, 2000);
        }
      }

      // update-begin- --- author:scott ------ date:20190805 ---- for:密码加密逻辑暂时注释掉，有点问题
      // this.getEncrypte();
      // update-end- --- author:scott ------ date:20190805 ---- for:密码加密逻辑暂时注释掉，有点问题
    },
    methods: {
      ...mapActions([ 'Login', 'Logout', 'PhoneLogin', 'ThirdLogin', 'WxcodeToToken' ]),
      GetQueryString(url, name) {
        try {
          var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
          var r = url.split('?')[1].match(reg);
          if (r != null) {
            return r[2];
          }
          return ''; // 如果此处只写return;则返回的是undefined
        } catch (e) {
          return ''; // 如果此处只写return;则返回的是undefined
        }
      },
      requestFailed (errmsg) {
        this.$notification[ 'error' ]({
          message: '登录失败',
          description: errmsg,
          duration: 4
        });
        setTimeout(() => {
          this.$router.push({ path: '/' })
        }, 2000);
      },
      loginSuccess () {
        // update-begin- author:sunjianlei --- date:20190812 --- for: 登录成功后不解除禁用按钮，防止多次点击
        // this.loginBtn = false
        // update-end- author:sunjianlei --- date:20190812 --- for: 登录成功后不解除禁用按钮，防止多次点击
        this.$router.push({ path: '/dashboard/analysis' })
        this.$notification.success({
          message: '欢迎',
          description: `${timeFix()}，欢迎回来`
        });
      },
      cmsFailed(err) {
        this.$notification[ 'error' ]({
          message: '登录失败',
          description: err,
          duration: 4
        });
      },

      generateCode(value) {
        this.verifiedCode = value.toLowerCase()
      },
      inputCodeChange(e) {
        this.inputCodeContent = e.target.value
      },
      departConfirm(res) {
        if (res.success) {
          let multi_depart = res.result.multi_depart
          // 0:无部门 1:一个部门 2:多个部门
          if (multi_depart == 0) {
            this.loginSuccess()
            this.$notification.warn({
              message: '提示',
              description: `您尚未归属部门,请确认账号信息`,
              duration: 3
            });
          } else if (multi_depart == 2) {
            this.departVisible = true
            this.currentUsername = this.form.getFieldValue('username')
            this.departList = res.result.departs
          } else {
            this.loginSuccess()
          }
        } else {
          this.requestFailed(res)
          this.Logout();
        }
      },
      departOk() {
        if (!this.departSelected) {
          this.validate_status = 'error'
          return false
        }
        let obj = {
          orgCode: this.departSelected,
          username: this.form.getFieldValue('username')
        }
        putAction('/sys/selectDepart', obj).then(res => {
          if (res.success) {
            const userInfo = res.result.userInfo;
            Vue.ls.set(USER_INFO, userInfo, 7 * 24 * 60 * 60 * 1000);
            store.commit('SET_INFO', userInfo);
            // console.log("---切换组织机构---userInfo-------",store.getters.userInfo.orgCode);
            this.departClear()
            this.loginSuccess()
          } else {
            this.requestFailed(res)
            this.Logout().then(() => {
              this.departClear()
            });
          }
        })
      },
      departClear() {
        this.departList = []
        this.departSelected = ''
        this.currentUsername = ''
        this.departVisible = false
        this.validate_status = ''
      },
      departChange(value) {
        this.validate_status = 'success'
        this.departSelected = value
      },
      getRouterData() {
        this.$nextTick(() => {
          if (this.$route.params.username) {
            this.form.setFieldsValue({
              'username': this.$route.params.username
            });
          }
        })
      },
      // 获取密码加密规则
      getEncrypte() {
        var encryptedString = Vue.ls.get(ENCRYPTED_STRING);
        if (encryptedString == null) {
          getEncryptedString().then((data) => {
            this.encryptedString = data
          });
        } else {
          this.encryptedString = encryptedString;
        }
      }
    }
  }
</script>
