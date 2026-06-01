<template>
  <div class="about-page">
    <!-- Navigation -->
    <nav class="nav">
      <router-link to="/" class="nav-logo">PORTFOLIO</router-link>
      <div class="nav-center">
        <router-link to="/about" class="nav-link nav-active">ABOUT ME</router-link>
        <router-link to="/works" class="nav-link">WORKS</router-link>
        <span class="nav-link nav-disabled">DAILY</span>
      </div>
      <div class="nav-icons">
        <svg class="nav-icon" width="31" height="31" viewBox="0 0 31 31" fill="none">
          <circle cx="13" cy="13" r="9" stroke="currentColor" stroke-width="2"/>
          <line x1="20" y1="20" x2="28" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <svg class="nav-icon" width="31" height="31" viewBox="0 0 31 31" fill="none">
          <line x1="4" y1="8" x2="27" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="4" y1="15.5" x2="27" y2="15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="4" y1="23" x2="27" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
    </nav>

    <!-- Title area -->
    <div class="about-header">
      <div class="about-title-group">
        <h1 class="about-title">About</h1>
        <h1 class="about-title about-title-me">Me</h1>
      </div>
      <div class="about-header-content">
        <!-- Left sidebar tabs - always at same z-level -->
        <div class="sidebar-tabs">
          <div
            v-for="card in cards"
            :key="card.id"
            class="sidebar-tab"
            :style="{ background: card.tabColor }"
            :class="{ active: activeCard === card.id }"
            @click="setActiveCard(card.id)"
          ></div>
        </div>

        <!-- Stacked cards area -->
        <div class="stacked-cards" ref="stackedArea">
          <!-- Experience card (bottom layer) -->
          <div
            class="stacked-card card-experience"
            :class="{ active: activeCard === 'experience', 'behind-honor': activeCard !== 'experience' && activeCard !== 'honors' }"
            :style="{ zIndex: getZIndex('experience') }"
            @click="setActiveCard('experience')"
          >
            <div class="card-inner">
              <div class="card-header-experience">
                <h2 class="card-en-title">Experience</h2>
                <span class="card-cn-title">经历</span>
              </div>
              <div class="card-content">
                <div class="experience-grid" v-if="experienceItems.length">
                  <div class="exp-item" v-for="(item, index) in experienceItems" :key="index">
                    <h3 class="exp-title">{{ item.title }}</h3>
                    <p class="exp-desc">{{ item.description }}</p>
                  </div>
                </div>
                <p v-else class="empty-hint">暂无经历数据</p>
              </div>
            </div>
          </div>

          <!-- Honor card (middle layer) -->
          <div
            class="stacked-card card-honor"
            :class="{ active: activeCard === 'honors' }"
            :style="{ zIndex: getZIndex('honors') }"
            @click="setActiveCard('honors')"
          >
            <div class="card-inner">
              <div class="card-header-honor">
                <h2 class="card-en-title">Honor</h2>
                <span class="card-cn-title">获奖荣誉</span>
              </div>
              <div class="card-content">
                <div class="honors-list" v-if="honorsItems.length">
                  <div class="honor-item" v-for="(item, index) in honorsItems" :key="index">
                    <div class="honor-dot"></div>
                    <div class="honor-text">
                      <h3 class="honor-title">{{ item.title }}</h3>
                      <p class="honor-desc" v-for="(desc, i) in item.descriptions" :key="i">{{ desc }}</p>
                    </div>
                  </div>
                </div>
                <p v-else class="empty-hint">暂无荣誉数据</p>
              </div>
            </div>
          </div>

          <!-- Basic Information card (top layer) -->
          <div
            class="stacked-card card-basic"
            :class="{ active: activeCard === 'basic' }"
            :style="{ zIndex: getZIndex('basic') }"
            @click="setActiveCard('basic')"
          >
            <div class="card-inner">
              <div class="card-header-basic">
                <h2 class="card-en-title">Basic Information</h2>
                <span class="card-cn-title">基本信息</span>
              </div>
              <div class="card-content">
                <div class="basic-layout">
                  <!-- Left: photo + contact -->
                  <div class="basic-left">
                    <div class="basic-photo" v-if="photoPath">
                      <img :src="photoPath" alt="个人照片" />
                    </div>
                    <div class="basic-contact" v-if="contactInfo.length">
                      <p v-for="item in contactInfo" :key="item.key">{{ item.label }}：{{ item.value }}</p>
                    </div>
                  </div>
                  <!-- Right: info sections -->
                  <div class="basic-right">
                    <div class="basic-name-row" v-if="nameValue">
                      <span class="name-value">{{ nameValue }}</span>
                      <span class="hometown-value" v-if="hometownValue">{{ hometownValue }}</span>
                    </div>

                    <!-- Education section -->
                    <div class="info-section" v-if="educationFields.length">
                      <h3 class="section-label">教育背景</h3>
                      <div class="info-grid">
                        <div class="info-item" v-for="item in educationFields" :key="item.key">
                          <span class="info-label">{{ item.label }}：</span>
                          <span class="info-value">{{ item.value }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Courses section -->
                    <div class="info-section" v-if="courseFields.length">
                      <h3 class="section-label">主修课程</h3>
                      <div class="tags-grid">
                        <span class="course-tag" v-for="item in courseFields" :key="item.key">{{ item.value }}</span>
                      </div>
                    </div>

                    <!-- Software skills section -->
                    <div class="info-section" v-if="softwareSkills.length">
                      <h3 class="section-label">软件技能</h3>
                      <div class="tags-grid">
                        <span class="skill-tag" v-for="(skill, index) in softwareSkills" :key="index">
                          <img v-if="skill.icon" :src="skill.icon" :alt="skill.name" class="skill-icon" />
                          <span v-else class="skill-text">{{ skill.name }}</span>
                        </span>
                      </div>
                    </div>

                    <!-- Other fields -->
                    <div class="info-section" v-if="otherFields.length">
                      <div class="info-grid">
                        <div class="info-item" v-for="item in otherFields" :key="item.key">
                          <span class="info-label">{{ item.label }}：</span>
                          <span class="info-value">{{ item.value }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePortfolioStore } from '@/stores/portfolio'
import api from '@/utils/api'

const store = usePortfolioStore()
const route = useRoute()
const photoPath = ref<string | null>(null)
const activeCard = ref('basic')
const stackedArea = ref<HTMLElement>()

// Three cards configuration
const cards = [
  { id: 'basic', en: 'Basic Information', cn: '基本信息', tabColor: '#93847B' },
  { id: 'honors', en: 'Honor', cn: '获奖荣誉', tabColor: '#EAD287' },
  { id: 'experience', en: 'Experience', cn: '经历', tabColor: '#EDE3D7' }
]

// Default labels for basic info fields
const defaultLabels: Record<string, string> = {
  name: '姓名', gender: '性别', birth: '出生年月',
  hometown: '籍贯', education: '学历', school: '学校',
  political: '政治面貌', phone: '电话', email: '邮箱'
}

// Basic info computed
const basicInfo = computed(() => {
  const s = store.personalInfo.find(s => s.section === 'basic_info')
  if (!s?.content) return null
  if (s.content.fields && s.content.labels) {
    return s.content.fields
  }
  return s.content
})

const savedLabels = computed(() => {
  const s = store.personalInfo.find(s => s.section === 'basic_info')
  if (s?.content?.labels) return s.content.labels
  return {}
})

// Helper to get label for a key
function getLabel(key: string): string {
  return savedLabels.value[key] || defaultLabels[key] || key
}

// Name
const nameValue = computed(() => basicInfo.value?.name || '')

// Hometown
const hometownValue = computed(() => basicInfo.value?.hometown || '')

// Education fields: school, education (degree), major, political, GPA
const educationFields = computed(() => {
  if (!basicInfo.value) return []
  const eduKeys = ['school', 'education', 'major', 'political', 'gpa']
  return Object.entries(basicInfo.value)
    .filter(([key]) => eduKeys.includes(key))
    .map(([key, value]) => ({ key, label: getLabel(key), value: String(value) }))
    .filter(item => item.value)
})

// Course fields
const courseFields = computed(() => {
  if (!basicInfo.value) return []
  return Object.entries(basicInfo.value)
    .filter(([key]) => key.startsWith('course_'))
    .map(([key, value]) => ({ key, value: String(value) }))
    .filter(item => item.value)
})

// Software skills
const softwareSkills = computed(() => {
  if (!basicInfo.value) return []
  return Object.entries(basicInfo.value)
    .filter(([key]) => key.startsWith('skill_'))
    .map(([key, value]) => {
      const v = value as any
      if (typeof v === 'object' && v !== null) {
        return { name: v.name || '', icon: v.icon || null }
      }
      return { name: String(v), icon: null }
    })
    .filter(item => item.name)
})

// Contact fields: phone, email, wechat
const contactInfo = computed(() => {
  if (!basicInfo.value) return []
  const contactKeys = ['phone', 'email', 'wechat']
  return Object.entries(basicInfo.value)
    .filter(([key]) => contactKeys.includes(key))
    .map(([key, value]) => ({ key, label: getLabel(key), value: String(value) }))
    .filter(item => item.value)
})

// Other fields (not in any specific category)
const otherFields = computed(() => {
  if (!basicInfo.value) return []
  const usedKeys = new Set([
    'name', 'hometown', 'school', 'education', 'major', 'political', 'gpa',
    'phone', 'email', 'wechat'
  ])
  return Object.entries(basicInfo.value)
    .filter(([key]) => !key.startsWith('course_') && !key.startsWith('skill_') && !usedKeys.has(key))
    .map(([key, value]) => ({ key, label: getLabel(key), value: String(value) }))
    .filter(item => item.value)
})

// Experience
const experienceItems = computed(() => {
  const s = store.personalInfo.find(s => s.section === 'experience')
  return s?.content?.items || []
})

// Honors
const honorsItems = computed(() => {
  const s = store.personalInfo.find(s => s.section === 'honors')
  return s?.content?.items || []
})

// Z-index logic: active card on top, others behind
function getZIndex(cardId: string): number {
  if (activeCard.value === cardId) return 3
  if (cardId === 'basic') return 1
  if (cardId === 'honors') return 2
  return 1
}

function setActiveCard(cardId: string) {
  activeCard.value = cardId
}

// Reset when navigating to About from home
watch(() => route.fullPath, (newPath) => {
  if (newPath === '/about') {
    activeCard.value = 'basic'
  }
})

onMounted(async () => {
  await store.fetchPersonalInfo()
  try {
    const res = await api.get('/personal/photo/current')
    if (res.data.path) photoPath.value = res.data.path
  } catch {}
})
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: #FBF7F6;
  padding-bottom: 100px;
}

