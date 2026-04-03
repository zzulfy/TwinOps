<template>
  <div class="layout-panel">
    <div class="panel-header">
      <div class="panel-header-title">{{ title }}</div>
    </div>
    <div class="panel-body">
      <slot></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
interface PropsType {
  title: string | number;
}
const { title } = defineProps<PropsType>();
</script>
<style lang="scss" scoped>
.layout-panel {
  position: relative;
  overflow: hidden;
  color: var(--tw-color-text-on-dark-secondary);
  background: linear-gradient(
    165deg,
    var(--tw-bg-panel-start) 0%,
    var(--tw-bg-panel-end) 100%
  );
  backdrop-filter: blur(8px);
  border: 1px solid var(--tw-border-panel);
  border-radius: var(--tw-radius-md);
  box-shadow: var(--tw-shadow-panel);
  transition: all var(--tw-motion-duration-base) var(--tw-motion-ease-standard);

  &::before {
    position: absolute;
    top: -40px;
    right: -60px;
    width: 180px;
    height: 180px;
    pointer-events: none;
    content: "";
    background: radial-gradient(
      circle,
      rgba(61, 157, 255, 0.26) 0%,
      transparent 70%
    );
  }

  &:hover {
    box-shadow: var(--tw-shadow-panel-hover);
    transform: translateY(-2px);
    border-color: var(--tw-border-strong);
  }

  .panel-header {
    display: flex;
    align-items: center;
    height: 65px;
    font-family: var(--tw-font-title);
    background: linear-gradient(
      120deg,
      rgba(20, 41, 67, 0.95) 0%,
      rgba(15, 32, 55, 0.92) 55%,
      rgba(12, 27, 49, 0.94) 100%
    );
    border-radius: var(--tw-radius-md) var(--tw-radius-md) 0 0;
    border-bottom: 1px solid rgba(77, 132, 195, 0.5);
    .panel-header-title {
      position: relative;
      top: -10px;
      left: 34px;
      padding: var(--tw-space-1) 14px;
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 1.5px;
      color: var(--tw-color-text-on-dark);
      text-transform: uppercase;
      background: rgba(22, 49, 82, 0.92);
      border: 1px solid rgba(96, 160, 226, 0.52);
      border-radius: 20px;
      box-shadow: 0 6px 14px rgba(5, 15, 30, 0.48);
    }
  }
  .panel-body {
    height: 220px;
    padding: 0 12px 12px;
    font-family: var(--tw-font-body);
  }
}
</style>
