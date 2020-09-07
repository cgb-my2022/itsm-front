<template>
  <div>
    <template v-if="this.userInfo().roleType==2">
      <div style="width: 100%;text-align: left;margin-top: 20px">
        <a-radio-group size="large" v-model="indexStyle">
          <a-radio-button :value="2">运维首页</a-radio-button>
          <a-radio-button :value="1">员工首页</a-radio-button>
        </a-radio-group>
      </div>
    </template>

    <!-- <index-chart v-if="indexStyle==1"></index-chart>-->
    <it-index-task v-if="indexStyle==2"></it-index-task>
    <index-task v-if="indexStyle==1"></index-task>
  </div>
</template>

<script>
  import IndexTask from './IndexTask'
  import ItIndexTask from './ItIndexTask'
  import { mapGetters } from 'vuex'

  export default {
    name: 'Analysis',
    components: {
      IndexTask,
      ItIndexTask
    },
    data() {
      return {
        indexStyle: 1
      }
    },
    created() {
      if(this.userInfo().roleType==2){
        this.indexStyle = 2;
      }else {
        this.indexStyle = 1;
      }
    },
    methods: {
      ...mapGetters(['userInfo'])
    }
  }
</script>
