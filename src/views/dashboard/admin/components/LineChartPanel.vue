<template>
  <el-row :gutter="40" class="panel-group">
    <el-col
      v-for="(item, index) in dataList"
      :key="index"
      :xs="48 / len"
      :sm="48 / len"
      :lg="24 / len"
      class="card-panel-col"
    >
      <div
        :class="['card-panel']"
        :style="{ background: item.color }"
        @click="handleSetLineChartData('newVisitis')"
      >
        <div class="card-panel-description">
          <div class="card-panel-text">
            {{ item.text }}
          </div>
          <count-to
            :start-val="0"
            :end-val="item.value"
            :duration="2600"
            class="card-panel-num"
          />
        </div>
      </div>
    </el-col>
    <!-- <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div :class="['card-panel', 'messages']" @click="handleSetLineChartData('messages')">
        <div class="card-panel-description">
          <div class="card-panel-text">
            续费
          </div>
          <count-to :start-val="0" :end-val="81212" :duration="3000" class="card-panel-num" />
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div :class="['card-panel', 'purchases']" @click="handleSetLineChartData('purchases')">
        <div class="card-panel-description">
          <div class="card-panel-text">
            充次
          </div>
          <count-to :start-val="0" :end-val="9280" :duration="3200" class="card-panel-num" />
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div :class="['card-panel', 'shoppings']" @click="handleSetLineChartData('shoppings')">
        <div class="card-panel-description">
          <div class="card-panel-text">
            升级
          </div>
          <count-to :start-val="0" :end-val="13600" :duration="3600" class="card-panel-num" />
        </div>
      </div>
    </el-col> -->
  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'

export default {
    components: {
        CountTo
    },
    props: {
        dataList: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            len: this.dataList.length
        }
    },
    methods: {
        handleSetLineChartData(type) {
            this.$emit('handleSetLineChartData', type)
        }
    }
}
</script>

<style lang="scss" scoped>
.panel-group {
    margin-top: 18px;

    .card-panel-col {
        margin-bottom: 32px;
    }

    .card-panel {
        height: 48px;
        cursor: pointer;
        font-size: 12px;
        position: relative;
        overflow: hidden;
        color: #666;
        background: #fff;
        box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
        border-color: rgba(0, 0, 0, 0.05);
        border-radius: 4px;
        color: #fff;

        &:hover {
            .card-panel-icon-wrapper {
                color: #fff;
            }

            .icon-people {
                background: #40c9c6;
            }

            .icon-message {
                background: #36a3f7;
            }

            .icon-money {
                background: #f4516c;
            }

            .icon-shopping {
                background: #34bfa3;
            }
        }

        .icon-people {
            color: #40c9c6;
        }

        .icon-message {
            color: #36a3f7;
        }

        .icon-money {
            color: #f4516c;
        }

        .icon-shopping {
            color: #34bfa3;
        }

        .card-panel-icon-wrapper {
            float: left;
            margin: 14px 0 0 14px;
            padding: 16px;
            transition: all 0.38s ease-out;
            border-radius: 6px;
        }

        .card-panel-icon {
            float: left;
            font-size: 48px;
        }

        .card-panel-description {
            font-weight: bold;
            margin: 4px;
            margin-left: 0px;
            text-align: center;

            .card-panel-text {
                line-height: 18px;
                // color: rgba(0, 0, 0, 0.45);
                font-size: 14px;
                margin-bottom: 4px;
            }

            .card-panel-num {
                font-size: 14px;
            }
        }
    }
}

@media (max-width: 550px) {
    .card-panel-description {
        display: none;
    }

    .card-panel-icon-wrapper {
        float: none !important;
        width: 100%;
        height: 100%;
        margin: 0 !important;

        .svg-icon {
            display: block;
            margin: 14px auto !important;
            float: none !important;
        }
    }
}
</style>
