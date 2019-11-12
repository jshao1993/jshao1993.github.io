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
