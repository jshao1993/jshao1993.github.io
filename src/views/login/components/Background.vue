<!--
 * @Descripttion:
 * @version:
 * @Author: zhanghao
 * @Date: 2019-10-28 22:39:46
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-10-28 22:39:50
 -->
<template>
  <div class="background">
    <vue-particles
      color="#dedede"
      :particle-opacity="0.7"
      :particles-number="80"
      shape-type="circle"
      :particle-size="6"
      lines-color="#dedede"
      :lines-width="1"
      :line-linked="true"
      :line-opacity="0.4"
      :lines-distance="150"
      :move-speed="3"
      :hover-effect="true"
      hover-mode="grab"
      :click-effect="true"
      click-mode="push"
    />
  </div>
</template>
<style scoped>
    .background {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 0;
        overflow: hidden;
        background: url('~@/assets/login_images/sky.jpg');
        background-size: cover;
    }
</style>
<script>
// import Particle from 'zhihu-particle'
export default {
  // mounted(){
  //     new Particle(this.$el, {interactive: true, density: 'low'})
  // }
}
</script>
