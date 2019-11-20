import Layout from '@/layout'

const cardsRouter = {
    path: '/card',
    component: Layout,
    redirect: '/card/list',
    name: 'Cards',
    meta: {
        title: '会员卡',
        icon: 'table'
    },
    children: [{
        path: 'list',
        component: () => import('@/views/cards/list'),
        name: 'ListCards',
        meta: {
            title: '会员卡列表',
            icon: 'skill'
        }
    },
    {
        path: 'card',
        component: () => import('@/views/cards/config'),
        name: 'CardsConfig',
        meta: {
            title: '会员卡配置',
            icon: 'tab'
        }
    }
        //  {
        //   path: 'add',
        //   component: () => import('@/views/cards/add'),
        //   name: 'addCards',
        //   meta: { title: '会员卡添加' }
        // },
        // {
        //   path: 'stop',
        //   component: () => import('@/views/cards/stop'),
        //   name: 'stopCards',
        //   meta: { title: '会员卡停卡' }
        // }
    ]
}

export default cardsRouter
