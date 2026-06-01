<template>
  <div class="personal-edit">
    <div class="page-header">
      <h1 class="page-title">个人信息管理</h1>
    </div>

    <!-- Photo Upload -->
    <div class="form-section">
      <h2 class="section-title">个人照片</h2>
      <div class="photo-upload">
        <div class="photo-preview" v-if="photoPreview">
          <img :src="photoPreview" alt="个人照片" />
        </div>
        <div class="photo-actions">
          <button class="btn-secondary" @click="triggerPhotoInput">
            {{ photoPreview ? '更换照片' : '上传照片' }}
          </button>
          <button v-if="photoPreview" class="btn-danger" @click="deletePhoto">
            删除照片
          </button>
          <input ref="photoInput" type="file" accept="image/*" @change="handlePhotoChange" hidden />
        </div>
      </div>
    </div>

    <!-- Basic Info Section -->
    <div class="form-section">
      <h2 class="section-title">基本信息 (Basic Information)</h2>
      <div class="form-grid" v-if="basicInfo">
        <div class="form-group" v-for="(value, key) in basicInfo" :key="key">
          <div class="field-header">
            <label>{{ fieldLabels[key as string] || key }}</label>
            <button class="btn-remove-field" @click="removeField(key as string)" title="删除字段">×</button>
          </div>
          <input v-model="basicInfo[key as string]" type="text" :placeholder="fieldLabels[key as string] || key" />
        </div>
      </div>
      <div class="form-actions-inline">
        <button class="btn-add-field" @click="openAddFieldModal">+ 添加字段</button>
        <button class="btn-primary" @click="saveSection('basic_info')">保存基本信息</button>
      </div>
    </div>

    <!-- Experience Section -->
    <div class="form-section">
      <h2 class="section-title">经历 (Experience)</h2>
      <div class="items-list" v-if="experienceData">
        <div
          class="item-card"
          v-for="(item, index) in experienceData.items"
          :key="index"
        >
          <div class="item-fields">
            <input v-model="item.title" placeholder="经历标题" />
            <textarea v-model="item.description" placeholder="经历描述" rows="3"></textarea>
          </div>
          <button class="btn-remove" @click="removeItem('experience', index)">×</button>
        </div>
        <button class="btn-add" @click="addItem('experience')">+ 添加经历</button>
      </div>
      <div class="form-actions-inline">
        <button class="btn-primary" @click="saveSection('experience')">保存经历</button>
      </div>
    </div>

    <!-- Skillsets Section -->
    <div class="form-section">
      <h2 class="section-title">技能 (Skillsets)</h2>
      <div class="items-list" v-if="skillsetData">
        <div
          class="item-card skill-card"
          v-for="(item, index) in skillsetData.items"
          :key="index"
        >
          <div class="item-fields skill-fields">
            <input v-model="item.name" placeholder="技能名称" />
            <div class="skill-level">
              <label>掌握程度</label>
              <input v-model.number="item.level" type="range" min="0" max="100" />
              <span>{{ item.level }}%</span>
            </div>
          </div>
          <button class="btn-remove" @click="removeItem('skillsets', index)">×</button>
        </div>
        <button class="btn-add" @click="addItem('skillsets')">+ 添加技能</button>
      </div>
      <div class="form-actions-inline">
        <button class="btn-primary" @click="saveSection('skillsets')">保存技能</button>
      </div>
    </div>

    <!-- Honors Section -->
    <div class="form-section">
      <h2 class="section-title">荣誉 (Honors)</h2>
      <div class="items-list" v-if="honorsData">
        <div
          class="item-card"
          v-for="(item, index) in honorsData.items"
          :key="index"
        >
          <div class="item-fields">
            <input v-model="item.title" placeholder="荣誉标题" />
            <div class="honor-descriptions">
              <div v-for="(desc, i) in item.descriptions" :key="i" class="desc-row">
                <textarea v-model="item.descriptions[i]" placeholder="荣誉描述" rows="2"></textarea>
                <button class="btn-remove-small" @click="removeDescription(index, i)">×</button>
              </div>
              <button class="btn-add-desc" @click="addDescription(index)">+ 添加描述</button>
            </div>
          </div>
          <button class="btn-remove" @click="removeItem('honors', index)">×</button>
        </div>
        <button class="btn-add" @click="addItem('honors')">+ 添加荣誉</button>
      </div>
      <div class="form-actions-inline">
        <button class="btn-primary" @click="saveSection('honors')">保存荣誉</button>
      </div>
    </div>

    <div class="save-toast" v-if="showToast">
      <span>✓ 保存成功</span>
    </div>

    <!-- Add Field Modal -->
    <div class="modal-overlay" v-if="showAddFieldModal" @click.self="cancelAddField">
      <div class="modal-content">
        <h3 class="modal-title">添加新字段</h3>
        <div class="modal-body">
          <div class="modal-field">
            <label>字段名称</label>
            <input
              v-model="newFieldLabel"
              type="text"
              placeholder="例如：电话、邮箱、地址..."
              @keyup.enter="confirmAddField"
              autofocus
            />
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-modal-cancel" @click="cancelAddField">取消</button>
          <button class="btn-modal-confirm" @click="confirmAddField">确认添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import api from '@/utils/api'

