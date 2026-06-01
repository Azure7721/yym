<template>
  <div class="project-edit">
    <div class="page-header">
      <h1 class="page-title">{{ isEdit ? '编辑作品' : '新增作品' }}</h1>
      <router-link to="/admin" class="btn-back">← 返回列表</router-link>
    </div>

    <form @submit.prevent="handleSubmit" class="edit-form">
      <div class="form-section">
        <h2 class="section-title">基本信息</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>作品名称 *</label>
            <input v-model="form.title" type="text" placeholder="请输入作品名称" required />
          </div>
          <div class="form-group">
            <label>副标题</label>
            <input v-model="form.subtitle" type="text" placeholder="一句话描述" />
          </div>
          <div class="form-group">
            <label>分类</label>
            <input v-model="form.category" type="text" placeholder="如：UI设计、产品设计" />
          </div>
          <div class="form-group">
            <label>年份</label>
            <input v-model="form.year" type="text" placeholder="如：2024" />
          </div>
        </div>
        <div class="form-group full">
          <label>项目简介</label>
          <textarea v-model="form.description" rows="5" placeholder="详细描述项目背景、目标、你的角色和贡献..."></textarea>
        </div>
        <div class="form-group full">
          <label>标签（用逗号分隔）</label>
          <input v-model="form.tags" type="text" placeholder="如：UI设计, 移动端, 教育" />
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input v-model="form.is_featured" type="checkbox" />
            设为精选作品
          </label>
        </div>
      </div>

      <div class="form-section">
        <h2 class="section-title">封面图片</h2>
        <div class="upload-area" @click="triggerCoverInput">
          <div v-if="coverPreview" class="upload-preview">
            <img :src="coverPreview" alt="封面预览" />
            <button type="button" class="remove-btn" @click.stop="removeCover">×</button>
          </div>
          <div v-else class="upload-placeholder">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" stroke-width="2" stroke-dasharray="6 4"/>
              <circle cx="18" cy="20" r="4" stroke="currentColor" stroke-width="2"/>
              <path d="M4 32l10-10 8 8 8-12 14 14" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>点击上传封面图片</span>
            <small>支持 JPG、PNG，建议尺寸 1600×1200</small>
          </div>
        </div>
        <input ref="coverInput" type="file" accept="image/*" @change="handleCoverChange" hidden />
      </div>

      <div class="form-section">
        <h2 class="section-title">PDF文件</h2>
        <p class="section-desc">上传PDF后，详情页会自动展示PDF的每一页内容</p>
        <div class="upload-area" @click="triggerPdfInput">
          <div v-if="pdfName" class="upload-file">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="2" width="24" height="28" rx="2" stroke="currentColor" stroke-width="2"/>
              <text x="16" y="20" text-anchor="middle" font-size="8" fill="currentColor">PDF</text>
            </svg>
            <span>{{ pdfName }}</span>
            <button type="button" class="remove-btn" @click.stop="removePdf">×</button>
          </div>
          <div v-else class="upload-placeholder">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="4" width="32" height="40" rx="4" stroke="currentColor" stroke-width="2" stroke-dasharray="6 4"/>
              <text x="24" y="28" text-anchor="middle" font-size="12" fill="currentColor">PDF</text>
            </svg>
            <span>点击上传PDF文件</span>
            <small>支持 PDF 格式，最大 50MB</small>
          </div>
        </div>
        <input ref="pdfInput" type="file" accept=".pdf" @change="handlePdfChange" hidden />
      </div>

      <div class="form-actions">
        <router-link to="/admin" class="btn-cancel">取消</router-link>
        <button type="submit" class="btn-submit" :disabled="submitting">
          {{ submitting ? '保存中...' : '保存作品' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/api'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const submitting = ref(false)

const coverInput = ref<HTMLInputElement>()
const pdfInput = ref<HTMLInputElement>()
const coverPreview = ref<string | null>(null)
const coverFile = ref<File | null>(null)
const pdfFile = ref<File | null>(null)
const pdfName = ref<string | null>(null)

const form = reactive({
  title: '',
  subtitle: '',
  description: '',
  category: '',
  year: '',
  tags: '',
  is_featured: false
})

function triggerCoverInput() {
  coverInput.value?.click()
}

function triggerPdfInput() {
  pdfInput.value?.click()
}

function handleCoverChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  coverFile.value = file
  coverPreview.value = URL.createObjectURL(file)
}

function removeCover() {
  coverFile.value = null
  coverPreview.value = null
  if (coverInput.value) coverInput.value.value = ''
}

function handlePdfChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  pdfFile.value = file
  pdfName.value = file.name
}

