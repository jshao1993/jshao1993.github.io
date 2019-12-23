<template>
  <div class="components-container">
    <aside>
      <el-autocomplete
        v-model="phone"
        :fetch-suggestions="querySearchAsync"
        placeholder="请输入客户手机号码或姓名，搜索会员卡"
        style="width: 100%;"
        @select="handleSelect"
      >
        <i slot="suffix" class="el-icon-search el-input__icon" @click="handleIconClick" />
        <template slot-scope="{ item }">
          <span class="name">姓名：{{ item.value }}</span>
          <span class="phone">手机号码：{{ item.phone }}</span>
        </template>
      </el-autocomplete>
    </aside>
    <split-pane split="vertical" :min-percent="35" :default-percent="40" @resize="resize">
      <template slot="paneL">
        <div class="left-container">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>消费</span>
            </div>
            <el-form ref="form" :model="form" label-width="140px">
              <el-form-item label="消费金额：">
                <div class="number-wrap">
                  <el-input-number
                    v-model="form.monetary"
                    controls-position="right"
                    placeholder="请输入消费金额"
                    :controls="false"
                    size="medium"
                    :min="0"
                    :max="restMoney"
                  />
                  <span>元</span>
                </div>
              </el-form-item>
              <el-form-item label="是否使用优惠券：">
                <el-switch v-model="form.couponUse" @change="handleCouponUseChange" />
              </el-form-item>
              <el-form-item v-if="form.couponUse" label="选择优惠券：">
                <el-select
                  v-model="form.couponSelect"
                  clearable
                  placeholder="请选择"
                  @change="handleCouponChange"
                >
                  <el-option
                    v-for="item in couponList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  >
                    <!-- <span style="float: left">{{
                                            item.label
                                        }}</span>
                                        <span
                                            style="float: right; color: #8492a6; font-size: 13px"
                                            >{{ item.value }}</span
                    >-->
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form>
            <div class="cut-line" />
            <h4>结算</h4>
            <ul class="info">
              <li>
                <label>消费金额:</label>
                <span>{{ form.monetary }}元</span>
              </li>
              <li>
                <label>会员卡:</label>
                <span>{{ cardMonetary }}</span>
              </li>
              <li>
                <label>优惠券:</label>
                <span>{{ couponMonetary }}</span>
              </li>
              <li>
                <label>实际消费:</label>
                <span>{{ realMonetary }}</span>
              </li>
            </ul>
            <el-row>
              <el-button type="primary" :disabled="!cardId || !phone" @click="handleSure">核销</el-button>
              <el-button @click="handleCancel">取消</el-button>
            </el-row>
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
                <ul v-if="phone" class="info">
                  <li v-for="o in cardInfo" v-show="o.show" :key="o.key">
                    <label>{{ o.label }}:</label>
                    <span>{{ o.value }}</span>
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
                <ul v-if="form.couponSelect && form.couponUse" class="info">
                  <li v-for="o in couponData" :key="o.value">
                    <label>{{ o.label }}:</label>
                    <span>{{ o.value }}</span>
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
import { fetchCardList, addNewPurchase } from '@/api/consume'
import { fetchConfigTypeById } from '@/api/card'
import { getCoupon } from '@/api/coupon'
import { parseTime } from '@/utils'