/* Navigation */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  display: flex;
  align-items: center;
  z-index: 100;
  padding: 0 65px;
  background: rgba(251, 247, 246, 0.95);
  backdrop-filter: blur(10px);
}

.nav-logo {
  position: absolute;
  left: 65px;
  top: 30px;
  font-family: var(--font-cn);
  font-weight: 500;
  font-size: 32px;
  color: #544B45;
  text-decoration: none;
  letter-spacing: 2px;
}

.nav-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 30px;
  display: flex;
  align-items: center;
  gap: 48px;
}

.nav-link {
  font-family: var(--font-cn);
  font-weight: 500;
  font-size: 32px;
  color: #93847B;
  text-decoration: none;
  transition: color 0.3s;
  position: relative;
  padding-bottom: 6px;
}

.nav-link:hover {
  color: #544B45;
}

.nav-active {
  color: #544B45;
}

.nav-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #544B45;
  border-radius: 2px;
}

.nav-disabled {
  opacity: 0.6;
  cursor: default;
}

.nav-icons {
  position: absolute;
  right: 65px;
  top: 31px;
  display: flex;
  gap: 16px;
}

.nav-icon {
  color: #544B45;
  cursor: pointer;
}

/* About header */
.about-header {
  padding: 142px 65px 0;
  position: relative;
}

