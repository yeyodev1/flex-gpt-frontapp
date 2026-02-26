<script setup lang="ts">
import type { AIProvider } from '@/types'

defineProps({
  provider: {
    type: String as () => AIProvider,
    required: true,
  },
})
</script>

<template>
  <div class="provider-logo" :class="`provider-logo--${provider}`">
    <!-- Claude Logo (Stylized Asterisk/Sparkle) -->
    <svg v-if="provider === 'claude'" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L13.5 9H21L15 13.5L17.5 21L12 16.5L6.5 21L9 13.5L3 9H10.5L12 2Z" />
    </svg>

    <!-- Gemini Logo (4-point sparkle) -->
    <svg v-else-if="provider === 'gemini'" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" />
    </svg>

    <!-- DeepSeek Logo (Abstract Whale/Wave) -->
    <svg v-else-if="provider === 'deepseek'" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4C5.373 4 0 9.373 0 16H2.5C2.5 10.753 6.753 6.5 12 6.5C17.247 6.5 21.5 10.753 21.5 16H24C24 9.373 18.627 4 12 4Z" />
      <path d="M12 9C8.134 9 5 12.134 5 16H7.5C7.5 13.515 9.515 11.5 12 11.5C14.485 11.5 16.5 13.515 16.5 16H19C19 12.134 15.866 9 12 9Z" />
      <circle cx="12" cy="18" r="2" />
    </svg>
  </div>
</template>

<style lang="scss" scoped>
.provider-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;

  svg {
    width: 100%;
    height: 100%;
  }

  &--claude {
    color: $claude-color;
  }

  &--gemini {
    color: $gemini-color;
  }

  &--deepseek {
    color: $deepseek-color;
  }
}
</style>
