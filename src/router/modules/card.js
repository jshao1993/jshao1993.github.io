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
  children: [
    {
      path: 'list',
      component: () => import('@/views/cards/list'),
      name: 'listCards',
      meta: { title: '会员卡列表' }
    }
    // {
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
