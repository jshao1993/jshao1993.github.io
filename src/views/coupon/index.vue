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
          <el-divider class="card-tip">{{ card.name }}</el-divider>
          <div class="card-wrap">
            <div class="card-circle">
              <h5>
                提示:
                <span>{{ typeMapOptionsObj[card.type] }}</span>
              </h5>
              <div>
                <i class="el-icon-postcard" />
              </div>
            </div>
            <div class="card-detail">
              <h4>
                消费{{ card.amount
                }}{{
                  card.parsedBenefit
                    | benefitFilter(card.type)
                }}
              </h4>
              <p>
                发券数
                <i class="el-icon-bank-card" />
                <strong>200</strong>
              </p>
            </div>
          </div>
          <div class="card-amount">
            <p>
              充值金额
              <i class="el-icon-caret-top" />
              {{ card.amount }}
            </p>
            <p>
              {{ cardTypeObj[card.type] }}
              <i
                v-if="cardTypeObj[card.type]"
                class="el-icon-caret-bottom"
              />
              {{
                card.parsedBenefit
                  | benefitDetailFilter(card.type)
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
      width="540px"
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
        label-width="120px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="优惠券类型:" prop="type">
          <el-select
            v-model="temp.type"
            style="width: 100%;"
            class="filter-item"
            placeholder="请选择优惠券类型"
            @change="typeChange"
          >
            <el-option
              v-for="item in typeMapOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优惠券名称:" prop="name">
          <el-input
            v-model="temp.name"
            clearable
            placeholder="请输入优惠券名称"
          />
        </el-form-item>
        <el-form-item label="消费金额:" prop="amount">
          <el-input
            v-model="temp.amount"
            clearable
            placeholder="请输入消费金额"
          >
            <el-button slot="append">元</el-button>
          </el-input>
        </el-form-item>
        <el-form-item
          v-if="typeMapOptionsObj[temp.type].label === 'DISCOUNT'"
          :rules="[
            {
              required: true,
              message: '打折力度为必填',
              trigger: 'blur'
            }
          ]"
          label="打折力度:"
          prop="benefit"
        >
          <el-input
            v-model="temp.benefit"
            clearable
            placeholder="请输入打折力度"
          >
            <el-button slot="append">%</el-button>
          </el-input>
        </el-form-item>
        <el-form-item
          v-if="typeMapOptionsObj[temp.type].label === 'REBATE'"
          :rules="[
            {
              required: true,
              message: '抵价额为必填',
              trigger: 'blur'
            }
          ]"
          label="抵价额:"
          prop="benefit"
        >
          <el-input
            v-model="temp.benefit"
            clearable
            placeholder="请输入抵价额"
          >
            <el-button slot="append">元</el-button>
          </el-input>
        </el-form-item>
        <el-form-item
          v-if="typeMapOptionsObj[temp.type].label === 'GIFT'"
          :rules="[
            {
              required: true,
              message: '赠送内容为必填',
              trigger: 'blur'
            }
          ]"
          label="赠送内容:"
          prop="benefit"
        >
          <el-input
            v-model="temp.benefit"
            clearable
            placeholder="请输入赠送内容"
          />
        </el-form-item>
        <el-form-item label="使用说明:" prop="intro">
          <el-input
            v-model="temp.intro"
            type="textarea"
            maxlength="30"
            show-word-limit
            placeholder="请输入使用说明"
          />
        </el-form-item>
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
import noData from '@/components//NoData'
import { getCoupon, addCoupon, updateCoupon, deleteCoupon } from '@/api/coupon'
import noDataPic from '@/assets/no-data/no-data.png'

const typeMapOptions = [
    { label: '抵价优惠券', value: 0, desc: 'REBATE' }, // REBATE
    { label: '折扣优惠券', value: 1, desc: 'DISCOUNT' }, // DISCOUNT
    { label: '赠送优惠券', value: 2, desc: 'GIFT' } // GIFT
]
const typeMapOptionsObj = {
    0: {
        label: 'REBATE',
        text: '抵价额'
    },
    REBATE: '抵价券',
    1: {
        label: 'DISCOUNT',
        text: '打折力度'
    },
    DISCOUNT: '折扣券',
    2: {
        label: 'GIFT',
        text: '赠送内容'
    },
    GIFT: '赠送券'
}

const cardTypeObj = {
    REBATE: '返现',
    DISCOUNT: '打折力度',
    GIFT: ''
}

