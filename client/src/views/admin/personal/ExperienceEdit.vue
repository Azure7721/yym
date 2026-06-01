<template>
  <div class="personal-edit">
    <div class="page-header">
      <h1 class="page-title">经历管理</h1>
      <div class="page-nav">
        <router-link to="/admin/personal/basic" class="nav-tab">基本信息</router-link>
        <router-link to="/admin/personal/honors" class="nav-tab">获奖荣誉</router-link>
        <router-link to="/admin/personal/experience" class="nav-tab active">经历</router-link>
      </div>
    </div>

    <div class="form-section">
      <h2 class="section-title">工作/项目经历</h2>
      <div class="items-list" v-if="experienceData">
        <div
          class="item-card"
          v-for="(item, index) in experienceData.items"
          :key="index"
        >
          <div class="item-fields">
            <input v-model="item.title" placeholder="经历标题（如：2024 身之语——青少年性教育科普APP）" />
            <textarea v-model="item.description" placeholder="经历描述（支持多行）" rows="4"></textarea>
          </div>
          <button class="btn-remove" @click="removeItem(index)">×</button>
        </div>
        <button class="btn-add" @click="addItem">+ 添加经历</button>
      </div>
      <div class="form-actions-inline">
        <button class="btn-primary" @click="saveExperience" :disabled="saving">
          {{ saving ? '保存中...' : '保存经历' }}
        </button>
      </div>
    </div>

    <div class="save-toast" v-if="showToast">
      <span>✓ 保存成功</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const saving = ref(false)
const showToast = ref(false)
const experienceData = ref<{ items: { title: string; description: string }[] } | null>(null)

function addItem() {
  if (experienceData.value) {
    experienceData.value.items.push({ title: '', description: '' })
  }
}

function removeItem(index: number) {
  if (experienceData.value) {
    experienceData.value.items.splice(index, 1)
  }
}

async function saveExperience() {
  if (!experienceData.value) return
  saving.value = true
  try {
    await api.put('/personal/experience', { content: experienceData.value })
    showSaveToast()
  } catch {
    alert('保存失败')
  } finally {
    saving.value = false
  }
}

function showSaveToast() {
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2000)
}

onMounted(async () => {
  try {
    const res = await api.get('/personal')
    for (const section of res.data) {
      if (section.section === 'experience') {
        experienceData.value = section.content
      }
    }
  } catch {}
  if (!experienceData.value) {
    experienceData.value = { items: [] }
  }
})
</script>

<style scoped>
.personal-edit {
  max-width: 800px;
  position: relative;
}

.page-header { margin-bottom: 32px; }

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 16px;
}

.page-nav { display: flex; gap: 8px; }

.nav-tab {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  color: var(--color-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.nav-tab:hover { background: rgba(147, 132, 123, 0.1); }
.nav-tab.active { background: var(--color-primary); color: white; }

.form-section {
  background: white;
  border-radius: 8px;
  padding: 28px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px dashed rgba(147, 132, 123, 0.2);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.item-card {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 16px;
  background: var(--color-bg-warm);
  border-radius: 8px;
}

.item-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-fields input,
.item-fields textarea {
  padding: 10px 14px;
  border: 1px solid rgba(147, 132, 123, 0.15);
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.item-fields textarea { resize: vertical; }

.btn-remove {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e74c3c;
  font-size: 20px;
  border-radius: 50%;
  flex-shrink: 0;
}

.btn-remove:hover { background: rgba(231, 76, 60, 0.1); }

.btn-add {
  padding: 12px;
  border: 2px dashed rgba(147, 132, 123, 0.2);
  border-radius: 8px;
  color: var(--color-secondary);
  font-size: 14px;
  text-align: center;
  transition: all var(--transition-fast);
}

.btn-add:hover { border-color: var(--color-secondary); color: var(--color-primary); }

.form-actions-inline {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(147, 132, 123, 0.1);
}

.btn-primary {
  padding: 10px 24px;
  background: var(--color-primary);
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.btn-primary:hover { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.save-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-primary);
  color: white;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: var(--shadow-lg);
  animation: fadeInUp 0.3s ease;
  z-index: 9999;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateX(-50%) translateY(20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
</style>
