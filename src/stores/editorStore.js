import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useEditorStore = defineStore('editor', () => {
  const pdfBytes = ref(null)
  const totalPages = ref(0)
  const currentPage = ref(1)
  const renderScale = ref(1.5)
  const canvasSize = ref({ width: 0, height: 0 })
  const imagesByPage = ref({})
  const historyByPage = ref({})

  const currentPageImages = computed(() =>
    imagesByPage.value[currentPage.value] ?? []
  )

  const canUndoCurrentPage = computed(() => {
    const h = historyByPage.value[currentPage.value]
    return !!(h && h.cursor > 0)
  })

  const canRedoCurrentPage = computed(() => {
    const h = historyByPage.value[currentPage.value]
    return !!(h && h.cursor < h.stack.length - 1)
  })

  function setPdf(bytes, pages) {
    pdfBytes.value = bytes
    totalPages.value = pages
    currentPage.value = 1
    canvasSize.value = { width: 0, height: 0 }
    imagesByPage.value = {}
    historyByPage.value = {}
  }

  function setCanvasSize(width, height) {
    canvasSize.value.width = width
    canvasSize.value.height = height
  }

  function savePageImages(pageIndex, images) {
    imagesByPage.value[pageIndex] = images.map(img => ({ ...img }))
  }

  function initPageHistory(pageIndex, images) {
    historyByPage.value[pageIndex] = {
      stack: [images.map(img => ({ ...img }))],
      cursor: 0,
    }
  }

  function pushHistory(pageIndex, images) {
    const snapshot = images.map(img => ({ ...img }))
    if (!historyByPage.value[pageIndex]) {
      historyByPage.value[pageIndex] = { stack: [snapshot], cursor: 0 }
      return
    }
    const h = historyByPage.value[pageIndex]
    const newStack = [...h.stack.slice(0, h.cursor + 1), snapshot]
    // 替換整個 sub-object 確保 Vue 反應性追蹤
    historyByPage.value[pageIndex] = { stack: newStack, cursor: newStack.length - 1 }
  }

  function undo(pageIndex) {
    const h = historyByPage.value[pageIndex]
    if (!h || h.cursor <= 0) return null
    const newCursor = h.cursor - 1
    historyByPage.value[pageIndex] = { stack: h.stack, cursor: newCursor }
    return h.stack[newCursor]
  }

  function redo(pageIndex) {
    const h = historyByPage.value[pageIndex]
    if (!h || h.cursor >= h.stack.length - 1) return null
    const newCursor = h.cursor + 1
    historyByPage.value[pageIndex] = { stack: h.stack, cursor: newCursor }
    return h.stack[newCursor]
  }

  function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  return {
    pdfBytes,
    totalPages,
    currentPage,
    renderScale,
    canvasSize,
    imagesByPage,
    currentPageImages,
    canUndoCurrentPage,
    canRedoCurrentPage,
    setPdf,
    setCanvasSize,
    savePageImages,
    initPageHistory,
    pushHistory,
    undo,
    redo,
    goToPage,
  }
})
