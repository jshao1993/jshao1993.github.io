import request from '@/utils/request'

// 获取所有角色列表
export function getRoles() {
    return request({
        url: '/v1/role/list',
        method: 'get'
    })
}

// 新建自定义角色
export function addRole(data) {
    return request({
        url: '/v1/role',
        method: 'post',
        data
    })
}

export function updateRole(id, data) {
    return request({
        url: `/role/${id}`,
        method: 'put',
        data
    })
}

export function deleteRole(id) {
    return request({
        url: `/role/${id}`,
        method: 'delete'
    })
}
