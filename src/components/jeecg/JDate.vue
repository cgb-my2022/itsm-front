<template>
  <a-date-picker
    :disabled="disabled || readOnly"
    :placeholder="placeholder"
    :disabled-date="disabledDate"
    @change="handleDateChange"
    :value="momVal"
    :showTime="showTime"
    :format="dateFormat"
    :getCalendarContainer="getCalendarContainer"
  />
</template>
<script>
  import moment from 'moment'
  export default {
    name: 'JDate',
    props: {
      placeholder:{
        type: String,
        default: '',
        required: false
      },
      value:{
        type: String,
        required: false
      },
      dateFormat:{
        type: String,
        default: 'YYYY-MM-DD',
        required: false
      },
      //此属性可以被废弃了
      triggerChange:{
        type: Boolean,
        required: false,
        default: false
      },
      readOnly:{
        type: Boolean,
        required: false,
        default: false
      },
      disabled:{
        type: Boolean,
        required: false,
        default: false
      },
      showTime:{
        type: Boolean,
        required: false,
        default: false
      },
      getCalendarContainer: {
        type: Function,
        default: (node) => node.parentNode
      },
      // 禁用时间（1：不禁用  2：今天之前  3：今天之后）包括今天
      disableType: {
        type: Number,
        default: 1  
      }
    },
    data () {
      let dateStr = this.value;
      return {
        decorator:"",
        momVal:!dateStr?null:moment(dateStr,this.dateFormat)
      }
    },
    watch: {
      value (val) {
        if(!val){
          this.momVal = null
        }else{
          this.momVal = moment(val,this.dateFormat)
        }
      }
    },
    methods: {
      moment,
      handleDateChange(mom,dateStr){
        this.$emit('change', dateStr);
      },
      disabledDate(current) {
        if(this.disableType === 2) {
          return current && current > moment().endOf('day');
        } else if (this.disableType === 3) {
          return current && current < moment().endOf('day');
        } else {
          return current && current < moment().endOf('day') && current > moment().endOf('day');
        }
      },
    },
    //2.2新增 在组件内定义 指定父组件调用时候的传值属性和事件类型 这个牛逼
    model: {
      prop: 'value',
      event: 'change'
    }
  }
</script>
