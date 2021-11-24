<template>
  <div>
    <a-tabs type="card" @change="callback">
      <a-tab-pane v-if="frontline" tab="一线" :key="1"></a-tab-pane>
      <a-tab-pane v-if="supportline" tab="二线" :key="2"></a-tab-pane>
      <a-tab-pane v-if="frontlinesup" tab="一线主管" :key="3"></a-tab-pane>
      <a-tab-pane v-if="supportlinesup" tab="二线主管" :key="4"></a-tab-pane>
      <a-tab-pane tab="员工" :key="0"></a-tab-pane>
    </a-tabs>
    <!-- 一线 -->
    <front-line-index-task v-if="indexStyle === 1" ref="tab1"></front-line-index-task>
    <!-- 二线 -->
    <support-line-index-task v-if="indexStyle === 2" ref="tab2"></support-line-index-task>
    <!-- 一线主管 -->
    <front-line-sup-index-task v-if="indexStyle === 3" ref="tab3"></front-line-sup-index-task>
    <!-- 二线主管 -->
    <support-line-sup-index-task v-if="indexStyle === 4" ref="tab4"></support-line-sup-index-task>
    <!-- 员工 -->
    <index-task v-if="indexStyle === 0" ref="tab0"></index-task>
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
    SupportLineSupIndexTask,
  },
  data() {
    return {
      frontline: false,
      frontlinesup: false,
      supportline: false,
      supportlinesup: false,
      indexTask: false,
      indexStyle: 0
    }
  },
  created() {
    let roles = this.userInfo().roles
    let indexStyle = 0;
    for (let j = 0; j < roles.length; j++) {
      if (roles[j] === 'FRONTLINE_PERSONNEL') {
        this.frontline = true
        if (indexStyle === 0) {
          indexStyle = 1
        }
      } else if (roles[j] === 'SUPPORT_PERSONNEL') {
        this.supportline = true
        if (indexStyle === 0) {
          indexStyle = 2
        }
      } else if (roles[j] === 'FRONTLINE_SUP') {
        this.frontlinesup = true
        if (indexStyle === 0) {
          indexStyle = 3
        }
      } else if (roles[j] === 'SUPPORTLINE_SUP') {
        this.supportlinesup = true
        if (indexStyle === 0) {
          indexStyle = 4
        }
      }
      this.indexStyle = indexStyle
    }
  },
  methods: {
    ...mapGetters(['userInfo']),
    callback(key) {
      this.indexStyle = key
    },
  },
}
</script>
