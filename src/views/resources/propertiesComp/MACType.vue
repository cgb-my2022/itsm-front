<template>
  <div>
    <el-input 
      v-model="textValue" 
      type="number"
      onKeypress="return (/[\d]/.test(String.fromCharCode(event.keyCode || event.which))) || event.which === 8"
      @change="handleTextChange(arguments[0])"
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
      textValue:"",
      theIndex: null
    }
  },
  mounted(){
    if(this.getData){
      this.textValue = this.getData
    }
  },
  methods:{
    handleTextChange(val){
      this.textValue = Number(val)
      this.$emit('sonMAC', this.textValue, this.theIndex)
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