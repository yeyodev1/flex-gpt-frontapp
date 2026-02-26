<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useConversationStore } from '@/stores/conversation'
import ChatSidebar from '@/components/ChatSidebar.vue'
import ModelSelector from '@/components/ModelSelector.vue'
import ChatMessageList from '@/components/ChatMessageList.vue'
import ChatInputBar from '@/components/ChatInputBar.vue'
import type { AIProvider } from '@/types'

const conversationStore = useConversationStore()
const isSidebarOpen = ref(false)

onMounted(() => {
  conversationStore.loadConversations()
  conversationStore.checkProvidersStatus()
})

function handleProviderSelect(provider: AIProvider) {
  conversationStore.setProvider(provider)
}

function handleSendMessage(message: string) {
  conversationStore.sendMessage(message)
}

function handleNewChat() {
  conversationStore.startNewChat()
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
        <button class="chat-header__menu" @click="isSidebarOpen = true">
          <i class="fa-solid fa-bars"></i>
        </button>

        <ModelSelector
          :selected="conversationStore.selectedProvider"
          :disabled="conversationStore.isStreaming || conversationStore.isConversationLimitReached"
          :provider-statuses="conversationStore.providersStatus"
          :is-checking="conversationStore.isCheckingProviders"
          @select="handleProviderSelect"
        />

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

      <!-- Input -->
      <ChatInputBar
        :disabled="conversationStore.isStreaming || conversationStore.isConversationLimitReached"
        :placeholder="conversationStore.isConversationLimitReached ? 'Conversation limit reached — start a new chat' : 'Send a message...'"
        @send="handleSendMessage"
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
  border-bottom: 1px solid var(--border);
  background: rgba($primary-dark, 0.8);
  backdrop-filter: blur(12px);

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

  &__spacer {
    @media (max-width: 768px) {
      width: 40px;
    }
  }
}
</style>