.about-title-group {
  display: flex;
  gap: 56px;
}

.about-title {
  font-family: var(--font-en);
  font-style: italic;
  font-weight: 500;
  font-size: 70px;
  color: #544B45;
  line-height: 1.1;
}

.about-header-content {
  display: flex;
  gap: 20px;
  margin-top: 40px;
}

/* Sidebar tabs - always at same z-level */
.sidebar-tabs {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-shrink: 0;
  z-index: 10;
}

.sidebar-tab {
  width: 24px;
  height: 80px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.85;
}

.sidebar-tab:hover {
  opacity: 1;
  transform: scale(1.05);
}

.sidebar-tab.active {
  opacity: 1;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

/* Stacked cards */
.stacked-cards {
  position: relative;
  flex: 1;
  min-height: 700px;
}

.stacked-card {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
}

.stacked-card:hover {
  transform: translateY(-4px);
}

/* Card states */
.card-basic {
  height: 480px;
  background: #FFF2E5;
}

.card-honor {
  height: 420px;
  background: #EAD287;
}

.card-experience {
  height: 700px;
  background: #BAB395;
}

/* Active card positioning */
.card-basic.active {
  transform: translateY(0);
}

.card-honor.active {
  transform: translateY(0);
}

.card-experience.active {
  transform: translateY(0);
}

/* Non-active cards: peek from behind */
.card-basic:not(.active) {
  transform: translateY(280px);
  opacity: 0.85;
}

.card-honor:not(.active) {
  transform: translateY(200px);
  opacity: 0.85;
}

.card-experience:not(.active) {
  transform: translateY(0);
  opacity: 0.85;
}

/* Card inner layout */
.card-inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Card headers */
.card-header-basic {
  padding: 40px 60px 16px;
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.card-header-honor {
  padding: 40px 60px 16px;
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.card-header-experience {
  padding: 40px 60px 16px;
  display: flex;
  align-items: baseline;
  gap: 12px;
  justify-content: flex-end;
}

.card-en-title {
  font-family: var(--font-en);
  font-style: italic;
  font-weight: 500;
  font-size: 42px;
  color: #544B45;
  line-height: 1.2;
}

.card-cn-title {
  font-family: var(--font-cn);
  font-weight: 500;
  font-size: 22px;
  color: #93847B;
}

/* Card content */
.card-content {
  flex: 1;
  padding: 16px 60px 40px;
  overflow-y: auto;
}

/* ===== Basic Information Layout ===== */
.basic-layout {
  display: flex;
  gap: 48px;
}

.basic-left {
  flex-shrink: 0;
  width: 240px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.basic-photo {
  width: 240px;
  height: 320px;
  border-radius: 4px;
  overflow: hidden;
  background: #e8ddd0;
}

.basic-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.basic-contact {
  font-family: var(--font-cn);
  font-size: 14px;
  color: #544B45;
  line-height: 1.8;
}

.basic-contact p {
  margin: 0;
}

.basic-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.basic-name-row {
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.name-value {
  font-family: var(--font-cn);
  font-weight: 600;
  font-size: 28px;
  color: #544B45;
}

.hometown-value {
  font-family: var(--font-cn);
  font-size: 18px;
  color: #93847B;
}

.info-section {
  margin-bottom: 8px;
}

.section-label {
  font-family: var(--font-cn);
  font-weight: 500;
  font-size: 18px;
  color: #544B45;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px dashed rgba(147, 132, 123, 0.3);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px 24px;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #544B45;
}

.info-label {
  font-family: var(--font-cn);
  color: #93847B;
  white-space: nowrap;
}

.info-value {
  font-family: var(--font-cn);
}

.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.course-tag {
  padding: 4px 14px;
  background: rgba(84, 75, 69, 0.08);
  border-radius: 4px;
  font-family: var(--font-cn);
  font-size: 14px;
  color: #544B45;
}

.skill-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(84, 75, 69, 0.08);
  border-radius: 6px;
  overflow: hidden;
}

.skill-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.skill-text {
  font-family: var(--font-cn);
  font-size: 11px;
  color: #544B45;
  text-align: center;
  line-height: 1.2;
}

/* ===== Honor Layout ===== */
.honors-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.honor-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.honor-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #544B45;
  flex-shrink: 0;
  margin-top: 6px;
}

.honor-text {
  flex: 1;
}

.honor-title {
  font-family: var(--font-cn);
  font-weight: 500;
  font-size: 18px;
  color: #544B45;
  margin-bottom: 4px;
}

.honor-desc {
  font-family: var(--font-cn);
  font-size: 15px;
  color: #544B45;
  line-height: 1.6;
  margin: 2px 0;
}

/* ===== Experience Layout ===== */
.experience-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px 40px;
}

.exp-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.exp-title {
  font-family: var(--font-cn);
  font-weight: 500;
  font-size: 18px;
  color: #544B45;
}

.exp-desc {
  font-family: var(--font-cn);
  font-size: 15px;
  color: #544B45;
  line-height: 1.6;
}

.empty-hint {
  color: rgba(84, 75, 69, 0.4);
  font-size: 16px;
  text-align: center;
  padding: 40px;
}

/* Responsive */
@media (max-width: 1024px) {
  .basic-layout {
    flex-direction: column;
  }

  .basic-left {
    width: 100%;
    flex-direction: row;
    align-items: flex-start;
  }

  .basic-photo {
    width: 180px;
    height: 240px;
  }

  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .nav { padding: 0 24px; }
  .nav-logo { left: 24px; }
  .nav-center { gap: 24px; }
  .nav-link { font-size: 20px; }
  .nav-icons { right: 24px; }

  .about-header { padding: 120px 24px 0; }
  .about-title { font-size: 48px; }
  .about-title-group { gap: 24px; }

  .sidebar-tabs { display: none; }

  .stacked-cards {
    min-height: auto;
  }

  .stacked-card {
    position: relative;
    height: auto !important;
    margin-bottom: 16px;
    transform: none !important;
    opacity: 1 !important;
  }

  .card-inner {
    min-height: 300px;
  }

  .card-header-basic,
  .card-header-honor,
  .card-header-experience {
    padding: 24px 24px 12px;
    justify-content: flex-start;
  }

  .card-content { padding: 12px 24px 24px; }

  .card-en-title { font-size: 28px; }

  .basic-layout {
    flex-direction: column;
  }

  .basic-left {
    flex-direction: column;
    width: 100%;
  }

  .basic-photo { width: 100%; height: 280px; }

  .info-grid { grid-template-columns: 1fr; }
  .experience-grid { grid-template-columns: 1fr; }
}
</style>
