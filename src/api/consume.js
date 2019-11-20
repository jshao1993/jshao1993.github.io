import request from '@/utils/request'

// 查询会员卡消费列表
export function fetchList({
    eid,
    phone
}) {
    return request({
        url: `/v1/ms/consume/list/${eid}`,
        method: 'get',
        params: {
            phone
        }
    })
}

// 根据商家ID，客户手机号查询会员卡
export function fetchCardList({
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
