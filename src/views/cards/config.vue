<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        placeholder="请输入优惠券名称"
        clearable
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >搜索</el-button>
      <el-button
        v-waves
        class="filter-item"
        type="success"
        icon="el-icon-plus"
        @click="handleAdd"
      >添加</el-button>
    </div>

    <no-data v-if="!list.length" :icon="noDataPic" text="暂无数据" />

    <el-row :gutter="12">
      <el-col v-for="card in list" :key="card.id" :span="6">
        <el-card shadow="hover">
          <el-divider
            class="card-tip"
          >提示:{{
            card.config.type | typeFilter(card.config)
          }}</el-divider>
          <div class="card-wrap">
            <div class="card-circle">
              <div>
                <i class="el-icon-postcard" />
              </div>
            </div>
            <div class="card-detail">
              <h4>{{ card.name }}</h4>
              <p>
                发卡数
                <i class="el-icon-bank-card" />
                <strong>200</strong>
              </p>
            </div>
          </div>
          <div class="card-amount">
            <p>
              {{
                card.type === "TIMED" ? "生效时间" : "充值金额"
              }}
              <i class="el-icon-caret-top" />
              {{
                card.type === "TIMED"
                  ? timeParse(
                    card.config.startDate,
                    "{y}-{m}-{d}"
                  )
                  : card.config.amount
              }}
            </p>
            <p>
              {{ card.config.type | benefitFilter(card.config) }}
              <i class="el-icon-caret-bottom" />
              {{
                card.config.type | typeDetailFilter(card.config)
              }}
            </p>
          </div>
          <div class="card-handle">
            <p>
              <a @click="handleUpdate(card)">
                <i class="el-icon-edit" />修改
              </a>
            </p>
            <p>
              <a @click="handleDelete(card)">
                <i class="el-icon-delete" />删除
              </a>
            </p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      width="620px"
      :before-close="handleClose"
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="116px"
        style="width: 520px; margin-left:40px;"
      >
        <el-form-item label="会员卡名称:" prop="name">
          <el-input
            v-model="temp.name"
            clearable
            placeholder="请输入会员卡名称"
          />
        </el-form-item>
        <el-form-item label="会员卡类型:" prop="type">
          <el-select
            v-model="temp.type"
            style="width: 100%;"
            class="filter-item"
            placeholder="请选择会员卡类型"
            @change="typeChange"
          >
            <el-option
              v-for="item in membercardsTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <!-- 会员卡类型：时间会员卡 -->
        <template v-if="temp.type === 'TIMED'">
          <el-form-item label="时间类型:" prop="config.timedType">
            <el-select
              v-model="temp.config.timedType"
              style="width: 100%;"
              class="filter-item"
              placeholder="请选择时间类型"
              @change="timeTypeChange"
            >
              <el-option
                v-for="item in timeTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="生效时间:" prop="config.effectiveTime">
            <!-- temp.timeType 6--自定义时可以选择日期 -->
            <el-date-picker
              v-model="temp.config.effectiveTime"
              style="width: 100%;"
              type="datetimerange"
              align="right"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="['08:00:00', '20:00:00']"
              :picker-options="pickerOptions"
              :disabled="temp.config.timedType !== 'CUSTOMIZE'"
            />
          </el-form-item>
        </template>
        <!-- 会员卡类型：充值会员卡 -->
        <template v-else>
          <el-form-item label="优惠类型:" prop="config.type">
            <el-select
              v-model="temp.config.type"
              style="width: 100%;"
              class="filter-item"
              placeholder="请选择优惠类型"
              @change="typeChange"
            >
              <el-option
                v-for="item in preferentialTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="充值金额:" prop="config.amount">
            <el-input
              v-model="temp.config.amount"
              clearable
              placeholder="请输入充值金额"
            >
              <el-button slot="append">元</el-button>
            </el-input>
          </el-form-item>
          <!-- 优惠类型：打折卡 -->
          <template v-if="temp.config.type === 'DISCOUNT'">
            <el-form-item label="打折力度:" prop="config.discount">
              <el-input
                v-model="temp.config.discount"
                clearable
                placeholder="请输入打折力度"
              >
                <el-button slot="append">%</el-button>
              </el-input>
            </el-form-item>
          </template>
          <!-- 优惠类型：充值返券 -->
          <template v-else>
            <el-form-item prop="config.cashBack" label="返现金额:">
              <el-input
                v-model="temp.config.cashBack"
                clearable
                placeholder="请输入返现金额"
              >
                <el-button slot="append">元</el-button>
              </el-input>
            </el-form-item>
            <el-form-item
              label="是否使用优惠券:"
              prop="config.useCoupon"
            >
              <el-switch
                v-model="temp.config.useCoupon"
                active-color="#13ce66"
                active-text="开"
                inactive-text="关"
              />
            </el-form-item>
            <el-form-item
              v-if="temp.config.useCoupon"
              label="优惠券:"
              prop="config.couponId"
            >
              <el-select
                v-model="temp.config.couponId"
                style="width: 100%;"
                class="filter-item"
                placeholder="请选择优惠券"
              >
                <el-option
                  v-for="item in couponList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </template>
        </template>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">关闭</el-button>
        <el-button
          type="primary"
          @click="
            dialogStatus === 'create' ? createData() : updateData()
          "
        >确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import patterns from '@/patterns'
