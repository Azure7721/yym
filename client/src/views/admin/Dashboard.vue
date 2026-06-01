<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <router-link to="/" class="sidebar-logo">Portfolio</router-link>
        <span class="sidebar-tag">Admin</span>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section">
          <span class="nav-section-label">关于我 (About Me)</span>
          <router-link to="/admin/personal/basic" class="nav-item" active-class="active">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="7" r="4" stroke="currentColor" stroke-width="1.5"/>
              <path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            基本信息
          </router-link>
          <router-link to="/admin/personal/honors" class="nav-item" active-class="active">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
              <path d="M7 14l-1 4 4-2 4 2-1-4" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            获奖荣誉
          </router-link>
          <router-link to="/admin/personal/experience" class="nav-item" active-class="active">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <line x1="7" y1="8" x2="13" y2="8" stroke="currentColor" stroke-width="1.5"/>
              <line x1="7" y1="12" x2="11" y2="12" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            经历
          </router-link>
        </div>

        <div class="nav-section">
          <span class="nav-section-label">作品 (Works)</span>
          <router-link to="/admin" class="nav-item" exact-active-class="active">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/>
              <rect x="11" y="2" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/>
              <rect x="2" y="11" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/>
              <rect x="11" y="11" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            作品管理
          </router-link>
        </div>

        <div class="nav-section">
          <span class="nav-section-label">日常 (Daily)</span>
          <router-link to="/admin/daily" class="nav-item" active-class="active">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" stroke-width="1.5"/>
              <line x1="10" y1="3" x2="10" y2="17" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            Daily 页面
          </router-link>
        </div>
      </nav>
      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn">退出登录</button>
      </div>
    </aside>
    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/admin/login')
}

onMounted(async () => {
  const valid = await authStore.verify()
  if (!valid) {
    router.push('/admin/login')
  }
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f2f0;
}

.admin-sidebar {
  width: 240px;
  background: var(--color-primary);
  color: var(--color-white);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
}

.sidebar-header {
  padding: 24px 24px 32px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-logo {
  font-family: var(--font-en);
  font-style: italic;
  font-size: 22px;
  color: white;
  text-decoration: none;
}

.sidebar-tag {
  font-size: 11px;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 12px;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 8px;
}

.nav-section-label {
  display: block;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 8px 16px 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  transition: all var(--transition-fast);
  text-decoration: none;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.sidebar-footer {
  padding: 16px 24px 24px;
}

.logout-btn {
  width: 100%;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  font-size: 14px;
  transition: background var(--transition-fast);
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.admin-main {
  flex: 1;
  margin-left: 240px;
  padding: 32px 40px;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .admin-sidebar {
    width: 200px;
  }

  .admin-main {
    margin-left: 200px;
    padding: 24px;
  }
}
</style>
