<template>
  <div class="personal-edit">
    <div class="page-header">
      <h1 class="page-title">基本信息管理</h1>
      <div class="page-nav">
        <router-link to="/admin/personal/basic" class="nav-tab active">基本信息</router-link>
        <router-link to="/admin/personal/honors" class="nav-tab">获奖荣誉</router-link>
        <router-link to="/admin/personal/experience" class="nav-tab">经历</router-link>
      </div>
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

    <!-- Basic Info Fields -->
    <div class="form-section">
      <h2 class="section-title">信息字段</h2>
      <p class="section-desc">以下是基本信息页显示的字段。姓名和籍贯会显示在顶部，教育背景、主修课程、软件技能会分区域显示。</p>

      <!-- Name (special - shown at top) -->
      <div class="field-group">
        <div class="form-group">
          <label>姓名</label>
          <input v-model="fields.name" type="text" placeholder="姓名" />
        </div>
        <div class="form-group">
          <label>籍贯</label>
          <input v-model="fields.hometown" type="text" placeholder="籍贯" />
        </div>
      </div>

      <!-- Education fields -->
      <h3 class="sub-section-title">教育背景</h3>
      <div class="field-grid">
        <div class="form-group">
          <label>学校</label>
          <input v-model="fields.school" type="text" placeholder="学校名称" />
        </div>
        <div class="form-group">
          <label>学历</label>
          <input v-model="fields.education" type="text" placeholder="如：硕士" />
        </div>
        <div class="form-group">
          <label>专业</label>
          <input v-model="fields.major" type="text" placeholder="专业名称" />
        </div>
        <div class="form-group">
          <label>政治面貌</label>
          <input v-model="fields.political" type="text" placeholder="政治面貌" />
        </div>
        <div class="form-group">
          <label>GPA</label>
          <input v-model="fields.gpa" type="text" placeholder="如：4.01" />
        </div>
      </div>

      <!-- Courses -->
      <h3 class="sub-section-title">主修课程</h3>
      <div class="items-list">
        <div v-for="(course, index) in courses" :key="index" class="item-card">
          <input v-model="courses[index]" placeholder="课程名称" />
          <button class="btn-remove" @click="removeCourse(index)">×</button>
        </div>
        <button class="btn-add" @click="addCourse">+ 添加课程</button>
      </div>

      <!-- Software Skills -->
      <h3 class="sub-section-title">软件技能</h3>
      <div class="items-list">
        <div v-for="(skill, index) in softwareSkills" :key="index" class="item-card skill-card">
          <div class="skill-fields">
            <input v-model="skill.name" placeholder="技能名称（如：PS、AI）" />
            <div class="skill-icon-upload">
              <label>图标：</label>
              <input
                :ref="el => setSkillIconRef(el as HTMLInputElement, index)"
                type="file"
                accept="image/*"
                @change="(e) => handleSkillIconChange(e, index)"
                hidden
              />
              <button class="btn-icon" @click="triggerSkillIcon(index)">
                {{ skill.icon ? '更换图标' : '上传图标' }}
              </button>
              <img v-if="skill.icon" :src="skill.icon" class="skill-icon-preview" />
            </div>
          </div>
          <button class="btn-remove" @click="removeSoftwareSkill(index)">×</button>
        </div>
        <button class="btn-add" @click="addSoftwareSkill">+ 添加软件技能</button>
      </div>

      <!-- Contact fields -->
      <h3 class="sub-section-title">联系方式</h3>
      <div class="field-grid">
        <div class="form-group">
          <label>电话</label>
          <input v-model="fields.phone" type="text" placeholder="电话号码" />
        </div>
        <div class="form-group">
          <label>邮箱</label>
          <input v-model="fields.email" type="text" placeholder="邮箱地址" />
        </div>
        <div class="form-group">
          <label>微信</label>
          <input v-model="fields.wechat" type="text" placeholder="微信号" />
        </div>
      </div>

      <!-- Custom fields -->
      <h3 class="sub-section-title">自定义字段</h3>
      <div class="items-list">
        <div v-for="(field, index) in customFields" :key="index" class="item-card">
          <div class="custom-field-row">
            <input v-model="field.label" placeholder="字段名称" class="field-label-input" />
            <input v-model="field.value" placeholder="字段值" class="field-value-input" />
          </div>
          <button class="btn-remove" @click="removeCustomField(index)">×</button>
        </div>
        <button class="btn-add" @click="addCustomField">+ 添加自定义字段</button>
      </div>
    </div>

    <div class="form-actions">
      <button class="btn-primary" @click="saveBasicInfo" :disabled="saving">
        {{ saving ? '保存中...' : '保存基本信息' }}
      </button>
    </div>

    <div class="save-toast" v-if="showToast">
      <span>✓ 保存成功</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import api from '@/utils/api'