import { parseTime, deepClone } from '@/utils'
import noData from '@/components//NoData'
import {
    fetchConfigType,
    addCardConfig,
    deleteCardConfig,
    updateCardConfig
} from '@/api/card'
import { getCoupon } from '@/api/coupon'
import noDataPic from '@/assets/no-data/no-data.png'

const membercardsTypeOptions = [
    { label: '充值会员卡', value: 'CREDITED' },
    { label: '时间会员卡', value: 'TIMED' }
]

const preferentialTypeOptions = [
    { label: '充值返券', value: 'COUPON' },
    { label: '打折卡', value: 'DISCOUNT' }
]

const timeTypeOptions = [
    { label: '日卡', value: 'DAY', days: 1 },
    { label: '周卡', value: 'WEEK', days: 7 },
    { label: '月卡', value: 'MONTH', days: 30 },
    { label: '季卡', value: 'QUARTER', days: 90 },
    { label: '半年卡', value: 'HALF_YEAR', days: 180 },
    { label: '年卡', value: 'YEAR', days: 360 },
    { label: '自定义', value: 'CUSTOMIZE' }
]

export default {
    name: 'CardConfig',
    directives: { waves },
    components: {
        noData
    },
    filters: {
        typeFilter(configType, config) {
            const typeObj = {
                TIMED: '时间卡',
                DISCOUNT: '打折卡',
                COUPON: '返劵卡'
            }
            let desc = typeObj[configType]
            if (typeof config.useCoupon !== 'boolean') return desc
            const couponIdExsist = typeof config.couponId === 'number'
            config.useCoupon && couponIdExsist
                ? (desc = `${desc}，使用优惠券`)
                : (desc = `${desc}，无优惠券`)
            return desc
        },
        benefitFilter(configType, config) {
            const benefitObj = {
                TIMED: '',
                DISCOUNT: '打折力度',
                COUPON: ''
            }
            let desc = benefitObj[configType]
            if (typeof config.useCoupon !== 'boolean') return desc
            const couponIdExsist = typeof config.couponId === 'number'
            config.useCoupon && couponIdExsist
                ? (desc = `${desc}优惠券`)
                : (desc = `${desc}返现`)
            return desc
        },
        typeDetailFilter(configType, config) {
            if (configType === 'TIMED') {
                return parseTime(config.endDate, '{y}-{m}-{d}')
            } else if (configType === 'DISCOUNT') {
                return `${config.discount}%`
            } else {
                if (typeof config.useCoupon === 'boolean') {
                    const couponIdExsist = typeof config.couponId === 'number'
                    return config.useCoupon && couponIdExsist
                        ? `${config.cashBack}元劵`
                        : `${config.cashBack}`
                }
                return ''
            }
        }
    },
    data() {
        const nameValidate = async(rule, value, callback) => {
            const result = await this.getConfigType()
            const idExsist =
                this.cardObj !== null &&
                this.cardObj.id !== null && // null or undefined
                this.cardObj.id !== ''
            const len = result.filter(_ => {
                if (idExsist && this.cardObj.id === _.id) {
                    return false
                }
                return _.name === value
            }).length
            len > 0 ? callback(new Error('该名称已经存在')) : callback()
        }
        return {
            listQuery: {
                name: undefined
            },
            temp: {
                type: 'CREDITED', // 充值会员卡
                name: '',
                config: {
                    type: 'COUPON', // 充值返券
                    amount: '',
                    timedType: 'DAY', // 日卡
                    effectiveTime: [], // 生效时间
                    cashBack: '',
                    discount: '',
                    useCoupon: false,
                    couponId: ''
                }
            },
            dialogFormVisible: false,
            dialogStatus: '',
            textMap: {
                update: '编辑',
                create: '新增'
            },
            typeStatus: '',
            list: [],
            noDataPic,
            rules: {
                name: [
                    {
                        required: true,
                        message: '会员卡名称为必填',
                        trigger: 'blur'
                    },
                    { validator: nameValidate, trigger: 'blur' }
                ],
                type: [
                    {
                        required: true,
                        message: '会员卡类型为必选',
                        trigger: 'change'
                    }
                ],
                'config.type': [
                    {
                        required: true,
                        message: '优惠类型为必选',
                        trigger: 'change'
                    }
                ],
                'config.amount': [
                    {
                        required: true,
                        message: '消费金额为必填',
                        trigger: 'blur'
                    },
                    {
                        pattern: patterns.positiveNumber,
                        message: '请输入正确的消费金额',
                        trigger: 'blur'
                    }
                ],
                'config.discount': [
                    {
                        required: true,
                        message: '打折力度为必填',
                        trigger: 'blur'
                    }
                ],
                'config.cashBack': [
                    {
                        required: true,
                        message: '返现金额为必填',
                        trigger: 'blur'
                    }
                ],
                'config.couponId': [
                    {
                        required: true,
                        message: '优惠券为必选',
                        trigger: 'change'
                    }
                ],
                'config.timedType': [
                    {
                        required: true,
                        message: '时间类型为必选',
                        trigger: 'change'
                    }
                ],
                'config.effectiveTime': [
                    {
                        required: true,
                        message: '生效时间为必选',
                        trigger: 'blur'
                    }
                ]
            },
            membercardsTypeOptions,
            preferentialTypeOptions,
            timeTypeOptions,
            pickerOptions: {
                disabledDate(time) {
                    return time.getTime() < Date.now() - 8.64e7
                }
            },
            couponList: [],
            cardObj: null
        }
    },
    computed: {
        enterprise() {
            return this.$store.getters.enterprise
        }
    },
    created() {
        this.getConfigType()
        this.getCouponList()
    },
    methods: {
        getCouponList() {
            const ep = this.enterprise.filter(_ => _.name === '李宝的店铺')
            getCoupon(ep[0].eid).then(response => {
                if (Array.isArray(response)) {
                    this.couponList = response
                }
            })
        },
        getConfigType() {
            const ep = this.enterprise.filter(_ => _.name === '李宝的店铺')
            return new Promise((resolve, reject) => {
                fetchConfigType(ep[0].eid).then(response => {
                    if (Array.isArray(response)) {
                        const { name } = this.listQuery
                        if (name != null) {
                            this.list = response.filter(
                                _ => !!~_.name.indexOf(name)
                            )
                            return
                        }
                        this.list = response
                    }
                    resolve(this.list)
                })
            })
        },
        handleFilter() {
            this.getConfigType()
        },
        resetTemp() {
            this.temp = {
                type: 'CREDITED', // 充值会员卡
                name: '',
                config: {
                    type: 'COUPON', // 充值返券
                    amount: '',
                    timedType: 'DAY', // 日卡
                    effectiveTime: [], // 生效时间
                    cashBack: '',
                    discount: '',
                    useCoupon: false,
                    couponId: ''
                }
            }
        },
        closeDialog() {
            this.resetTemp()
            this.$refs['dataForm'].clearValidate()
            this.dialogFormVisible = false
        },
        formatterData() {
            const ep = this.enterprise.filter(_ => _.name === '李宝的店铺')
            const { name, type, config } = this.temp
            const configType = config.type
            const paramsObj = Object.create(null)
            paramsObj.name = name
            paramsObj.type = type
            paramsObj.eid = ep[0].eid
            paramsObj.config = Object.create(null)
            if (type === 'TIMED') {
                const { timedType, effectiveTime } = config
                paramsObj.config.type = 'TIMED'
                paramsObj.config.timedType = timedType
                paramsObj.config.startDate = effectiveTime[0]
                paramsObj.config.endDate = effectiveTime[1]
            } else {
                // type === 'CREDITED'
                if (configType === 'DISCOUNT') {
                    const { type, amount, discount } = config
                    paramsObj.config.type = type
                    paramsObj.config.amount = amount
                    paramsObj.config.discount = discount
                } else if (configType === 'COUPON') {
                    const {
                        type,
                        amount,
                        cashBack,
                        useCoupon,
                        couponId
                    } = config
                    paramsObj.config.type = type
                    paramsObj.config.amount = amount
                    paramsObj.config.cashBack = cashBack
                    paramsObj.config.useCoupon = useCoupon
                    useCoupon && (paramsObj.config.couponId = couponId)
                }
            }
            return paramsObj
        },
        createData() {
            this.$refs['dataForm'].validate(valid => {
                if (valid) {
                    const paramsObj = this.formatterData()
                    addCardConfig(paramsObj).then(() => {
                        this.resetTemp()
                        this.$refs['dataForm'].clearValidate()
                        this.dialogFormVisible = false
                        this.getConfigType()
                        this.$notify({
                            title: 'Success',
                            message: '新增成功',
                            type: 'success',
                            duration: 2000
                        })
                    })
                }
            })
        },
        handleAdd() {
            this.cardObj = null
            this.dialogStatus = 'create'
            this.dialogFormVisible = true
            const start = new Date().getTime()
            const end = new Date().setTime(start + 3600 * 1000 * 24 * 1)
            this.temp.config.effectiveTime = [start, end]
        },
        handleClose(done) {
            this.resetTemp()
            this.$refs['dataForm'].clearValidate()
            done()
        },
        handleUpdate(card) {
            this.cardObj = card
            const temp = deepClone(this.temp)
            this.temp = Object.assign({}, temp, card) // copy obj
            this.temp.config = Object.assign({}, temp.config, card.config) // copy config obj
            const effectiveTimeLen = this.temp.config.effectiveTime
            const start = new Date().getTime()
            const end = new Date().setTime(start + 3600 * 1000 * 24 * 1)
            effectiveTimeLen && (this.temp.config.effectiveTime = [start, end])
            this.dialogStatus = 'update'
            this.dialogFormVisible = true
        },
        updateData() {
            this.$refs['dataForm'].validate(valid => {
                if (valid) {
                    const paramsObj = this.formatterData()
                    paramsObj.id = this.temp.id
                    updateCardConfig(paramsObj).then(() => {
                        this.resetTemp()
                        this.$refs['dataForm'].clearValidate()
                        this.dialogFormVisible = false
                        this.getConfigType()
                        this.$notify({
                            title: 'Success',
                            message: '更新成功',
                            type: 'success',
                            duration: 2000
                        })
                    })
                }
            })
        },
        handleDelete(card) {
            this.$confirm('此操作将删除该会员卡配置, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    deleteCardConfig(card.id).then(response => {
                        this.getConfigType()
                        this.$notify({
                            title: '成功',
                            message: '删除成功',
                            type: 'success',
                            duration: 2000
                        })
                    })
                })
                .catch(() => {
                    this.$notify({
                        title: '失败',
                        message: '取消删除',
                        type: 'warning',
                        duration: 2000
                    })
                })
        },
        typeChange(val) {
            this.$refs['dataForm'].clearValidate()
        },
        timeTypeChange(val) {
            const days = this.timeTypeOptions.filter(_ => _.value === val)
            let end = new Date()
            const start = new Date().getTime()
            if (days.length && days[0].days) {
                end = end.setTime(start + 3600 * 1000 * 24 * days[0].days)
                this.temp.config.effectiveTime = [start, end]
            } else {
                this.temp.config.effectiveTime = []
            }
        },
        timeParse(time, cFormat) {
            return parseTime(time, cFormat)
        }
    }
}
</script>

