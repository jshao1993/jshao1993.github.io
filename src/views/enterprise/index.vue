<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        placeholder="输入商家名称"
        style="width: 200px;"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.phone"
        placeholder="联系人手机号"
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
      >添加商家</el-button>
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
            <el-form-item label="商家名称">
              <span>{{ props.row.name }}</span>
            </el-form-item>
            <el-form-item label="联系人">
              <span>{{ props.row.owner }}</span>
            </el-form-item>
            <el-form-item label="联系人手机号">
              <span>{{ props.row.ownerPhone }}</span>
            </el-form-item>
            <el-form-item label="注册时间">
              <span>{{ props.row.createdAt | timeFilter }}</span>
            </el-form-item>
            <el-form-item label="到期时间">
              <span>{{ props.row.createdAt | timeFilter }}</span>
            </el-form-item>
            <el-form-item label="状态">
              <span>{{ props.row.status | statusFilter }}</span>
            </el-form-item>
            <el-form-item label="地址">
              <span>{{ `${props.row.province} ${props.row.city} ${props.row.district} ${props.row.address}` }}</span>
            </el-form-item>
            <!-- <el-form-item label="充值金额">
              <span>{{ props.row.money }}</span>
            </el-form-item>
            <el-form-item label="对接人">
              <span>{{ props.row.pickPerson }}</span>
            </el-form-item>-->
          </el-form>
        </template>
      </el-table-column>
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
      <el-table-column prop="name" label="商家名称" min-width="180px" align="center" />
      <el-table-column prop="owner" label="联系人" width="180px" align="center" />
      <el-table-column prop="ownerPhone" label="联系人手机号" width="180px" align="center" />
      <el-table-column prop="createdAt" label="注册时间" min-width="180px" align="center">
        <template slot-scope="{row}">{{ row.createdAt | timeFilter }}</template>
      </el-table-column>
      <el-table-column prop="createdAt" label="到期时间" min-width="150px" align="center">
        <template slot-scope="{row}">{{ row.createdAt | timeFilter }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="150px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter | statusFilter">{{ row.status | statusFilter }}</el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="money" label="充值金额" width="150px" align="center">
        <template slot-scope="{row}">
          <el-link :type="row.status | statusFilter" :underline="false">{{ row.money }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="pickPerson" label="对接人" width="150px" align="center" />-->
      <el-table-column
        label="操作"
        align="center"
        width="220px"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row}">
          <el-button
            v-if="showUpdateBtn(row.status)"
            size="mini"
            type="warning"
            @click="handleUpdate(row)"
          >编辑</el-button>
          <el-button
            size="mini"
            :type="row.status | operateFilter | operateFilter"
            @click="handleDelete(row)"
          >{{ row.status | operateFilter }}</el-button>
          <el-button
            v-if="showUpdateBtn(row.status)"
            size="mini"
            type="info"
            @click="handleSet(row)"
          >指定管理员</el-button>
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
      width="540px"
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      @closed="beforeClose('dataForm')"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="120px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="商家名称：" prop="name">
          <el-input v-model="temp.name" clearable placeholder="请输入商家名称" />
        </el-form-item>
        <el-form-item label="联系人：" prop="owner">
          <el-input v-model="temp.owner" clearable placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系人手机号：" prop="ownerPhone">
          <el-input v-model="temp.ownerPhone" clearable placeholder="请输入联系人手机号" />
        </el-form-item>
        <el-form-item label="所在地区：" prop="fullAddress">
          <el-cascader
            ref="cascader"
            v-model="temp.fullAddress"
            placeholder="请选择地区"
            :props="{ expandTrigger: 'click' }"
            clearable
            filterable
            :options="areaData"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="详细地址：" prop="address">
          <el-input v-model="temp.address" clearable placeholder="请输入详细地址" />
        </el-form-item>

        <!-- <el-form-item label="充值金额" prop="money">
          <el-input v-model="temp.money" clearable placeholder="请输入充值金额" />
        </el-form-item>
        <el-form-item label="对接人" prop="pickPerson">
          <el-input v-model="temp.pickPerson" clearable placeholder="请输入对接人" />
        </el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">关闭</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      width="540px"
      title="管理员指定"
      :visible.sync="dialogSpecifyFormVisible"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      @closed="beforeClose('specifyForm')"
    >
      <el-form
        ref="specifyForm"
        :rules="specifyRules"
        :model="specifyTemp"
        label-position="right"
        label-width="120px"
        style="width: 460px; margin-left:10px;"
      >
        <el-form-item label="商家管理员：" prop="uid">
          <el-select
            v-model="specifyTemp.uid"
            filterable
            :filter-method="dataFilter"
            placeholder="请选择商家管理员"
            popper-class="specify-select"
            style="width: 100%;"
            :popper-append-to-body="false"
            clearable
            @visible-change="visibleChange"
          >
            <template>
              <div class="optionHeader">
                <span class="fl">用户名</span>
                <span class="fr phone-header">手机号码</span>
                <span class="fr nick-header">真实姓名</span>
              </div>
            </template>
            <el-option
              v-for="item in users"
              :key="item.id"
              :disabled="item.disabled"
              :label="item.username"
              :value="item.id"
            >
              <span class="fl">{{ item.username }}</span>
              <span class="fr phone">{{ item.phone }}</span>
              <span class="fr nick">{{ item.nickName }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogSpecifyFormVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleSpecify">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchList,
  addEnterprise,
  updateEnterprise,
  deleteEnterprise,
  fetchUserList,
  specifyEnterprise
} from '@/api/enterprise'
import waves from '@/directive/waves' // waves directive
import { parseTime, deepClone } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
// import { listData } from './constant'
import patterns from '@/patterns'
import AreaJson from './area2.json'

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
    const ownerValidate = (rule, value, callback) => {
      if (String(value).length < 3 || String(value).length > 16) {
        callback(new Error('联系人必须为3-16位'))
      } else {
        callback()
      }
    }
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
        name: '',
        owner: '',
        ownerPhone: '',
        address: '',
        fullAddress: []
      },
      dialogFormVisible: false,
      dialogStatus: '',
      dialogPvVisible: false,
      pvData: [],
      rules: {
        name: [{ required: true, message: '商家名称为必填', trigger: 'blur' }],
        owner: [
          { required: true, message: '联系人为必填', trigger: 'blur' },
          { validator: ownerValidate, trigger: 'blur' }
        ],
        ownerPhone: [
          { required: true, message: '联系人手机号为必填', trigger: 'blur' },
          {
            pattern: patterns.mobile,
            message: '请输入正确的联系人手机号',
            trigger: 'blur'
          }
        ],
        fullAddress: [
          { required: true, message: '所在地区为必填', trigger: 'change' }
        ],
        address: [
          { required: true, message: '详细地址为必填', trigger: 'blur' }
        ]
        // registerTime: [
        //   {
        //     type: "date",
        //     required: true,
        //     message: "请选择注册时间",
        //     trigger: "change"
        //   }
        // ],
        // dueTime: [
        //   {
        //     type: "date",
        //     required: true,
        //     message: "请选择到期时间",
        //     trigger: "change"
        //   }
        // ],
        // money: [
        //   { required: true, message: "充值金额为必填", trigger: "blur" },
        //   {
        //     pattern: patterns.positiveNumber,
        //     message: "请输入正确的金额",
        //     trigger: "blur"
        //   }
        // ],
        // pickPerson: [
        //   { required: true, message: "对接人为必填", trigger: "blur" }
        // ]
      },
      specifyRules: {
        uid: [{ required: true, message: '商家管理员为必选', trigger: 'blur' }]
      },
      downloadLoading: false,
      textMap: {
        update: '编辑',
        create: '新增'
      },
      typeStatus: '',
      areaData: [],
      dialogSpecifyFormVisible: false,
      users: [],
      specifyTemp: {
        uid: ''
      },
      eid: ''
    }
  },
  created() {
    this.getList()
    this.initAreaData()
    this.getUserList()
  },
  methods: {
    initAreaData() {
      this.areaData = AreaJson
      for (var i = 0; i < this.areaData.length; i++) {
        if (
          this.areaData[i].children &&
          this.areaData[i].children.length === 0
        ) {
          delete this.areaData[i].children // 解决因为省级区域没有下级市的BUG
        }
      }
    },
    getUserList() {
      fetchUserList({ pageNumber: 1, pageSize: 10000 }).then(response => {
        this.users = Array.isArray(response.records) ? response.records : []
        this.copyUsers = this.users.slice()
      })
    },
    getList() {
      this.listLoading = true
      fetchList().then(response => {
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
        name: '',
        owner: '',
        ownerPhone: '',
        address: '',
        fullAddress: []
      }
    },
    resetSpecifyTemp() {
      this.specifyTemp = {
        uid: ''
      }
    },
    handleSpecify() {
      this.$refs['specifyForm'].validate(valid => {
        if (valid) {
          specifyEnterprise({
            eid: this.eid,
            role: 'ADMIN',
            uid: this.specifyTemp.uid
          }).then(response => {
            this.dialogSpecifyFormVisible = false
            // this.getList();
            this.$notify({
              title: 'Success',
              message: '指定成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          // this.temp.id = parseInt(Math.random() * 100) + 1024; // mock a id'
          const params = Object.assign({}, this.temp)
          const fullAddress = deepClone(params.fullAddress)
          delete params.fullAddress
          params.province = fullAddress[0] || ''
          params.city = fullAddress[1] || ''
          params.district = fullAddress[2] || ''
          addEnterprise(params).then(response => {
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
    beforeClose(formName) {
      this.$refs[formName].resetFields()
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
    },
    handleSet(row) {
      this.eid = row.id
      this.dialogSpecifyFormVisible = true
      this.resetSpecifyTemp()
    },
    dataFilter(val) {
      // 自定义搜索
      if (val) {
        // val存在
        this.users = this.copyUsers.filter((item, index) => {
          if (
            !!~item.username.indexOf(val) ||
            !!~item.phone.indexOf(val) ||
            !!~item.nickName.indexOf(val)
          ) {
            return true
          }
        })
      } else {
        // val为空时，还原数组
        this.users = this.copyUsers
      }
    },
    visibleChange(val) {
      // 解决自定义搜索是的bug
      if (!val) return
      this.users = this.copyUsers
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

<style lang="scss">
.specify-select {
  .el-select-dropdown__wrap {
    & > .el-select-dropdown__list {
      padding-top: 0.5px;
      & > .el-select-dropdown__item {
        &.selected {
          .phone {
            color: #1890ff !important;
          }
        }
        .phone {
          color: #8492a6;
          font-size: 13px;
        }
        .nick {
          margin: 0 30px;
        }
      }
      & > .optionHeader {
        cursor: auto;
        background: #ddd;
        color: rgba(0, 0, 0, 0.6);
        font-weight: 700;
        overflow: hidden;
        padding: 0 20px;
        height: 36px;
        .nick-header {
          margin-right: 57px;
        }
        .phone-header {
          color: rgba(0, 0, 0, 0.6);
          font-weight: 700;
        }
      }
    }
  }
}
</style>
