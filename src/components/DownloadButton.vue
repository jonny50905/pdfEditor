<template>
  <button class="dl-btn" :disabled="!store.pdfBytes || exporting" @click="run">
    {{ exporting ? '匯出中...' : '⬇️ 下載 PDF' }}
  </button>
</template>

<script setup>
import { ref } from 'vue'
import { useEditorStore } from '../stores/editorStore'
import { usePdfExporter } from '../composables/usePdfExporter'

const store = useEditorStore()
const { exportPdf } = usePdfExporter()
const exporting = ref(false)

async function run() {
  exporting.value = true
  try {
    await exportPdf()
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped>
.dl-btn {
  background: #22c55e;
  color: #fff;
  font-size: 14px;
}
.dl-btn:hover:not(:disabled) {
  background: #16a34a;
}
</style>
