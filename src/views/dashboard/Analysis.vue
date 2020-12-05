<template>
  <div>
    <template v-if="frontline==true||supportline==true||frontlinesup==true||supportlinesup==true">
      <a-tabs type="card" @change="callback">
        <template v-if="frontline==true">
          <a-tab-pane tab="一线" key="1">
            <front-line-index-task ref="tab1"></front-line-index-task>
          </a-tab-pane>
        </template>
        <template v-if="supportline==true">
          <a-tab-pane tab="二线" key="2">
            <support-line-index-task ref="tab2"></support-line-index-task>
          </a-tab-pane>
        </template>
        <template v-if="frontlinesup==true">
          <a-tab-pane tab="一线主管" key="3">
            <front-line-sup-index-task ref="tab3"></front-line-sup-index-task>
          </a-tab-pane>
        </template>
        <template v-if="supportlinesup==true">
          <a-tab-pane tab="二线主管" key="4">
            <support-line-sup-index-task ref="tab4"></support-line-sup-index-task>
          </a-tab-pane>
        </template>
        <a-tab-pane tab="员工" key="0">
          <index-task ref="tab0"></index-task>
        </a-tab-pane>
      </a-tabs>
    </template>
    <template v-else>
      <index-task ></index-task>
    </template>
    <!--<div style="width: 100%;text-align: left;margin-top: 20px;margin-bottom: 20px">
        <a-radio-group size="large" v-model="indexStyle">
          <template v-if="frontline==true">
            <a-radio-button :value="1">一线运维</a-radio-button>
          </template>
          <template v-if="supportline==true">
          <a-radio-button :value="2">二线运维</a-radio-button>
          </template>
          <template v-if="frontline==true||supportline==true">
          <a-radio-button :value="0">员工首页</a-radio-button>
          </template>
        </a-radio-group>
      </div>-->
    <!-- <index-chart v-if="indexStyle==1"></index-chart>-->
    <!--二线运维人员首页-->
    <!--<support-line-index-task v-if="indexStyle==2"></support-line-index-task>
    &lt;!&ndash;一线运维人员首页&ndash;&gt;
    <front-line-index-task v-if="indexStyle==1"></front-line-index-task>
    &lt;!&ndash;普通员工首页&ndash;&gt;
    <index-task v-if="indexStyle==0"></index-task>-->
  </div>
</template>

<script>
  import IndexTask from './IndexTask'
  import FrontLineIndexTask from './FrontLineIndexTask'
  import FrontLineSupIndexTask from './FrontLineSupIndexTask'
  import SupportLineIndexTask from './SupportLineIndexTask'
  import SupportLineSupIndexTask from './SupportLineSupIndexTask'
  import { mapGetters } from 'vuex'

  export default {
    name: 'Analysis',
    components: {
      IndexTask,
      FrontLineIndexTask,
      FrontLineSupIndexTask,
      SupportLineIndexTask,
      SupportLineSupIndexTask
    },
    data() {
      return {
        frontline: false,
        frontlinesup: false,
        supportline: false,
        supportlinesup: false,
        indexStyle: 0
      }
    },
    created() {
      let roles = this.userInfo().roles;
      console.log('roles:' + roles);
      console.log(this.userInfo());
      for (let j = 0; j < roles.length; j++) {
        if (roles[j] === 'FRONTLINE_PERSONNEL') {
          this.frontline = true;
          this.indexStyle = 1;
        } else if (roles[j] === 'SUPPORT_PERSONNEL') {
          this.supportline = true;
          this.indexStyle = 2;
        } else if (roles[j] === 'FRONTLINE_SUP') {
          this.frontlinesup = true;
          this.indexStyle = 3;
        } else if (roles[j] === 'SUPPORTLINE_SUP') {
          this.supportlinesup = true;
          this.indexStyle = 4;
        }
      }
    },
    methods: {
      ...mapGetters(['userInfo']),
      callback(key) {
        let that = this;
       if (key === '0') {
         that.$refs.tab0.loadData();
       } else if (key === '1') {
         that.$refs.tab1.loadData();
       } else if (key === '2') {
         that.$refs.tab2.loadData();
       } else if (key === '3') {
         that.$refs.tab3.loadData();
       } else if (key === '4') {
         that.$refs.tab4.loadData();
       }
      }
    }
  }
</script>
