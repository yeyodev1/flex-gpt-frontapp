<script setup lang="ts">
import type { Toast } from '@/stores/ui'
import { computed } from 'vue'

const props = defineProps<{
  toast: Toast
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const iconClass = computed(() => {
  switch (props.toast.type) {
    case 'success': return 'fa-solid fa-circle-check'
    case 'error': return 'fa-solid fa-circle-exclamation'
    case 'warning': return 'fa-solid fa-triangle-exclamation'
    default: return 'fa-solid fa-circle-info'
  }
})

const typeClass = computed(() => `toast--${props.toast.type}`)
</script>

<template>
  <div class="toast" :class="typeClass">
    <div class="toast__icon">
      <i :class="iconClass"></i>
    </div>
    <div class="toast__content">
      <p>{{ toast.message }}</p>
    </div>
    <button class="toast__close" @click="emit('close')">
      <i class="fa-solid fa-xmark"></i>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.toast {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: rgba($primary-dark, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid $glass-border;
  border-radius: $radius-lg;
  color: $white;
  box-shadow: $shadow-lg;
  pointer-events: auto;
  min-width: 280px;

  &__icon {
    font-size: 1.125rem;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;

    p {
      margin: 0;
      font-size: 0.875rem;
      line-height: 1.4;
      font-weight: 500;
    }
  }

  &__close {
    background: none;
    border: none;
    color: rgba($white, 0.4);
    cursor: pointer;
    font-size: 1rem;
    padding: $spacing-xs;
    transition: color $transition-fast;

    &:hover {
      color: $white;
    }
  }

  // Types
  &--success {
    border-left: 4px solid $alert-success;

    .toast__icon {
      color: $alert-success;
    }
  }

  &--error {
    border-left: 4px solid $alert-error;

    .toast__icon {
      color: $alert-error;
    }
  }

  &--warning {
    border-left: 4px solid $alert-warning;

    .toast__icon {
      color: $alert-warning;
    }
  }

  &--info {
    border-left: 4px solid $primary;

    .toast__icon {
      color: $primary;
    }
  }
}
</style>
