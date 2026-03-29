<template>
  <LayoutPanel title="视频监控">
    <div class="video-images">
      <!-- <video src="/images/camera.mp4" autoplay></video> -->
      <i class="fa-solid fa-video-slash"></i>
    </div>
  </LayoutPanel>
</template>
<script setup lang="ts">
import LayoutPanel from "./LayoutPanel.vue";
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}
.video-images {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  margin-top: 10px;
  font-size: 40px;
  color: #64748b;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  video {
    width: 100%;
    height: 100%;
  }
}
</style>
