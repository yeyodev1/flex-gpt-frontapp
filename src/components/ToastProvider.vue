<script setup lang="ts">
import { useUIStore } from '@/stores/ui'
import ToastItem from './ToastItem.vue'

const uiStore = useUIStore()
</script>

<template>
  <div class="toast-container">
    <TransitionGroup name="toast-list">
      <ToastItem
        v-for="toast in uiStore.toasts"
        :key="toast.id"
        :toast="toast"
        @close="uiStore.removeToast(toast.id)"
      />
    </TransitionGroup>
  </div>
</template>

<style lang="scss" scoped>
.toast-container {
  position: fixed;
  top: $spacing-lg;
  right: $spacing-lg;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  pointer-events: none;
  max-width: 400px;
  width: calc(100% - #{$spacing-2xl});
}

.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-list-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}

.toast-list-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}

.toast-list-move {
  transition: transform 0.4s ease;
}
</style>
