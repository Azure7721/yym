<template>
  <div class="daily-page">
    <!-- Navigation -->
    <nav class="nav">
      <router-link to="/" class="nav-logo">PORTFOLIO</router-link>
      <div class="nav-center">
        <router-link to="/about" class="nav-link">ABOUT ME</router-link>
        <router-link to="/works" class="nav-link">WORKS</router-link>
        <router-link to="/daily" class="nav-link nav-active">DAILY</router-link>
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
    <section class="daily-hero">
      <h1 class="daily-title">{{ dailyData.title }}</h1>
      <p class="daily-subtitle">{{ dailyData.subtitle }}</p>
    </section>

    <!-- Boards carousel -->
    <section class="boards-section">
      <!-- Left arrow -->
      <button class="arrow-btn arrow-left" @click="scrollBoards(-1)" v-if="boards.length > 3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- Boards container -->
      <div class="boards-container" ref="boardsContainer">
        <div
          v-for="(board, index) in boards"
          :key="index"
          class="board-item"
          :class="getBoardClass(index)"
          :style="getBoardStyle(index)"
        >
          <div class="board-clip">
            <img :src="clipPaths[board.style]" alt="" class="clip-img" />
          </div>
          <div class="board-content">
            <div
              class="board-image"
              :style="board.image ? { backgroundImage: `url(${board.image})` } : {}"
            ></div>
          </div>
        </div>
      </div>

      <!-- Right arrow -->
      <button class="arrow-btn arrow-right" @click="scrollBoards(1)" v-if="boards.length > 3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/api'

interface Board {
  image: string | null
  style: 'huaban1' | 'huaban2'
}

const dailyData = ref({
  title: '跨界技能与设计思维的延展',
  subtitle: 'Extensions of cross-disciplinary\nskills and design thinking'
})

const boards = ref<Board[]>([])
const scrollOffset = ref(0)
const boardsContainer = ref<HTMLElement>()

const clipPaths: Record<string, string> = {
  huaban1: '/images/figma/huaban1.jpg',
  huaban2: '/images/figma/huaban2.jpg'
}

function getBoardClass(index: number): string {
  const centerIndex = Math.floor(boards.value.length / 2) + scrollOffset.value
  const dist = Math.abs(index - centerIndex)
  if (dist === 0) return 'board-center'
  if (dist === 1) return 'board-near'
  return 'board-far'
}

function getBoardStyle(index: number): Record<string, string> {
  const centerIndex = Math.floor(boards.value.length / 2) + scrollOffset.value
  const dist = Math.abs(index - centerIndex)
  if (dist === 0) {
    return { transform: 'scale(1)', opacity: '1', zIndex: '3' }
  }
  if (dist === 1) {
    return { transform: 'scale(0.82)', opacity: '0.85', zIndex: '2' }
  }
  return { transform: 'scale(0.65)', opacity: '0.6', zIndex: '1' }
}

function scrollBoards(direction: number) {
  const maxOffset = Math.max(0, Math.floor(boards.value.length / 2))
  const newOffset = scrollOffset.value + direction
  if (newOffset >= -maxOffset && newOffset <= maxOffset) {
    scrollOffset.value = newOffset
  }
}

onMounted(async () => {
  try {
    const res = await api.get('/daily')
    if (res.data) {
      if (res.data.title) dailyData.value.title = res.data.title
      if (res.data.subtitle) dailyData.value.subtitle = res.data.subtitle
      if (res.data.boards) boards.value = res.data.boards
    }
  } catch {
    // Default boards if no data
    boards.value = [
      { image: null, style: 'huaban1' },
      { image: null, style: 'huaban2' },
      { image: null, style: 'huaban1' },
      { image: null, style: 'huaban2' },
      { image: null, style: 'huaban1' }
    ]
  }
})
</script>

<style scoped>
.daily-page {
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
.daily-hero {
  padding: 160px 65px 60px;
}

.daily-title {
  font-family: var(--font-cn);
  font-weight: 600;
  font-size: 42px;
  color: #544B45;
  line-height: 1.3;
  margin-bottom: 16px;
}

.daily-subtitle {
  font-family: var(--font-en);
  font-size: 20px;
  color: #93847B;
  line-height: 1.5;
  white-space: pre-line;
}

/* Boards carousel */
.boards-section {
  position: relative;
  padding: 40px 0 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.boards-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 0 80px;
  min-height: 420px;
  overflow: hidden;
}

/* Board item */
.board-item {
  flex-shrink: 0;
  width: 220px;
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
}

.board-item.board-center {
  width: 280px;
}

.board-clip {
  position: relative;
  width: 100%;
  z-index: 2;
}

.clip-img {
  width: 100%;
  height: auto;
  display: block;
}

.board-content {
  position: absolute;
  top: 8%;
  left: 10%;
  width: 80%;
  height: 78%;
  border-radius: 2px;
  overflow: hidden;
}

.board-image {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  background-size: cover;
  background-position: center;
}

/* Arrow buttons */
.arrow-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(84, 75, 69, 0.15);
  border: none;
  color: #544B45;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  backdrop-filter: blur(4px);
}

.arrow-btn:hover {
  background: rgba(84, 75, 69, 0.3);
}

.arrow-left {
  left: 40px;
}

.arrow-right {
  right: 40px;
}

@media (max-width: 768px) {
  .nav { padding: 0 24px; }
  .nav-logo { left: 24px; }
  .nav-center { gap: 24px; }
  .nav-link { font-size: 20px; }
  .nav-icons { right: 24px; }

  .daily-hero { padding: 140px 24px 40px; }
  .daily-title { font-size: 28px; }
  .daily-subtitle { font-size: 16px; }

  .boards-container {
    gap: 16px;
    padding: 0 60px;
  }

  .board-item {
    width: 160px;
  }

  .board-item.board-center {
    width: 200px;
  }

  .arrow-left { left: 16px; }
  .arrow-right { right: 16px; }
}
</style>
