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
    propMaxLength: null,
    theIndex: null
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
    handleTextChange(val){
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