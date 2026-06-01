<template>
  <nav class="navbar" :class="{ scrolled: isScrolled, hidden: isHidden }">
    <div class="nav-inner">
      <router-link to="/" class="nav-logo">PORTFOLIO</router-link>
      <div class="nav-center">
        <router-link
          to="/about"
          class="nav-link"
          :class="{ active: currentRoute === 'about' }"
        >
          ABOUT ME
        </router-link>
        <router-link
          to="/works"
          class="nav-link"
          :class="{ active: currentRoute === 'works' }"
        >
          WORKS
        </router-link>
        <span class="nav-link disabled">DAILY</span>
      </div>
      <div class="nav-right">
        <button class="nav-icon" @click="toggleSearch" aria-label="Search">
          <svg width="31" height="31" viewBox="0 0 31 31" fill="none">
            <circle cx="13" cy="13" r="9" stroke="currentColor" stroke-width="2"/>
            <line x1="20" y1="20" x2="28" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <button class="nav-icon" @click="toggleMenu" aria-label="Menu">
          <svg width="31" height="31" viewBox="0 0 31 31" fill="none">
            <line x1="4" y1="8" x2="27" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="4" y1="15.5" x2="27" y2="15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="4" y1="23" x2="27" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  </nav>

  <!-- Mobile Menu Overlay -->
  <transition name="fade">
    <div v-if="menuOpen" class="menu-overlay" @click.self="toggleMenu">
      <div class="menu-content animate-slide-right">
        <router-link to="/" class="menu-link" @click="toggleMenu">HOME</router-link>
        <router-link to="/about" class="menu-link" @click="toggleMenu">ABOUT ME</router-link>
        <router-link to="/works" class="menu-link" @click="toggleMenu">WORKS</router-link>
        <span class="menu-link disabled">DAILY</span>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isScrolled = ref(false)
const isHidden = ref(false)
const menuOpen = ref(false)
let lastScrollY = 0

const currentRoute = computed(() => {
  const name = route.name as string
  if (name?.startsWith('about')) return 'about'
  if (name?.startsWith('work')) return 'works'
  return ''
})

function handleScroll() {
  const currentY = window.scrollY
  isScrolled.value = currentY > 50
  isHidden.value = currentY > lastScrollY && currentY > 200
  lastScrollY = currentY
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
  document.body.style.overflow = menuOpen.value ? 'hidden' : ''
}

function toggleSearch() {
  // Search functionality placeholder
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 0 var(--content-padding);
  height: var(--nav-height);
  display: flex;
  align-items: center;
  transition: all var(--transition-normal);
  background: transparent;
}

.navbar.scrolled {
  background: rgba(251, 247, 246, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-sm);
}

.navbar.hidden {
  transform: translateY(-100%);
}

.nav-inner {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  font-family: var(--font-cn);
  font-weight: 500;
  font-size: var(--text-xl);
  color: var(--color-primary);
  letter-spacing: 2px;
  flex-shrink: 0;
}

.nav-center {
  display: flex;
  gap: 48px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.nav-link {
  font-family: var(--font-cn);
  font-weight: 500;
  font-size: var(--text-xl);
  color: var(--color-secondary);
  transition: color var(--transition-fast);
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-primary);
  transition: width var(--transition-normal);
}

.nav-link:hover,
.nav-link.active {
  color: var(--color-primary);
}

.nav-link:hover::after,
.nav-link.active::after {
  width: 100%;
}

.nav-link.disabled {
  opacity: 0.5;
  cursor: default;
}

.nav-link.disabled::after {
  display: none;
}

.nav-right {
  display: flex;
  gap: 16px;
  align-items: center;
}

.nav-icon {
  width: 31px;
  height: 31px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  transition: opacity var(--transition-fast);
}

.nav-icon:hover {
  opacity: 0.7;
}

/* Menu Overlay */
.menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(84, 75, 69, 0.3);
  z-index: 2000;
  display: flex;
  justify-content: flex-end;
}

.menu-content {
  width: 320px;
  height: 100%;
  background: var(--color-bg-warm);
  padding: 100px 48px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.menu-link {
  font-family: var(--font-cn);
  font-weight: 500;
  font-size: var(--text-xl);
  color: var(--color-primary);
  transition: opacity var(--transition-fast);
}

.menu-link:hover {
  opacity: 0.7;
}

.menu-link.disabled {
  opacity: 0.4;
  cursor: default;
}

@media (max-width: 768px) {
  .nav-center {
    display: none;
  }

  .navbar {
    padding: 0 24px;
  }
}
</style>
