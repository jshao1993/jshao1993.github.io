import request from '@/utils/request'

// 查询用户列表
export function fetchList(params) {
    return request({
        url: `/v1/user/list`,
        method: 'get',
        params
    })
}

// 添加新的用户
export function addUser(data) {
    return request({
        url: '/v1/user',
        method: 'post',
        data
    })
}

// 上传头像
export const avatar = '/api/v1/file/avatar'

// 根据id删除用户
export function deleteUser(id) {
    return request({
        url: `/v1/user/${id}`,
        method: 'delete'
    })
}

// 修改用户信息
export function updateUser(data) {
    return request({
        url: '/v1/user',
        method: 'put',
        data
    })
}
