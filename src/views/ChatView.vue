<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useConversationStore } from '@/stores/conversation'
import ChatSidebar from '@/components/ChatSidebar.vue'
import ChatMessageList from '@/components/ChatMessageList.vue'
import ChatInputBar from '@/components/ChatInputBar.vue'
import ModelSelector from '@/components/ModelSelector.vue'
import ProviderLogo from '@/components/ProviderLogo.vue'
import type { AIProvider } from '@/types'

const conversationStore = useConversationStore()
const isSidebarOpen = ref(false)
const pendingFiles = ref<File[]>([])

onMounted(() => {
  conversationStore.loadConversations()
  conversationStore.checkProvidersStatus()
})

function handleProviderSelect(provider: AIProvider) {
  // Can only change provider if the conversation doesn't have files
  if (pendingFiles.value.length > 0) return
  conversationStore.setProvider(provider)
}

function handleSendMessage(message: string) {
  conversationStore.sendMessage(message, pendingFiles.value)
  pendingFiles.value = []
}

function handleNewChat() {
  conversationStore.startNewChat()
  pendingFiles.value = []
}

function handleFileUpload(file: File) {
  // For now, support only 1 file maybe? Or support multiple. Let's support multiple visually, but limit later if needed.
  pendingFiles.value.push(file)
}

function handleRemoveFile(index: number) {
  pendingFiles.value.splice(index, 1)
}
</script>

<template>
  <div class="chat-layout">
    <!-- Sidebar -->
    <ChatSidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

    <!-- Main Chat Area -->
    <main class="chat-main">
      <!-- Top Bar -->
      <header class="chat-header">
        <div class="chat-header__left">
          <button class="chat-header__menu" @click="isSidebarOpen = true">
            <i class="fa-solid fa-bars"></i>
          </button>
          
          <div class="chat-header__brand">
            <span class="chat-header__brand-text">FlexGPT</span>
          </div>
        </div>

        <!-- Big Top Indicator -->
        <div class="chat-header__indicator">
          <ProviderLogo :provider="conversationStore.selectedProvider" class="chat-header__indicator-logo" />
          <span class="chat-header__indicator-text">
            {{
              conversationStore.selectedProvider === 'claude' ? 'Claude' :
                conversationStore.selectedProvider === 'gemini' ? 'Gemini' :
                  'DeepSeek'
            }}
          </span>
        </div>

        <div class="chat-header__spacer"></div>
      </header>

      <!-- Messages -->
      <ChatMessageList
        :messages="conversationStore.messages"
        :streaming-content="conversationStore.streamingContent"
        :is-streaming="conversationStore.isStreaming"
        :selected-provider="conversationStore.selectedProvider"
        :is-near-limit="conversationStore.isConversationNearLimit"
        :is-limit-reached="conversationStore.isConversationLimitReached"
        :messages-remaining="conversationStore.messagesRemaining"
        @new-chat="handleNewChat"
      />

      <!-- Provider Select Bar (Floating above input) -->
      <div class="chat-provider-bar">
        <span class="chat-provider-bar__label">Switch Provider:</span>
        <ModelSelector
          :selected="conversationStore.selectedProvider"
          :disabled="conversationStore.isStreaming || pendingFiles.length > 0"
          :provider-statuses="conversationStore.providersStatus"
          :is-checking="conversationStore.isCheckingProviders"
          @select="handleProviderSelect"
        />
      </div>

      <!-- Input -->
      <ChatInputBar
        :disabled="conversationStore.isStreaming || conversationStore.isConversationLimitReached"
        :placeholder="conversationStore.isConversationLimitReached ? 'Conversation limit reached' : 'Send a message...'"
        :selected-provider="conversationStore.selectedProvider"
        :pending-files="pendingFiles"
        @send="handleSendMessage"
        @upload-file="handleFileUpload"
        @remove-file="handleRemoveFile"
      />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.chat-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;

  @media (min-width: 769px) {
    margin-left: var(--sidebar-width);
  }
}

// Header
.chat-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  border-bottom: 1px solid $glass-border;
  background: rgba($primary-dark, 0.9);
  backdrop-filter: blur(12px);
  z-index: 10;

  &__left {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: $spacing-xs;

    @media (max-width: 480px) {
      display: none; // Hide brand on very small screens to fit indicator
    }

    &-text {
      font-size: 1.25rem;
      font-weight: 700;
      color: $white;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, $white, rgba($white, 0.7));
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  &__menu {
    display: none;
    background: none;
    border: none;
    color: $text-secondary;
    font-size: 1.125rem;
    cursor: pointer;
    padding: $spacing-sm;
    border-radius: $radius-md;
    transition: all $transition-fast;

    @media (max-width: 768px) {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &:hover {
      background: $surface-hover;
      color: $white;
    }
  }

  &__indicator {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-lg;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid $glass-border;
    border-radius: $radius-full;
    margin: 0 auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    &-logo {
      font-size: 1.5rem;
    }

    &-text {
      font-family: $font-principal;
      font-weight: 600;
      font-size: 1rem;
      color: $text-light;
      letter-spacing: 0.02em;
    }
  }

  &__spacer {
    display: none;

    @media (max-width: 768px) {
      display: block;
      width: 40px;
    }
  }
}

.chat-provider-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-md;
  padding: $spacing-xs 0;
  margin-top: $spacing-sm;
  animation: fadeIn 300ms ease;

  &__label {
    font-size: 0.75rem;
    font-weight: 600;
    color: $text-secondary;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  @media (max-width: 480px) {
    gap: $spacing-sm;

    &__label {
      display: none;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
