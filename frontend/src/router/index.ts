import { createRouter, createWebHashHistory } from "vue-router";
import { isAdminLoggedIn } from "@/api/backend";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("@/pages/LoginPage.vue"),
      meta: { public: true },
    },
    {
      path: "/",
      name: "dashboard",
      component: () => import("@/pages/DashboardPage.vue"),
    },
    {
      path: "/devices",
      name: "devices",
      component: () => import("@/pages/DeviceDetailPage.vue"),
    },
    {
      path: "/devices/:deviceCode",
      name: "device-focus",
      component: () => import("@/pages/DeviceDetailPage.vue"),
      props: true,
    },
    {
      path: "/analysis",
      name: "analysis-center",
      component: () => import("@/pages/AnalysisCenterPage.vue"),
    },
  ],
});

router.beforeEach((to) => {
  const requiresAuth = !to.meta.public;
  if (requiresAuth && !isAdminLoggedIn()) {
    return { name: "login", query: { redirect: to.fullPath } };
  }
  if (to.name === "login" && isAdminLoggedIn()) {
    return { name: "dashboard" };
  }
  return true;
});

export default router;
