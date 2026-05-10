import { PDFDocument, degrees } from 'pdf-lib'
import { useEditorStore } from '../stores/editorStore'

export function usePdfExporter() {
  const store = useEditorStore()

  async function exportPdf() {
    const pdfDoc = await PDFDocument.load(store.pdfBytes)
    const pages = pdfDoc.getPages()
    const scale = store.renderScale

    for (const [pageIndexStr, images] of Object.entries(store.imagesByPage)) {
      const pageIndex = parseInt(pageIndexStr) - 1
      const pdfPage = pages[pageIndex]
      if (!pdfPage || !images.length) continue

      const { height: canvasH } = store.canvasSize

      for (const img of images) {
        let embeddedImage
        const dataUrl = img.src

        if (dataUrl.startsWith('data:image/png')) {
          const base64 = dataUrl.split(',')[1]
          embeddedImage = await pdfDoc.embedPng(base64)
        } else {
          const base64 = dataUrl.split(',')[1]
          embeddedImage = await pdfDoc.embedJpg(base64)
        }

        // Convert pixel coords to PDF points
        const pdfX = img.x / scale
        const pdfW = img.width / scale
        const pdfH = img.height / scale
        // Flip Y axis: PDF origin is bottom-left, canvas is top-left
        const pdfY = (canvasH - img.y - img.height) / scale

        pdfPage.drawImage(embeddedImage, {
          x: pdfX,
          y: pdfY,
          width: pdfW,
          height: pdfH,
          rotate: degrees(-(img.rotation ?? 0)),
        })
      }
    }

    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'edited.pdf'
    a.click()
    URL.revokeObjectURL(url)
  }

  return { exportPdf }
}
