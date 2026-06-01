<template>
  <div class="detail-page">
    <!-- Navigation -->
    <nav class="nav">
      <router-link to="/" class="nav-logo">PORTFOLIO</router-link>
      <div class="nav-center">
        <router-link to="/about" class="nav-link">ABOUT ME</router-link>
        <router-link to="/works" class="nav-link nav-active">WORKS</router-link>
        <router-link to="/daily" class="nav-link">DAILY</router-link>
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
    <div class="detail-loading" v-if="loading">
      <div class="loading-spinner"></div>
    </div>

    <template v-if="project">
      <section class="detail-hero">
        <div
          class="detail-cover"
          :style="project.cover_image ? { backgroundImage: `url(${project.cover_image})` } : {}"
        >
          <div class="detail-cover-overlay"></div>
        </div>
        <div class="detail-header">
          <div class="detail-meta">
            <span v-if="project.year" class="meta-year">{{ project.year }}</span>
            <span v-if="project.category" class="meta-cat">{{ project.category }}</span>
          </div>
          <h1 class="detail-title">{{ project.title }}</h1>
          <p class="detail-subtitle" v-if="project.subtitle">{{ project.subtitle }}</p>
        </div>
      </section>

      <section class="detail-body">
        <div class="detail-description" v-if="project.description">
          <h2 class="section-label">项目简介</h2>
          <p class="desc-text">{{ project.description }}</p>
        </div>

        <div class="detail-tags" v-if="project.tags">
          <span
            class="tag"
            v-for="tag in project.tags.split(',')"
            :key="tag"
          >{{ tag.trim() }}</span>
        </div>
      </section>

      <!-- PDF Pages Display - Full width -->
      <section class="pdf-section" v-if="pdfUrl">
        <div class="pdf-pages">
          <div
            v-for="page in pdfPages"
            :key="page.num"
            class="pdf-page"
          >
            <canvas :ref="el => setCanvasRef(el, page.num)"></canvas>
          </div>
        </div>
        <div class="pdf-loading" v-if="pdfLoading">
          <div class="loading-spinner"></div>
          <span>正在加载PDF...</span>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { usePortfolioStore, type Project } from '@/stores/portfolio'

const route = useRoute()
const store = usePortfolioStore()
const project = ref<Project | null>(null)
const loading = ref(true)
const pdfUrl = ref<string | null>(null)
const pdfLoading = ref(false)
const pdfPages = ref<{ num: number }[]>([])
const canvasRefs = new Map<number, HTMLCanvasElement>()

function setCanvasRef(el: any, pageNum: number) {
  if (el) {
    canvasRefs.set(pageNum, el as HTMLCanvasElement)
  }
}

async function loadPdf(url: string) {
  pdfLoading.value = true
  try {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

    const loadingTask = pdfjsLib.getDocument(url)
    const pdf = await loadingTask.promise

    // Create page entries
    for (let i = 1; i <= pdf.numPages; i++) {
      pdfPages.value.push({ num: i })
    }

    await nextTick()

    // Render each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = canvasRefs.get(i)
      if (!canvas) continue

      canvas.width = viewport.width
      canvas.height = viewport.height

      const ctx = canvas.getContext('2d')
      if (!ctx) continue

      await page.render({
        canvasContext: ctx,
        viewport
      }).promise
    }
  } catch (e) {
    console.error('Failed to load PDF:', e)
  } finally {
    pdfLoading.value = false
  }
}

onMounted(async () => {
  const id = Number(route.params.id)
  project.value = await store.fetchProject(id)

  if (project.value?.pdf_file) {
    pdfUrl.value = project.value.pdf_file
    await loadPdf(pdfUrl.value)
  }

  loading.value = false
})
</script>

<style scoped>
.detail-page {
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

.detail-loading {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(147, 132, 123, 0.2);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.detail-hero {
  position: relative;
  height: 60vh;
  min-height: 400px;
  overflow: hidden;
}

.detail-cover {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #d4c5b0, #e8ddd0);
  background-size: cover;
  background-position: center;
}

.detail-cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 40%, var(--color-bg-warm) 100%);
}

.detail-header {
  position: absolute;
  bottom: 60px;
  left: var(--content-padding);
  z-index: 2;
}

.detail-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.meta-year,
.meta-cat {
  font-size: 14px;
  color: var(--color-secondary);
  background: rgba(251, 247, 246, 0.8);
  padding: 4px 12px;
  border-radius: 4px;
}

.detail-title {
  font-family: var(--font-cn);
  font-weight: 500;
  font-size: var(--text-3xl);
  color: var(--color-primary);
  margin-bottom: 8px;
}

.detail-subtitle {
  font-size: var(--text-lg);
  color: var(--color-secondary);
}

.detail-body {
  max-width: 900px;
  margin: 0 auto;
  padding: 60px var(--content-padding) 60px;
}

.section-label {
  font-family: var(--font-cn);
  font-weight: 500;
  font-size: var(--text-lg);
  color: var(--color-primary);
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--color-secondary);
}

.detail-description {
  margin-bottom: 40px;
}

.desc-text {
  font-size: 18px;
  line-height: 1.8;
  color: var(--color-text-dark);
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 48px;
}

.tag {
  padding: 6px 16px;
  background: rgba(147, 132, 123, 0.1);
  border-radius: 20px;
  font-size: 14px;
  color: var(--color-secondary);
}

/* PDF Section - Full width, no gaps */
.pdf-section {
  width: 100%;
  padding: 0;
}

.pdf-pages {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.pdf-page {
  position: relative;
  width: 100%;
  background: white;
  line-height: 0;
}

.pdf-page canvas {
  width: 100%;
  height: auto;
  display: block;
}

.pdf-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px;
  color: var(--color-secondary);
}

@media (max-width: 768px) {
  .detail-hero {
    height: 40vh;
    min-height: 280px;
  }

  .detail-header {
    left: 24px;
    bottom: 40px;
  }

  .detail-title {
    font-size: 36px;
  }

  .detail-body {
    padding: 40px 24px 60px;
  }
}
</style>
