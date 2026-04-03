<template>
  <div class="login-page">
    <div class="login-card">
      <h1>TwinOps Admin Login</h1>
      <p>Only administrator access is allowed.</p>
      <form @submit.prevent="submitLogin">
        <label>
          Username
          <input
            v-model.trim="username"
            type="text"
            autocomplete="username"
            required
          />
        </label>
        <label>
          Password
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
          />
        </label>
        <button type="submit" :disabled="loading">
          {{ loading ? "Signing in..." : "Sign in" }}
        </button>
      </form>
      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
      <div class="hint">
        Default admin credentials can be configured in backend application.yml.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { loginAdmin, setAdminSession } from "@/api/backend";

const router = useRouter();
const route = useRoute();

const username = ref("admin");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");

const submitLogin = async () => {
  loading.value = true;
  errorMessage.value = "";
  try {
    const result = await loginAdmin(username.value, password.value);
    setAdminSession(result);
    const redirect =
      typeof route.query.redirect === "string" ? route.query.redirect : "/";
    await router.replace(redirect);
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Login failed";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    140deg,
    var(--tw-bg-ink) 0%,
    var(--tw-bg-deep) 56%,
    var(--tw-bg-haze) 100%
  );
}

.login-card {
  width: 420px;
  padding: 28px;
  border-radius: 14px;
  background: rgba(12, 28, 48, 0.88);
  border: 1px solid var(--tw-border-soft);
  box-shadow: var(--tw-shadow-panel);
  color: var(--tw-color-text-primary);

  h1 {
    margin: 0 0 8px;
    font-size: 24px;
  }

  p {
    margin: 0 0 18px;
    color: var(--tw-color-text-secondary);
  }

  form {
    display: grid;
    gap: 12px;
  }

  label {
    display: grid;
    gap: 6px;
    font-size: 13px;
  }

  input {
    height: 36px;
    border-radius: 8px;
    border: 1px solid var(--tw-border-soft);
    padding: 0 10px;
    color: var(--tw-color-text-on-dark);
    background: rgba(8, 20, 35, 0.8);
  }

  button {
    margin-top: 6px;
    height: 36px;
    border: 1px solid var(--tw-cta-border);
    border-radius: 999px;
    cursor: pointer;
    color: var(--tw-color-text-on-dark);
    background: linear-gradient(
      120deg,
      var(--tw-cta-start) 0%,
      var(--tw-cta-end) 100%
    );
    box-shadow: var(--tw-cta-shadow);
  }

  button:disabled {
    opacity: 0.68;
    cursor: not-allowed;
  }
}

.error {
  margin-top: 12px;
  font-size: 13px;
  color: #ffd2d2;
}

.hint {
  margin-top: 12px;
  font-size: 12px;
  color: var(--tw-color-text-on-dark-secondary);
}
</style>
