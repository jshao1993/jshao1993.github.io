<template>
  <div class="dashboard-editor-container">
    <el-row style="background:#fff;padding:4px 16px 0;margin-bottom:32px;">
      <h3 class="title">销售统计</h3>
      <span>选择时间：</span>
      <el-date-picker
        v-model="totalTime"
        type="daterange"
        align="right"
        unlink-panels
        prefix-icon="el-icon-date"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickerOptions"
      />

      <panel-group @handleSetLineChartData="handleSetLineChartData" />
    </el-row>

    <el-row style="background:#fff;padding:4px 16px 0;margin-bottom:32px;">
      <h3 class="title">消费金额</h3>
      <line-chart :chart-data="lineChartData" />
    </el-row>

    <el-row style="background:#fff;padding:4px 16px 0;margin-bottom:32px;">
      <h3 class="title">会员统计</h3>
      <line-chart-panel :data-list="cardsData" />
      <line-chart-panel :data-list="payData" />
    </el-row>

    <!-- <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <h3 class="title">会员卡分析</h3>
          <raddar-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <h3 class="title">入场时段分析</h3>
          <pie-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <h3 class="title">会员活跃度分析</h3>
          <bar-chart />
        </div>
      </el-col>
    </el-row> -->

    <!-- <el-row :gutter="8">
      <el-col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 24}" :lg="{span: 12}" :xl="{span: 12}" style="padding-right:8px;margin-bottom:30px;">
        <transaction-table />
      </el-col>
      <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 6}" :xl="{span: 6}" style="margin-bottom:30px;">
        <todo-list />
      </el-col>
      <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 6}" :xl="{span: 6}" style="margin-bottom:30px;">
        <box-card />
      </el-col>
    </el-row> -->
  </div>
</template>

<script>
// import GithubCorner from '@/components/GithubCorner'
import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'
import LineChartPanel from './components/LineChartPanel'
// import RaddarChart from './components/RaddarChart'
// import PieChart from './components/PieChart'
// import BarChart from './components/BarChart'
// import TransactionTable from './components/TransactionTable'
// import TodoList from './components/TodoList'
// import BoxCard from './components/BoxCard'

const lineChartData = {
    newVisitis: {
        expectedData: [100, 120, 161, 134, 105, 160, 165],
        actualData: [120, 82, 91, 154, 162, 140, 145]
    },
    messages: {
        expectedData: [200, 192, 120, 144, 160, 130, 140],
        actualData: [180, 160, 151, 106, 145, 150, 130]
    },
    purchases: {
        expectedData: [80, 100, 121, 104, 105, 90, 100],
        actualData: [120, 90, 100, 138, 142, 130, 130]
    },
    shoppings: {
        expectedData: [130, 140, 141, 142, 145, 150, 160],
        actualData: [120, 82, 91, 154, 162, 140, 130]
    }
}

const dataList = {
    cardsData: [
        { text: '当前会员数', value: 1234, color: '#d87a80' },
        { text: '会员卡发放量', value: 6000, color: '#5ab1ef' },
        { text: '优惠券发放量', value: 800, color: '#e5995c' },
        { text: '三月内活跃会员数', value: 800, color: '#82c92e' }
    ],
    payData: [
        { text: '会员总充值金额', value: 126560, color: '#2ec7c9' },
        { text: '会员总消费金额', value: 6560, color: '#b6a2de' },
        { text: '会员剩余金额', value: 800, color: '#eb82bd' }
    ]
}

export default {
    name: 'DashboardAdmin',
    components: {
        // GithubCorner,
        PanelGroup,
        LineChart,
        LineChartPanel
        // RaddarChart,
        // PieChart,
        // BarChart
        // TransactionTable,
        // TodoList,
        // BoxCard
    },
    data() {
        return {
            lineChartData: lineChartData.newVisitis,
            cardsData: dataList.cardsData,
            payData: dataList.payData,
            pickerOptions: {
                shortcuts: [
                    {
                        text: '最近一周',
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            start.setTime(
                                start.getTime() - 3600 * 1000 * 24 * 7
                            )
                            picker.$emit('pick', [start, end])
                        }
                    },
                    {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            start.setTime(
                                start.getTime() - 3600 * 1000 * 24 * 30
                            )
                            picker.$emit('pick', [start, end])
                        }
                    },
                    {
                        text: '最近三个月',
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            start.setTime(
                                start.getTime() - 3600 * 1000 * 24 * 90
                            )
                            picker.$emit('pick', [start, end])
                        }
                    }
                ]
            },
            totalTime: ''
        }
    },
    methods: {
        handleSetLineChartData(type) {
            this.lineChartData = lineChartData[type]
        }
    }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
    padding: 32px;
    background-color: rgb(240, 242, 245);
    position: relative;

    .title {
        line-height: 20px;
        padding: 15px 0 15px 15px;
        font-size: 16px;
        position: relative;
        border-bottom: 1px solid #ddd;
        font-weight: 500;
        &::before {
            content: "";
            display: block;
            border-left: 3px solid #666;
            position: absolute;
            left: 0;
            height: 20px;
        }
    }

    .github-corner {
        position: absolute;
        top: 0px;
        border: 0;
        right: 0;
    }

    .chart-wrapper {
        background: #fff;
        padding: 16px 16px 0;
        margin-bottom: 32px;
    }
}

@media (max-width: 1024px) {
    .chart-wrapper {
        padding: 8px;
    }
}
</style>
