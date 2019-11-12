import request from '@/utils/request'

// 查询商家列表
export function fetchList() {
    return request({
        url: `/v1/enterprise/list`,
        method: 'get'
    })
}

// 添加商家信息
export function addEnterprise(data) {
    return request({
        url: '/v1/enterprise',
        method: 'post',
        data
    })
}

// 更新商家信息
export function updateEnterprise(data) {
    return request({
        url: '/v1/enterprise',
        method: 'put',
        data
    })
}

// 根据商家id，删除商家
export function deleteEnterprise(id) {
    return request({
        url: `/v1/enterprise/${id}`,
        method: 'delete'
    })
}

// 查询用户列表
export function fetchUserList(params) {
    return request({
        url: `/v1/user/list`,
        method: 'get',
        params
    })
}

// 指定商家管理员或者店员
export function specifyEnterprise(data) {
    return request({
        url: '/v1/enterprise/role',
        method: 'post',
        data
    })
}
