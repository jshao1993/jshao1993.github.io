<template>
  <div class="zwsj">
    <img :src="icon" :width="imgW" :height="imgH">
    <div class="text">{{ text }}</div>
  </div>
</template>

<script>
export default {
    name: 'EcsNodata',
    props: {
        icon: {
            require: true
        },
        text: {
            require: true
        },
        imgW: {
            default: '350px'
        },
        imgH: {
            default: '190px'
        }
    }
}
</script>

<style scoped lang="scss">
.zwsj {
    padding: 120px 0;
    text-align: center;
    .text {
        color: #999;
        font-size: 18px;
        margin-top: 5px;
    }
}
</style>
