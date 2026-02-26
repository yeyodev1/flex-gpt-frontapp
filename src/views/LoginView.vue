<script setup lang="ts">
import { ref } from 'vue'
import longLogo from '@/assets/logo/long-logo.png'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { authService } from '@/services/auth.service'

const router = useRouter()
const userStore = useUserStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) {
    errorMessage.value = 'Por favor, ingresa tu correo y contraseña.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const data = await authService.login(email.value, password.value)

    localStorage.setItem('access_token', data.token)
    userStore.setUser({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
    })

    router.push('/chat')
  } catch (error: any) {
    errorMessage.value = error?.message || 'Credenciales inválidas. Por favor, inténtalo de nuevo.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Brand -->
      <div class="login-brand">
        <img :src="longLogo" alt="FlexGPT" class="brand-logo" />
        <p class="brand-tagline">IA Corporativa sin complicaciones</p>
      </div>

      <!-- Login Card -->
      <form class="login-card" @submit.prevent="handleLogin">
        <h2 class="card-title">Bienvenido de nuevo</h2>
        <p class="card-subtitle">Inicia sesión para continuar en FlexGPT</p>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-banner">
          <i class="fa-solid fa-circle-exclamation"></i>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Email Field -->
        <div class="input-group">
          <label for="email">Correo Electrónico</label>
          <div class="input-wrapper">
            <i class="fa-solid fa-envelope"></i>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="you@flexgpt.ec"
              autocomplete="email"
              :disabled="isLoading"
            />
          </div>
        </div>

        <!-- Password Field -->
        <div class="input-group">
          <label for="password">Contraseña</label>
          <div class="input-wrapper">
            <i class="fa-solid fa-lock"></i>
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              autocomplete="current-password"
              :disabled="isLoading"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
              tabindex="-1"
            >
              <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
            </button>
          </div>
        </div>

        <!-- Submit -->
        <button type="submit" class="btn-login" :disabled="isLoading">
          <template v-if="isLoading">
            <i class="fa-solid fa-spinner fa-spin"></i>
            Iniciando sesión...
          </template>
          <template v-else>
            <i class="fa-solid fa-right-to-bracket"></i>
            Iniciar Sesión
          </template>
        </button>

        <!-- Footer -->
        <div class="login-footer">
          <div class="provider-badges">
            <span class="badge badge--claude" title="Claude">
              <i class="fa-solid fa-brain"></i>
            </span>
            <span class="badge badge--gemini" title="Gemini">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
            </span>
            <span class="badge badge--deepseek" title="DeepSeek">
              <i class="fa-solid fa-magnifying-glass-chart"></i>
            </span>
          </div>
          <p class="footer-text">Impulsado por Claude · Gemini · DeepSeek</p>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-md;
  background: radial-gradient(ellipse at 30% 20%, rgba($primary, 0.12) 0%, transparent 60%),
    radial-gradient(ellipse at 70% 80%, rgba($secondary, 0.08) 0%, transparent 60%),
    $primary-dark;
}

.login-container {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}

// Brand
.login-brand {
  text-align: center;

  .brand-logo {
    height: 56px;
    width: auto;
    margin-bottom: $spacing-md;
    object-fit: contain;
  }

  .brand-tagline {
    font-size: 0.875rem;
    color: $text-secondary;
    font-weight: 400;
  }
}

// Card
.login-card {
  background: $glass-bg;
  border: 1px solid $glass-border;
  border-radius: $radius-xl;
  padding: $spacing-xl;
  backdrop-filter: blur(16px);
  box-shadow: $shadow-lg;

  .card-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: $white;
    margin-bottom: $spacing-xs;
  }

  .card-subtitle {
    font-size: 0.875rem;
    color: $text-secondary;
    margin-bottom: $spacing-lg;
  }
}

// Error
.error-banner {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  margin-bottom: $spacing-md;
  border-radius: $radius-md;
  background: $alert-error-bg;
  border: 1px solid rgba($alert-error, 0.3);
  color: $alert-error;
  font-size: 0.8125rem;

  i {
    flex-shrink: 0;
  }
}

// Inputs
.input-group {
  margin-bottom: $spacing-md;

  label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 500;
    color: rgba($white, 0.7);
    margin-bottom: $spacing-xs;
  }
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;

  >i:first-child {
    position: absolute;
    left: $spacing-md;
    color: $text-secondary;
    font-size: 0.875rem;
    pointer-events: none;
  }

  input {
    width: 100%;
    padding: 0.75rem $spacing-md 0.75rem 2.5rem;
    background: $surface;
    border: 1px solid $glass-border;
    border-radius: $radius-md;
    color: $white;
    font-family: $font-principal;
    font-size: 0.9375rem;
    outline: none;
    transition: border-color $transition-fast, box-shadow $transition-fast;

    &::placeholder {
      color: rgba($text-secondary, 0.6);
    }

    &:focus {
      border-color: $primary;
      box-shadow: 0 0 0 3px rgba($primary, 0.15);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .toggle-password {
    position: absolute;
    right: $spacing-sm;
    background: none;
    border: none;
    color: $text-secondary;
    cursor: pointer;
    padding: $spacing-xs $spacing-sm;
    font-size: 0.875rem;
    transition: color $transition-fast;

    &:hover {
      color: $white;
    }
  }
}

// Button
.btn-login {
  width: 100%;
  padding: 0.875rem;
  margin-top: $spacing-sm;
  background: linear-gradient(135deg, $primary, darken($primary, 8%));
  border: none;
  border-radius: $radius-md;
  color: $white;
  font-family: $font-principal;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  transition: transform $transition-fast, box-shadow $transition-fast, opacity $transition-fast;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: $shadow-glow;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

// Footer
.login-footer {
  margin-top: $spacing-xl;
  text-align: center;

  .provider-badges {
    display: flex;
    justify-content: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-sm;
  }

  .badge {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $radius-full;
    font-size: 0.875rem;
    transition: transform $transition-fast;

    &:hover {
      transform: scale(1.1);
    }

    &--claude {
      background: rgba($claude-color, 0.15);
      color: $claude-color;
    }

    &--gemini {
      background: rgba($gemini-color, 0.15);
      color: $gemini-color;
    }

    &--deepseek {
      background: rgba($deepseek-color, 0.15);
      color: $deepseek-color;
    }
  }

  .footer-text {
    font-size: 0.75rem;
    color: $text-secondary;
  }
}
</style>
