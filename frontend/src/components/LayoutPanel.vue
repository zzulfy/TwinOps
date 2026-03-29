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
  color: var(--tw-color-text-secondary);
  background: linear-gradient(165deg, var(--tw-bg-panel-start) 0%, var(--tw-bg-panel-end) 100%);
  backdrop-filter: blur(12px);
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
    background: radial-gradient(circle, rgba(109, 165, 217, 0.22) 0%, transparent 68%);
  }

  &:hover {
    box-shadow: var(--tw-shadow-panel-hover);
    transform: translateY(-2px);
    border-color: rgba(102, 149, 191, 0.48);
  }

  .panel-header {
    display: flex;
    align-items: center;
    height: 65px;
    font-family: Douyu;
    background: linear-gradient(120deg, rgba(224, 239, 252, 0.88) 0%, rgba(214, 232, 248, 0.82) 55%, rgba(205, 224, 241, 0.78) 100%);
    border-radius: var(--tw-radius-md) var(--tw-radius-md) 0 0;
    border-bottom: 1px solid rgba(111, 158, 198, 0.34);
    .panel-header-title {
      position: relative;
      top: -10px;
      left: 34px;
      padding: var(--tw-space-1) 14px;
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 1.5px;
      color: var(--tw-color-text-primary);
      text-transform: uppercase;
      background: rgba(255, 255, 255, 0.72);
      border: 1px solid rgba(104, 147, 186, 0.36);
      border-radius: 20px;
    }
  }
  .panel-body {
    height: 220px;
    padding: 0 12px 12px;
  }
}
</style>
