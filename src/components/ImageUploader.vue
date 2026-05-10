<template>
  <button class="img-btn" @click="fileInput.click()">
    🖼️ 上傳圖片
    <input ref="fileInput" type="file" accept="image/*" multiple hidden @change="onChange" />
  </button>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['images-selected'])
const fileInput = ref(null)

function onChange(e) {
  const files = Array.from(e.target.files)
  const readers = files.map(file =>
    new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = ev => resolve({ src: ev.target.result, name: file.name })
      reader.readAsDataURL(file)
    })
  )
  Promise.all(readers).then(results => {
    emit('images-selected', results)
    e.target.value = ''
  })
}
</script>

<style scoped>
.img-btn {
  background: #4a6cf7;
  color: #fff;
  font-size: 14px;
}
.img-btn:hover {
  background: #6080ff;
}
</style>
