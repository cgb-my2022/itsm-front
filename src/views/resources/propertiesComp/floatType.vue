<template>
  <div>
    <el-input 
      v-model="textValue" 
      type="number"
      placeholder="最大长度为14字符"
      onKeypress="return (/[\d]/.test(String.fromCharCode(event.keyCode || event.which))) || event.which === 8"
      @change="handleTextChange(arguments[0],14)"
      :style="{width: '80%'}"
      clearable></el-input>
    <span class="propTips" title="小数的最大长度限制的是用户在本输入框输入数字整数部分加小数部分的总长度。">?</span>
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
    handleTextChange(val,maxNum){
      this.textValue = Number(val)
        this.$nextTick(()=>{
          //比较输入的值和最大值，返回小的
          let num = Math.min(Number(val),maxNum)
          if(num < 0){
            this.textValue = 0
          }else if( num > 14 ){
            this.textValue = 14
          }else{
            this.textValue = num
          }
          this.$emit('sonFloat', this.textValue, this.theIndex)
      })
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