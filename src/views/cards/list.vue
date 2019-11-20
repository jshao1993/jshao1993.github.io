<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.phone"
        placeholder="会员手机号码"
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
        :loading="downloadLoading"
        class="filter-item"
        type="warning"
        icon="el-icon-download"
        @click="handleDownload"
      >导出</el-button>
      <el-button
        class="filter-item"
        type="success"
        icon="el-icon-plus"
        @click="handleCreate"
      >新增</el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="序号" prop="id" align="center" width="80">
        <template slot-scope="props">
          <span>{{
            (listQuery.pageNum - 1) * listQuery.pageSize +
              props.$index +
              1
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="客户称呼" width="120px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.customerName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="客户手机号" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.customerPhone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="办卡时间" min-width="160px" align="center">
        <template slot-scope="scope">
          <span>{{
            scope.row.createdAt | parseTime("{y}-{m}-{d} {h}:{i}")
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="会员卡编号"
        min-width="150px"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.sid }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="充值金额（元）"
        width="150px"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.money }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="会员卡状态"
        min-width="200px"
        align="center"
      >
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            active-color="#13ce66"
            active-text="正常"
            inactive-text="停卡"
            active-value="NORMAL"
            inactive-value="CLOSED"
            :disabled="true"
            @click.native="handleStatusClick(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="120"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button
            type="warning"
            size="mini"
            @click="handleUpdate(row)"
          >编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getList"
    />

    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
      width="520px"
      :before-close="handleClose"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="120px"
        style="width: 410px; margin-left:20px;"
      >
        <el-form-item label="会员卡类型:" prop="type">
          <el-radio-group v-model="temp.type">
            <el-radio label="CREDITED">充值卡</el-radio>
            <el-radio label="TIMED">时间卡</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="会员卡名称:" prop="cid">
          <el-select
            v-model="temp.cid"
            filterable
            style="width: 100%;"
            class="filter-item"
            placeholder="请选择会员卡"
            @change="cidChange"
          >
            <el-option
              v-for="item in membercardsOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="客户称呼:" prop="customerName">
          <el-input
            v-model="temp.customerName"
            clearable
            placeholder="请输入会员姓名"
          />
        </el-form-item>
        <el-form-item label="客户手机号:" prop="customerPhone">
          <el-input
            v-model="temp.customerPhone"
            clearable
            placeholder="请输入会员电话"
          />
        </el-form-item>
        <!-- v-if="temp.type === 'CREDITED'" -->
        <el-form-item label="充值金额" prop="money">
          <el-input
            v-model="temp.money"
            clearable
            placeholder="请输入充值金额"
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
import {
    fetchList,
    fetchConfigType,
    addCard,
    startCard,
    stopCard,
    updateCard,
    fetchCard
} from '@/api/card'
import waves from '@/directive/waves' // waves directive
import { parseTime, deepClone } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import patterns from '@/patterns'

const membercardsTypeOptions = [
    { key: '充值会员卡', display_name: '充值会员卡' },
    { key: '时间会员卡', display_name: '时间会员卡' }
]

export default {
    name: 'CardList',
    components: { Pagination },
    directives: { waves },
    filters: {
        statusFilter(status) {
            const statusMap = {
                published: 'success',
                draft: 'info',
                deleted: 'danger'
            }
            return statusMap[status]
        }
    },
    data() {
        const phoneValidate = async(rule, value, callback) => {
            const result = await this.getCard(value)
            const idExsist =
                this.cardObj !== null &&
                this.cardObj.id != null && // null or undefined
                this.cardObj.id !== ''
            if (idExsist && this.cardObj.customerPhone === value) {
                return false
            }
            Array.isArray(result) && result.length
                ? callback(new Error('该手机号已经存在'))
                : callback()
        }
        return {
            tableKey: 0,
            list: null,
            total: 0,
            listLoading: true,
            listQuery: {
                pageNum: 1,
                pageSize: 20,
                phone: undefined
            },
            membercardsTypeOptions,
            temp: {
                type: 'CREDITED',
                cid: '',
                customerName: '',
                customerPhone: '',
                money: ''
            },
            dialogFormVisible: false,
            dialogStatus: '',
            textMap: {
                update: '编辑',
                create: '新增'
            },
            rules: {
                type: [
                    {
                        required: true,
                        message: '会员卡类型为必选',
                        trigger: 'change'
                    }
                ],
                cid: [
                    {
                        required: true,
                        message: '会员卡名称为必选',
                        trigger: 'blur'
                    }
                ],
                customerName: [
                    {
                        required: true,
                        message: '客户称呼为必填',
                        trigger: 'blur'
                    }
                ],
                customerPhone: [
                    {
                        required: true,
                        message: '客户手机号为必填',
                        trigger: 'blur'
                    },
                    {
                        pattern: patterns.mobile,
                        message: '请输入正确的手机号码',
                        trigger: 'blur'
                    },
                    { validator: phoneValidate, trigger: 'blur' }
                ],
                money: [
                    {
                        required: true,
                        message: '充值金额为必填',
                        trigger: 'blur'
                    },
                    {
                        pattern: patterns.positiveNumber,
                        message: '请输入正确的金额',
                        trigger: 'blur'
                    }
                ]
            },
            downloadLoading: false,
            membercardsOptions: [],
            currentCid: '',
            creditedCideTemp: '',
            timedCideTemp: '',
            cardObj: null
        }
    },
    computed: {
        enterprise() {
            return this.$store.getters.enterprise
        }
    },
    watch: {
        'temp.type': {
            handler(newVal, oldVal) {
                this.membercardsOptions = this.cloneMembercardsOptions.filter(
                    _ => _.type === newVal
                )
                const nowCide =
                    newVal === 'TIMED'
                        ? this.timedCideTemp
                        : this.creditedCideTemp
                const nCardArr = this.membercardsOptions.filter(
                    _ => _.id === nowCide
                )
                if (nCardArr.length) {
                    this.temp.cid = nCardArr[0].id
                } else {
                    this.temp.cid = ''
                }
            }
        }
    },
    created() {
        this.getList()
        this.getConfigType()
    },
    methods: {
        getList() {
            this.listLoading = true
            const ep = this.enterprise.filter(_ => _.name === '李宝的店铺')
            this.listQuery.eid = ep[0].eid
            fetchList(this.listQuery).then(response => {
                this.list = response.records
                this.total = response.total
                this.listLoading = false
            })
        },
        getCard(phone) {
            const ep = this.enterprise.filter(_ => _.name === '李宝的店铺')
            const eid = ep[0].eid
            return new Promise((resolve, reject) => {
                fetchCard({ eid, phone }).then(response => {
                    resolve(response)
                })
            })
        },
        handleFilter() {
            this.listQuery.pageNum = 1
            this.getList()
        },
        resetTemp() {
            this.temp = {
                type: 'CREDITED',
                cid: '',
                customerName: '',
                customerPhone: '',
                money: ''
            }
        },
        handleCreate() {
            this.cardObj = null
            this.timedCideTemp = ''
            this.creditedCideTemp = ''
            this.dialogStatus = 'create'
            this.dialogFormVisible = true
        },
        createData() {
            this.$refs['dataForm'].validate(valid => {
                if (valid) {
                    const ep = this.enterprise.filter(
                        _ => _.name === '李宝的店铺'
                    )
                    const temp = Object.assign({}, this.temp)
                    // if (temp.type === "TIMED") {
                    //     temp.money = 200; // 测试数据
                    // }
                    delete temp.type
                    temp.eid = ep[0].eid
                    addCard(temp).then(response => {
                        this.resetTemp()
                        this.$refs['dataForm'].clearValidate()
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
        handleUpdate(row) {
            this.cardObj = row
            this.timedCideTemp = ''
            this.creditedCideTemp = ''
            this.temp = Object.assign({}, row) // copy obj
            const nCardArr = this.cloneMembercardsOptions.filter(
                _ => _.id === this.temp.cid
            )
            nCardArr.length && this.$set(this.temp, 'type', nCardArr[0].type)
            if (!this.temp.type) {
                this.$confirm(
                    '该会员卡所关联的会员卡配置已经删除, 是否重新选择?',
                    '提示',
                    {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }
                )
                    .then(() => {
                        this.$set(this.temp, 'type', 'CREDITED')
                        this.temp.cid = ''
                        this.dialogStatus = 'update'
                        this.dialogFormVisible = true
                    })
                    .catch(() => {
                        this.resetTemp()
                        this.$notify({
                            title: '失败',
                            message: '取消关联',
                            type: 'warning',
                            duration: 2000
                        })
                    })
            } else {
                this.temp.type === 'TIMED'
                    ? (this.timedCideTemp = this.temp.cid)
                    : (this.creditedCideTemp = this.temp.cid)
                this.dialogStatus = 'update'
                this.dialogFormVisible = true
            }
        },
        updateData() {
            this.$refs['dataForm'].validate(valid => {
                if (valid) {
                    const temp = Object.assign({}, this.temp)
                    delete temp.createdAt
                    delete temp.updatedAt
                    updateCard(temp).then(() => {
                        this.resetTemp()
                        this.$refs['dataForm'].clearValidate()
                        this.dialogFormVisible = false
                        this.getList()
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
        handleDownload() {
            this.downloadLoading = true
            import('@/vendor/Export2Excel').then(excel => {
                const tHeader = [
                    '客户称呼',
                    '客户手机号',
                    '办卡时间',
                    '会员卡编号',
                    '充值金额（元）',
                    '会员卡状态'
                ]
                const filterVal = [
                    'customerName',
                    'customerPhone',
                    'createdAt',
                    'sid',
                    'money',
                    'status'
                ]
                const data = this.formatJson(filterVal, this.list)
                excel.export_json_to_excel({
                    header: tHeader,
                    data,
                    filename: '会员卡列表'
                })
                this.downloadLoading = false
            })
        },
        formatJson(filterVal, jsonData) {
            return jsonData.map(v =>
                filterVal.map(j => {
                    if (j === 'createdAt') {
                        return parseTime(v[j])
                    } else if (j === 'status') {
                        return v[j] === 'NORMAL' ? '正常' : '停卡'
                    } else {
                        return v[j]
                    }
                })
            )
        },
        handleStatusClick(row) {
            const { status } = row
            const statusFunc = status === 'NORMAL' ? stopCard : startCard
            statusFunc(row.id).then(response => {
                this.dialogFormVisible = false
                status === 'NORMAL'
                    ? (row.status = 'CLOSED')
                    : (row.status = 'NORMAL')
                this.$notify({
                    title: 'Success',
                    message: `${row.status === 'NORMAL' ? '启用' : '停卡'}成功`,
                    type: 'success',
                    duration: 2000
                })
            })
        },
        handleClose(done) {
            this.resetTemp()
            this.$refs['dataForm'].clearValidate()
            done()
        },
        closeDialog() {
            this.resetTemp()
            this.$refs['dataForm'].clearValidate()
            this.dialogFormVisible = false
        },
        getConfigType() {
            const ep = this.enterprise.filter(_ => _.name === '李宝的店铺')
            return new Promise((resolve, reject) => {
                fetchConfigType(ep[0].eid).then(response => {
                    if (Array.isArray(response)) {
                        this.cloneMembercardsOptions = deepClone(response)
                        this.membercardsOptions = response.filter(
                            _ => _.type === this.temp.type
                        )
                    }
                    resolve(this.membercardsOptions)
                })
            })
        },
        cidChange(currentVal) {
            this.temp.type === 'TIMED'
                ? (this.timedCideTemp = currentVal)
                : (this.creditedCideTemp = currentVal)
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
    &.is-disabled {
        opacity: 1;
        & >>> .el-switch__label,
        & >>> .el-switch__core {
            cursor: pointer;
        }
    }
}
</style>
