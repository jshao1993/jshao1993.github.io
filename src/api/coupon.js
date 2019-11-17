import request from '@/utils/request'

// 根据商家id,获取优惠券配置
export function getCoupon(eid) {
    return request({
        url: `/v1/coupon/config/enterprise/${eid}`,
        method: 'get'
    })
}

// 添加优惠券配置
export function addCoupon(data) {
    return request({
        url: '/v1/coupon/config',
        method: 'post',
        data
    })
}

// 更新优惠券配置
export function updateCoupon(data) {
    return request({
        url: '/v1/coupon/config',
        method: 'put',
        data
    })
}

// 删除优惠券配置
export function deleteCoupon(id) {
    return request({
        url: `/v1/coupon/config/${id}`,
        method: 'delete'
    })
}
