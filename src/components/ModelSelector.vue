<script setup lang="ts">

import type { AIProvider, ProviderStatus } from '@/types'

const PROVIDERS: { id: AIProvider; label: string; icon: string; colorVar: string }[] = [
  { id: 'claude', label: 'Claude', icon: 'fa-solid fa-brain', colorVar: '--claude' },
  { id: 'gemini', label: 'Gemini', icon: 'fa-solid fa-wand-magic-sparkles', colorVar: '--gemini' },
  { id: 'deepseek', label: 'DeepSeek', icon: 'fa-solid fa-magnifying-glass-chart', colorVar: '--deepseek' },
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
})

const emit = defineEmits<{
  (e: 'select', provider: AIProvider): void
}>()

function isProviderDisabled(providerId: AIProvider): boolean {
  if (props.disabled) return true
  if (!props.providerStatuses) return false
  return !props.providerStatuses[providerId]?.available
}

function getTooltip(providerId: AIProvider): string {
  if (!props.providerStatuses) return ''
  const status = props.providerStatuses[providerId]
  if (!status || status.available) return ''
  return status.error || 'Unavailable'
}
</script>

<template>
  <div class="model-selector">
    <button
      v-for="provider in PROVIDERS"
      :key="provider.id"
      class="model-selector__tab"
      :class="{
        'model-selector__tab--active': selected === provider.id,
        'model-selector__tab--unavailable': isProviderDisabled(provider.id) && !disabled,
      }"
      :style="selected === provider.id ? { '--active-color': `var(${provider.colorVar})` } : {}"
      :disabled="isProviderDisabled(provider.id)"
      :title="getTooltip(provider.id)"
      @click="emit('select', provider.id)"
    >
      <i :class="provider.icon"></i>
      <span class="model-selector__label">{{ provider.label }}</span>

      <!-- Unavailable badge -->
      <span
        v-if="isProviderDisabled(provider.id) && !disabled && providerStatuses"
        class="model-selector__badge"
        :title="getTooltip(provider.id)"
      >
        <i class="fa-solid fa-ban"></i>
      </span>

      <!-- Loading indicator during check -->
      <i
        v-if="isChecking && !providerStatuses"
        class="fa-solid fa-spinner fa-spin model-selector__spinner"
      ></i>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.model-selector {
  display: flex;
  gap: $spacing-xs;
  padding: $spacing-xs;
  background: $surface;
  border-radius: $radius-lg;
  border: 1px solid $glass-border;

  &__tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    border: none;
    border-radius: $radius-md;
    background: transparent;
    color: $text-secondary;
    font-family: $font-principal;
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: all $transition-fast;
    white-space: nowrap;
    position: relative;

    i {
      font-size: 0.875rem;
    }

    &:hover:not(:disabled) {
      background: $surface-hover;
      color: $white;
    }

    &--active {
      // Provider-specific active states
      &[style*="--claude"] {
        background: rgba($claude-color, 0.15);
        color: $claude-color;
      }

      &[style*="--gemini"] {
        background: rgba($gemini-color, 0.15);
        color: $gemini-color;
      }

      &[style*="--deepseek"] {
        background: rgba($deepseek-color, 0.15);
        color: $deepseek-color;
      }
    }

    &--unavailable {
      opacity: 0.35;
      cursor: not-allowed;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 15%;
        right: 15%;
        height: 1px;
        background: $text-secondary;
        transform: rotate(-12deg);
        opacity: 0.5;
      }
    }
  }

  &__label {
    @media (max-width: 480px) {
      display: none;
    }
  }

  &__badge {
    position: absolute;
    top: 2px;
    right: 4px;
    font-size: 0.5625rem;
    color: $alert-error;
    background: rgba($alert-error, 0.15);
    border-radius: $radius-full;
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__spinner {
    font-size: 0.625rem;
    opacity: 0.5;
  }
}
</style>