export default {
    name: 'CouponList',
    directives: { waves },
    components: {
        noData
    },
    filters: {
        benefitFilter(benefit, type) {
            if (type === 'REBATE') {
                return `抵${benefit}`
            } else if (type === 'DISCOUNT') {
                return `打${benefit / 10}折`
            } else {
                return `送${benefit}`
            }
        },
        benefitDetailFilter(benefit, type) {
            if (type === 'REBATE') {
                return benefit
            } else if (type === 'DISCOUNT') {
                return `${benefit}%`
            } else {
                return ''
            }
        }
    },
    data() {
        return {
            listQuery: {
                name: undefined
            },
            temp: {
                eid: undefined,
                type: 0, // REBATE 抵价优惠券
                name: '',
                amount: '',
                intro: '',
                benefit: ''
            },
            dialogFormVisible: false,
            dialogStatus: '',
            textMap: {
                update: '编辑',
                create: '新增'
            },
            typeStatus: '',
            typeMapOptions,
            typeMapOptionsObj,
            cardTypeObj,
            list: [],
            noDataPic
        }
    },
    computed: {
        enterprise() {
            return this.$store.getters.enterprise
        },
        rules() {
            return {
                type: [
                    {
                        required: true,
                        message: '优惠券类型为必选',
                        trigger: 'change'
                    }
                ],
                name: [
                    {
                        required: true,
                        message: '优惠券名称为必填',
                        trigger: 'blur'
                    }
                ],
                amount: [
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
                intro: [
                    {
                        required: true,
                        message: '使用说明为必填',
                        trigger: 'blur'
                    }
                ]
            }
        }
    },
    created() {
        this.getList()
    },
    methods: {
        getList() {
            const ep = this.enterprise.filter(_ => _.name === '李宝的店铺')
            getCoupon(ep[0].eid).then(response => {
                if (Array.isArray(response)) {
                    this.listQuery.name == null && (this.listQuery.name = '') // null or undefined
                    this.list = response.filter(
                        _ => !!_.type && !!~_.name.indexOf(this.listQuery.name)
                    )
                }
            })
        },
        handleFilter() {
            this.getList()
        },
        resetTemp() {
            const temp = {
                name: '',
                amount: '',
                intro: '',
                benefit: ''
            }
            this.temp = Object.assign({}, this.temp, temp)
        },
        closeDialog() {
            this.$refs['dataForm'].resetFields()
            this.dialogFormVisible = false
        },
        createData() {
            this.$refs['dataForm'].validate(valid => {
                if (valid) {
                    const ep = this.enterprise.filter(
                        _ => _.name === '李宝的店铺'
                    )
                    this.temp.eid = ep[0].eid
                    addCoupon(this.temp).then(() => {
                        this.$refs['dataForm'].resetFields()
                        this.dialogFormVisible = false
                        this.getList()
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
            this.dialogStatus = 'create'
            this.dialogFormVisible = true
        },
        handleClose(done) {
            this.$refs['dataForm'].resetFields()
            done()
        },
        handleUpdate(card) {
            this.temp = Object.assign({}, card) // copy obj
            const type = this.typeMapOptions.filter(
                _ => _.desc === this.temp.type
            )
            this.temp.type = type.length ? type[0].value : ''
            this.dialogStatus = 'update'
            this.dialogFormVisible = true
        },
        updateData() {
            this.$refs['dataForm'].validate(valid => {
                if (valid) {
                    const tempData = Object.assign({}, this.temp)
                    delete tempData.createdAt
                    delete tempData.updatedAt
                    updateCoupon(tempData).then(() => {
                        this.getList()
                        this.dialogFormVisible = false
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
            this.$confirm('此操作将删除该优惠券, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    deleteCoupon(card.id).then(response => {
                        this.getList()
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
            this.resetTemp()
            this.$refs['dataForm'].clearValidate()
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

.card-wrap {
    .card-circle {
        width: 100px;
        float: left;
        text-align: center;
        h5 {
            margin: 10px 0;
            color: red;
        }
        div {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #108eff;
            text-align: center;
            /* vertical-align: middle; */
            line-height: 60px;
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
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
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
        width: 110px;
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
    line-height: 60px;
}
.el-card {
    min-width: 260px;
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
.el-col-6 {
    min-width: 266px;
    margin-bottom: 12px;
}
</style>
