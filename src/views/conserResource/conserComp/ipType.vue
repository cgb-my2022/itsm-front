<template>
  <div>
    <el-input 
      v-model="textValue" 
      :maxlength="propMaxLength"
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
      this.$emit('sonIP', this.textValue, this.theIndex)
    },
    handleBlur(){
      let reg = /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/;
      if(!reg.test(this.textValue)){
        this.$message.error('请输入正确的ip地址')
      }
    }
  },
}
</script>
<style scoped>
.propTips {
  display: inline-block;
   font-weight: bold;
   width: 20px;
   height: 20px;
   line-height: 18px;
   text-align: center;
   border: 1px solid #000;
   border-radius: 50%;
   margin-left: 20px;
   cursor: pointer;
}
</style>