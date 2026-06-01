<template>
  <div class="works-page">
    <!-- Navigation -->
    <nav class="nav">
      <router-link to="/" class="nav-logo">PORTFOLIO</router-link>
      <div class="nav-center">
        <router-link to="/about" class="nav-link">ABOUT ME</router-link>
        <router-link to="/works" class="nav-link nav-active">WORKS</router-link>
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

    <section class="works-hero">
      <h1 class="works-title">Works</h1>
      <p class="works-subtitle">作品集</p>
    </section>

    <section class="works-list">
      <div
        v-for="(project, index) in store.projects"
        :key="project.id"
        class="work-item"
        :class="index % 2 === 0 ? 'item-left' : 'item-right'"
      >
        <!-- Envelope card -->
        <div class="envelope-wrapper" :style="getEnvelopeStyle(index)">
          <div class="envelope" @click="goToDetail(project.id)">
            <!-- Envelope background -->
            <img :src="envelopeImg" alt="" class="envelope-bg" />
            <!-- Image on envelope -->
            <div class="envelope-image" :class="{ hovering: hoveredProject === project.id }">
              <div
                class="envelope-img-inner"
                :style="project.cover_image ? { backgroundImage: `url(${project.cover_image})` } : {}"
              ></div>
            </div>
          </div>
        </div>

        <!-- Text info -->
        <div class="work-info">
          <h2 class="work-title">{{ project.title }}</h2>
          <p class="work-subtitle" v-if="project.subtitle">{{ project.subtitle }}</p>
          <div class="work-meta">
            <span class="work-year" v-if="project.year">{{ project.year }}</span>
            <span class="work-category" v-if="project.category">{{ project.category }}</span>
          </div>
          <router-link
            :to="`/works/${project.id}`"
            class="work-link"
            @mouseenter="hoveredProject = project.id"
            @mouseleave="hoveredProject = null"
          >
            观看 →
          </router-link>
        </div>
      </div>

      <div v-if="!store.loading && store.projects.length === 0" class="empty-state">
        <p>暂无作品，请在后台添加</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePortfolioStore } from '@/stores/portfolio'

const router = useRouter()
const store = usePortfolioStore()
const hoveredProject = ref<number | null>(null)
const envelopeImg = '/images/figma/xinfeng.png'

// Generate random envelope tilt based on index
function getEnvelopeStyle(index: number) {
  const isLeft = index % 2 === 0
  // Seed random-ish tilt based on index
  const seed = (index * 7 + 3) % 11
  const tilt = isLeft ? -(2 + seed * 0.5) : (2 + seed * 0.5)
  return {
    transform: `rotate(${tilt}deg)`
  }
}

function goToDetail(id: number) {
  router.push({ name: 'work-detail', params: { id } })
}

onMounted(() => {
  store.fetchProjects()
})
</script>

<style scoped>
.works-page {
  min-height: 100vh;
  background: #FBF7F6;
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

/* Hero */
.works-hero {
  height: 35vh;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 65px 48px;
}

.works-title {
  font-family: var(--font-en);
  font-style: italic;
  font-weight: 500;
  font-size: 70px;
  color: #544B45;
}

.works-subtitle {
  font-family: var(--font-cn);
  font-weight: 500;
  font-size: 30px;
  color: #93847B;
  margin-top: 8px;
}

/* Works list - staggered layout */
.works-list {
  padding: 0 65px 80px;
  display: flex;
  flex-direction: column;
  gap: 80px;
}

.work-item {
  display: flex;
  align-items: flex-start;
  gap: 48px;
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards;
}

.work-item.item-left {
  flex-direction: row;
}

.work-item.item-right {
  flex-direction: row-reverse;
}

/* Envelope */
.envelope-wrapper {
  flex-shrink: 0;
  width: 420px;
  transition: transform 0.4s ease;
}

.envelope-wrapper:hover {
  transform: rotate(0deg) !important;
}

.envelope {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  cursor: pointer;
  overflow: visible;
}

.envelope-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Image on envelope - pull-out effect */
.envelope-image {
  position: absolute;
  top: 15%;
  left: 15%;
  width: 70%;
  height: 70%;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.envelope-image.hovering {
  transform: translateY(-16px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.25);
}

.envelope-img-inner {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e8ddd0, #d4c5b0);
  background-size: cover;
  background-position: center;
}

/* Work info */
.work-info {
  flex: 1;
  padding-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.work-title {
  font-family: var(--font-cn);
  font-weight: 500;
  font-size: 28px;
  color: #544B45;
  line-height: 1.4;
  white-space: pre-line;
}

.work-subtitle {
  font-family: var(--font-cn);
  font-size: 18px;
  color: #93847B;
  line-height: 1.5;
  white-space: pre-line;
}

.work-meta {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.work-year {
  font-family: var(--font-en);
  font-size: 14px;
  color: #93847B;
}

.work-category {
  font-size: 14px;
  color: #93847B;
  padding-left: 12px;
  border-left: 1px solid #93847B;
}

.work-link {
  display: inline-block;
  margin-top: 8px;
  font-family: var(--font-cn);
  font-size: 18px;
  color: #544B45;
  text-decoration: none;
  transition: all 0.3s ease;
  align-self: flex-start;
}

.work-link:hover {
  color: #93847B;
  transform: scale(1.08);
  letter-spacing: 1px;
}

.empty-state {
  text-align: center;
  padding: 80px 0;
  color: #93847B;
  font-size: 18px;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .envelope-wrapper {
    width: 320px;
  }
}

@media (max-width: 768px) {
  .nav { padding: 0 24px; }
  .nav-logo { left: 24px; }
  .nav-center { display: none; }
  .nav-icons { right: 24px; }

  .works-hero { padding: 0 24px 32px; }
  .works-title { font-size: 48px; }

  .works-list {
    gap: 48px;
    padding: 0 24px 48px;
  }

  .work-item,
  .work-item.item-left,
  .work-item.item-right {
    flex-direction: column;
    align-items: center;
  }

  .envelope-wrapper {
    width: 100%;
    max-width: 400px;
  }

  .work-info {
    padding-top: 0;
    text-align: center;
    align-items: center;
  }
}
</style>
