<template>
  <div>
      <el-select v-model="dateValue" placeholder="请选择日期格式" @change="handelSec" style="width: 80%">
         <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
         </el-option>
      </el-select>
  </div>
</template>

<script>
export default {
  components:{},
  props:{
    getData: null,
    theIndex: null
  },
  data(){
    return {
         dateValue:"1",
         options: [{
            value: '1',
            label: '年-月-日'
         }, {
            value: '2',
            label: '年-月-日 时-分-秒'
         }],
    }
  },
  mounted(){
     if(this.getData){
      this.dateValue = this.getData
    }
  },
  methods:{
     handelSec(){
        this.$emit('sonDate', this.dateValue, this.theIndex )
     }
  },
}
</script>
<style scoped>
</style>