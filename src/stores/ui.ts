import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

export interface ModalConfig {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
}

export const useUIStore = defineStore('ui', () => {
  // Toast State
  const toasts = ref<Toast[]>([])

  function showToast(message: string, type: ToastType = 'info', duration = 4000) {
    const id = Date.now().toString()
    const toast: Toast = { id, message, type, duration }
    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  function removeToast(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  // Modal State
  const isModalOpen = ref(false)
  const modalConfig = ref<ModalConfig | null>(null)

  function openModal(config: ModalConfig) {
    modalConfig.value = config
    isModalOpen.value = true
  }

  function closeModal() {
    isModalOpen.value = false
    // Delay clearing config to allow transition to finish
    setTimeout(() => {
      modalConfig.value = null
    }, 300)
  }

  return {
    toasts,
    showToast,
    removeToast,
    isModalOpen,
    modalConfig,
    openModal,
    closeModal,
  }
})
