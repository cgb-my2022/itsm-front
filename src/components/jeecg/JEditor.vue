<template>
  <div class="tinymce-editor">
    <editor
      v-model="myValue"
      :init="init"
      :key="tinymceFlag"
      :disabled="disabled"
      @onClick="onClick">
    </editor>
  </div>
</template>

<script>
  import tinymce from 'tinymce/tinymce'
  import Editor from '@tinymce/tinymce-vue'
  import 'tinymce/themes/silver/theme'
  import 'tinymce/plugins/image'
  import 'tinymce/plugins/link'
  import 'tinymce/plugins/media'
  import 'tinymce/plugins/table'
  import 'tinymce/plugins/lists'
  import 'tinymce/plugins/contextmenu'
  import 'tinymce/plugins/wordcount'
  import 'tinymce/plugins/colorpicker'
  import 'tinymce/plugins/textcolor'
  import 'tinymce/plugins/fullscreen'
  import 'tinymce/icons/default'
  import { uploadAction,getFileAccessHttpUrl } from '@/api/manage'
  export default {
    components: {
      Editor
    },
    props: {
      value: {
        type: String,
        required:false
      },
      triggerChange:{
        type: Boolean,
        default: false,
        required:false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      plugins: {
        type: [String, Array],
        default: 'lists image link media table textcolor wordcount contextmenu fullscreen'
      },
      toolbar: {
        type: [String, Array],
        default: 'undo redo |  formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | lists link unlink image media table | removeformat | fullscreen',
        branding:false
      }
    },
    data() {
      return {
        //初始化配置
        init: {
          language_url: '/tinymce/langs/zh_CN.js',
          language: 'zh_CN',
          skin_url: '/tinymce/skins/lightgray',
          height: 300,
          plugins: this.plugins,
          toolbar: this.toolbar,
          branding: false,
          menubar: false,
          toolbar_drawer: false,
          images_upload_handler: (blobInfo, success) => {
            let formData = new FormData()
            formData.append('file', blobInfo.blob(), blobInfo.filename());
            formData.append('biz', "jeditor");
            formData.append("jeditor","1");
            uploadAction(window._CONFIG['domianURL']+"/sys/common/upload", formData).then((res) => {
              if (res.success) {
                if(res.message == 'local'){
                  const img = 'data:image/jpeg;base64,' + blobInfo.base64()
                  success(img)
                }else{
                  let img = getFileAccessHttpUrl(res.message)
                  success(img)
                }
              }
            })
          }
        },
        myValue: this.value,
        tinymceFlag: 1
      }
    },
    mounted() {
      //tinymce.init({})
      this.tinymceFlag++;
    },
    methods: {

      onClick(e) {
        this.$emit('onClick', e, tinymce)
      },
      //可以添加一些自己的自定义事件，如清空内容
      clear() {
        this.myValue = ''
      }
    },
    watch: {
      value(newValue) {
        this.myValue = (newValue == null ? '' : newValue)
      },
      myValue(newValue) {
        if(this.triggerChange){
          this.$emit('change', newValue)
        }else{
          this.$emit('input', newValue)
        }
      }
    },
    activated() {
      this.tinymceFlag++;
    }
  }

</script>
<style scoped>
</style>