const photoInput = ref<HTMLInputElement>()
const photoPreview = ref<string | null>(null)
const saving = ref(false)
const showToast = ref(false)

const fields = reactive({
  name: '',
  hometown: '',
  school: '',
  education: '',
  major: '',
  political: '',
  gpa: '',
  phone: '',
  email: '',
  wechat: ''
})

const courses = ref<string[]>([])
const softwareSkills = ref<{ name: string; icon: string | null }[]>([])
const customFields = ref<{ label: string; value: string; key: string }[]>([])

const skillIconRefs = new Map<number, HTMLInputElement>()

function setSkillIconRef(el: HTMLInputElement | null, index: number) {
  if (el) skillIconRefs.set(index, el)
}

function triggerSkillIcon(index: number) {
  skillIconRefs.get(index)?.click()
}

async function handleSkillIconChange(e: Event, index: number) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const formData = new FormData()
  formData.append('image', file)
  try {
    const res = await api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    softwareSkills.value[index].icon = res.data.path
  } catch {
    alert('图标上传失败')
  }
}

function triggerPhotoInput() {
  photoInput.value?.click()
}

async function handlePhotoChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const formData = new FormData()
  formData.append('photo', file)
  try {
    const res = await api.post('/personal/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    photoPreview.value = res.data.path
    showSaveToast()
  } catch {
    alert('照片上传失败')
  }
}

async function deletePhoto() {
  if (!confirm('确定要删除个人照片吗？')) return
  try {
    await api.delete('/personal/photo')
    photoPreview.value = null
    showSaveToast()
  } catch {
    alert('删除失败')
  }
}

function addCourse() {
  courses.value.push('')
}

function removeCourse(index: number) {
  courses.value.splice(index, 1)
}

function addSoftwareSkill() {
  softwareSkills.value.push({ name: '', icon: null })
}

function removeSoftwareSkill(index: number) {
  softwareSkills.value.splice(index, 1)
}

function addCustomField() {
  const key = `custom_${Date.now()}`
  customFields.value.push({ label: '', value: '', key })
}

function removeCustomField(index: number) {
  customFields.value.splice(index, 1)
}

