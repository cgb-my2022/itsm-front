<template>
  <div>
    <el-input 
      type="textarea"
      v-model="textValue" 
      :maxlength="propMaxLength"
      show-word-limit
      @change="handleTextChange"
      :autosize="{minRows: 4}" 
      :style="{width: '80%'}"
      clearable></el-input>
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
      this.$emit('sonTextArea', this.textValue, this.theIndex)
    }
  },
}
</script>
<style scoped>
</style>