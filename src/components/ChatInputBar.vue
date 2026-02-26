<script setup lang="ts">
import { ref, nextTick } from 'vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    required: false,
  },
  placeholder: {
    type: String,
    required: false,
    default: 'Send a message...',
  },
})

const emit = defineEmits<{
  (e: 'send', message: string): void
}>()

const inputText = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

function handleSend() {
  const trimmed = inputText.value.trim()
  if (!trimmed || props.disabled) return
  emit('send', trimmed)
  inputText.value = ''
  // Reset textarea height
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
  })
}

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
</script>

<template>
  <div class="input-bar">
    <div class="input-bar__wrapper">
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
      <button
        class="input-bar__send"
        :disabled="disabled || !inputText.trim()"
        @click="handleSend"
      >
        <i class="fa-solid fa-paper-plane"></i>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.input-bar {
  padding: $spacing-sm $spacing-md $spacing-md;
  background: linear-gradient(to top, $primary-dark 60%, transparent);

  &__wrapper {
    display: flex;
    align-items: flex-end;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-sm $spacing-sm $spacing-md;
    background: $surface;
    border: 1px solid $glass-border;
    border-radius: $radius-xl;
    transition: border-color $transition-fast;

    &:focus-within {
      border-color: rgba($primary, 0.5);
    }
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
    padding: $spacing-sm 0;

    &::placeholder {
      color: $text-secondary;
    }

    &:disabled {
      opacity: 0.5;
    }
  }

  &__send {
    width: 40px;
    height: 40px;
    min-width: 40px;
    border: none;
    border-radius: $radius-md;
    background: linear-gradient(135deg, $primary, $secondary);
    color: $white;
    font-size: 0.875rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform $transition-fast, opacity $transition-fast;

    &:hover:not(:disabled) {
      transform: scale(1.05);
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }
}
</style>