export default {
  name: 'CardConsume',
  components: { splitPane },
  data() {
    return {
      phone: undefined,
      cards: [],
      timeout: null,
      form: {
        monetary: '',
        couponUse: false,
        couponSelect: ''
      },
      cardInfo: [
        {
          label: '客户称呼',
          value: '',
          key: 'customerName',
          show: true
        },
        {
          label: '客户手机号',
          value: '',
          key: 'customerPhone',
          show: true
        },
        {
          label: '会员卡名称',
          value: '',
          key: 'name',
          show: true
        },
        {
          label: '会员卡类型',
          value: '',
          key: 'stype',
          show: true
        },
        {
          label: '优惠类型',
          value: '',
          key: 'config.type',
          show: true
        },
        {
          label: '开始时间',
          value: '',
          key: 'config.startDate',
          show: true
        },
        {
          label: '到期时间',
          value: '',
          key: 'config.endDate',
          show: true
        },
        {
          label: '剩余金额',
          value: '',
          key: 'money',
          show: true
        },
        {
          label: '折扣力度',
          value: '',
          key: 'config.discount',
          show: true
        }
      ],
      couponData: [
        {
          label: '优惠券名称',
          value: '',
          key: 'name'
        },
        {
          label: '优惠券类型',
          value: '',
          key: 'type'
        },
        {
          label: '优惠方式',
          value: '',
          key: 'way'
        }
      ],
      couponList: [],
      restMoney: 0,
      configTypeInfo: null,
      isGIFT: false,
      isGIFT2: false,
      cardId: ''
    }
  },
  computed: {
    enterprise() {
      return this.$store.getters.enterprise
    },
    cardMonetary() {
      this.modifyIsGIFTStatus('isGIFT', false)
      if (!this.configTypeInfo) return '-0元' // 没有选择会员卡的时候
      const c = this.configTypeInfo.config
      if (this.configTypeInfo.type === 'CREDITED') {
        if (c.type === 'DISCOUNT') {
          return `-${this.form.monetary * ((100 - +c.discount) / 100)}元`
        }
        if (c.type === 'COUPON') {
          if (c.useCoupon) {
            const currentCouponList = this.couponList.filter(
              _ => _.id === c.couponId
            )
            if (currentCouponList) {
              const currentCoupon = currentCouponList[0]
              if (this.form.monetary >= currentCoupon.amount) {
                if (currentCoupon.type === 'DISCOUNT') {
                  return `-${this.form.monetary *
                    ((100 - +currentCoupon.parsedBenefit) / 100)}元`
                }
                if (currentCoupon.type === 'REBATE') {
                  return `-${+currentCoupon.benefit}元`
                }
                if (currentCoupon.type === 'GIFT') {
                  this.modifyIsGIFTStatus('isGIFT', true)
                  return `送${currentCoupon.benefit}`
                }
              }
            }
          } else {
            console.log('返现暂未实现')
          }
        }
      }
      return '-0元'
    },
    couponMonetary() {
      this.modifyIsGIFTStatus('isGIFT2', false)
      const selectCouponArr = this.couponList.filter(
        _ => _.id === this.form.couponSelect
      )
      if (selectCouponArr.length) {
        const c = selectCouponArr[0]
        if (this.form.monetary >= c.amount) {
          if (c.type === 'REBATE') {
            return `-${+c.benefit}元`
          }
          if (c.type === 'DISCOUNT') {
            if (this.isGIFT) {
              return `-${this.form.monetary *
                ((100 - c.parsedBenefit) / 100)}元`
            } else {
              return `-${(this.form.monetary +
                +this.cardMonetary.split('元')[0]) *
                ((100 - c.parsedBenefit) / 100)}元`
            }
          }
          if (c.type === 'GIFT') {
            this.modifyIsGIFTStatus('isGIFT2', true)
            return `送${c.benefit}`
          }
        }
      }
      return '-0元'
    },
    realMonetary() {
      const part1 = this.isGIFT ? +0 : +this.cardMonetary.split('元')[0]
      const part2 = this.isGIFT2 ? +0 : +this.couponMonetary.split('元')[0]
      return `${this.form.monetary + part1 + part2}元`
    }
  },
  created() {
    this.getCouponList()
  },
  methods: {
    resize() {},
    querySearchAsync(queryString, cb) {
      this.cards = []
      const ep = this.enterprise.filter(_ => _.name === '李宝的店铺')
      const eid = ep[0].eid
      const phone = this.phone
      fetchCardList({ eid }).then(response => {
        this.cards = response.records
          .map(_ => {
            if (_.status === 'CLOSED') return false
            if (
              !_.customerPhone.toString().includes(phone) &&
              !_.customerName.toString().includes(phone) &&
              phone
            ) { return false }
            return Object.assign({}, _, {
              value: _.customerName,
              phone: _.customerPhone
            })
          })
          .filter(_ => !!_)
        cb(this.cards)
      })
    },
    getConfigTypeById(id) {
      return new Promise((resolve, reject) => {
        fetchConfigTypeById(id).then(response => {
          resolve(response)
        })
      })
    },
    async handleSelect(item) {
      const typeObj = {
        CREDITED: '充值会员卡',
        TIMED: '时间会员卡'
      }
      const { id, cid, money } = item
      // 当前选择会员卡的id
      this.cardId = id
      this.restMoney = money
      const configTypeInfo = await this.getConfigTypeById(cid)
      this.configTypeInfo = configTypeInfo
      configTypeInfo.type &&
        (configTypeInfo.stype = typeObj[configTypeInfo.type])
      this.cardInfo.forEach(_ => {
        _.value = item[_.key]
        if (_.value == null) {
          _.value = configTypeInfo[_.key]
          if (_.key === 'config.startDate' || _.key === 'config.endDate') {
            _.show =
              !!(configTypeInfo['config'] &&
              configTypeInfo['config']['type'] === 'TIMED')
            _.value = parseTime(configTypeInfo['config'][_.key.split('.')[1]])
          }
          if (_.key === 'config.discount') {
            _.value =
              configTypeInfo['config'] &&
              configTypeInfo['config']['type'] === 'DISCOUNT'
                ? `${configTypeInfo['config']['discount']}%`
                : '无'
          }
          if (_.key === 'config.type') {
            _.value =
              configTypeInfo['config'] &&
              configTypeInfo['config']['type'] === 'COUPON'
                ? configTypeInfo['config']['useCoupon']
                  ? this.couponList.filter(
                    _ => _.id === configTypeInfo['config']['couponId']
                  )[0].name
                  : `返现${configTypeInfo['config']['cashBack']}元`
                : '无'
          }
        }
      })
    },
    handleIconClick(ev) {
      console.log(ev)
    },
    getCouponList() {
      const ep = this.enterprise.filter(_ => _.name === '李宝的店铺')
      getCoupon(ep[0].eid).then(response => {
        if (Array.isArray(response)) {
          this.couponList = response
        }
      })
    },
    handleCouponChange(val) {
      const cl = this.couponList.filter(_ => _.id === val)
      if (!cl.length) return
      this.couponInfo = cl[0]
      const couponType = {
        REBATE: '抵价优惠券',
        DISCOUNT: '折扣优惠券',
        GIFT: '赠送优惠券'
      }
      this.couponData.forEach(_ => {
        if (_.key === 'type') {
          _.value = couponType[this.couponInfo[_.key]]
          return
        }
        if (_.key === 'way') {
          if (this.couponInfo['type'] === 'DISCOUNT') {
            _.value = `满${this.couponInfo.amount}打${this.couponInfo
              .parsedBenefit / 10}折`
          } else if (this.couponInfo['type'] === 'REBATE') {
            _.value = `满${this.couponInfo.amount}抵${this.couponInfo.parsedBenefit}元`
          } else {
            _.value = `满${this.couponInfo.amount}送${this.couponInfo.parsedBenefit}`
          }
          return
        }
        _.value = this.couponInfo[_.key]
      })
    },
    handleCouponUseChange(val) {
      if (!val) {
        this.form.couponSelect = ''
      }
    },
    handleCancel() {
      this.phone = ''
      this.form.monetary = ''
      this.form.couponUse = false
      this.form.couponSelect = ''
    },
    handleSure() {
      addNewPurchase({
        memberShipId: this.cardId,
        notes: '',
        operatorId: '',
        couponId: this.form.couponSelect,
        usingCoupon: !!this.form.couponSelect,
        payInAmount: +this.realMonetary.split('元')[0],
        purchaseAmount: +this.form.monetary,
        type: 'PURCHASE'
      }).then(response => {
        console.log(response, 'response')
      })
    },
    modifyIsGIFTStatus(name, status) {
      this[name] = status
    }
  }
}
</script>

