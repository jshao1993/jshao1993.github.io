import request from '@/utils/request'

// 查询获取权限树
export function fetchPermissionTree() {
    return request({
        url: '/v1/permission/tree',
        method: 'get'
    })
}
