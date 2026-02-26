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
  files: {
    type: Array as () => { path: string; name: string; mimeType: string }[],
    required: false,
    default: () => [],
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

function getFileIcon(mimeType: string) {
  if (mimeType.includes('pdf')) return 'fa-solid fa-file-pdf'
  if (mimeType.includes('image')) return 'fa-solid fa-file-image'
  if (mimeType.includes('csv')) return 'fa-solid fa-file-csv'
  if (mimeType.includes('text')) return 'fa-solid fa-file-lines'
  return 'fa-solid fa-file'
}
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
        <!-- Files Area -->
        <div v-if="files && files.length > 0" class="bubble__files">
          <div v-for="(file, index) in files" :key="index" class="file-card">
            <div class="file-card__icon">
              <i :class="getFileIcon(file.mimeType)"></i>
            </div>
            <div class="file-card__info">
              <span class="file-card__name" :title="file.name">{{ file.name }}</span>
              <span class="file-card__status">Documento Enviado <i class="fa-solid fa-check-double"></i></span>
            </div>
          </div>
        </div>
        <p v-if="content">{{ content }}</p>
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
  padding: $spacing-xs 0;
  max-width: 90%;
  animation: fadeIn 200ms ease;

  &--user {
    flex-direction: row;
    justify-content: flex-end;
  }

  &--assistant {
    justify-content: flex-start;
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

      :deep(h1) {
        font-size: 1.25rem;
      }

      :deep(h2) {
        font-size: 1.125rem;
      }

      :deep(h3) {
        font-size: 1rem;
      }

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

        th,
        td {
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

  &__files {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    margin-bottom: $spacing-sm;
  }
}

// Professional File Card
.file-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: rgba($white, 0.05);
  border: 1px solid rgba($white, 0.1);
  border-radius: $radius-md;
  width: 100%;
  min-width: 240px;
  max-width: 320px;
  transition: all $transition-fast;
  cursor: default;

  &:hover {
    background: rgba($white, 0.08);
    border-color: rgba($primary, 0.3);
    transform: translateY(-1px);
  }

  &__icon {
    width: 44px;
    height: 44px;
    background: rgba($primary, 0.15);
    border-radius: $radius-sm;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    color: $primary;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__name {
    color: $white;
    font-size: 0.875rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__status {
    color: rgba($white, 0.5);
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    gap: $spacing-xs;

    i {
      font-size: 0.625rem;
      color: $secondary;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes blink {

  0%,
  50% {
    opacity: 1;
  }

  51%,
  100% {
    opacity: 0;
  }
}
</style>
