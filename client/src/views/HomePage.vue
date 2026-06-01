<template>
  <div class="home-page">
    <!-- Background image with parallax - Figma: 个人作品集首页 -->
    <div
      class="hero-bg"
      ref="bgRef"
      :style="{ transform: `translate(${bgX}px, ${bgY}px)` }"
    >
      <img src="/images/home-bg-1.png" alt="" class="hero-bg-img" />
    </div>

    <!-- Navigation - Figma positions -->
    <nav class="nav">
      <span class="nav-logo">PORTFOLIO</span>
      <div class="nav-center">
        <router-link to="/about" class="nav-link">ABOUT ME</router-link>
        <router-link to="/works" class="nav-link">WORKS</router-link>
        <router-link to="/daily" class="nav-link">DAILY</router-link>
      </div>
      <div class="nav-icons">
        <!-- Search icon from Figma -->
        <svg class="nav-icon" width="31" height="31" viewBox="0 0 31 31" fill="none">
          <circle cx="13" cy="13" r="9" stroke="currentColor" stroke-width="2"/>
          <line x1="20" y1="20" x2="28" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <!-- Menu icon from Figma -->
        <svg class="nav-icon" width="31" height="31" viewBox="0 0 31 31" fill="none">
          <line x1="4" y1="8" x2="27" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="4" y1="15.5" x2="27" y2="15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="4" y1="23" x2="27" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
    </nav>

    <!-- Center name - YUMEI YI, Figma: x:818, y:507 -->
    <div class="hero-center">
      <h1 class="hero-name" :class="{ visible: nameVisible }">YUMEI YI</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const bgRef = ref<HTMLElement>()
const bgX = ref(0)
const bgY = ref(0)
const nameVisible = ref(false)

let targetX = 0
let targetY = 0
let animationId: number

function handleMouseMove(e: MouseEvent) {
  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight / 2
  // Move background opposite to mouse, max ~30px
  targetX = ((e.clientX - centerX) / centerX) * -30
  targetY = ((e.clientY - centerY) / centerY) * -30
}

function animate() {
  bgX.value += (targetX - bgX.value) * 0.05
  bgY.value += (targetY - bgY.value) * 0.05
  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  animate()
  setTimeout(() => { nameVisible.value = true }, 300)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  cancelAnimationFrame(animationId)
})
</script>

<style scoped>
.home-page {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: #D9D9D9;
}

/* Background image - covers full viewport, extends slightly for parallax */
.hero-bg {
  position: absolute;
  top: -30px;
  left: -60px;
  width: calc(100% + 120px);
  height: calc(100% + 60px);
  will-change: transform;
}

.hero-bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Navigation - exact Figma positions */
.nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  display: flex;
  align-items: center;
  z-index: 10;
  padding: 0 65px;
}

.nav-logo {
  position: absolute;
  left: 65px;
  top: 30px;
  font-family: var(--font-cn);
  font-weight: 500;
  font-size: 32px;
  color: #544B45;
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
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #544B45;
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
  align-items: center;
}

.nav-icon {
  color: #544B45;
  cursor: pointer;
  transition: opacity 0.2s;
}

.nav-icon:hover {
  opacity: 0.7;
}

/* Center content - Figma: x:818, y:507 in 1920x1080 frame */
.hero-center {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  pointer-events: none;
}

.hero-name {
  font-family: var(--font-cn);
  font-weight: 500;
  font-size: 64px;
  color: #544B45;
  letter-spacing: 8px;
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.hero-name.visible {
  opacity: 1;
}

@media (max-width: 768px) {
  .nav-center {
    display: none;
  }

  .nav {
    padding: 0 24px;
  }

  .nav-logo {
    left: 24px;
  }

  .nav-icons {
    right: 24px;
  }

  .hero-name {
    font-size: 40px;
    letter-spacing: 4px;
  }
}
</style>
