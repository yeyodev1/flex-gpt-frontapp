import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AIProvider, ConversationListItem, Message, ProvidersStatusMap, ProviderStatus } from '@/types'
import { chatService } from '@/services/chat.service'

export const MAX_MESSAGES = 50
export const WARN_MESSAGES = 40

export const useConversationStore = defineStore('conversation', () => {
  // State
  const conversations = ref<ConversationListItem[]>([])
  const activeConversationId = ref<string | null>(null)
  const messages = ref<Message[]>([])
  const selectedProvider = ref<AIProvider>('gemini')
  const isStreaming = ref(false)
  const streamingContent = ref('')
  const isLoadingConversations = ref(false)

  // Provider health state
  const providersStatus = ref<ProvidersStatusMap | null>(null)
  const isCheckingProviders = ref(false)

  // Getters
  const activeConversation = computed(() =>
    conversations.value.find((c) => c._id === activeConversationId.value)
  )

  const hasConversations = computed(() => conversations.value.length > 0)

  const isConversationNearLimit = computed(() =>
    messages.value.length >= WARN_MESSAGES && messages.value.length < MAX_MESSAGES
  )

  const isConversationLimitReached = computed(() =>
    messages.value.length >= MAX_MESSAGES
  )

  const messagesRemaining = computed(() =>
    Math.max(0, MAX_MESSAGES - messages.value.length)
  )

  /**
   * Returns the status of a specific provider.
   * Defaults to available if status hasn't been fetched yet.
   */
  function getProviderStatus(provider: AIProvider): ProviderStatus {
    if (!providersStatus.value) return { available: true }
    return providersStatus.value[provider] ?? { available: true }
  }

  // Actions
  async function checkProvidersStatus() {
    isCheckingProviders.value = true
    try {
      providersStatus.value = await chatService.getProvidersStatus()

      // If the currently selected provider is unavailable, auto-switch
      const current = getProviderStatus(selectedProvider.value)
      if (!current.available) {
        const fallback = (['claude', 'gemini', 'deepseek'] as AIProvider[]).find(
          (p) => getProviderStatus(p).available
        )
        if (fallback) selectedProvider.value = fallback
      }
    } catch (error) {
      console.error('Failed to check providers:', error)
    } finally {
      isCheckingProviders.value = false
    }
  }

  async function loadConversations() {
    isLoadingConversations.value = true
    try {
      conversations.value = await chatService.getConversations()
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      isLoadingConversations.value = false
    }
  }

  async function selectConversation(id: string) {
    activeConversationId.value = id
    try {
      const conversation = await chatService.getConversation(id)
      messages.value = conversation.messages
      selectedProvider.value = conversation.aiProvider
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }

  function startNewChat() {
    activeConversationId.value = null
    messages.value = []
    streamingContent.value = ''
  }

  async function sendMessage(content: string, files?: File[]) {
    // Only block if there's no content AND no files
    if (isStreaming.value || (!content.trim() && (!files || files.length === 0))) return

    // Add user message to UI immediately
    const userMessage: Message = {
      role: 'user',
      content: content.trim(),
      createdAt: new Date().toISOString(),
      files: files ? files.map(f => ({
        path: '', // Local files don't have a path yet
        name: f.name,
        mimeType: f.type
      })) : undefined
    }
    messages.value.push(userMessage)

    isStreaming.value = true
    streamingContent.value = ''

    try {
      await chatService.sendMessageStream(
        selectedProvider.value,
        content.trim(),
        activeConversationId.value,
        files,
        {
          onMeta: (conversationId: string) => {
            activeConversationId.value = conversationId
          },
          onChunk: (text: string) => {
            streamingContent.value += text
          },
          onDone: () => {
            // Move streaming content to messages
            const assistantMessage: Message = {
              role: 'assistant',
              content: streamingContent.value,
              provider: selectedProvider.value,
              createdAt: new Date().toISOString(),
            }
            messages.value.push(assistantMessage)
            streamingContent.value = ''
            isStreaming.value = false

            // Refresh conversation list
            loadConversations()
          },
          onError: (error: string) => {
            console.error('Stream error:', error)

            // Add a system error message instead of removing user message
            const errorMessage: Message = {
              role: 'assistant',
              content: `⚠️ **Error:** ${error}. There seems to be an "interference" with this provider. Switching you to a more stable one...`,
              provider: selectedProvider.value,
              createdAt: new Date().toISOString(),
              isError: true,
            }
            messages.value.push(errorMessage)

            // Auto-fallback logic: switch to Gemini if Claude/DeepSeek fails, or vice-versa
            const current = selectedProvider.value
            if (current === 'claude') setProvider('gemini')
            else if (current === 'deepseek') setProvider('gemini')
            else setProvider('claude')

            streamingContent.value = ''
            isStreaming.value = false
          },
        }
      )
    } catch (error) {
      console.error('Send message error:', error)
      isStreaming.value = false
      streamingContent.value = ''
    }
  }

  async function deleteConversation(id: string) {
    try {
      await chatService.deleteConversation(id)
      conversations.value = conversations.value.filter((c) => c._id !== id)
      if (activeConversationId.value === id) {
        startNewChat()
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }

  function setProvider(provider: AIProvider) {
    selectedProvider.value = provider
  }

  return {
    // State
    conversations,
    activeConversationId,
    messages,
    selectedProvider,
    isStreaming,
    streamingContent,
    isLoadingConversations,
    providersStatus,
    isCheckingProviders,
    // Getters
    activeConversation,
    hasConversations,
    isConversationNearLimit,
    isConversationLimitReached,
    messagesRemaining,
    // Actions
    checkProvidersStatus,
    getProviderStatus,
    loadConversations,
    selectConversation,
    startNewChat,
    sendMessage,
    deleteConversation,
    setProvider,
  }
})
