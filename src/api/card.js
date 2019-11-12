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
// export function fetchList({
//     eid,
//     phone
// }) {
//     return request({
//         url: `/v1/ms/${eid}/list`,
//         method: 'get'
//     })
// }
