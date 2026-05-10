<template>
  <div class="nav">
    <button :disabled="store.currentPage <= 1" @click="prev">◀</button>
    <span>第 {{ store.currentPage }} / {{ store.totalPages }} 頁</span>
    <button :disabled="store.currentPage >= store.totalPages" @click="next">▶</button>
  </div>
</template>

<script setup>
import { useEditorStore } from '../stores/editorStore'

const store = useEditorStore()
const emit = defineEmits(['page-change'])

function prev() {
  emit('page-change', store.currentPage - 1)
}
function next() {
  emit('page-change', store.currentPage + 1)
}
</script>

<style scoped>
.nav {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 15px;
  color: #c8d6ff;
}
.nav button {
  background: rgba(74, 108, 247, 0.2);
  color: #c8d6ff;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 16px;
}
.nav button:hover:not(:disabled) {
  background: rgba(74, 108, 247, 0.4);
}
</style>
