import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useEditorStore = defineStore('editor', () => {
  const pdfBytes = ref(null)
  const totalPages = ref(0)
  const currentPage = ref(1)
  const renderScale = ref(1.5)
  const canvasSize = ref({ width: 0, height: 0 })

  // imagesByPage[pageIndex] = [ { id, src, x, y, width, height, rotation } ]
  const imagesByPage = ref({})

  const currentPageImages = computed(() =>
    imagesByPage.value[currentPage.value] ?? []
  )

  function setPdf(bytes, pages) {
    pdfBytes.value = bytes
    totalPages.value = pages
    currentPage.value = 1
    canvasSize.value = { width: 0, height: 0 }
    imagesByPage.value = {}
  }

  function setCanvasSize(width, height) {
    canvasSize.value.width = width
    canvasSize.value.height = height
  }

  function savePageImages(pageIndex, images) {
    imagesByPage.value[pageIndex] = images.map(img => ({ ...img }))
  }

  function addImage(pageIndex, image) {
    if (!imagesByPage.value[pageIndex]) {
      imagesByPage.value[pageIndex] = []
    }
    imagesByPage.value[pageIndex].push(image)
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
    setPdf,
    setCanvasSize,
    savePageImages,
    addImage,
    goToPage,
  }
})
