<template>
  <div>
    <el-input 
      v-model="textValue" 
      :maxlength="propMaxLength"
      show-word-limit
      @change="handleTextChange"
      :style="{width: '80%'}"
      ></el-input>
  </div>
</template>

<script>
export default {
  components:{},
  props:{
    getData: null,
    theIndex: null,
    propMaxLength: null
  },
  data(){
    return {
      textValue:"",
    }
  },
  mounted(){
    if(this.getData){
      this.textValue = this.getData
    }
  },
  methods:{
    handleTextChange(){
      this.$emit('sonText', this.textValue, this.theIndex)
    }
  },
}
</script>
<style scoped>
</style>