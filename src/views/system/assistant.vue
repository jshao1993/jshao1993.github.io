<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="输入店员手机号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="warning" icon="el-icon-download" @click="handleDownload">
        导出
      </el-button>
      <el-button v-waves class="filter-item" type="success" icon="el-icon-plus" @click="handleAdd">
        添加店员
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
            <el-form-item label="店员手机号">
              <span>{{ props.row.phone }}</span>
            </el-form-item>
            <el-form-item label="店员昵称">
              <span>{{ props.row.name }}</span>
            </el-form-item>
            <el-form-item label="登记时间">
              <span>{{ props.row.time }}</span>
            </el-form-item>
            <el-form-item label="店员角色">
              <span>{{ props.row.role }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column label="序号" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="props">
          <span>{{ props.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="店员手机号" width="180px" align="center" />
      <el-table-column prop="name" label="店员昵称" min-width="180px" align="center" />
      <el-table-column prop="time" label="登记时间" width="180px" align="center" />
      <el-table-column prop="role" label="店员角色" width="180px" align="center" />
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog width="540px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" @closed="beforeClose">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="店员手机号" prop="name">
          <el-input v-model="temp.name" clearable placeholder="请输入店员手机号" />
        </el-form-item>
        <el-form-item label="店员昵称" prop="phonePerson">
          <el-input v-model="temp.phonePerson" clearable placeholder="请输入店员昵称" />
        </el-form-item>
        <el-form-item label="店员角色" prop="phone">
          <el-input v-model="temp.phone" clearable placeholder="请输入店员角色" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          关闭
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, createArticle, updateArticle } from '@/api/article'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { listData } from './constant'
import patterns from '@/patterns'

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
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
        sort: '+id'
      },
      importanceOptions: [1, 2, 3],
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        name: '',
        phonePerson: '',
        phone: '',
        registerTime: '',
        dueTime: '',
        money: '',
        pickPerson: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      typeStatus: '',
      dialogPvVisible: false,
      pvData: [],
      rules: {
        name: [{ required: true, message: '会员姓名为必填', trigger: 'blur' }],
        phonePerson: [{ required: true, message: '联系人为必填', trigger: 'blur' }],
        phone: [{ required: true, message: '联系人手机号为必填', trigger: 'blur' },
          { pattern: patterns.mobile, message: '请输入正确的联系人手机号', trigger: 'blur' }],
        registerTime: [
          { type: 'date', required: true, message: '请选择注册时间', trigger: 'change' }
        ],
        dueTime: [
          { type: 'date', required: true, message: '请选择到期时间', trigger: 'change' }
        ],
        money: [{ required: true, message: '充值金额为必填', trigger: 'blur' },
          { pattern: patterns.positiveNumber, message: '请输入正确的金额', trigger: 'blur' }],
        pickPerson: [{ required: true, message: '对接人为必填', trigger: 'blur' }]
      },
      downloadLoading: false,
      textMap: {
        update: '编辑',
        create: '新增'
      }
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
        name: '',
        phonePerson: '',
        phone: '',
        registerTime: '',
        dueTime: '',
        money: '',
        pickPerson: ''
      }
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id'
          this.temp.status = 'inUse'
          createArticle(this.temp).then(() => {
            this.list.unshift(JSON.parse(JSON.stringify(this.temp)))
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
    handleAdd() {
      this.dialogFormVisible = true
      this.dialogStatus = 'create'
      this.resetTemp()
    },
    beforeClose(done) {
      this.$refs['dataForm'].resetFields()
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
