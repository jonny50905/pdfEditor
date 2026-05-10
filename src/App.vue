<template>
  <div class="app">
    <header class="toolbar">
      <div class="brand">📝 PDF 編輯器</div>
      <div class="actions">
        <label class="pdf-btn">
          📄 上傳 PDF
          <input type="file" accept="application/pdf" hidden @change="onPdfSelected" />
        </label>
        <ImageUploader v-if="store.pdfBytes" @images-selected="onImagesSelected" />
        <DownloadButton v-if="store.pdfBytes" />
      </div>
    </header>

    <main class="main">
      <template v-if="!store.pdfBytes">
        <div class="welcome">
          <PdfUploader @file-selected="loadPdf" />
        </div>
      </template>

      <template v-else>
        <PdfViewer :images="pendingImages" @images-added="pendingImages = []" />
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

const pendingImages = ref([])

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
  padding: 14px 24px;
  background: #16213e;
  border-bottom: 1px solid #2a3a5e;
  position: sticky;
  top: 0;
  z-index: 100;
}

.brand {
  font-size: 20px;
  font-weight: 700;
  color: #c8d6ff;
  letter-spacing: 0.5px;
}

.actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.pdf-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(74, 108, 247, 0.2);
  color: #c8d6ff;
  border: 1px solid #4a6cf7;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.pdf-btn:hover {
  background: rgba(74, 108, 247, 0.4);
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
