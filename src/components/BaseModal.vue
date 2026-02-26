<script setup lang="ts">
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()

function handleConfirm() {
  if (uiStore.modalConfig?.onConfirm) {
    uiStore.modalConfig.onConfirm()
  }
  uiStore.closeModal()
}

function handleCancel() {
  if (uiStore.modalConfig?.onCancel) {
    uiStore.modalConfig.onCancel()
  }
  uiStore.closeModal()
}
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="uiStore.isModalOpen" class="modal-overlay" @click.self="handleCancel">
      <div class="modal-container">
        <!-- Content -->
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ uiStore.modalConfig?.title }}</h3>
          </div>
          <div class="modal-body">
            <p>{{ uiStore.modalConfig?.message }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="handleCancel">
              {{ uiStore.modalConfig?.cancelText || 'Cancel' }}
            </button>
            <button class="btn-confirm" @click="handleConfirm">
              {{ uiStore.modalConfig?.confirmText || 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba($primary-dark, 0.7);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-md;
}

.modal-container {
  width: 100%;
  max-width: 400px;
  background: $surface;
  border: 1px solid $glass-border;
  border-radius: $radius-xl;
  box-shadow: $shadow-lg;
  overflow: hidden;
  animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-content {
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: $spacing-lg $spacing-lg $spacing-sm;

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: $white;
    margin: 0;
  }
}

.modal-body {
  padding: $spacing-sm $spacing-lg $spacing-lg;

  p {
    font-size: 0.9375rem;
    line-height: 1.6;
    color: rgba($white, 0.8);
    margin: 0;
  }
}

.modal-footer {
  padding: $spacing-md $spacing-lg;
  background: rgba($white, 0.02);
  display: flex;
  justify-content: flex-end;
  gap: $spacing-md;
}

button {
  padding: $spacing-sm $spacing-lg;
  border-radius: $radius-md;
  font-family: $font-principal;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all $transition-fast;
}

.btn-cancel {
  background: transparent;
  border: 1px solid $glass-border;
  color: $text-secondary;

  &:hover {
    background: rgba($white, 0.05);
    color: $white;
  }
}

.btn-confirm {
  background: $alert-error;
  border: none;
  color: $white;

  &:hover {
    background: lighten($alert-error, 5%);
    box-shadow: 0 0 15px rgba($alert-error, 0.3);
    transform: translateY(-1px);
  }
}

// Transitions
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes modalIn {
  from {
    transform: scale(0.95) translateY(10px);
    opacity: 0;
  }

  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
</style>
