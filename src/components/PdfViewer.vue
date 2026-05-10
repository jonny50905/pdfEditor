<template>
  <div class="viewer-wrapper">
    <div v-if="renderError" class="render-error">渲染錯誤：{{ renderError }}</div>
    <div class="canvas-container" :style="containerStyle">
      <canvas ref="pdfCanvas" class="pdf-canvas" />

      <v-stage
        v-if="store.canvasSize.width > 0"
        :config="stageConfig"
        class="konva-stage"
        @mousedown="onStageMouseDown"
      >
        <v-layer ref="layerRef">
          <v-image
            v-for="img in konvaImages"
            :key="img.id"
            :config="img.config"
            @mousedown="onImageMouseDown(img.id)"
            @dragend="onDragEnd(img.id, $event)"
            @transformend="onTransformEnd(img.id, $event)"
          />
          <v-transformer ref="transformerRef" :config="transformerConfig" />
        </v-layer>
      </v-stage>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useEditorStore } from '../stores/editorStore'
import { usePdfLoader } from '../composables/usePdfLoader'

const props = defineProps({ images: { type: Array, default: () => [] } })
const emit = defineEmits(['images-added'])

const store = useEditorStore()
const { renderPage } = usePdfLoader()

const pdfCanvas = ref(null)
const layerRef = ref(null)
const transformerRef = ref(null)
const selectedId = ref(null)
const konvaImages = ref([])

const imageElCache = new Map()

const renderError = ref(null)

const stageConfig = computed(() => ({
  width: store.canvasSize.width,
  height: store.canvasSize.height,
}))

const containerStyle = computed(() => {
  if (!store.canvasSize.width) return {}
  return {
    width: `${store.canvasSize.width}px`,
    height: `${store.canvasSize.height}px`,
  }
})

const transformerConfig = {
  keepRatio: false,
  rotateEnabled: true,
  borderStroke: '#4a6cf7',
  borderStrokeWidth: 2,
  anchorFill: '#4a6cf7',
  anchorStroke: '#fff',
  anchorSize: 10,
}

// 元件掛載後立刻渲染當前頁（此時 pdfDoc 已存在）
onMounted(async () => {
  await doRenderPage(store.currentPage)
})

// 切頁時重新渲染
watch(() => store.currentPage, async (page) => {
  selectedId.value = null
  konvaImages.value = []
  await doRenderPage(page)
})

// 父層傳入新圖片
watch(() => props.images, async (newImgs) => {
  if (!newImgs.length) return
  for (const { src } of newImgs) {
    await addImageToKonva(src)
  }
  emit('images-added')
}, { deep: true })

async function doRenderPage(page) {
  renderError.value = null
  if (!store.pdfBytes) { renderError.value = 'PDF 尚未載入'; return }
  if (!pdfCanvas.value) { renderError.value = 'canvas not ready'; return }
  try {
    await renderPage(pdfCanvas.value, page)
  } catch (e) {
    renderError.value = e.message
    return
  }
  await nextTick()
  loadPageImages()
}

function loadPageImages() {
  konvaImages.value = []
  selectedId.value = null
  const saved = store.imagesByPage[store.currentPage] ?? []
  saved.forEach(img => {
    loadImageEl(img.src, (el) => {
      konvaImages.value.push(makeKonvaEntry(img.id, el, img.x, img.y, img.width, img.height, img.rotation ?? 0))
    })
  })
}

function addImageToKonva(src) {
  return new Promise(resolve => {
    loadImageEl(src, (el) => {
      const id = `img-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const maxW = Math.min(200, store.canvasSize.width * 0.4 || 200)
      const aspect = el.naturalHeight / el.naturalWidth
      const w = maxW
      const h = w * aspect
      const x = (store.canvasSize.width - w) / 2
      const y = (store.canvasSize.height - h) / 2
      konvaImages.value.push(makeKonvaEntry(id, el, x, y, w, h, 0))
      saveCurrentImages()
      nextTick(() => attachTransformer(id))
      resolve()
    })
  })
}

function makeKonvaEntry(id, el, x, y, width, height, rotation) {
  return {
    id,
    config: {
      image: el,
      x, y, width, height, rotation,
      draggable: true,
      name: id,
    }
  }
}

function loadImageEl(src, callback) {
  if (imageElCache.has(src)) {
    callback(imageElCache.get(src))
    return
  }
  const el = new window.Image()
  el.onload = () => {
    imageElCache.set(src, el)
    callback(el)
  }
  el.src = src
}

function onImageMouseDown(id) {
  selectedId.value = id
  nextTick(() => attachTransformer(id))
}

function onStageMouseDown(e) {
  if (e.target === e.target.getStage()) {
    selectedId.value = null
    const tr = transformerRef.value?.getNode()
    if (tr) {
      tr.nodes([])
      tr.getLayer()?.batchDraw()
    }
  }
}

function attachTransformer(id) {
  const tr = transformerRef.value?.getNode()
  if (!tr) return
  const layer = layerRef.value?.getNode()
  if (!layer) return
  const node = layer.findOne(`#${id}`) || layer.findOne(`.${id}`)
  if (node) {
    tr.nodes([node])
    tr.getLayer()?.batchDraw()
  }
}

function onDragEnd(id, e) {
  const node = e.target
  updateConfig(id, { x: node.x(), y: node.y() })
  saveCurrentImages()
}

function onTransformEnd(id, e) {
  const node = e.target
  const scaleX = node.scaleX()
  const scaleY = node.scaleY()
  updateConfig(id, {
    x: node.x(),
    y: node.y(),
    width: Math.max(10, node.width() * scaleX),
    height: Math.max(10, node.height() * scaleY),
    rotation: node.rotation(),
  })
  node.scaleX(1)
  node.scaleY(1)
  layerRef.value?.getNode()?.batchDraw()
  saveCurrentImages()
}

function updateConfig(id, patch) {
  const img = konvaImages.value.find(i => i.id === id)
  if (img) Object.assign(img.config, patch)
}

function saveCurrentImages() {
  store.savePageImages(store.currentPage, konvaImages.value.map(img => ({
    id: img.id,
    src: img.config.image.src,
    x: img.config.x,
    y: img.config.y,
    width: img.config.width,
    height: img.config.height,
    rotation: img.config.rotation ?? 0,
  })))
}

onUnmounted(() => imageElCache.clear())
</script>

<style scoped>
.viewer-wrapper {
  display: flex;
  justify-content: center;
  padding: 24px;
  overflow: auto;
  flex: 1;
  background: #0f0f1e;
}
.canvas-container {
  position: relative;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  border-radius: 4px;
  flex-shrink: 0;
}
.render-error {
  color: #ff6b6b;
  padding: 12px;
  font-size: 13px;
  text-align: center;
}
.pdf-canvas {
  display: block;
}
.konva-stage {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
