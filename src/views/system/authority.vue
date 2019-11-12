<template>
  <div class="app-container">
    <el-container>
      <el-aside width="280px">
        <h2 class="role-tree-title">权限树</h2>
        <el-tree
          ref="tree"
          :data="data"
          show-checkbox
          default-expand-all
          node-key="id"
          highlight-current
          :props="defaultProps"
        />
      </el-aside>
      <el-main>
        <el-table border :data="tableData" style="width: 100%" height="250">
          <el-table-column fixed prop="date" label="日期" width="150" />
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="province" label="省份" width="120" />
          <el-table-column prop="city" label="市区" width="120" />
          <el-table-column prop="address" label="地址" width="300" />
          <el-table-column prop="zip" label="邮编" width="120" />
        </el-table>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { fetchPermissionTree } from '@/api/authority'
import waves from '@/directive/waves' // waves directive
export default {
    name: 'PermissionTree',
    directives: { waves },
    data() {
        return {
            data: [
                {
                    id: 1,
                    label: '模块1',
                    children: [
                        {
                            id: 4,
                            label: '模块1-1',
                            children: [
                                {
                                    id: 9,
                                    label: '新增'
                                },
                                {
                                    id: 10,
                                    label: '删除'
                                },
                                {
                                    id: 11,
                                    label: '修改'
                                },
                                {
                                    id: 12,
                                    label: '查看'
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 2,
                    label: '一级 2',
                    children: [
                        {
                            id: 5,
                            label: '二级 2-1'
                        },
                        {
                            id: 6,
                            label: '二级 2-2'
                        }
                    ]
                },
                {
                    id: 3,
                    label: '一级 3',
                    children: [
                        {
                            id: 7,
                            label: '二级 3-1'
                        },
                        {
                            id: 8,
                            label: '二级 3-2'
                        }
                    ]
                }
            ],
            defaultProps: {
                children: 'children',
                label: 'label'
            },
            tableData: [
                {
                    date: '2016-05-03',
                    name: '王小虎',
                    province: '上海',
                    city: '普陀区',
                    address: '上海市普陀区金沙江路 1518 弄',
                    zip: 200333
                },
                {
                    date: '2016-05-02',
                    name: '王小虎',
                    province: '上海',
                    city: '普陀区',
                    address: '上海市普陀区金沙江路 1518 弄',
                    zip: 200333
                },
                {
                    date: '2016-05-04',
                    name: '王小虎',
                    province: '上海',
                    city: '普陀区',
                    address: '上海市普陀区金沙江路 1518 弄',
                    zip: 200333
                },
                {
                    date: '2016-05-01',
                    name: '王小虎',
                    province: '上海',
                    city: '普陀区',
                    address: '上海市普陀区金沙江路 1518 弄',
                    zip: 200333
                },
                {
                    date: '2016-05-08',
                    name: '王小虎',
                    province: '上海',
                    city: '普陀区',
                    address: '上海市普陀区金沙江路 1518 弄',
                    zip: 200333
                },
                {
                    date: '2016-05-06',
                    name: '王小虎',
                    province: '上海',
                    city: '普陀区',
                    address: '上海市普陀区金沙江路 1518 弄',
                    zip: 200333
                },
                {
                    date: '2016-05-07',
                    name: '王小虎',
                    province: '上海',
                    city: '普陀区',
                    address: '上海市普陀区金沙江路 1518 弄',
                    zip: 200333
                }
            ]
        }
    },
    created() {
        this.getPermissionTree()
    },
    methods: {
        getPermissionTree(queryObj) {
            fetchPermissionTree().then(response => {})
        }
    }
}
</script>

<style lang="scss" scoped>
.role-tree-title {
  font-size: 16px;
  color: #1890ff;
  position: relative;
  padding-left: 20px;
  line-height: 34px;
  &::before {
    content: "";
    width: 3px;
    background: #1890ff;
    position: absolute;
    left: 0;
    height: 14px;
    top: 50%;
    margin-top: -7px;
    border-radius: 3px;
    border: 1px solid #1890ff;
  }
  &::after {
    content: "";
    width: auto;
    height: 0;
    border: 1px dashed #1890ff;
    position: absolute;
    top: 50%;
    transform: scale(0.8);
    margin-bottom: -0.4px;
    left: 62px;
    right: -18px;
  }
}
</style>
