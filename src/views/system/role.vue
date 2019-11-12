<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        placeholder="输入角色名称"
        style="width: 200px;"
        class="filter-item"
        clearable
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
        v-waves
        class="filter-item"
        type="success"
        icon="el-icon-plus"
        @click="handleAdd"
      >添加角色</el-button>
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
      <el-table-column
        label="序号"
        prop="id"
        sortable="custom"
        align="center"
        width="80"
        :class-name="getSortClass('id')"
      >
        <template slot-scope="props">
          <span>{{ (listQuery.page - 1) * listQuery.limit + props.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="角色名称" min-width="180px" align="center" />
      <el-table-column prop="createdAt" label="创建时间" min-width="180px" align="center">
        <template slot-scope="{row}">{{ row.createdAt | timeFilter }}</template>
      </el-table-column>
      <el-table-column prop="createdAt" label="最近一次更新时间" min-width="150px" align="center">
        <template slot-scope="{row}">{{ row.updatedAt | timeFilter }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="mini" type="warning" @click="handleUpdate(row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :limit="listQuery.limit"
      :page="listQuery.page"
      :total="total"
      @pagination="handlePagination"
    />

    <el-dialog
      width="480px"
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      @closed="beforeClose"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="120px"
        style="width: 400px;"
      >
        <el-form-item label="角色名称：" prop="name">
          <el-input v-model="temp.name" clearable placeholder="请输入角色名称" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">关闭</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
    getRoles,
    addRole,
    updateEnterprise,
    deleteEnterprise
} from '@/api/role'
import waves from '@/directive/waves' // waves directive
import { parseTime, deepClone } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
// import { listData } from './constant'
// import patterns from '@/patterns'

export default {
    name: 'ComplexTable',
    components: { Pagination },
    directives: { waves },
    filters: {
        statusFilter(status) {
            const statusMap = {
                TRIAL: '试用',
                试用: '',
                NORMAL: '正常使用',
                正常使用: 'success',
                EXPIRED: '使用到期',
                使用到期: 'warning',
                DELETED: '禁用',
                禁用: 'danger'
            }
            return statusMap[status]
        },
        timeFilter(time) {
            return parseTime(time)
        },
        operateFilter(status) {
            const statusMap = {
                TRIAL: '禁用',
                NORMAL: '禁用',
                EXPIRED: '禁用',
                DELETED: '启用',
                禁用: 'danger',
                启用: 'success'
            }
            return statusMap[status]
        }
    },
    data() {
    // const ownerValidate = (rule, value, callback) => {
    //   if (String(value).length < 3 || String(value).length > 16) {
    //     callback(new Error("联系人必须为3-16位"));
    //   } else {
    //     callback();
    //   }
    // };
        return {
            tableKey: 0,
            list: null,
            total: 0,
            listLoading: true,
            listQuery: {
                page: 1,
                limit: 15,
                name: undefined,
                sort: '+id',
                phone: undefined
            },
            importanceOptions: [1, 2, 3],
            sortOptions: [
                { label: 'ID Ascending', key: '+id' },
                { label: 'ID Descending', key: '-id' }
            ],
            statusOptions: ['published', 'draft', 'deleted'],
            showReviewer: false,
            temp: {
                name: ''
            },
            dialogFormVisible: false,
            dialogStatus: '',
            dialogPvVisible: false,
            pvData: [],
            rules: {
                name: [{ required: true, message: '角色名称为必填', trigger: 'blur' }]
            },
            downloadLoading: false,
            textMap: {
                update: '编辑',
                create: '新增'
            },
            typeStatus: '',
            areaData: []
        }
    },
    created() {
        this.getList()
    },
    methods: {
        getList() {
            this.listLoading = true
            getRoles().then(response => {
                const data = response
                const list = Array.isArray(data) ? data : []
                this.list = list.slice()
                const { name, phone, page, limit } = this.listQuery
                if (name != null && name !== '') {
                    this.list = this.list.filter(_ => {
                        if (_.name.indexOf(name) >= 0) {
                            return true
                        }
                        return false
                    })
                }
                if (phone != null && phone !== '') {
                    this.list = this.list.filter(_ => {
                        if (_.ownerPhone.indexOf(phone) >= 0) {
                            return true
                        }
                        return false
                    })
                }
                this.total = this.list.length
                this.list = this.list.slice((page - 1) * limit, page * limit)
                this.listLoading = false
            })
        },
        handleFilter() {
            this.listQuery.page = 1
            this.getList()
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
                name: ''
            }
        },
        createData() {
            this.$refs['dataForm'].validate(valid => {
                if (valid) {
                    addRole(Object.assign(this.temp, { id: 1 })).then(response => {
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
            this.dialogStatus = 'update'
            this.temp = Object.assign({}, row) // copy obj
            const fullAddressLike = {
                0: this.temp.province,
                1: this.temp.city,
                2: this.temp.district,
                length: 3
            }
            const fullAddressArray = Array.from(fullAddressLike)
            const hasEmpty = fullAddressArray.some(_ => !_)
            this.temp.fullAddress = hasEmpty ? [] : fullAddressArray
            this.dialogFormVisible = true
            this.$nextTick(() => {
                this.$refs['dataForm'].clearValidate()
                // const parent = document.getElementsByTagName("body")[0];
                // const childNodes = Array.from(parent.childNodes);
                // const node = childNodes.filter(
                //   node => node.className === "el-popper el-cascader__dropdown"
                // );
                // if (node.length) {
                //   parent.removeChild(node[0]);
                // }
            })
        },
        updateData() {
            this.$refs['dataForm'].validate(valid => {
                if (valid) {
                    const params = Object.assign({}, this.temp)
                    const fullAddress = deepClone(params.fullAddress)
                    delete params.fullAddress
                    params.province = fullAddress[0] || ''
                    params.city = fullAddress[1] || ''
                    params.district = fullAddress[2] || ''
                    updateEnterprise(params).then(() => {
                        // for (const v of this.list) {
                        //   if (v.id === this.temp.id) {
                        //     const index = this.list.indexOf(v);
                        //     this.list.splice(index, 1, this.temp);
                        //     break;
                        //   }
                        // }
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
              '商家名称',
              '联系人',
              '联系人手机号',
              '注册时间',
              '到期时间',
              '状态'
          ]
          const filterVal = [
              'name',
              'owner',
              'ownerPhone',
              'createdAt',
              'createdAt',
              'status'
          ]
          const data = this.formatJson(filterVal, this.list)
          excel.export_json_to_excel({
              header: tHeader,
              data,
              filename: '商家列表'
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
                        return this.$options.filters.statusFilter(v[j])
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
        handleAdd() {
            this.dialogFormVisible = true
            this.dialogStatus = 'create'
            this.resetTemp()
        },
        beforeClose(done) {
            this.$refs['dataForm'].resetFields()
        },
        handleDelete(row) {
            this.$confirm('此操作将禁用该商家, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    deleteEnterprise(row.id).then(response => {
                        this.getList()
                        this.$notify({
                            title: '成功',
                            message: '禁用成功',
                            type: 'success',
                            duration: 2000
                        })
                    })
                })
                .catch(() => {
                    this.$notify({
                        title: '失败',
                        message: '已取消禁用',
                        type: 'warning',
                        duration: 2000
                    })
                })
        },
        showUpdateBtn(status) {
            const statusMap = {
                TRIAL: true,
                NORMAL: true,
                EXPIRED: true,
                DELETED: false
            }
            return statusMap[status]
        },
        handlePagination(val) {
            const { page, limit } = val
            this.listQuery.page = page
            this.listQuery.limit = limit
            this.getList()
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