const photoInput = ref<HTMLInputElement>()
const photoPreview = ref<string | null>(null)
const photoFile = ref<File | null>(null)
const showToast = ref(false)

// Modal state
const showAddFieldModal = ref(false)
const newFieldLabel = ref('')

// Generate a simple key from label (pinyin-like or just use field_N)
function generateFieldKey(): string {
  if (!basicInfo.value) return 'field_1'
  const existingKeys = Object.keys(basicInfo.value)
  let counter = existingKeys.length + 1
  let key = `field_${counter}`
  while (existingKeys.includes(key)) {
    counter++
    key = `field_${counter}`
  }
  return key
}

const fieldLabels = reactive<Record<string, string>>({
  name: '姓名',
  gender: '性别',
  birth: '出生年月',
  hometown: '籍贯',
  education: '学历',
  school: '学校',
  political: '政治面貌',
  phone: '电话',
  email: '邮箱'
})

const basicInfo = ref<Record<string, string> | null>(null)
const experienceData = ref<{ items: { title: string; description: string }[] } | null>(null)
const skillsetData = ref<{ items: { name: string; level: number }[] } | null>(null)
const honorsData = ref<{ items: { title: string; descriptions: string[] }[] } | null>(null)

function triggerPhotoInput() {
  photoInput.value?.click()
}

async function handlePhotoChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  photoFile.value = file
  photoPreview.value = URL.createObjectURL(file)

  // Upload immediately
  const formData = new FormData()
  formData.append('photo', file)
  try {
    const res = await api.post('/personal/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    photoPreview.value = res.data.path
    showSaveToast()
  } catch (e) {
    alert('照片上传失败')
  }
}

async function deletePhoto() {
  if (!confirm('确定要删除个人照片吗？')) return
  try {
    await api.delete('/personal/photo')
    photoPreview.value = null
    photoFile.value = null
    showSaveToast()
  } catch (e) {
    alert('删除失败')
  }
}

function openAddFieldModal() {
  newFieldLabel.value = ''
  showAddFieldModal.value = true
}

function confirmAddField() {
  if (!newFieldLabel.value.trim()) {
    alert('请输入字段名称')
    return
  }

  if (basicInfo.value) {
    const key = generateFieldKey()
    basicInfo.value[key] = ''
    fieldLabels[key] = newFieldLabel.value.trim()
  }

  showAddFieldModal.value = false
  newFieldLabel.value = ''
}

function cancelAddField() {
  showAddFieldModal.value = false
  newFieldLabel.value = ''
}