async function saveBasicInfo() {
  saving.value = true

  // Build the fields object
  const allFields: Record<string, any> = { ...fields }

  // Add courses
  courses.value.forEach((course, i) => {
    if (course) allFields[`course_${i}`] = course
  })

  // Add software skills
  softwareSkills.value.forEach((skill, i) => {
    if (skill.name) {
      allFields[`skill_${i}`] = skill.icon ? { name: skill.name, icon: skill.icon } : skill.name
    }
  })

  // Add custom fields
  customFields.value.forEach(field => {
    if (field.label && field.value) {
      allFields[field.key] = field.value
    }
  })

  // Build labels
  const labels: Record<string, string> = {
    name: '姓名', hometown: '籍贯', school: '学校', education: '学历',
    major: '专业', political: '政治面貌', gpa: 'GPA',
    phone: '电话', email: '邮箱', wechat: '微信'
  }
  customFields.value.forEach(field => {
    if (field.label) labels[field.key] = field.label
  })

  try {
    await api.put('/personal/basic_info', {
      content: { fields: allFields, labels }
    })
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
      if (section.section === 'basic_info') {
        let fieldsData = section.content.fields || section.content
        let labelsData = section.content.labels || {}

        // Populate reactive fields
        Object.keys(fields).forEach(key => {
          if (fieldsData[key]) (fields as any)[key] = fieldsData[key]
        })

        // Populate courses
        Object.keys(fieldsData)
          .filter(k => k.startsWith('course_'))
          .sort()
          .forEach(k => courses.value.push(fieldsData[k]))

        // Populate software skills
        Object.keys(fieldsData)
          .filter(k => k.startsWith('skill_'))
          .sort()
          .forEach(k => {
            const v = fieldsData[k]
            if (typeof v === 'object' && v !== null) {
              softwareSkills.value.push({ name: v.name || '', icon: v.icon || null })
            } else {
              softwareSkills.value.push({ name: String(v), icon: null })
            }
          })

        // Populate custom fields
        const standardKeys = new Set([
          'name', 'hometown', 'school', 'education', 'major', 'political', 'gpa',
          'phone', 'email', 'wechat'
        ])
        Object.keys(fieldsData)
          .filter(k => !k.startsWith('course_') && !k.startsWith('skill_') && !standardKeys.has(k))
          .forEach(k => {
            customFields.value.push({
              label: labelsData[k] || k,
              value: fieldsData[k],
              key: k
            })
          })
      }
    }
  } catch {}

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
  margin-bottom: 16px;
}

.page-nav {
  display: flex;
  gap: 8px;
}

.nav-tab {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  color: var(--color-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.nav-tab:hover {
  background: rgba(147, 132, 123, 0.1);
}

.nav-tab.active {
  background: var(--color-primary);
  color: white;
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

.section-desc {
  font-size: 14px;
  color: var(--color-secondary);
  margin-bottom: 16px;
}

.sub-section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-primary);
  margin: 20px 0 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(147, 132, 123, 0.1);
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

.photo-actions {
  display: flex;
  gap: 12px;
}

/* Form */
.field-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.field-grid {
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

.form-group label {
  font-size: 14px;
  color: var(--color-secondary);
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

.form-group input:focus {
  border-color: var(--color-primary);
}

/* Items list */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-card {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  background: var(--color-bg-warm);
  border-radius: 8px;
}

.item-card input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid rgba(147, 132, 123, 0.15);
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.skill-fields {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.skill-fields input {
  width: 200px;
  flex: none;
}

.skill-icon-upload {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skill-icon-upload label {
  font-size: 13px;
  color: var(--color-secondary);
}

.btn-icon {
  padding: 6px 12px;
  background: rgba(147, 132, 123, 0.1);
  color: var(--color-secondary);
  border-radius: 4px;
  font-size: 12px;
}

.btn-icon:hover {
  background: rgba(147, 132, 123, 0.2);
}

.skill-icon-preview {
  width: 28px;
  height: 28px;
  object-fit: contain;
  border-radius: 4px;
}

.custom-field-row {
  flex: 1;
  display: flex;
  gap: 12px;
}

.field-label-input {
  width: 120px !important;
  flex: none !important;
}

.field-value-input {
  flex: 1 !important;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
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

.btn-primary:hover { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secondary {
  padding: 10px 24px;
  background: rgba(147, 132, 123, 0.1);
  color: var(--color-primary);
  border-radius: 6px;
  font-size: 14px;
}

.btn-secondary:hover { background: rgba(147, 132, 123, 0.2); }

.btn-danger {
  padding: 10px 24px;
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border-radius: 6px;
  font-size: 14px;
}

.btn-danger:hover { background: rgba(231, 76, 60, 0.2); }

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

@media (max-width: 768px) {
  .field-group, .field-grid {
    grid-template-columns: 1fr;
  }
  .skill-fields {
    flex-direction: column;
    align-items: stretch;
  }
  .skill-fields input { width: 100%; }
  .custom-field-row { flex-direction: column; }
  .field-label-input, .field-value-input { width: 100% !important; }
}
</style>
