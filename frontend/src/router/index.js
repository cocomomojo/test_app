import { createRouter, createWebHistory } from "vue-router";

import LoginPage from "../components/LoginPage.vue";
import TopPage from "../components/TopPage.vue";
import TodoList from "../components/TodoList.vue";
import MemoUpload from "../components/MemoUpload.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: LoginPage },
  { path: "/top", component: TopPage, meta: { requiresAuth: true } },
  { path: "/todo", component: TodoList, meta: { requiresAuth: true } },
  { path: "/memo", component: MemoUpload, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ★ ナビゲーションガード（ログイン必須制御）
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("idToken");

  if (to.meta.requiresAuth && !token) {
    return next("/login");
  }

  next();
});

export default router;