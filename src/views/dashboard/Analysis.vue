<template>
  <div>
    <template v-if="frontline==true||supportline==true">
      <a-tabs type="card" >
        <template v-if="frontline==true">
        <a-tab-pane tab="一线运维" key="1">
          <front-line-index-task ></front-line-index-task>
        </a-tab-pane>
        </template>
        <template v-if="supportline==true">
        <a-tab-pane tab="二线运维" key="2">
          <support-line-index-task ></support-line-index-task>
        </a-tab-pane>
        </template>
        <a-tab-pane tab="员工首页" key="0">
          <index-task ></index-task>
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
  import SupportLineIndexTask from './SupportLineIndexTask'
  import { mapGetters } from 'vuex'

  export default {
    name: 'Analysis',
    components: {
      IndexTask,
      FrontLineIndexTask,
      SupportLineIndexTask
    },
    data() {
      return {
        frontline: false,
        supportline: false,
        indexStyle: 0,
      }
    },
    created() {
      let roles = this.userInfo().roles;
      for (let j = 0; j < roles.length; j++) {
        if (roles[j] === 'FRONTLINE_PERSONNEL') {
          this.frontline = true;
          this.indexStyle = 1;
        } else if (roles[j] === 'SUPPORT_PERSONNEL') {
          this.supportline = true;
          this.indexStyle = 2;
        }
      }
    },
    methods: {
      ...mapGetters(['userInfo'])
    }
  }
</script>
