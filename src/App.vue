<template>
  <div class="app">
    <header class="toolbar">
      <div class="brand">📝 PDF 編輯器</div>
      <div class="actions">
        <label class="action-btn pdf-upload-btn">
          📄 上傳 PDF
          <input type="file" accept="application/pdf" hidden @change="onPdfSelected" />
        </label>

        <template v-if="store.pdfBytes">
          <ImageUploader @images-selected="onImagesSelected" />

          <div class="divider" />

          <button
            class="action-btn undo-btn"
            :disabled="!store.canUndoCurrentPage"
            title="復原 (Ctrl+Z)"
            @click="viewerRef?.undo()"
          >↩ 復原</button>

          <button
            class="action-btn undo-btn"
            :disabled="!store.canRedoCurrentPage"
            title="取消復原 (Ctrl+Y)"
            @click="viewerRef?.redo()"
          >↪ 重做</button>

          <button
            class="action-btn delete-btn"
            :disabled="!hasSelection"
            title="刪除選取圖片 (Delete)"
            @click="viewerRef?.deleteSelected()"
          >🗑️ 刪除</button>

          <div class="divider" />

          <DownloadButton />
        </template>
      </div>
    </header>

    <main class="main">
      <template v-if="!store.pdfBytes">
        <div class="welcome">
          <PdfUploader @file-selected="loadPdf" />
        </div>
      </template>

      <template v-else>
        <PdfViewer
          ref="viewerRef"
          :images="pendingImages"
          @images-added="pendingImages = []"
          @selection-change="onSelectionChange"
        />
      </template>

      <div v-if="loadError" class="error">{{ loadError }}</div>
    </main>

    <footer v-if="store.pdfBytes" class="footer">
      <PageNavigator @page-change="changePage" />
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useEditorStore } from './stores/editorStore'
import { usePdfLoader } from './composables/usePdfLoader'
import PdfUploader from './components/PdfUploader.vue'
import ImageUploader from './components/ImageUploader.vue'
import PdfViewer from './components/PdfViewer.vue'
import PageNavigator from './components/PageNavigator.vue'
import DownloadButton from './components/DownloadButton.vue'

const store = useEditorStore()
const { loadPdf: loadPdfFile, error: loadError } = usePdfLoader()

const viewerRef = ref(null)
const pendingImages = ref([])
const hasSelection = ref(false)

async function onPdfSelected(e) {
  const file = e.target.files[0]
  if (file) await loadPdf(file)
  e.target.value = ''
}

async function loadPdf(file) {
  await loadPdfFile(file)
}

function onImagesSelected(images) {
  pendingImages.value = images
}

function onSelectionChange(id) {
  hasSelection.value = !!id
}

function changePage(page) {
  store.goToPage(page)
}
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: #16213e;
  border-bottom: 1px solid #2a3a5e;
  position: sticky;
  top: 0;
  z-index: 100;
  flex-wrap: wrap;
  gap: 8px;
}

.brand {
  font-size: 18px;
  font-weight: 700;
  color: #c8d6ff;
}

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.divider {
  width: 1px;
  height: 28px;
  background: #2a3a5e;
  margin: 0 4px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 7px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.pdf-upload-btn {
  background: rgba(74, 108, 247, 0.2);
  color: #c8d6ff;
  border: 1px solid #4a6cf7 !important;
  cursor: pointer;
}
.pdf-upload-btn:hover {
  background: rgba(74, 108, 247, 0.4);
}

.undo-btn {
  background: rgba(255, 255, 255, 0.08);
  color: #c8d6ff;
}
.undo-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}
.undo-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.delete-btn {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
}
.delete-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.3);
}
.delete-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.welcome {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 48px 24px;
}

.footer {
  display: flex;
  justify-content: center;
  padding: 16px;
  background: #16213e;
  border-top: 1px solid #2a3a5e;
}

.error {
  text-align: center;
  color: #ff6b6b;
  padding: 16px;
  font-size: 14px;
}
</style>
