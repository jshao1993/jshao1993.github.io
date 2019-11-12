<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="输入手机号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="table-expand">
            <el-form-item label="客户姓名">
              <span>{{ props.row.name }}</span>
            </el-form-item>
            <el-form-item label="客户手机号">
              <span>{{ props.row.phone }}</span>
            </el-form-item>
            <el-form-item label="会员卡">
              <span>{{ props.row.cardName }}</span>
            </el-form-item>
            <el-form-item label="注册时间">
              <span>{{ props.row.time }}</span>
            </el-form-item>
            <el-form-item label="充值金额">
              <span>{{ props.row.rechargeAmount }}</span>
            </el-form-item>
            <el-form-item label="消费金额">
              <span>{{ props.row.consumeAmount }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column label="序号" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="props">
          <span>{{ props.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="客户姓名" width="180px" align="center" />
      <el-table-column prop="phone" label="客户手机号" min-width="180px" align="center" />
      <el-table-column prop="cardName" label="会员卡" width="180px" align="center" />
      <el-table-column prop="time" label="注册时间" width="180px" align="center" />
      <el-table-column prop="rechargeAmount" label="充值金额" width="150px" align="center" />
      <el-table-column prop="consumeAmount" label="消费金额" width="150px" align="center" />
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleHistory(row)">
            消费历史
          </el-button>
          <el-button size="mini" type="warning" @click="handleDelete(row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-drawer
      title="消费历史"
      :visible.sync="drawer"
      direction="rtl"
      :before-close="handleClose"
    >
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in activities"
          :key="index"
          :icon="activity.icon"
          :type="activity.type"
          :color="activity.color"
          :size="activity.size"
          :timestamp="activity.timestamp"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </el-drawer>
  </div>
</template>

<script>
import { fetchList, fetchPv, createArticle, updateArticle } from '@/api/article'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { listData } from './constant'
import patterns from '@/patterns'

const calendarTypeOptions = [
    { key: 'CN', display_name: 'China' },
    { key: 'US', display_name: 'USA' },
    { key: 'JP', display_name: 'Japan' },
    { key: 'EU', display_name: 'Eurozone' }
]

const typeOptions = [
    { key: '充值', display_name: '充值' },
    { key: '消费', display_name: '消费' }
]

const typeStatusOptions = {
    recharge: [
        { key: '充值返券', display_name: '充值返券' },
        { key: '打折卡', display_name: '打折卡' }
    ],
    time: [
        { key: '日卡', display_name: '日卡' },
        { key: '周卡', display_name: '周卡' },
        { key: '月卡', display_name: '月卡' },
        { key: '季度卡', display_name: '季度卡' },
        { key: '半年卡', display_name: '半年卡' },
        { key: '年卡', display_name: '年卡' }
    ]
}

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
    acc[cur.key] = cur.display_name
    return acc
}, {})

export default {
    name: 'ComplexTable',
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
        },
        typeFilter(type) {
            return calendarTypeKeyValue[type]
        }
    },
    data() {
        return {
            tableKey: 0,
            list: null,
            total: 0,
            listLoading: true,
            listQuery: {
                page: 1,
                limit: 20,
                name: undefined,
                number: undefined,
                type: undefined,
                sort: '+id'
            },
            importanceOptions: [1, 2, 3],
            calendarTypeOptions,
            typeOptions,
            typeStatusOptions,
            sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
            statusOptions: ['published', 'draft', 'deleted'],
            showReviewer: false,
            temp: {
                id: undefined,
                data: undefined,
                name: '',
                type: '',
                mobile: '',
                amount: '',
                number: undefined
            },
            dialogFormVisible: false,
            dialogStatus: '',
            textMap: {
                update: '编辑',
                create: '新增'
            },
            typeStatus: '',
            typeMap: {
                recharge: '充值卡优惠类型',
                time: '时间会员卡类型'
            },
            dialogPvVisible: false,
            pvData: [],
            rules: {
                type: [{ required: true, message: '会员卡类型为必选', trigger: 'change' }],
                name: [{ required: true, message: '会员姓名为必填', trigger: 'blur' }],
                mobile: [{ required: true, message: '会员手机号码为必填', trigger: 'blur' },
                    { pattern: patterns.mobile, message: '请输入正确的手机号码', trigger: 'blur' }],
                amount: [{ required: true, message: '充值金额为必填', trigger: 'blur' },
                    { pattern: patterns.positiveNumber, message: '请输入正确的金额', trigger: 'blur' }]
            },
            downloadLoading: false,
            drawer: false,
            activities: [{
                content: '充值200元，送20元',
                timestamp: '2018-04-12 20:46',
                size: 'large',
                type: 'primary',
                icon: 'el-icon-more'
            }, {
                content: '充值20元',
                timestamp: '2018-04-03 20:46',
                color: '#0bbd87'
            }, {
                content: '消费20元',
                timestamp: '2018-04-03 20:46',
                size: 'large'
            }, {
                content: '注册会员卡',
                timestamp: '2018-04-03 20:46'
            }]
        }
    },
    created() {
        this.getList()
    },
    methods: {
        getList() {
            this.listLoading = true
            fetchList(this.listQuery).then(response => {
                // this.list = response.data.items
                const { name, type, number } = this.listQuery
                this.list = listData
                this.list = this.list.filter(_ => {
                    return name ? _.name === name : true &&
                 type ? _.type === type : true &&
                 number ? _.number === number : true
                })
                // this.total = response.data.total
                this.total = this.list.length

                // Just to simulate the time of the request
                setTimeout(() => {
                    this.listLoading = false
                }, 1.5 * 1000)
            })
        },
        handleFilter() {
            this.listQuery.page = 1
            this.getList()
        },
        handleModifyStatus(row, status) {
            this.$message({
                message: '操作Success',
                type: 'success'
            })
            row.status = status
        },
        sortChange(data) {
            const { prop, order } = data
            if (prop === 'id') {
                this.sortByID(order)
            }
        },
        sortByID(order) {
            if (order === 'ascending') {
                this.listQuery.sort = '+id'
            } else {
                this.listQuery.sort = '-id'
            }
            this.handleFilter()
        },
        resetTemp() {
            this.temp = {
                id: undefined,
                importance: 1,
                remark: '',
                timestamp: new Date(),
                title: '',
                status: 'published',
                type: ''
            }
        },
        createData() {
            this.$refs['dataForm'].validate((valid) => {
                if (valid) {
                    this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
                    this.temp.date = new Date()
                    this.temp.number = parseInt(Math.random() * 100) + 1024 // mock a number
                    createArticle(this.temp).then(() => {
                        this.list.unshift(this.temp)
                        this.dialogFormVisible = false
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
            this.temp = Object.assign({}, row) // copy obj
            this.dialogStatus = 'update'
            this.typeStatus = this.temp.type === '充值会员卡' ? 'recharge' : 'time'
            this.dialogFormVisible = true
            this.$nextTick(() => {
                this.$refs['dataForm'].clearValidate()
            })
        },
        updateData() {
            this.$refs['dataForm'].validate((valid) => {
                if (valid) {
                    const tempData = Object.assign({}, this.temp)
                    updateArticle(tempData).then(() => {
                        for (const v of this.list) {
                            if (v.id === this.temp.id) {
                                const index = this.list.indexOf(v)
                                this.list.splice(index, 1, this.temp)
                                break
                            }
                        }
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
        handleDelete(row) {
            this.$notify({
                title: 'Success',
                message: '删除成功',
                type: 'success',
                duration: 2000
            })
            const index = this.list.indexOf(row)
            this.list.splice(index, 1)
        },
        handleFetchPv(pv) {
            fetchPv(pv).then(response => {
                this.pvData = response.data.pvData
                this.dialogPvVisible = true
            })
        },
        handleDownload() {
            this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['会员卡id', '办卡日期', '类型', '会员姓名', '会员手机号']
          const filterVal = ['date', 'type', 'number', 'name']
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
            return jsonData.map(v => filterVal.map(j => {
                if (j === 'timestamp') {
                    return parseTime(v[j])
                } else {
                    return v[j]
                }
            }))
        },
        getSortClass: function(key) {
            const sort = this.listQuery.sort
            return sort === `+${key}`
                ? 'ascending'
                : sort === `-${key}`
                    ? 'descending'
                    : ''
        },
        handleStatusChange(newStatus) {
            this.$notify({
                title: 'Success',
                message: `${newStatus ? '启用' : '停卡'}成功`,
                type: 'success',
                duration: 2000
            })
        },
        handleHistory(row) {
            this.drawer = true
        },
        handleClose(done) {
            this.$confirm('确认关闭？')
                .then(_ => {
                    done()
                })
                .catch(_ => {})
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
</style>