function removeField(key: string) {
  if (!basicInfo.value) return
  if (confirm(`确定删除字段「${fieldLabels[key] || key}」吗？`)) {
    delete basicInfo.value[key]
    delete fieldLabels[key]
  }
}

function addItem(section: string) {
  if (section === 'experience' && experienceData.value) {
    experienceData.value.items.push({ title: '', description: '' })
  } else if (section === 'skillsets' && skillsetData.value) {
    skillsetData.value.items.push({ name: '', level: 50 })
  } else if (section === 'honors' && honorsData.value) {
    honorsData.value.items.push({ title: '', descriptions: [''] })
  }
}

function removeItem(section: string, index: number) {
  if (section === 'experience' && experienceData.value) {
    experienceData.value.items.splice(index, 1)
  } else if (section === 'skillsets' && skillsetData.value) {
    skillsetData.value.items.splice(index, 1)
  } else if (section === 'honors' && honorsData.value) {
    honorsData.value.items.splice(index, 1)
  }
}

function addDescription(honorIndex: number) {
  if (honorsData.value) {
    honorsData.value.items[honorIndex].descriptions.push('')
  }
}

function removeDescription(honorIndex: number, descIndex: number) {
  if (honorsData.value) {
    honorsData.value.items[honorIndex].descriptions.splice(descIndex, 1)
  }
}

async function saveSection(section: string) {
  let content: any = null
  if (section === 'basic_info') {
    // 保存数据和标签
    content = {
      fields: basicInfo.value,
      labels: { ...fieldLabels }
    }
  }
  else if (section === 'experience') content = experienceData.value
  else if (section === 'skillsets') content = skillsetData.value
  else if (section === 'honors') content = honorsData.value

  if (!content) return

  try {
    await api.put(`/personal/${section}`, { content })
    showSaveToast()
  } catch (e) {
    alert('保存失败')
  }
}

function showSaveToast() {
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2000)
}

onMounted(async () => {
  // Load personal info
  try {
    const res = await api.get('/personal')
    for (const section of res.data) {
      if (section.section === 'basic_info') {
        // 支持新格式 { fields, labels } 和旧格式
        if (section.content.fields && section.content.labels) {
          basicInfo.value = section.content.fields
          Object.assign(fieldLabels, section.content.labels)
        } else {
          basicInfo.value = section.content
        }
      }
      else if (section.section === 'experience') experienceData.value = section.content
      else if (section.section === 'skillsets') skillsetData.value = section.content
      else if (section.section === 'honors') honorsData.value = section.content
    }
  } catch (e) {
    console.error('Failed to load personal info:', e)
  }

  // Load photo
  try {
    const res = await api.get('/personal/photo/current')
    if (res.data.path) photoPreview.value = res.data.path
  } catch {}
})
</script>

<style scoped>
.personal-edit {
  max-width: 800px;
  position: relative;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-primary);
}

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

/* Photo */
.photo-upload {
  display: flex;
  align-items: center;
  gap: 24px;
}

