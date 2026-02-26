<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import BaseModal from '@/components/BaseModal.vue'
import ToastProvider from '@/components/ToastProvider.vue'

const userStore = useUserStore()

onMounted(() => {
  userStore.hydrate()
})
</script>

<template>
  <div class="app-container">
    <RouterView />
    
    <!-- Global UI Components -->
    <BaseModal />
    <ToastProvider />
  </div>
</template>

<style lang="scss">
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
