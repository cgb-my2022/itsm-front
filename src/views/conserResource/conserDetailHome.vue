<template>
  <a-card :bordered="false">
    <a-tabs default-active-key="1" @change="callback">
      <a-tab-pane key="1" tab="资源信息">
        <conserDetail v-if="intKey == '1'"></conserDetail>
      </a-tab-pane>
      <a-tab-pane key="2" tab="变更日志">
        <changeInfo v-if="intKey == '2'"></changeInfo>
      </a-tab-pane>
      <a-tab-pane key="3" tab="关联资源">
        <associatedResources v-if="intKey == '3'"></associatedResources>
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<script>
import conserDetail from './detailComp/conserDetail'
import changeInfo from './detailComp/changeInfo'
import associatedResources from './detailComp/associatedResources'
export default {
  components:{
    conserDetail,
    changeInfo,
    associatedResources
  },
  props:{},
  data(){
    return {
      intKey: "1"
    }
  },
  mounted(){},
  methods:{
    callback(key) {
      // console.log(key);
      this.intKey = key
    },
  },
}
</script>
<style scoped>
</style>