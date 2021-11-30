<template>
  <div>
    <el-input 
      v-model="textValue" 
      oninput='value=value.replace(/[^0-9.]/g,"")'
      :maxlength="propMaxLength"
      show-word-limit
      @change="handleTextChange()"
      :style="{width: '80%'}"
      ></el-input>
    <span v-if="isShowTip" class="propTips" title="小数的最大长度限制的是用户在本输入框输入数字整数部分加小数部分的总长度。">?</span>
  </div>
</template>

<script>
export default {
  components:{},
  props:{
    getData: null,
    theIndex: null,
    propMaxLength: null,
    isShowTip:{
      type: Boolean,
      default: false
    }
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
      this.$emit('sonFloat', this.textValue, this.theIndex)
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