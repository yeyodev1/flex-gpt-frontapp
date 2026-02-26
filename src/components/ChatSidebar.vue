<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useConversationStore } from '@/stores/conversation'
import type { ConversationListItem } from '@/types'
import longLogo from '@/assets/logo/long-logo.png'

defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()
const userStore = useUserStore()
const conversationStore = useConversationStore()

function handleNewChat() {
  conversationStore.startNewChat()
  emit('close')
}

function handleSelectConversation(conversation: ConversationListItem) {
  conversationStore.selectConversation(conversation._id)
  emit('close')
}

function handleDeleteConversation(event: Event, id: string) {
  event.stopPropagation()
  conversationStore.deleteConversation(id)
}

function handleLogout() {
  userStore.clear()
  router.push('/login')
}

function getProviderIcon(provider: string): string {
  switch (provider) {
    case 'claude': return 'fa-solid fa-brain'
    case 'gemini': return 'fa-solid fa-wand-magic-sparkles'
    case 'deepseek': return 'fa-solid fa-magnifying-glass-chart'
    default: return 'fa-solid fa-robot'
  }
}
</script>

<template>
  <div class="sidebar-overlay" :class="{ 'sidebar-overlay--open': isOpen }" @click="emit('close')"></div>

  <aside class="sidebar" :class="{ 'sidebar--open': isOpen }">
    <!-- Header -->
    <div class="sidebar__header">
      <div class="sidebar__brand">
        <img :src="longLogo" alt="FlexGPT" class="sidebar__brand-logo" />
      </div>
      <button class="sidebar__close" @click="emit('close')">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- New Chat -->
    <button class="sidebar__new-chat" @click="handleNewChat">
      <i class="fa-solid fa-plus"></i>
      <span>New Chat</span>
    </button>

    <!-- Conversations -->
    <div class="sidebar__conversations">
      <p v-if="conversationStore.isLoadingConversations" class="sidebar__loading">
        <i class="fa-solid fa-spinner fa-spin"></i> Loading...
      </p>
      <p v-else-if="!conversationStore.hasConversations" class="sidebar__empty">
        No conversations yet.
      </p>

      <button
        v-for="conv in conversationStore.conversations"
        :key="conv._id"
        class="sidebar__conversation"
        :class="{ 'sidebar__conversation--active': conversationStore.activeConversationId === conv._id }"
        @click="handleSelectConversation(conv)"
      >
        <i :class="getProviderIcon(conv.aiProvider)" class="sidebar__conv-icon"></i>
        <span class="sidebar__conv-title">{{ conv.title }}</span>
        <button
          class="sidebar__conv-delete"
          title="Delete"
          @click="(e) => handleDeleteConversation(e, conv._id)"
        >
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </button>
    </div>

    <!-- Footer / User -->
    <div class="sidebar__footer">
      <div class="sidebar__user">
        <div class="sidebar__user-avatar">
          <i class="fa-solid fa-user"></i>
        </div>
        <span class="sidebar__user-email">{{ userStore.email || 'User' }}</span>
      </div>
      <button class="sidebar__logout" title="Logout" @click="handleLogout">
        <i class="fa-solid fa-right-from-bracket"></i>
      </button>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 90;
  backdrop-filter: blur(4px);

  @media (max-width: 768px) {
    &--open {
      display: block;
    }
  }
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: transform $transition-base;

  @media (max-width: 768px) {
    transform: translateX(-100%);

    &--open {
      transform: translateX(0);
    }
  }

  // Header
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md;
    border-bottom: 1px solid var(--border);
  }

  &__brand {
    display: flex;
    align-items: center;
  }

  &__brand-logo {
    height: 28px;
    width: auto;
    object-fit: contain;
  }

  &__close {
    display: none;
    background: none;
    border: none;
    color: $text-secondary;
    font-size: 1.125rem;
    cursor: pointer;
    padding: $spacing-xs;

    @media (max-width: 768px) {
      display: block;
    }

    &:hover {
      color: $white;
    }
  }

  // New Chat
  &__new-chat {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin: $spacing-md;
    padding: $spacing-sm $spacing-md;
    border: 1px dashed var(--border);
    border-radius: $radius-md;
    background: transparent;
    color: $text-secondary;
    font-family: $font-principal;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      border-color: $primary;
      color: $primary;
      background: rgba($primary, 0.05);
    }
  }

  // Conversations
  &__conversations {
    flex: 1;
    overflow-y: auto;
    padding: 0 $spacing-sm;
  }

  &__loading, &__empty {
    text-align: center;
    color: $text-secondary;
    font-size: 0.8125rem;
    padding: $spacing-xl $spacing-md;
  }

  &__conversation {
    width: 100%;
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    margin-bottom: 2px;
    border: none;
    border-radius: $radius-md;
    background: transparent;
    color: rgba($white, 0.7);
    font-family: $font-principal;
    font-size: 0.8125rem;
    cursor: pointer;
    transition: background $transition-fast;
    text-align: left;

    &:hover {
      background: $surface-hover;
      color: $white;

      .sidebar__conv-delete {
        opacity: 1;
      }
    }

    &--active {
      background: $surface-active;
      color: $white;
    }
  }

  &__conv-icon {
    font-size: 0.75rem;
    opacity: 0.6;
    min-width: 16px;
  }

  &__conv-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__conv-delete {
    opacity: 0;
    background: none;
    border: none;
    color: $text-secondary;
    font-size: 0.75rem;
    cursor: pointer;
    padding: $spacing-xs;
    transition: all $transition-fast;

    &:hover {
      color: $alert-error;
    }
  }

  // Footer
  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md;
    border-top: 1px solid var(--border);
  }

  &__user {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    overflow: hidden;
  }

  &__user-avatar {
    width: 32px;
    height: 32px;
    min-width: 32px;
    border-radius: $radius-full;
    background: rgba($primary, 0.15);
    color: $primary;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
  }

  &__user-email {
    font-size: 0.8125rem;
    color: rgba($white, 0.7);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__logout {
    background: none;
    border: none;
    color: $text-secondary;
    font-size: 0.875rem;
    cursor: pointer;
    padding: $spacing-xs $spacing-sm;
    transition: color $transition-fast;

    &:hover {
      color: $alert-error;
    }
  }
}
</style>
