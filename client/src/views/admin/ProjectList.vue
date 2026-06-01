<template>
  <div class="project-list">
    <div class="page-header">
      <h1 class="page-title">作品管理</h1>
      <router-link to="/admin/projects/new" class="btn-primary">
        + 新增作品
      </router-link>
    </div>

    <div class="project-table" v-if="projects.length">
      <div class="table-header">
        <span class="col-cover">封面</span>
        <span class="col-title">名称</span>
        <span class="col-category">分类</span>
        <span class="col-year">年份</span>
        <span class="col-actions">操作</span>
      </div>
      <div
        v-for="project in projects"
        :key="project.id"
        class="table-row"
      >
        <span class="col-cover">
          <div
            class="cover-thumb"
            :style="project.cover_image ? { backgroundImage: `url(${project.cover_image})` } : {}"
          ></div>
        </span>
        <span class="col-title">
          <strong>{{ project.title }}</strong>
          <small v-if="project.subtitle">{{ project.subtitle }}</small>
        </span>
        <span class="col-category">{{ project.category || '-' }}</span>
        <span class="col-year">{{ project.year || '-' }}</span>
        <span class="col-actions">
          <router-link
            :to="`/admin/projects/${project.id}/edit`"
            class="btn-edit"
          >编辑</router-link>
          <button class="btn-delete" @click="handleDelete(project.id)">删除</button>
        </span>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>暂无作品</p>
      <router-link to="/admin/projects/new" class="btn-primary">+ 新增第一个作品</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/utils/api'
import type { Project } from '@/stores/portfolio'

const projects = ref<Project[]>([])

async function loadProjects() {
  try {
    const res = await api.get('/projects')
    projects.value = res.data
  } catch (e) {
    console.error('Failed to load projects:', e)
  }
}

async function handleDelete(id: number) {
  if (!confirm('确定要删除这个作品吗？此操作不可撤销。')) return
  try {
    await api.delete(`/projects/${id}`)
    projects.value = projects.value.filter(p => p.id !== id)
  } catch (e) {
    alert('删除失败')
  }
}

onMounted(loadProjects)
</script>

<style scoped>
.project-list {
  max-width: 1000px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-primary);
}

.btn-primary {
  display: inline-block;
  padding: 10px 24px;
  background: var(--color-primary);
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: opacity var(--transition-fast);
}

.btn-primary:hover {
  opacity: 0.9;
}

.project-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.table-header {
  display: grid;
  grid-template-columns: 80px 1fr 120px 80px 140px;
  gap: 16px;
  padding: 16px 24px;
  background: rgba(147, 132, 123, 0.06);
  font-size: 13px;
  color: var(--color-secondary);
  font-weight: 500;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 1fr 120px 80px 140px;
  gap: 16px;
  padding: 16px 24px;
  align-items: center;
  border-top: 1px solid rgba(147, 132, 123, 0.08);
  transition: background var(--transition-fast);
}

.table-row:hover {
  background: rgba(147, 132, 123, 0.03);
}

.cover-thumb {
  width: 60px;
  height: 45px;
  border-radius: 4px;
  background: #e8ddd0;
  background-size: cover;
  background-position: center;
}

.col-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.col-title strong {
  font-size: 15px;
  color: var(--color-primary);
}

.col-title small {
  font-size: 13px;
  color: var(--color-secondary);
}

.col-category,
.col-year {
  font-size: 14px;
  color: var(--color-secondary);
}

.col-actions {
  display: flex;
  gap: 8px;
}

.btn-edit {
  padding: 6px 14px;
  background: rgba(147, 132, 123, 0.1);
  color: var(--color-primary);
  border-radius: 4px;
  font-size: 13px;
  transition: background var(--transition-fast);
}

.btn-edit:hover {
  background: rgba(147, 132, 123, 0.2);
}

.btn-delete {
  padding: 6px 14px;
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border-radius: 4px;
  font-size: 13px;
  transition: background var(--transition-fast);
}

.btn-delete:hover {
  background: rgba(231, 76, 60, 0.2);
}

.empty-state {
  text-align: center;
  padding: 80px 0;
  color: var(--color-secondary);
}

.empty-state p {
  font-size: 16px;
  margin-bottom: 24px;
}
</style>
