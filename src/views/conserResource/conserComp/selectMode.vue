<template>
  <div>
    <el-input 
      v-model="textValue" 
      type="textarea"
      :autosize="{minRows: 4}" 
      show-word-limit 
      @change="handleTextChange"
      :style="{width: '80%'}"
      clearable></el-input>
    <span class="propTips" title="输入选项内容并用英文逗号隔开,可选值数量不超过30个,单个可选值长度不超过50个字符">?</span>
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
      this.$emit('sonSecMode', this.textValue, this.theIndex)
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