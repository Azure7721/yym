<template>
  <div class="daily-edit">
    <div class="page-header">
      <h1 class="page-title">Daily 页面管理</h1>
    </div>

    <!-- Title Section -->
    <div class="form-section">
      <h2 class="section-title">页面标题</h2>
      <div class="form-group">
        <label>中文标题</label>
        <input v-model="form.title" type="text" placeholder="输入中文标题" />
      </div>
      <div class="form-group">
        <label>英文副标题</label>
        <textarea v-model="form.subtitle" rows="3" placeholder="输入英文副标题"></textarea>
      </div>
    </div>

    <!-- Boards Section -->
    <div class="form-section">
      <h2 class="section-title">画板管理</h2>
      <p class="section-desc">拖拽或点击箭头调整画板顺序，每个画板可以选择空画板样式并上传图片。</p>

      <div class="boards-list">
        <div
          v-for="(board, index) in form.boards"
          :key="index"
          class="board-card"
        >
          <div class="board-card-header">
            <span class="board-number">画板 {{ index + 1 }}</span>
            <div class="board-actions">
              <button class="btn-move" @click="moveBoard(index, -1)" :disabled="index === 0" title="上移">↑</button>
              <button class="btn-move" @click="moveBoard(index, 1)" :disabled="index === form.boards.length - 1" title="下移">↓</button>
              <button class="btn-remove" @click="removeBoard(index)" title="删除">×</button>
            </div>
          </div>

          <div class="board-card-body">
            <!-- Board style selection -->
            <div class="board-style-select">
              <label>画板样式</label>
              <div class="style-options">
                <div
                  class="style-option"
                  :class="{ selected: board.style === 'huaban1' }"
                  @click="board.style = 'huaban1'"
                >
                  <img :src="clipPaths.huaban1" alt="画板样式1" />
                  <span>样式1 (单夹)</span>
                </div>
                <div
                  class="style-option"
                  :class="{ selected: board.style === 'huaban2' }"
                  @click="board.style = 'huaban2'"
                >
                  <img :src="clipPaths.huaban2" alt="画板样式2" />
                  <span>样式2 (双夹)</span>
                </div>
              </div>
            </div>

            <!-- Board image upload -->
            <div class="board-image-upload">
              <label>画板图片</label>
              <div class="upload-area" @click="triggerBoardInput(index)">
                <div v-if="board.image" class="upload-preview">
                  <img :src="board.image" alt="画板图片" />
                  <button type="button" class="remove-btn" @click.stop="removeBoardImage(index)">×</button>
                </div>
                <div v-else class="upload-placeholder">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <rect x="4" y="8" width="32" height="24" rx="3" stroke="currentColor" stroke-width="2" stroke-dasharray="5 3"/>
                    <circle cx="14" cy="16" r="3" stroke="currentColor" stroke-width="2"/>
                    <path d="M4 28l8-8 6 6 6-10 12 12" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <span>点击上传图片</span>
                </div>
              </div>
              <input
                :ref="el => setBoardInputRef(el as HTMLInputElement, index)"
                type="file"
                accept="image/*"
                @change="(e) => handleBoardImageChange(e, index)"
                hidden
              />
            </div>
          </div>
        </div>
      </div>

      <button class="btn-add-board" @click="addBoard">+ 添加画板</button>
    </div>

    <!-- Save -->
    <div class="form-actions">
      <button class="btn-primary" @click="saveDaily" :disabled="saving">
        {{ saving ? '保存中...' : '保存 Daily 页面' }}
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

const saving = ref(false)
const showToast = ref(false)

const clipPaths = {
  huaban1: '/images/figma/huaban1.jpg',
  huaban2: '/images/figma/huaban2.jpg'
}

const form = reactive({
  title: '跨界技能与设计思维的延展',
  subtitle: 'Extensions of cross-disciplinary\nskills and design thinking',
  boards: [] as { image: string | null; style: 'huaban1' | 'huaban2' }[]
})

const boardInputRefs = new Map<number, HTMLInputElement>()

function setBoardInputRef(el: HTMLInputElement | null, index: number) {
  if (el) boardInputRefs.set(index, el)
}

function triggerBoardInput(index: number) {
  boardInputRefs.get(index)?.click()
}

async function handleBoardImageChange(e: Event, index: number) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('image', file)
  try {
    const res = await api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    form.boards[index].image = res.data.path
  } catch {
    alert('图片上传失败')
  }
}

function removeBoardImage(index: number) {
  form.boards[index].image = null
}

function addBoard() {
  form.boards.push({ image: null, style: 'huaban1' })
}

function removeBoard(index: number) {
  form.boards.splice(index, 1)
}

function moveBoard(index: number, direction: number) {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= form.boards.length) return
  const temp = form.boards[index]
  form.boards[index] = form.boards[newIndex]
  form.boards[newIndex] = temp
}

async function saveDaily() {
  saving.value = true
  try {
    await api.put('/daily', {
      title: form.title,
      subtitle: form.subtitle,
      boards: form.boards
    })
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 2000)
  } catch {
    alert('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const res = await api.get('/daily')
    if (res.data) {
      if (res.data.title) form.title = res.data.title
      if (res.data.subtitle) form.subtitle = res.data.subtitle
      if (res.data.boards) form.boards = res.data.boards
    }
  } catch {}
})
</script>

<style scoped>
.daily-edit {
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

.section-desc {
  font-size: 14px;
  color: var(--color-secondary);
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
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

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--color-primary);
}

/* Boards list */
.boards-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.board-card {
  border: 1px solid rgba(147, 132, 123, 0.15);
  border-radius: 8px;
  overflow: hidden;
}

.board-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(147, 132, 123, 0.05);
}

.board-number {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
}

.board-actions {
  display: flex;
  gap: 6px;
}

.btn-move,
.btn-remove {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 14px;
  transition: all var(--transition-fast);
}

.btn-move {
  background: rgba(147, 132, 123, 0.1);
  color: var(--color-secondary);
}

.btn-move:hover:not(:disabled) {
  background: rgba(147, 132, 123, 0.2);
}

.btn-move:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-remove {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.btn-remove:hover {
  background: rgba(231, 76, 60, 0.2);
}

.board-card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.board-style-select label,
.board-image-upload > label {
  display: block;
  font-size: 13px;
  color: var(--color-secondary);
  margin-bottom: 8px;
}

.style-options {
  display: flex;
  gap: 12px;
}

.style-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.style-option:hover {
  border-color: rgba(147, 132, 123, 0.2);
}

.style-option.selected {
  border-color: var(--color-primary);
  background: rgba(147, 132, 123, 0.05);
}

.style-option img {
  width: 80px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.style-option span {
  font-size: 12px;
  color: var(--color-secondary);
}

.upload-area {
  border: 2px dashed rgba(147, 132, 123, 0.2);
  border-radius: 6px;
  padding: 20px;
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
  gap: 8px;
  color: var(--color-secondary);
}

.upload-placeholder span {
  font-size: 13px;
}

.upload-preview {
  position: relative;
  display: inline-block;
}

.upload-preview img {
  max-height: 120px;
  border-radius: 4px;
}

.remove-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 22px;
  height: 22px;
  background: #e74c3c;
  color: white;
  border-radius: 50%;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-add-board {
  width: 100%;
  padding: 12px;
  border: 2px dashed rgba(147, 132, 123, 0.2);
  border-radius: 8px;
  color: var(--color-secondary);
  font-size: 14px;
  text-align: center;
  transition: all var(--transition-fast);
}

.btn-add-board:hover {
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

.btn-primary:hover {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

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
</style>
