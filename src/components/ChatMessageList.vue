<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import ChatBubble from './ChatBubble.vue'
import type { Message, AIProvider } from '@/types'

const props = defineProps({
  messages: {
    type: Array as () => Message[],
    required: true,
  },
  streamingContent: {
    type: String,
    required: false,
  },
  isStreaming: {
    type: Boolean,
    required: false,
  },
  selectedProvider: {
    type: String as () => AIProvider,
    required: true,
  },
  isNearLimit: {
    type: Boolean,
    required: false,
  },
  isLimitReached: {
    type: Boolean,
    required: false,
  },
  messagesRemaining: {
    type: Number,
    required: false,
    default: 50,
  },
  isLoading: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emit = defineEmits<{
  (e: 'new-chat'): void
}>()

const scrollContainer = ref<HTMLElement | null>(null)

function scrollToBottom() {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  })
}

watch(() => props.messages.length, scrollToBottom)
watch(() => props.streamingContent, scrollToBottom)
</script>

<template>
  <div ref="scrollContainer" class="message-list">
    <!-- Empty State -->
    <div v-if="messages.length === 0 && !isStreaming" class="message-list__empty">
      <div class="empty-icon">
        <i class="fa-solid fa-comments"></i>
      </div>
      <p v-if="isLoading" class="sidebar__loading">
        <i class="fa-solid fa-spinner fa-spin"></i> Cargando...
      </p>
      <h3>Inicia una conversación</h3>
      <p>Elige un modelo de IA y envía un mensaje para comenzar.</p>
    </div>

    <!-- Messages -->
    <div v-else class="message-list__messages">
      <div 
        v-for="(msg, index) in messages" 
        :key="index" 
        class="message"
        :class="{
          'message--user': msg.role === 'user',
          'message--assistant': msg.role === 'assistant',
          'message--error': msg.isError
        }"
      >
        <ChatBubble
          :role="msg.role"
          :content="msg.content"
          :provider="msg.provider"
          :files="msg.files"
        />
      </div>

      <!-- Streaming Bubble -->
      <ChatBubble
        v-if="isStreaming && streamingContent"
        role="assistant"
        :content="streamingContent"
        :provider="selectedProvider"
        :is-streaming="true"
      />

      <!-- Typing Indicator -->
      <div v-if="isStreaming && !streamingContent" class="typing-indicator">
        <div class="typing-indicator__avatar">
          <i class="fa-solid fa-robot"></i>
        </div>
        <div class="typing-indicator__dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <!-- Near Limit Warning -->
      <div v-if="isNearLimit && !isLimitReached" class="limit-banner limit-banner--warning">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <div class="limit-banner__text">
          <strong>Quedan {{ messagesRemaining }} mensajes.</strong>
          <span>Considera iniciar un nuevo chat pronto para continuar la conversación.</span>
        </div>
      </div>

      <!-- Limit Reached Banner -->
      <div v-if="isLimitReached" class="limit-banner limit-banner--error">
        <i class="fa-solid fa-circle-exclamation"></i>
        <div class="limit-banner__text">
          <strong>Límite de conversación alcanzado.</strong>
          <span>Este chat ha alcanzado su longitud máxima. Por favor, inicia una nueva conversación para continuar.</span>
        </div>
        <button class="limit-banner__btn" @click="emit('new-chat')">
          <i class="fa-solid fa-plus"></i>
          Nuevo Chat
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-md;
  display: flex;
  flex-direction: column;

  &__empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: $spacing-sm;
    color: $text-secondary;

    .empty-icon {
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: $radius-full;
      background: $surface;
      font-size: 1.5rem;
      margin-bottom: $spacing-sm;
    }

    h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: $white;
    }

    p {
      font-size: 0.875rem;
      max-width: 280px;
    }
  }

  &__messages {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    padding-bottom: $spacing-md;
  }
}

.message {
  display: flex;
  flex-direction: column;
  width: 100%;

  &--user {
    align-self: flex-end;
    align-items: flex-end;
    margin-left: 20%;
  }

  &--assistant {
    align-self: flex-start;
    align-items: flex-start;
    margin-right: 20%;
  }

  &--error {
    // These styles are applied to the wrapper div,
    // and then propagated to the ChatBubble content via ::v-deep
    background: rgba($alert-error, 0.1) !important;
    border: 1px solid rgba($alert-error, 0.3) !important;
    color: $alert-error !important;

    // Target the paragraph inside ChatBubble
    &::v-deep(.chat-bubble__content p) {
      color: $alert-error !important;
    }
  }
}

// Limit banners
.limit-banner {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  border-radius: $radius-lg;
  margin-top: $spacing-md;
  animation: fadeIn 300ms ease;

  >i {
    font-size: 1.125rem;
    flex-shrink: 0;
  }

  &__text {
    flex: 1;
    font-size: 0.8125rem;
    line-height: 1.5;

    strong {
      display: block;
      margin-bottom: 2px;
    }

    span {
      opacity: 0.8;
    }
  }

  &__btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    border: none;
    border-radius: $radius-md;
    font-family: $font-principal;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all $transition-fast;
    background: $primary;
    color: $white;

    &:hover {
      transform: translateY(-1px);
      box-shadow: $shadow-glow;
    }
  }

  &--warning {
    background: rgba(#f59e0b, 0.1);
    border: 1px solid rgba(#f59e0b, 0.25);
    color: #fbbf24;

    .limit-banner__text span {
      color: rgba(#fbbf24, 0.7);
    }
  }

  &--error {
    background: rgba($alert-error, 0.1);
    border: 1px solid rgba($alert-error, 0.25);
    color: $alert-error;

    .limit-banner__text span {
      color: rgba($alert-error, 0.7);
    }
  }
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm 0;

  &__avatar {
    width: 32px;
    height: 32px;
    min-width: 32px;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    background: $surface;
    color: $text-secondary;
  }

  &__dots {
    display: flex;
    gap: 4px;
    padding: $spacing-sm $spacing-md;
    background: $surface;
    border-radius: $radius-lg;
    border: 1px solid $glass-border;

    span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: $text-secondary;
      animation: typingBounce 1.4s ease-in-out infinite;

      &:nth-child(2) {
        animation-delay: 0.2s;
      }

      &:nth-child(3) {
        animation-delay: 0.4s;
      }
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

@keyframes typingBounce {

  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }

  30% {
    transform: translateY(-6px);
    opacity: 1;
  }
}
</style>
