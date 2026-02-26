<script setup lang="ts">
import { ref, nextTick } from 'vue'
import type { AIProvider } from '@/types'

const props = defineProps({
  disabled: {
    type: Boolean,
    required: false,
  },
  placeholder: {
    type: String,
    required: false,
    default: 'Escribe un mensaje...',
  },
  isCheckingProviders: {
    type: Boolean,
    required: false,
  },
  pendingFiles: {
    type: Array as () => File[],
    required: false,
    default: () => [],
  },
})

const emit = defineEmits<{
  (e: 'send', message: string): void
  (e: 'select-provider', provider: AIProvider): void
  (e: 'upload-file', file: File): void
  (e: 'remove-file', index: number): void
}>()

const inputText = ref('')
const isDragging = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

function handleSend() {
  const trimmed = inputText.value.trim()
  if (!trimmed && props.pendingFiles.length === 0) return
  if (props.disabled) return

  emit('send', trimmed)
  inputText.value = ''
  // Reset textarea height and refocus
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      textareaRef.value.focus()
    }
  })
}

function focus() {
  textareaRef.value?.focus()
}

defineExpose({
  focus
})

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

function autoResize(event: Event) {
  const target = event.target as HTMLTextAreaElement
  target.style.height = 'auto'
  target.style.height = Math.min(target.scrollHeight, 150) + 'px'
}

function triggerFileUpload() {
  fileInputRef.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files) {
    Array.from(files).forEach(file => {
      emit('upload-file', file)
    })
    // Reset input so the same file can be selected again
    target.value = ''
  }
}

function handleDragEnter(e: DragEvent) {
  e.preventDefault()
  if (props.disabled) return
  isDragging.value = true
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  if (props.disabled) return
  isDragging.value = true
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  if (props.disabled) return

  const files = e.dataTransfer?.files
  if (files) {
    const validTypes = ['.pdf', '.png', '.jpg', '.jpeg', '.csv', '.txt']
    Array.from(files).forEach(file => {
      const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
      if (validTypes.includes(extension) || file.type.startsWith('image/')) {
        emit('upload-file', file)
      }
    })
  }
}
</script>

<template>
  <div class="input-bar">
    <!-- File Preview Area -->
    <div v-if="pendingFiles.length > 0" class="input-bar__files">
      <div v-for="(file, index) in pendingFiles" :key="index" class="file-chip">
        <div class="file-chip__icon">
          <i class="fa-solid fa-file-lines"></i>
        </div>
        <span class="file-chip__name" :title="file.name">{{ file.name }}</span>
        <button class="file-chip__remove" @click="emit('remove-file', index)">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>

    <div 
      class="input-bar__wrapper"
      :class="{ 'input-bar__wrapper--dragging': isDragging }"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <!-- Left Actions: Upload + Model Selector -->
      <div class="input-bar__left-actions">
        <button 
          class="input-bar__upload-btn" 
          :disabled="disabled"
          title="Adjuntar archivo"
          @click="triggerFileUpload"
        >
          <i class="fa-solid fa-plus"></i>
        </button>
        <input 
          type="file" 
          ref="fileInputRef" 
          class="input-bar__file-input" 
          accept=".pdf,.png,.jpg,.jpeg,.csv,.txt"
          @change="handleFileChange"
        />
      </div>

      <!-- Text Input -->
      <textarea
        ref="textareaRef"
        v-model="inputText"
        class="input-bar__textarea"
        :placeholder="placeholder"
        rows="1"
        :disabled="disabled"
        @keydown="handleKeydown"
        @input="autoResize"
      ></textarea>

      <!-- Right Actions: Send -->
      <button
        class="input-bar__send"
        :disabled="disabled || (!inputText.trim() && pendingFiles.length === 0)"
        @click="handleSend"
      >
        <i class="fa-solid fa-arrow-up"></i>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.input-bar {
  padding: $spacing-md;
  background: linear-gradient(to top, $primary-dark 60%, transparent);

  &__files {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
    margin-bottom: $spacing-sm;
    padding: 0 $spacing-sm;
  }

  &__wrapper {
    display: flex;
    align-items: flex-end;
    gap: $spacing-sm;
    padding: $spacing-xs $spacing-sm $spacing-xs $spacing-xs;
    background: $surface;
    border: 1px solid $glass-border;
    border-radius: $radius-xl;
    transition: all $transition-fast;

    &:focus-within {
      border-color: rgba($primary, 0.5);
      background: rgba($white, 0.03);
    }

    &--dragging {
      border-color: $primary;
      background: rgba($primary, 0.1);
      border-style: dashed;
      transform: scale(1.01);
    }
  }

  &__left-actions {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding-bottom: 2px; // Align vertically with textarea base
  }

  &__upload-btn {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: $radius-full;
    background: transparent;
    color: $text-secondary;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all $transition-fast;

    &:hover:not(:disabled) {
      background: rgba($white, 0.05);
      color: $white;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__file-input {
    display: none;
  }



  &__textarea {
    flex: 1;
    background: transparent;
    border: none;
    color: $white;
    font-family: $font-principal;
    font-size: 0.9375rem;
    line-height: 1.5;
    resize: none;
    outline: none;
    max-height: 150px;
    padding: 10px 0;
    margin-left: $spacing-xs;

    &::placeholder {
      color: $text-secondary;
    }

    &:disabled {
      opacity: 0.5;
    }
  }

  &__send {
    width: 36px;
    height: 36px;
    min-width: 36px;
    margin-bottom: 2px;
    border: none;
    border-radius: $radius-full;
    background: $primary;
    color: $white;
    font-size: 0.875rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform $transition-fast, opacity $transition-fast, background $transition-fast;

    &:hover:not(:disabled) {
      background: lighten($primary, 10%);
    }

    &:disabled {
      background: $surface-hover;
      color: $text-secondary;
      cursor: not-allowed;
    }
  }
}

// File Chip Styles
.file-chip {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: 6px 12px 6px 6px;
  background: rgba($white, 0.08);
  border: 1px solid $glass-border;
  border-radius: $radius-md;
  animation: slideUp 200ms ease;

  &__icon {
    width: 28px;
    height: 28px;
    border-radius: $radius-sm;
    background: rgba($primary, 0.2);
    color: $primary;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
  }

  &__name {
    color: $text-light;
    font-size: 0.8125rem;
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__remove {
    background: none;
    border: none;
    color: $text-secondary;
    font-size: 0.875rem;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: $radius-sm;
    margin-left: $spacing-xs;
    transition: all $transition-fast;

    &:hover {
      color: $alert-error;
      background: rgba($alert-error, 0.1);
    }
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
