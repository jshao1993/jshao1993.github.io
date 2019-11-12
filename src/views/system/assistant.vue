<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        placeholder="输入用户名"
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
        v-waves
        class="filter-item"
        type="success"
        icon="el-icon-plus"
        @click="handleAdd"
      >添加用户</el-button>
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
            <el-form-item label="用户名">
              <span>{{ props.row.username }}</span>
            </el-form-item>
            <el-form-item label="真实姓名">
              <span>{{ props.row.nickName }}</span>
            </el-form-item>
            <el-form-item label="联系电话">
              <span>{{ props.row.phone }}</span>
            </el-form-item>
            <el-form-item label="邮箱">
              <span>{{ props.row.email }}</span>
            </el-form-item>
            <el-form-item label="注册时间">
              <span>{{ props.row.createdAt | timeFilter }}</span>
            </el-form-item>
            <el-form-item label="最新一次更新时间">
              <span>{{ props.row.updatedAt | timeFilter }}</span>
            </el-form-item>
            <el-form-item label="头像">
              <img
                style="width: 28px;vertical-align: middle;"
                :src="`${baseUrl}${props.row.avatar}`"
                @error="imgLoadError"
              >
            </el-form-item>
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
          <span>{{ (listQuery.pageNum - 1) * listQuery.pageSize + props.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="username" label="用户名" min-width="120px" align="center" />
      <el-table-column prop="nickName" label="真实姓名" min-width="120px" align="center" />
      <el-table-column prop="phone" label="联系电话" min-width="140px" align="center" />
      <el-table-column prop="email" label="邮箱" min-width="160px" align="center" />
      <el-table-column prop="createdAt" label="注册时间" min-width="160px" align="center">
        <template slot-scope="{row}">{{ row.createdAt | timeFilter }}</template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="最新一次更新时间" min-width="160px" align="center">
        <template slot-scope="{row}">{{ row.updatedAt | timeFilter }}</template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="140px"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row}">
          <el-button size="mini" type="warning" @click="handleUpdate(row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getList"
    />

    <el-dialog
      width="740px"
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
      @closed="beforeClose"
    >
      <el-form
        id="formff"
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="110px"
        style="width: 640px; margin-left:20px;"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户名：" prop="username">
              <el-input
                v-model="temp.username"
                :disabled="dialogStatus==='update'"
                clearable
                placeholder="请输入用户名"
              />
            </el-form-item>
          </el-col>
          <template v-if="dialogStatus==='create'">
            <el-col :span="12">
              <el-form-item label="密码：" prop="password">
                <el-input
                  v-model="temp.password"
                  class="password-input"
                  :show-password="passwordShow"
                  :type="passwordType"
                  clearable
                  placeholder="请输入密码"
                  @focus="handlePwdFocus"
                />
                <password v-model="temp.password" :strength-meter-only="true" />
              </el-form-item>
            </el-col>
          </template>
          <el-col :span="12">
            <el-form-item label="真实姓名：" prop="nickName">
              <el-input v-model="temp.nickName" clearable placeholder="请输入真实姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话：" prop="phone">
              <el-input
                v-model="temp.phone"
                :disabled="dialogStatus==='update'"
                clearable
                placeholder="请输入联系电话"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱：" prop="email">
              <el-input
                v-model="temp.email"
                :disabled="dialogStatus==='update'"
                clearable
                placeholder="请输入邮箱"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="头像：" prop="avatar">
              <el-input v-model="temp.avatar" class="hidden" />
              <el-upload
                class="avatar-uploader"
                :action="`${avatar}`"
                :headers="{['X-Authorization']: $store.getters.token}"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
              >
                <img v-if="uploadAvatar" :src="uploadAvatar" class="avatar" @error="imgLoadError">
                <i v-else class="el-icon-plus avatar-uploader-icon" />
                <div slot="tip" class="el-upload__tip">提示：只能上传jpg/png文件，且不超过500kb</div>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">关闭</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createSubmit():updateData()">确定</el-button>
        <button v-show="false" id="submit" ref="submitRef" @click="createData()" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
    fetchList,
    addUser,
    deleteUser,
    updateUser,
    avatar
} from '@/api/system'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
// import { listData } from './constant'
import patterns from '@/patterns'
import Password from 'vue-password-strength-meter'
import defaultAvatar from '@/assets/error_default_avatar/default_avatar.png'

