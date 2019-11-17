<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select
        v-model="listQuery.type"
        placeholder="消费类型"
        clearable
        class="filter-item"
        style="width: 150px"
      >
        <el-option
          v-for="item in typeOptions"
          :key="item.key"
          :label="item.display_name"
          :value="item.key"
        />
      </el-select>
      <el-input
        v-model="listQuery.phone"
        placeholder="输入手机号"
        style="width: 200px;"
        clearable
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        搜索
      </el-button>
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="warning"
        icon="el-icon-download"
        @click="handleDownload"
      >导出</el-button>
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
      <!-- <el-table-column type="expand">
                <template slot-scope="props">
                    <el-form label-position="left" inline class="table-expand">
                        <el-form-item label="客户姓名">
                            <span>{{ props.row.name }}</span>
                        </el-form-item>
                        <el-form-item label="客户手机号">
                            <span>{{ props.row.phone }}</span>
                        </el-form-item>
                        <el-form-item label="会员卡名称">
                            <span>{{ props.row.cardName }}</span>
                        </el-form-item>
                        <el-form-item label="消费时间">
                            <span>{{ props.row.time }}</span>
                        </el-form-item>
                        <el-form-item label="消费充值金额">
                            <span>{{ props.row.amount }}</span>
                        </el-form-item>
                    </el-form>
                </template>
            </el-table-column> -->
      <el-table-column
        label="序号"
        prop="id"
        sortable="custom"
        align="center"
        width="80"
        :class-name="getSortClass('id')"
      >
        <template slot-scope="props">
          <span>{{
            (listQuery.pageNum - 1) * listQuery.pageSize +
              props.$index +
              1
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="customerName"
        label="顾客名称"
        min-width="140px"
        align="center"
      />
      <el-table-column
        prop="customerPhon"
        label="顾客手机号"
        min-width="140px"
        align="center"
      />
      <el-table-column
        prop="memberShipId"
        label="会员卡id"
        min-width="140px"
        align="center"
      />
      <el-table-column
        prop="memberShipName"
        label="会员卡名称"
        min-width="140px"
        align="center"
      />
      <el-table-column
        prop="consumeTime"
        label="消费时间"
        min-width="140px"
        align="center"
      />
      <el-table-column
        prop="money"
        label="消费或充值金额"
        min-width="140px"
        align="center"
      />
      <el-table-column
        prop="type"
        label="消费类型"
        min-width="140px"
        align="center"
      />
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { fetchList } from '@/api/consume'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import patterns from '@/patterns'

const typeOptions = [
    { key: 'DEPOSIT', display_name: '充值' },
    { key: 'PURCHASE', display_name: '消费' }
]

export default {
    name: 'ConsumeRecords',
    components: { Pagination },
    directives: { waves },
    data() {
        return {
            tableKey: 0,
            list: null,
            total: 0,
            listLoading: true,
            listQuery: {
                pageNum: 1,
                pageSize: 20,
                phone: undefined,
                type: undefined
            },
            typeOptions,
            temp: {
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
                type: [
                    {
                        required: true,
                        message: '会员卡类型为必选',
                        trigger: 'change'
                    }
                ],
                name: [
                    {
                        required: true,
                        message: '会员姓名为必填',
                        trigger: 'blur'
                    }
                ],
                mobile: [
                    {
                        required: true,
                        message: '会员手机号码为必填',
                        trigger: 'blur'
                    },
                    {
                        pattern: patterns.mobile,
                        message: '请输入正确的手机号码',
                        trigger: 'blur'
                    }
                ],
                amount: [
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
            downloadLoading: false
        }
    },
    computed: {
        enterprise() {
            return this.$store.getters.enterprise
        }
    },
    created() {
        this.getList()
    },
    methods: {
        getList() {
            this.listLoading = true
            const ep = this.enterprise.filter(_ => _.name === '李宝的店铺')
            this.listQuery.eid = ep[0].eid
            fetchList(this.listQuery).then(response => {
                this.list = response.records
                this.listLoading = false
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
        // createData() {
        //     this.$refs["dataForm"].validate(valid => {
        //         if (valid) {
        //             this.temp.id = parseInt(Math.random() * 100) + 1024; // mock a id
        //             this.temp.date = new Date();
        //             this.temp.number = parseInt(Math.random() * 100) + 1024; // mock a number
        //             createArticle(this.temp).then(() => {
        //                 this.list.unshift(this.temp);
        //                 this.dialogFormVisible = false;
        //                 this.$notify({
        //                     title: "Success",
        //                     message: "新增成功",
        //                     type: "success",
        //                     duration: 2000
        //                 });
        //             });
        //         }
        //     });
        // },
        handleUpdate(row) {
            this.temp = Object.assign({}, row) // copy obj
            this.dialogStatus = 'update'
            this.typeStatus =
                this.temp.type === '充值会员卡' ? 'recharge' : 'time'
            this.dialogFormVisible = true
            this.$nextTick(() => {
                this.$refs['dataForm'].clearValidate()
            })
        },
        // updateData() {
        //     this.$refs["dataForm"].validate(valid => {
        //         if (valid) {
        //             const tempData = Object.assign({}, this.temp);
        //             updateArticle(tempData).then(() => {
        //                 for (const v of this.list) {
        //                     if (v.id === this.temp.id) {
        //                         const index = this.list.indexOf(v);
        //                         this.list.splice(index, 1, this.temp);
        //                         break;
        //                     }
        //                 }
        //                 this.dialogFormVisible = false;
        //                 this.$notify({
        //                     title: "Success",
        //                     message: "更新成功",
        //                     type: "success",
        //                     duration: 2000
        //                 });
        //             });
        //         }
        //     });
        // },
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
        handleDownload() {
            this.downloadLoading = true
            import('@/vendor/Export2Excel').then(excel => {
                const tHeader = [
                    '会员卡id',
                    '办卡日期',
                    '类型',
                    '会员姓名',
                    '会员手机号'
                ]
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
            return jsonData.map(v =>
                filterVal.map(j => {
                    if (j === 'timestamp') {
                        return parseTime(v[j])
                    } else {
                        return v[j]
                    }
                })
            )
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
