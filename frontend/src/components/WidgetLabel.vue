<template>
  <div class="label-wrapper">
    <div class="label" @click.stop="handleLabelClick">{{ name }}</div>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from "vue-router";

interface PropsType {
  name: string;
  position?: number[];
}
const props = defineProps<PropsType>();
const router = useRouter();

const handleLabelClick = () => {
  router.push({
    name: "devices",
    query: { keyword: props.name },
  });
};
</script>
<style lang="scss" scoped>
.label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 135px;
  height: 40px;
  font-weight: bolder;
  color: #fff;
  pointer-events: all;
  cursor: pointer;
  background-image: url(@/assets/label_bg.png);
  background-repeat: no-repeat;
  background-size: 100% 100%;
}
</style>
