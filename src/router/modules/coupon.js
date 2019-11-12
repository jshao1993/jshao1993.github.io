import Layout from '@/layout'

const cardsRouter = {
    path: '/couponer',
    component: Layout,
    redirect: '/couponer/list',
    name: 'Coupons',
    meta: {
        title: '优惠券',
        icon: 'table'
    },
    children: [{
        path: 'list',
        component: () => import('@/views/coupons/list'),
        name: 'listCoupons',
        meta: {
            title: '优惠券列表'
        }
    }]
}

export default cardsRouter
