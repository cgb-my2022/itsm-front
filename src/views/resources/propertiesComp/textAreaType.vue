<template>
  <div>
    <el-input 
      v-model="textValue" 
      :maxlength="1000"
      type="textarea"
      :autosize="{minRows: 4}" 
      show-word-limit 
      @change="handleTextChange"
      :style="{width: '80%'}"
      clearable></el-input>
  </div>
</template>

<script>
export default {
  components:{},
  props:{
    getData: null
  },
  data(){
    return {
      textValue:""
    }
  },
  mounted(){
    if(this.getData){
      this.textValue = this.getData
    }
  },
  methods:{
    handleTextChange(){
      this.$emit('sonTextArea', this.textValue)
    }
  },
}
</script>
<style scoped>
</style>