<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import ProviderLogo from '@/components/ProviderLogo.vue'
import type { AIProvider, ProviderStatus } from '@/types'

const PROVIDERS: { id: AIProvider; label: string; description: string; colorVar: string }[] = [
  { id: 'claude', label: 'Claude', description: 'AI Assistant', colorVar: '--claude' },
  { id: 'gemini', label: 'Gemini', description: 'AI Assistant', colorVar: '--gemini' },
  { id: 'deepseek', label: 'DeepSeek', description: 'AI Assistant', colorVar: '--deepseek' },
]

const props = defineProps({
  selected: {
    type: String as () => AIProvider,
    required: true,
  },
  disabled: {
    type: Boolean,
    required: false,
  },
  providerStatuses: {
    type: Object as () => Record<AIProvider, ProviderStatus> | null,
    required: false,
    default: null,
  },
  isChecking: {
    type: Boolean,
    required: false,
  },
  hasFiles: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emit = defineEmits<{
  (e: 'select', provider: AIProvider): void
}>()

const isOpen = ref(false)
const selectorRef = ref<HTMLElement | null>(null)

function handleClickOutside(event: MouseEvent) {
  if (selectorRef.value && !selectorRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

const dropdownTitle = computed(() => {
  if (props.hasFiles) return 'Provider locked while files are attached'
  if (props.disabled) return 'Model selection disabled'
  return 'Select AI Model'
})

const selectedProviderObj = computed(() => PROVIDERS.find(p => p.id === props.selected))

function isProviderDisabled(providerId: AIProvider) {
  if (props.disabled || props.hasFiles) return true
  // If we don't have statuses yet, or the specific provider is missing, default to available
  if (!props.providerStatuses || !props.providerStatuses[providerId]) return false
  return props.providerStatuses[providerId].available === false
}

function getTooltip(providerId: AIProvider): string {
  if (props.hasFiles) return 'Provider locked while files are attached'
  if (!props.providerStatuses) return ''
  const status = props.providerStatuses[providerId]
  if (!status || status.available) return ''
  return status.error || 'Unavailable'
}

function handleSelect(providerId: AIProvider) {
  if (isProviderDisabled(providerId)) return
  emit('select', providerId)
  isOpen.value = false
}
</script>

<template>
  <div class="model-dropdown" ref="selectorRef">
    <!-- Trigger Button -->
    <button 
      class="model-dropdown__trigger" 
      :class="{
        'model-dropdown__trigger--open': isOpen,
        'model-dropdown__trigger--disabled': disabled,
        'model-dropdown__trigger--locked': hasFiles
      }"
      @click="isOpen = !isOpen" 
      :disabled="disabled || hasFiles"
      :title="dropdownTitle"
      type="button"
    >
      <div class="model-dropdown__trigger-content">
        <ProviderLogo :provider="selected" class="model-dropdown__logo" />
        <span class="model-dropdown__name">{{ selectedProviderObj?.label || 'Select Model' }}</span>
      </div>
      <i class="fa-solid fa-chevron-up model-dropdown__chevron"></i>
    </button>

    <!-- Dropdown Menu -->
    <div v-show="isOpen" class="model-dropdown__menu">
      <div class="model-dropdown__header">
        <span>Available Models</span>
        <i v-if="isChecking && !providerStatuses" class="fa-solid fa-spinner fa-spin model-dropdown__spinner"></i>
      </div>

      <button
        v-for="provider in PROVIDERS"
        :key="provider.id"
        class="model-dropdown__item"
        :class="{
          'model-dropdown__item--active': selected === provider.id,
          'model-dropdown__item--unavailable': isProviderDisabled(provider.id) && !disabled,
        }"
        :style="selected === provider.id ? { '--active-color': `var(${provider.colorVar})` } : {}"
        :disabled="isProviderDisabled(provider.id)"
        :title="isProviderDisabled(provider.id) ? getTooltip(provider.id) : provider.description"
        @click="handleSelect(provider.id)"
        type="button"
      >
        <div class="model-dropdown__item-logo">
          <ProviderLogo :provider="provider.id" />
        </div>
        
        <div class="model-dropdown__item-text">
          <span class="model-dropdown__item-name">{{ provider.label }}</span>
          <span class="model-dropdown__item-desc">{{ provider.description }}</span>
        </div>

        <!-- Unavailable badge / Checkmark -->
        <div class="model-dropdown__item-status">
          <span v-if="isProviderDisabled(provider.id) && !disabled" class="badge badge--error">
            <i class="fa-solid fa-ban"></i>
          </span>
          <span v-else-if="selected === provider.id" class="badge badge--success">
            <i class="fa-solid fa-check"></i>
          </span>
        </div>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.model-dropdown {
  position: relative;
  display: inline-block;

  &__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-sm;
    padding: 6px 12px 6px 8px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: $radius-xl;
    color: $text-light;
    cursor: pointer;
    transition: all $transition-fast;
    height: 36px;

    &:hover:not(:disabled) {
      background: rgba($white, 0.05);
      border-color: $glass-border;
    }

    &--open {
      background: $surface;
      border-color: rgba($primary, 0.5);
    }

    &--locked {
      cursor: help;
      opacity: 0.8;
      background: rgba($white, 0.03);
      border-color: rgba($primary, 0.2);
    }

    &--disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__trigger-content {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
  }

  &__logo {
    font-size: 1.125rem;
  }

  &__name {
    font-family: $font-principal;
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;

    @media (max-width: 480px) {
      max-width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  &__chevron {
    font-size: 0.75rem;
    color: $text-secondary;
    transition: transform $transition-fast;

    .model-dropdown__trigger--open & {
      transform: rotate(180deg);
    }
  }

  &__menu {
    position: absolute;
    bottom: calc(100% + $spacing-xs);
    left: 0;
    width: 260px;
    background: rgba($primary-dark, 0.95);
    backdrop-filter: blur(12px);
    border: 1px solid $glass-border;
    border-radius: $radius-lg;
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.4);
    padding: $spacing-xs;
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 2px;
    animation: popIn 200ms cubic-bezier(0.16, 1, 0.3, 1);
    transform-origin: bottom left;

    @media (max-width: 480px) {
      width: calc(100vw - 32px); // Almost full width on mobile minus padding
      position: fixed;
      bottom: 80px;
      left: 16px;
    }
  }

  &__header {
    padding: $spacing-xs $spacing-sm;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: $text-secondary;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    border-bottom: 1px solid $glass-border;
    padding-bottom: 8px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm;
    border: none;
    background: transparent;
    border-radius: $radius-md;
    text-align: left;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover:not(:disabled) {
      background: $surface-hover;
    }

    &--active {
      background: rgba($primary, 0.1);

      &[style*="--claude"] {
        background: rgba($claude-color, 0.15);
      }

      &[style*="--gemini"] {
        background: rgba($gemini-color, 0.15);
      }

      &[style*="--deepseek"] {
        background: rgba($deepseek-color, 0.15);
      }
    }

    &--unavailable {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__item-logo {
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: $radius-sm;
    background: $surface;
  }

  &__item-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__item-name {
    color: $text-light;
    font-family: $font-principal;
    font-size: 0.875rem;
    font-weight: 500;
  }

  &__item-desc {
    color: $text-secondary;
    font-size: 0.75rem;
  }

  &__item-status {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: $radius-full;
  font-size: 0.625rem;

  &--success {
    color: $white;
    background: $secondary;
  }

  &--error {
    color: $white;
    background: $alert-error;
  }
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
