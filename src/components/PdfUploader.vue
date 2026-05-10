<template>
  <div
    class="uploader"
    :class="{ dragging }"
    @dragover.prevent="dragging = true"
    @dragleave="dragging = false"
    @drop.prevent="onDrop"
    @click="fileInput.click()"
  >
    <input ref="fileInput" type="file" accept="application/pdf" hidden @change="onChange" />
    <div class="uploader-icon">📄</div>
    <p class="uploader-text">點擊或拖曳 PDF 至此</p>
    <p class="uploader-hint">支援 .pdf 格式</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['file-selected'])
const fileInput = ref(null)
const dragging = ref(false)

function onChange(e) {
  const file = e.target.files[0]
  if (file) emit('file-selected', file)
}

function onDrop(e) {
  dragging.value = false
  const file = e.dataTransfer.files[0]
  if (file && file.type === 'application/pdf') emit('file-selected', file)
}
</script>

<style scoped>
.uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 2px dashed #4a6cf7;
  border-radius: 16px;
  padding: 48px 32px;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(74, 108, 247, 0.05);
}
.uploader:hover, .uploader.dragging {
  background: rgba(74, 108, 247, 0.15);
  border-color: #7b9eff;
}
.uploader-icon { font-size: 48px; }
.uploader-text { font-size: 18px; font-weight: 600; color: #c8d6ff; }
.uploader-hint { font-size: 13px; color: #6b7db3; }
</style>