function removePdf() {
  pdfFile.value = null
  pdfName.value = null
  if (pdfInput.value) pdfInput.value.value = ''
}

async function handleSubmit() {
  if (!form.title) {
    alert('请输入作品名称')
    return
  }

  submitting.value = true
  const formData = new FormData()
  formData.append('title', form.title)
  formData.append('subtitle', form.subtitle)
  formData.append('description', form.description)
  formData.append('category', form.category)
  formData.append('year', form.year)
  formData.append('tags', form.tags)
  formData.append('is_featured', form.is_featured ? '1' : '0')

  if (coverFile.value) {
    formData.append('cover', coverFile.value)
  }
  if (pdfFile.value) {
    formData.append('pdf', pdfFile.value)
  }

  try {
    if (isEdit.value) {
      await api.put(`/projects/${route.params.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    } else {
      await api.post('/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }
    router.push('/admin')
  } catch (e: any) {
    alert(e.response?.data?.error || '保存失败')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  if (isEdit.value) {
    try {
      const res = await api.get(`/projects/${route.params.id}`)
      const p = res.data
      form.title = p.title || ''
      form.subtitle = p.subtitle || ''
      form.description = p.description || ''
      form.category = p.category || ''
      form.year = p.year || ''
      form.tags = p.tags || ''
      form.is_featured = !!p.is_featured
      if (p.cover_image) coverPreview.value = p.cover_image
      if (p.pdf_file) pdfName.value = p.pdf_file.split('/').pop() || 'uploaded.pdf'
    } catch (e) {
      alert('加载项目失败')
      router.push('/admin')
    }
  }
})
</script>

<style scoped>
.project-edit {
  max-width: 800px;
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

.btn-back {
  font-size: 14px;
  color: var(--color-secondary);
  transition: color var(--transition-fast);
}

.btn-back:hover {
  color: var(--color-primary);
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  background: white;
  border-radius: 8px;
  padding: 28px;
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px dashed rgba(147, 132, 123, 0.2);
}

.section-desc {
  font-size: 14px;
  color: var(--color-secondary);
  margin-bottom: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full {
  margin-bottom: 16px;
}

.form-group label {
  font-size: 14px;
  color: var(--color-secondary);
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  padding: 10px 14px;
  border: 1px solid rgba(147, 132, 123, 0.2);
  border-radius: 6px;
  font-size: 15px;
  transition: border-color var(--transition-fast);
  background: var(--color-bg-warm);
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--color-primary);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.checkbox-label {
  display: flex !important;
  flex-direction: row !important;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
}

/* Upload Area */
.upload-area {
  border: 2px dashed rgba(147, 132, 123, 0.2);
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.upload-area:hover {
  border-color: var(--color-secondary);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--color-secondary);
}

.upload-placeholder span {
  font-size: 15px;
}

.upload-placeholder small {
  font-size: 13px;
  opacity: 0.7;
}

.upload-preview {
  position: relative;
  display: inline-block;
}

.upload-preview img {
  max-height: 200px;
  border-radius: 4px;
}

.remove-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: #e74c3c;
  color: white;
  border-radius: 50%;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-file {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  color: var(--color-primary);
  position: relative;
}

.upload-file span {
  font-size: 15px;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 12px 28px;
  background: rgba(147, 132, 123, 0.1);
  color: var(--color-secondary);
  border-radius: 6px;
  font-size: 15px;
  transition: background var(--transition-fast);
}

.btn-cancel:hover {
  background: rgba(147, 132, 123, 0.2);
}

.btn-submit {
  padding: 12px 36px;
  background: var(--color-primary);
  color: white;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  transition: opacity var(--transition-fast);
}

.btn-submit:hover {
  opacity: 0.9;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
