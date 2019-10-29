<template>
  <div class="components-container">
    <aside>
      <el-input v-model="phoneInput" placeholder="请输入客户手机号，搜索会员卡">
        <el-button slot="append" type="primary" icon="el-icon-search">搜索</el-button>
      </el-input>
    </aside>
    <split-pane split="vertical" @resize="resize">
      <template slot="paneL">
        <div class="left-container">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>消费</span>
            </div>
            <el-form ref="form" :model="form" label-width="140px">
              <el-form-item label="消费金额：">
                <el-input v-model="form.monetary" placeholder="请输入消费金额">
                  <template slot="append">元</template>
                </el-input>
              </el-form-item>
              <el-form-item label="是否使用优惠券：">
                <el-switch v-model="form.couponUse" />
              </el-form-item>
              <el-form-item label="选择优惠券：">
                <el-select v-model="form.couponSelect" placeholder="请选择">
                  <el-option
                    v-for="item in cities"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                    <span style="float: left">{{ item.label }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{ item.value }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form>
            <div class="cut-line" />
            <h4>结算</h4>
            <ul class="info">
              <li><label>消费金额:</label><span>200</span></li>
              <li><label>会员卡:</label><span>-200</span></li>
              <li><label>优惠券:</label><span>+20</span></li>
              <li><label>实际消费:</label><span>-180</span></li>
            </ul>
          </el-card>
        </div>
      </template>
      <template slot="paneR">
        <split-pane split="horizontal">
          <template slot="paneL">
            <div class="top-container">
              <el-card class="box-card">
                <div slot="header" class="clearfix">
                  <span>会员卡信息</span>
                </div>
                <ul class="info">
                  <li v-for="o in memberData" :key="o.value">
                    <label>{{ o.label }}:</label><span>{{ o.value }}</span>
                  </li>
                </ul>
              </el-card>
            </div>
          </template>
          <template slot="paneR">
            <div class="bottom-container">
              <el-card class="box-card">
                <div slot="header" class="clearfix">
                  <span>优惠券信息</span>
                </div>
                <ul class="info">
                  <li v-for="o in couponData" :key="o.value">
                    <label>{{ o.label }}:</label><span>{{ o.value }}</span>
                  </li>
                </ul>
              </el-card>
            </div>
          </template>
        </split-pane>
      </template>
    </split-pane>
  </div>
</template>

<script>
import splitPane from 'vue-splitpane'

export default {
  name: 'SplitpaneDemo',
  components: { splitPane },
  data() {
    return {
      phoneInput: '',
      form: {
        monetary: '',
        couponUse: true,
        couponSelect: ''
      },
      cities: [{
        value: 'Beijing',
        label: '北京'
      }, {
        value: 'Shanghai',
        label: '上海'
      }, {
        value: 'Nanjing',
        label: '南京'
      }, {
        value: 'Chengdu',
        label: '成都'
      }, {
        value: 'Shenzhen',
        label: '深圳'
      }, {
        value: 'Guangzhou',
        label: '广州'
      }],
      memberData: [
        {
          label: '客户信息',
          value: '张先生'
        },
        {
          label: '客户手机号',
          value: '18020191235'
        },
        {
          label: '会员卡名称',
          value: '充200减20'
        },
        {
          label: '会员卡类型',
          value: '充值会员卡'
        },
        {
          label: '优惠类型',
          value: '打折会员卡'
        },
        {
          label: '剩余金额',
          value: '180元'
        },
        {
          label: '折扣力度',
          value: '80%'
        }
      ],
      couponData: [
        {
          label: '优惠券名称',
          value: '充200减20'
        },
        {
          label: '优惠券类型',
          value: '充值会员卡'
        },
        {
          label: '优惠类型',
          value: '打折会员卡'
        },
        {
          label: '优惠方式',
          value: '180元'
        }
      ]
    }
  },
  methods: {
    resize() {
      console.log('resize')
    }
  }
}
</script>

<style scoped lang="scss">
  @import "~@/styles/variables.scss";
  .components-container {
    position: relative;
    height: 100vh;
  }

  aside {
    width: 60%;
    margin: 20px auto;
  }

  .left-container {
    /* background-color: #F38181; */
    height: 100%;
  }

  .right-container {
    /* background-color: #FCE38A; */
    height: 200px;
  }

  .top-container {
    /* background-color: #FCE38A; */
    width: 100%;
    height: 100%;
  }

  .bottom-container {
    width: 100%;
    /* background-color: #95E1D3; */
    height: 100%;
  }

  .el-card {
    height: 100%;
  }

  .el-card >>> .el-card__header {
    font-weight: bold;
  }

  .el-select {
    width: 100%;
  }

  .el-button--primary {
    color: #fff !important;
    background-color: #1890ff !important;
    border-color: #1890ff !important;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  .cut-line {
    border: 1px dashed #ddd;
    transform: scaleX(1.5);
    margin: $direction30 -20px;
  }

  ul.info{
    padding: 0;
    li {
      list-style: none;
      font-size: 14px;
      line-height: 30px;
    }
    label {
      width: 100px;
      float: left;
      font-weight: normal;
      text-align: right;
      margin-right: 20px;
    }
  }

</style>