export default {
    name: 'ComplexTable',
    components: { Pagination, Password },
    directives: { waves },
    filters: {
        timeFilter(time) {
            return parseTime(time)
        }
    },
    data() {
        const validatePassword = (rule, value, callback) => {
            if (!value) {
                callback(new Error('密码为必填'))
            } else if (value.length < 8) {
                callback(new Error('密码不能少于8位'))
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
                pageNum: 1,
                pageSize: 15,
                name: undefined
            },
            importanceOptions: [1, 2, 3],
            sortOptions: [
                { label: 'ID Ascending', key: '+id' },
                { label: 'ID Descending', key: '-id' }
            ],
            statusOptions: ['published', 'draft', 'deleted'],
            showReviewer: false,
            temp: {
                username: '',
                nickName: '',
                phone: '',
                email: '',
                avatar: '',
                password: ''
            },
            dialogFormVisible: false,
            dialogStatus: '',
            typeStatus: '',
            dialogPvVisible: false,
            pvData: [],
            rules: {
                username: [
                    { required: true, message: '用户名为必填', trigger: 'blur' }
                ],
                password: [
                    { required: true, validator: validatePassword, trigger: 'blur' }
                ],
                nickName: [
                    { required: true, message: '真实姓名为必填', trigger: 'blur' }
                ],
                phone: [
                    { required: true, message: '联系电话为必填', trigger: 'blur' },
                    {
                        pattern: patterns.mobile,
                        message: '请输入正确的联系电话',
                        trigger: 'blur'
                    }
                ],
                email: [
                    { required: true, message: '邮箱为必填', trigger: 'blur' },
                    {
                        pattern: patterns.email,
                        message: '请输入正确的邮箱',
                        trigger: 'blur'
                    }
                ],
                avatar: [{ required: true, message: '头像为必传', trigger: 'change' }]
                // money: [
                //   { required: true, message: "充值金额为必填", trigger: "blur" },
                //   {
                //     pattern: patterns.positiveNumber,
                //     message: "请输入正确的金额",
                //     trigger: "blur"
                //   }
                // ]
            },
            downloadLoading: false,
            textMap: {
                update: '编辑',
                create: '新增'
            },
            baseUrl: process.env.VUE_APP_STATIC_BASE_URL,
            avatar,
            passwordType: 'text',
            passwordShow: false,
            uploadAvatar: ''
        }
    },
    created() {
        this.getList()
    },
    methods: {
        getList(queryObj) {
            if (typeof queryObj === 'object') {
                const { page = 1, limit = 15 } = queryObj
                this.listQuery.pageNum = page
                this.listQuery.pageSize = limit
            }
            this.listLoading = true
            fetchList(this.listQuery).then(response => {
                this.total = response.total || 0
                this.list = Array.isArray(response.records) ? response.records : []
                this.listLoading = false
            })
        },
        handleFilter() {
            this.listQuery.pageNum = 1
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
                username: '',
                nickName: '',
                phone: '',
                email: '',
                avatar: '',
                password: ''
            }
            this.uploadAvatar = ''
        },
        createData() {
            this.$refs['dataForm'].validate(valid => {
                if (valid) {
                    addUser(this.temp).then(() => {
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
            this.temp = Object.assign({}, row) // copy obj
            this.uploadAvatar = this.baseUrl + this.temp.avatar
            this.dialogStatus = 'update'
            this.dialogFormVisible = true
            this.$nextTick(() => {
                this.$refs['dataForm'].clearValidate()
            })
        },
        updateData() {
            this.$refs['dataForm'].validate(valid => {
                if (valid) {
                    const { id, nickName, avatar } = this.temp
                    const tempData = Object.assign({}, { userId: id, nickName, avatar })
                    updateUser(tempData).then(() => {
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
              '用户名',
              '真实姓名',
              '联系电话',
              '邮箱',
              '注册时间',
              '最新一次更新时间'
          ]
          const filterVal = [
              'username',
              'nickName',
              'phone',
              'email',
              'createdAt',
              'updatedAt'
          ]
          const data = this.formatJson(filterVal, this.list)
          excel.export_json_to_excel({
              header: tHeader,
              data,
              filename: '用户列表'
          })
          this.downloadLoading = false
      })
        },
        formatJson(filterVal, jsonData) {
            return jsonData.map(v =>
                filterVal.map(j => {
                    if (j === 'createdAt' || j === 'updatedAt') {
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
        handleAdd() {
            this.dialogFormVisible = true
            this.dialogStatus = 'create'
            this.resetTemp()
            this.$nextTick(() => {
                this.$refs['dataForm'].clearValidate()
            })
        },
        beforeClose(done) {
            this.$refs['dataForm'].resetFields()
        },
        imgLoadError(ev) {
            const img = ev.srcElement
            img.src = defaultAvatar
            img.onerror = null // 防止闪图
        },
        handleAvatarSuccess(res, file) {
            this.uploadAvatar = URL.createObjectURL(file.raw)
            this.temp.avatar = res.data.path
        },
        beforeAvatarUpload(file) {
            const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
            const isLt2M = file.size / 1024 / 1024 < 0.5

            if (!isJPG) {
                this.$message.error('上传头像图片只能是 JPG/PNG 格式!')
            }
            if (!isLt2M) {
                this.$message.error('上传头像图片大小不能超过 500kb!')
            }
            return isJPG && isLt2M
        },
        handlePwdFocus() {
            this.passwordType = 'password'
            this.passwordShow = true
        },
        createSubmit() {
            this.passwordType = 'text'
            this.passwordShow = false
            this.$nextTick(() => {
                this.$refs['submitRef'].click()
            })
        },
        handleDelete(row) {
            this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    deleteUser(row.id).then(response => {
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
                        title: '取消',
                        message: '已取消删除',
                        type: 'warning',
                        duration: 2000
                    })
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
.avatar-uploader {
  >>> .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    &:hover {
      border-color: #409eff;
    }
  }
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 88px;
  height: 88px;
  line-height: 88px;
  text-align: center;
}
.avatar {
  width: 88px;
  height: 88px;
  display: block;
}
.el-form >>> .Password__strength-meter {
  margin: 8px auto 0;
}
.password-input.el-input--suffix {
  & >>> .el-input__inner {
    padding-right: 60px;
  }
}
</style>
