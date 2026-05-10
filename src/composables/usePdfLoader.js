import * as pdfjsLib from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url'
import { useEditorStore } from '../stores/editorStore'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

// 模組級單例，避免 Vue Proxy 包裝 pdfjs 私有欄位
let _pdfDoc = null

export function usePdfLoader() {
  const store = useEditorStore()

  async function loadPdf(file) {
    const bytes = new Uint8Array(await file.arrayBuffer())
    _pdfDoc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise
    store.setPdf(bytes, _pdfDoc.numPages)
  }

  async function ensurePdfDoc() {
    if (_pdfDoc) return _pdfDoc
    if (!store.pdfBytes) return null
    // HMR 或頁面重整後從 bytes 重建
    _pdfDoc = await pdfjsLib.getDocument({ data: store.pdfBytes.slice(0) }).promise
    return _pdfDoc
  }

  async function renderPage(canvasEl, pageNum) {
    const doc = await ensurePdfDoc()
    if (!doc || !canvasEl) return
    const page = await doc.getPage(pageNum)
    const viewport = page.getViewport({ scale: store.renderScale })
    canvasEl.width = viewport.width
    canvasEl.height = viewport.height
    store.setCanvasSize(viewport.width, viewport.height)
    const ctx = canvasEl.getContext('2d')
    await page.render({ canvasContext: ctx, viewport }).promise
  }

  return { loadPdf, renderPage }
}
