 <template>
  <a-modal
    title="选择变更业务"
    :width="600"
    :visible="visible"
    @cancel="handleCancel"
    :footer="null"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <!-- 主表单区域 -->
        <a-row>
          <a-col :span="24">
            <a-form-item label="选择业务" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-cascader
                placeholder="请选择"
                :field-names="{ label: 'title', value: 'id', children: 'children' }"
                :show-search="{ filter }"
                v-decorator="['businessIds', validatorRules.businessIds]"
                :options="options"
                @change="serviceChange"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
    <!-- 添加业务内容 -->
    <alteration-info 
      ref="alterationInfo" 
      :changeOptions="changeType"
      @close="handleCancel"
      @ok="handleOk">
    </alteration-info>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'
import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
import ARow from 'ant-design-vue/es/grid/Row'
import AlterationInfo from './AlterationInfo.vue'

export default {
  name: 'ServiceOrderModal',
  mixins: [JEditableTableMixin],
  components: {
    ARow, AlterationInfo
  },
  props: {
    // 业务分类
    businessOptions: {
      type: Array,
      default: () => []
    },
    // 变更类型
    changeType: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      refKeys: ['serviceOrderAttach'],
      disableMixinCreated: true,
      disableSubmit: false,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      validatorRules: {
        businessIds: {
          rules: [{ required: true, message: '请选择业务!' }],
        }
      },
      options: []
    }
  },
  watch: {
    businessOptions: {
      handler(newVal) {
        if (newVal.length > 0) {
          let newOptions = JSON.parse(JSON.stringify(newVal))
          newOptions[0].children.forEach(item => {
            if (item.code != "B06A01A04") {
              item.disabled = true
            }
          })
          this.options = newOptions
        }
      },
      immediate: true
    }
  },
  methods: {
    //  初始页面内容
    add() {
      this.visible = true
      this.form.resetFields()
    },
    // 选择分类
    serviceChange(value, label) {   
      if (value.length > 0) {
        let title = []
        label.forEach(item => {
          title.push(item.title)
        })
        let businessInfo = {
          changeCatId: value[value.length - 1], 
          changeCatFullName: title.join("/"),
          changeCatIds: value.join(",")
        }
        this.$refs.alterationInfo.add(businessInfo)
      }
    },
    handleOk() {
      this.$emit("ok")
    }
  }
}
</script>

<style scoped>
.des-catalog {
  font-size: 12px;
}
.query-group-cust {
  width: 100%;
}
.col-item >>> .ant-form-item-label > label {
  color: #fff;
}
</style>
