<template>
  <div class="login-page">
    <div class="login-card animate-scale-in">
      <h1 class="login-title">Portfolio</h1>
      <p class="login-subtitle">管理后台</p>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>用户名</label>
          <input
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>
        <p class="login-error" v-if="error">{{ error }}</p>
        <button type="submit" class="login-btn" :disabled="submitting">
          {{ submitting ? '登录中...' : '登 录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function handleLogin() {
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }

  submitting.value = true
  error.value = ''

  const success = await authStore.login(username.value, password.value)
  if (success) {
    const redirect = (route.query.redirect as string) || '/admin'
    router.push(redirect)
  } else {
    error.value = '用户名或密码错误'
  }

  submitting.value = false
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-warm);
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--color-white);
  border-radius: 12px;
  padding: 48px 40px;
  box-shadow: var(--shadow-lg);
  text-align: center;
}

.login-title {
  font-family: var(--font-en);
  font-style: italic;
  font-weight: 500;
  font-size: 36px;
  color: var(--color-primary);
}

.login-subtitle {
  font-size: 16px;
  color: var(--color-secondary);
  margin-top: 8px;
  margin-bottom: 40px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  text-align: left;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: var(--color-secondary);
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(147, 132, 123, 0.3);
  border-radius: 6px;
  font-size: 16px;
  transition: border-color var(--transition-fast);
  background: var(--color-bg-warm);
}

.form-group input:focus {
  border-color: var(--color-primary);
}

.login-error {
  color: #e74c3c;
  font-size: 14px;
  text-align: center;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: var(--color-primary);
  color: var(--color-white);
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 4px;
  transition: opacity var(--transition-fast);
  margin-top: 8px;
}

.login-btn:hover {
  opacity: 0.9;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