<style scoped lang="scss">
@import "~@/styles/variables.scss";
.components-container {
  position: relative;
  height: calc(100vh - 144px);
  & > .vue-splitter-container {
    position: absolute;
    width: 100%;
    bottom: 0;
    top: 78px;
    height: auto;
  }
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

// .el-button--primary {
//   color: #fff !important;
//   background-color: #1890ff !important;
//   border-color: #1890ff !important;
//   border-top-left-radius: 0;
//   border-bottom-left-radius: 0;
// }

.cut-line {
  border: 1px dashed #ddd;
  transform: scaleX(1.5);
  margin: $direction30 -20px;
}

ul.info {
  padding: 0;
  li {
    list-style: none;
    font-size: 14px;
    line-height: 30px;
    height: 30px;
  }
  label {
    width: 100px;
    float: left;
    font-weight: normal;
    text-align: right;
    margin-right: 20px;
  }
}
.number-wrap {
  width: 100%;
  position: relative;
  >>> .el-input__inner {
    border-radius: 4px 0 0 4px;
  }
  span {
    position: absolute;
    left: 200px;
    top: 0;
    bottom: 0;
    width: 38px;
    background-color: #f5f7fa;
    color: #909399;
    border: 1px solid #dcdfe6;
    text-align: center;
    border-radius: 0 4px 4px 0;
    line-height: 36px;
    border-left: 0;
  }
}
.name {
  width: 20%;
  float: left;
  min-width: 100px;
}
.phone {
  font-weight: bold;
  color: grey;
  margin-left: 14px;
}
.el-row {
  margin-top: 28px;
  text-align: right;
}
</style>
