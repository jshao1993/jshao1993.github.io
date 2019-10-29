<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="请输入名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button v-waves class="filter-item" type="success" icon="el-icon-plus" @click="handleAdd">
        添加
      </el-button>
    </div>

    <el-row :gutter="12">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-wrap">
            <div class="card-circle">
              <h5>提示:<span>打折券</span></h5>
              <div>
                <i class="el-icon-postcard" />
              </div>
            </div>
            <div class="card-detail">
              <h4>消费200打9折</h4>
              <p>发券数<i class="el-icon-bank-card" /><strong>200</strong></p>
            </div>
          </div>
          <div class="card-amount">
            <p>充值金额<i class="el-icon-caret-top" />200</p>
            <p>打折力度<i class="el-icon-caret-bottom" />90％</p>
          </div>
          <div class="card-handle">
            <p>
              <a><i class="el-icon-edit" />修改</a>
            </p>
            <p>
              <a><i class="el-icon-delete" />删除</a>
            </p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-wrap">
            <div class="card-circle">
              <h5>提示:<span>打折券</span></h5>
              <div>
                <i class="el-icon-postcard" />
              </div>
            </div>
            <div class="card-detail">
              <h4>消费200打9折</h4>
              <p>发券数<i class="el-icon-bank-card" /><strong>200</strong></p>
            </div>
          </div>
          <div class="card-amount">
            <p>充值金额<i class="el-icon-caret-top" />200</p>
            <p>打折力度<i class="el-icon-caret-bottom" />90％</p>
          </div>
          <div class="card-handle">
            <p>
              <a><i class="el-icon-edit" />修改</a>
            </p>
            <p>
              <a><i class="el-icon-delete" />删除</a>
            </p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog width="540px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="优惠券类型:" prop="type">
          <el-select v-model="temp.type" style="width: 100%;" class="filter-item" placeholder="请选择优惠券类型">
            <el-option v-for="item in typeMapOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="消费金额:" prop="amount">
          <el-input v-model="temp.amount" clearable placeholder="请输入消费金额">
            <el-button slot="append">元</el-button>
          </el-input>
        </el-form-item>
        <el-form-item v-if="temp.type === 'discount'" label="打折力度:" prop="discount">
          <el-input v-model="temp.discount" clearable placeholder="请输入打折力度">
            <el-button slot="append">%</el-button>
          </el-input>
        </el-form-item>
        <el-form-item v-if="temp.type === 'deduction'" label="抵价额:" prop="deduction">
          <el-input v-model="temp.deduction" clearable placeholder="请输入抵价额">
            <el-button slot="append">元</el-button>
          </el-input>
        </el-form-item>
        <el-form-item v-if="temp.type === 'give'" label="赠送内容:" prop="give">
          <el-input v-model="temp.give" clearable placeholder="请输入赠送内容" />
        </el-form-item>
        <el-form-item label="使用说明:" prop="introduce">
          <el-input
            v-model="temp.introduce"
            type="textarea"
            maxlength="30"
            show-word-limit
            placeholder="请输入使用说明"
          />
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
import waves from '@/directive/waves' // waves directive
import patterns from '@/patterns'
import { parseTime } from '@/utils'
import { fetchList, createArticle, updateArticle } from '@/api/article'

const typeMapOptions = [
  { label: '折扣优惠券', value: 'discount' },
  { label: '抵价优惠券', value: 'deduction' },
  { label: '赠送优惠券', value: 'give' }
]

export default {
  name: 'ComplexTable',
  directives: { waves },
  data() {
    return {
      listQuery: {
        name: undefined
      },
      temp: {
        id: undefined,
        type: 'discount',
        amount: '',
        discount: '',
        deduction: '',
        give: '',
        introduce: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新增'
      },
      typeStatus: '',
      typeMapOptions,
      rules: {
        type: [{ required: true, message: '优惠券类型为必选', trigger: 'change' }],
        amount: [{ required: true, message: '消费金额为必填', trigger: 'blur' },
          { pattern: patterns.positiveNumber, message: '请输入正确的消费金额', trigger: 'blur' }],
        discount: [{ required: true, message: '打折力度为必填', trigger: 'blur' }],
        deduction: [{ required: true, message: '抵价额为必填', trigger: 'blur' }],
        give: [{ required: true, message: '赠送内容为必填', trigger: 'blur' }],
        introduce: [{ required: true, message: '使用说明为必填', trigger: 'blur' }]
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
        // const { name, type, number } = this.listQuery
        // this.list = listData
        // this.list = this.list.filter(_ => {
        //   return name ? _.name === name : true &&
        //          type ? _.type === type : true &&
        //          number ? _.number === number : true
        // })
        // // this.total = response.data.total
        // this.total = this.list.length

        // // Just to simulate the time of the request
        // setTimeout(() => {
        //   this.listLoading = false
        // }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: 'Success',
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
    handleAdd() {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
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
        background: #108EFF;
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
        width: 100px;
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
      background: #F8F9FA;
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
          color: #E6A23C;
        }
      }
    }

    .el-icon-caret-top {
      color: #67C23A;
    }

    .el-icon-caret-bottom {
      color: #F56C6C;
    }

    .el-icon-bank-card {
      color: #7F91FF;
      margin: 0 6px;
      font-size: 16px;
    }

    .el-icon-postcard {
      font-size: 28px;
      line-height: 60px;
    }
</style>
