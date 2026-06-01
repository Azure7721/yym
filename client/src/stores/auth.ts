import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const isAuthenticated = ref(!!token.value)

  async function login(username: string, password: string): Promise<boolean> {
    try {
      const res = await api.post('/auth/login', { username, password })
      token.value = res.data.token
      localStorage.setItem('token', res.data.token)
      isAuthenticated.value = true
      return true
    } catch {
      return false
    }
  }

  function logout() {
    token.value = null
    localStorage.removeItem('token')
    isAuthenticated.value = false
  }

  async function verify(): Promise<boolean> {
    if (!token.value) return false
    try {
      await api.get('/auth/verify')
      isAuthenticated.value = true
      return true
    } catch {
      logout()
      return false
    }
  }

  return { token, isAuthenticated, login, logout, verify }
})
