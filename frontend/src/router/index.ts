import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: () => import("@/pages/DashboardPage.vue"),
    },
    {
      path: "/devices",
      name: "device-detail",
      component: () => import("@/pages/DeviceDetailPage.vue"),
    },
  ],
});

export default router;