.photo-preview {
  width: 150px;
  height: 200px;
  border-radius: 6px;
  overflow: hidden;
  background: #e8ddd0;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Form */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  color: var(--color-secondary);
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-remove-field {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e74c3c;
  font-size: 14px;
  border-radius: 50%;
  opacity: 0.6;
  transition: all var(--transition-fast);
}

.btn-remove-field:hover {
  opacity: 1;
  background: rgba(231, 76, 60, 0.1);
}

.form-group input {
  padding: 10px 14px;
  border: 1px solid rgba(147, 132, 123, 0.2);
  border-radius: 6px;
  font-size: 15px;
  transition: border-color var(--transition-fast);
  background: var(--color-bg-warm);
}

.form-group input:focus {
  border-color: var(--color-primary);
}

.form-actions-inline {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  transition: opacity var(--transition-fast);
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  padding: 10px 24px;
  background: rgba(147, 132, 123, 0.1);
  color: var(--color-primary);
  border-radius: 6px;
  font-size: 14px;
  transition: background var(--transition-fast);
}

.btn-secondary:hover {
  background: rgba(147, 132, 123, 0.2);
}

.btn-danger {
  padding: 10px 24px;
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border-radius: 6px;
  font-size: 14px;
  transition: background var(--transition-fast);
}

.btn-danger:hover {
  background: rgba(231, 76, 60, 0.2);
}

.btn-add-field {
  padding: 8px 16px;
  background: none;
  color: var(--color-secondary);
  font-size: 14px;
  border: 1px dashed rgba(147, 132, 123, 0.3);
  border-radius: 6px;
  transition: all var(--transition-fast);
}

.btn-add-field:hover {
  border-color: var(--color-secondary);
  color: var(--color-primary);
}

/* Items List */
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

.item-fields textarea {
  resize: vertical;
}

.skill-fields {
  flex-direction: row;
  align-items: center;
  gap: 16px;
}

.skill-fields input {
  width: 200px;
}

.skill-level {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.skill-level label {
  font-size: 13px;
  color: var(--color-secondary);
  white-space: nowrap;
}

.skill-level input[type="range"] {
  flex: 1;
  padding: 0;
  border: none;
  accent-color: var(--color-primary);
}

.skill-level span {
  font-size: 14px;
  color: var(--color-primary);
  min-width: 40px;
}

.btn-remove {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e74c3c;
  font-size: 20px;
  border-radius: 50%;
  transition: background var(--transition-fast);
  flex-shrink: 0;
}

.btn-remove:hover {
  background: rgba(231, 76, 60, 0.1);
}

.btn-add {
  padding: 12px;
  border: 2px dashed rgba(147, 132, 123, 0.2);
  border-radius: 8px;
  color: var(--color-secondary);
  font-size: 14px;
  text-align: center;
  transition: all var(--transition-fast);
}

.btn-add:hover {
  border-color: var(--color-secondary);
  color: var(--color-primary);
}

/* Honor descriptions */
.honor-descriptions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.desc-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.desc-row textarea {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid rgba(147, 132, 123, 0.15);
  border-radius: 6px;
  font-size: 14px;
  background: white;
  resize: vertical;
}

.btn-remove-small {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e74c3c;
  font-size: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}

.btn-remove-small:hover {
  background: rgba(231, 76, 60, 0.1);
}

.btn-add-desc {
  padding: 6px 12px;
  background: none;
  color: var(--color-secondary);
  font-size: 13px;
  border: 1px dashed rgba(147, 132, 123, 0.2);
  border-radius: 4px;
  align-self: flex-start;
}

.btn-add-desc:hover {
  border-color: var(--color-secondary);
  color: var(--color-primary);
}

/* Toast */
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

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 28px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: scaleIn 0.2s ease;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 20px;
}

.modal-body {
  margin-bottom: 24px;
}

.modal-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal-field label {
  font-size: 14px;
  color: var(--color-secondary);
}

.modal-field input {
  padding: 12px 16px;
  border: 1px solid rgba(147, 132, 123, 0.2);
  border-radius: 8px;
  font-size: 15px;
  transition: border-color var(--transition-fast);
}

.modal-field input:focus {
  border-color: var(--color-primary);
  outline: none;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-modal-cancel {
  padding: 10px 20px;
  background: rgba(147, 132, 123, 0.1);
  color: var(--color-secondary);
  border-radius: 8px;
  font-size: 14px;
  transition: background var(--transition-fast);
}

.btn-modal-cancel:hover {
  background: rgba(147, 132, 123, 0.2);
}

.btn-modal-confirm {
  padding: 10px 20px;
  background: var(--color-primary);
  color: white;
  border-radius: 8px;
  font-size: 14px;
  transition: opacity var(--transition-fast);
}

.btn-modal-confirm:hover {
  opacity: 0.9;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .skill-fields {
    flex-direction: column;
    align-items: stretch;
  }

  .skill-fields input {
    width: 100%;
  }
}
</style>
