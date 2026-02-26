<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import type { AIProvider } from '@/types'

// Configure marked for safe, clean output
marked.setOptions({
  breaks: true,
  gfm: true,
})

const props = defineProps({
  role: {
    type: String as () => 'user' | 'assistant',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  provider: {
    type: String as () => AIProvider,
    required: false,
  },
  isStreaming: {
    type: Boolean,
    required: false,
  },
})

const providerIcon = computed(() => {
  switch (props.provider) {
    case 'claude': return 'fa-solid fa-brain'
    case 'gemini': return 'fa-solid fa-wand-magic-sparkles'
    case 'deepseek': return 'fa-solid fa-magnifying-glass-chart'
    default: return 'fa-solid fa-robot'
  }
})

const providerClass = computed(() => props.provider ? `bubble--${props.provider}` : '')

/** Parse markdown for assistant messages, keep plain text for user */
const renderedContent = computed(() => {
  if (props.role === 'user') return null
  return marked.parse(props.content) as string
})
</script>

<template>
  <div class="bubble" :class="[`bubble--${role}`, providerClass]">
    <!-- AI Avatar -->
    <div v-if="role === 'assistant'" class="bubble__avatar">
      <i :class="providerIcon"></i>
    </div>

    <div class="bubble__body">
      <!-- User message: plain text -->
      <div v-if="role === 'user'" class="bubble__content">
        <p>{{ content }}</p>
      </div>

      <!-- Assistant message: rendered markdown -->
      <div
        v-else
        class="bubble__content bubble__content--markdown"
        v-html="renderedContent"
      ></div>

      <span v-if="isStreaming" class="bubble__cursor"></span>
    </div>

    <!-- User Avatar -->
    <div v-if="role === 'user'" class="bubble__avatar bubble__avatar--user">
      <i class="fa-solid fa-user"></i>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bubble {
  display: flex;
  gap: $spacing-sm;
  padding: $spacing-sm 0;
  max-width: 85%;
  animation: fadeIn 200ms ease;

  &--user {
    align-self: flex-end;
    flex-direction: row;
  }

  &--assistant {
    align-self: flex-start;
  }

  &__avatar {
    width: 32px;
    height: 32px;
    min-width: 32px;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    margin-top: 2px;
    background: $surface;
    color: $text-secondary;

    &--user {
      background: rgba($secondary, 0.2);
      color: $secondary;
    }
  }

  // Provider-specific avatar colors
  &--claude .bubble__avatar {
    background: rgba($claude-color, 0.15);
    color: $claude-color;
  }

  &--gemini .bubble__avatar {
    background: rgba($gemini-color, 0.15);
    color: $gemini-color;
  }

  &--deepseek .bubble__avatar {
    background: rgba($deepseek-color, 0.15);
    color: $deepseek-color;
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__content {
    padding: $spacing-sm $spacing-md;
    border-radius: $radius-lg;
    font-size: 0.9375rem;
    line-height: 1.6;
    word-wrap: break-word;

    .bubble--user & {
      background: rgba($secondary, 0.15);
      border: 1px solid rgba($secondary, 0.2);
      color: $white;
      white-space: pre-wrap;
    }

    .bubble--assistant & {
      background: $surface;
      border: 1px solid $glass-border;
      color: rgba($white, 0.9);
    }

    p {
      margin: 0;
    }

    // Markdown styles for assistant responses
    &--markdown {
      :deep(h1),
      :deep(h2),
      :deep(h3),
      :deep(h4) {
        color: $white;
        font-weight: 600;
        margin: $spacing-md 0 $spacing-sm;

        &:first-child {
          margin-top: 0;
        }
      }

      :deep(h1) { font-size: 1.25rem; }
      :deep(h2) { font-size: 1.125rem; }
      :deep(h3) { font-size: 1rem; }

      :deep(p) {
        margin: 0 0 $spacing-sm;

        &:last-child {
          margin-bottom: 0;
        }
      }

      :deep(strong) {
        color: $white;
        font-weight: 600;
      }

      :deep(em) {
        font-style: italic;
      }

      :deep(ul),
      :deep(ol) {
        margin: $spacing-sm 0;
        padding-left: $spacing-lg;
      }

      :deep(li) {
        margin-bottom: $spacing-xs;

        &::marker {
          color: $text-secondary;
        }
      }

      :deep(code) {
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-size: 0.8125rem;
        padding: 2px 6px;
        border-radius: $radius-sm;
        background: rgba($white, 0.08);
        color: $primary;
      }

      :deep(pre) {
        margin: $spacing-sm 0;
        padding: $spacing-md;
        border-radius: $radius-md;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid $glass-border;
        overflow-x: auto;

        code {
          padding: 0;
          background: transparent;
          color: rgba($white, 0.85);
          font-size: 0.8125rem;
          line-height: 1.5;
        }
      }

      :deep(blockquote) {
        margin: $spacing-sm 0;
        padding: $spacing-sm $spacing-md;
        border-left: 3px solid $primary;
        background: rgba($primary, 0.05);
        border-radius: 0 $radius-sm $radius-sm 0;
        color: rgba($white, 0.75);

        p {
          margin: 0;
        }
      }

      :deep(hr) {
        border: none;
        border-top: 1px solid $glass-border;
        margin: $spacing-md 0;
      }

      :deep(a) {
        color: $primary;
        text-decoration: underline;
        text-underline-offset: 2px;

        &:hover {
          color: lighten($primary, 10%);
        }
      }

      :deep(table) {
        width: 100%;
        border-collapse: collapse;
        margin: $spacing-sm 0;
        font-size: 0.875rem;

        th, td {
          padding: $spacing-xs $spacing-sm;
          border: 1px solid $glass-border;
          text-align: left;
        }

        th {
          background: rgba($white, 0.05);
          color: $white;
          font-weight: 600;
        }
      }
    }
  }

  &__cursor {
    display: inline-block;
    width: 2px;
    height: 1em;
    background: $primary;
    margin-left: 2px;
    vertical-align: text-bottom;
    animation: blink 0.8s ease-in-out infinite;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
</style>
