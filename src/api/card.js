import request from '@/utils/request'

// 根据商家ID，客户手机号查询会员卡
export function fetchList({
    eid,
    phone
}) {
    return request({
        url: `/v1/ms/${eid}/list`,
        method: 'get',
        params: {
            phone
        }
    })
}

// 根据商家查询会员卡类型
export function fetchConfigType(eid) {
    return request({
        url: `/v1/ms/config/enterprise/${eid}`,
        method: 'get'
    })
}

// 添加新的会员卡配置
export function addCardConfig(data) {
    return request({
        url: '/v1/ms/config',
        method: 'post',
        data
    })
}

// 根据会员卡配置id，删除会员卡配置
export function deleteCardConfig(id) {
    return request({
        url: `/v1/ms/config/${id}`,
        method: 'delete'
    })
}

// 更新会员卡配置
export function updateCardConfig(data) {
    return request({
        url: '/v1/ms/config',
        method: 'put',
        data
    })
}

// 添加新的会员卡
export function addCard(data) {
    return request({
        url: '/v1/ms',
        method: 'post',
        data
    })
}

// 启用会员卡
export function startCard(id) {
    return request({
        url: `/v1/ms/${id}/start`,
        method: 'post'
    })
}

// 停用会员卡
export function stopCard(id) {
    return request({
        url: `/v1/ms/${id}/stop`,
        method: 'post'
    })
}

// 更新会员卡信息
export function updateCard(data) {
    return request({
        url: '/v1/ms',
        method: 'put',
        data
    })
}

// 根据会员卡id，查询会员卡
export function fetchCardInfoById(id) {
    return request({
        url: `/v1/ms/id/${id}`,
        method: 'get'
    })
}