<style scoped lang="scss">
.el-switch {
    /deep/ .el-switch__label {
        color: #606266;
        &.is-active {
            color: #1890ff;
        }
    }
}
.table-expand {
    font-size: 0;
}
.table-expand label {
    width: 90px;
    color: #99a9bf;
}
.table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
}

.el-divider--horizontal {
    margin: 12px 0;
}

.card-tip {
    >>> .el-divider__text {
        color: red;
        white-space: nowrap;
        max-width: 80%;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

.card-wrap {
    .card-circle {
        width: 100px;
        float: left;
        text-align: center;
        padding-top: 8px;
        div {
            width: 76px;
            height: 76px;
            border-radius: 50%;
            background: #108eff;
            text-align: center;
            /* vertical-align: middle; */
            line-height: 76px;
            color: #fff;
            margin: 0 auto;
        }
    }
    .card-detail {
        margin-left: 100px;
        height: 95px;
        text-align: center;
        h4 {
            line-height: 2.3;
            margin: 0;
            font-size: 22px;
            color: #ddd;
        }
        p {
            margin: 0;
            line-height: 2.8;
            font-size: 14px;
        }
    }
}
.card-amount {
    font-size: 14px;
    text-align: center;
    line-height: 16px;
    height: 16px;
    & > p:first-child {
        min-width: 110px;
        margin: 0;
        float: left;
    }
    & > p:last-child {
        margin-left: 120px;
        margin-top: 10px;
        margin-bottom: 5px;
    }
}
.card-handle {
    overflow: hidden;
    background: #f8f9fa;
    margin: 0 -20px;
    text-align: center;
    margin-bottom: -20px;
    margin-top: 10px;
    font-size: 14px;
    color: grey;
    p {
        width: 50%;
        float: left;
        &:hover {
            color: #e6a23c;
        }
    }
}

.el-icon-caret-top {
    color: #67c23a;
}

.el-icon-caret-bottom {
    color: #f56c6c;
}

.el-icon-bank-card {
    color: #7f91ff;
    margin: 0 6px;
    font-size: 16px;
}

.el-icon-postcard {
    font-size: 28px;
    line-height: 76px;
}

.el-date-editor {
    >>> .el-range-separator {
        width: 10%;
    }
}
.el-col-6 {
    padding: 5px 6px;
}
</style>
