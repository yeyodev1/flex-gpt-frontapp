<script setup lang="ts">
import { useRouter } from 'vue-router'
import longLogo from '@/assets/logo/long-logo.png'

const router = useRouter()

function goToLogin() {
  router.push('/login')
}
</script>

<template>
  <div class="landing">
    <!-- Navigation -->
    <nav class="landing__nav">
      <img :src="longLogo" alt="FlexGPT" class="landing__logo" />
      <button class="landing__cta-nav" @click="goToLogin">
        Entrar
      </button>
    </nav>

    <!-- Hero Section -->
    <main class="landing__hero">
      <div class="landing__hero-content">
        <div class="landing__badge">
          <i class="fa-solid fa-shield-halved"></i>
          Sistema IA 100% Seguro
        </div>
        <h1 class="landing__title">
          IA Potente para tu Empresa, <br />
          <span>Sin Filtraciones de Datos.</span>
        </h1>
        <p class="landing__description">
          Esta es la versión de prueba de FlexGPT. Experimenta la potencia de los mejores modelos del mundo (Claude 3.5, Gemini 1.5 Pro, DeepSeek V3) en un entorno blindado donde tu información nunca sale de tu control.
        </p>
        <div class="landing__actions">
          <button class="landing__cta-main" @click="goToLogin">
            Empezar ahora
            <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>

      <!-- Features Grid -->
      <div class="landing__features">
        <div class="feature-card">
          <div class="feature-card__icon feature-card__icon--blue">
            <i class="fa-solid fa-lock"></i>
          </div>
          <h3>Privacidad Total</h3>
          <p>Tu información está encriptada y no se utiliza para entrenar modelos públicos.</p>
        </div>
        <div class="feature-card">
          <div class="feature-card__icon feature-card__icon--green">
            <i class="fa-solid fa-bolt"></i>
          </div>
          <h3>Multimodelo</h3>
          <p>Cambia entre Claude, Gemini y DeepSeek en un solo chat de forma instantánea.</p>
        </div>
        <div class="feature-card">
          <div class="feature-card__icon feature-card__icon--purple">
            <i class="fa-solid fa-file-shield"></i>
          </div>
          <h3>Documentos Seguros</h3>
          <p>Analiza PDFs y archivos de datos con la confianza de que nadie más los verá.</p>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="landing__footer">
      <p>&copy; {{ new Date().getFullYear() }} FlexGPT - Plataforma de IA Segura para Empresas.</p>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.landing {
  min-height: 100vh;
  background: radial-gradient(circle at 50% -20%, lighten($primary-dark, 5%), $primary-dark);
  color: $white;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;

  &__nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-lg $spacing-2xl;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;

    @media (max-width: 768px) {
      padding: $spacing-md;
    }
  }

  &__logo {
    height: 32px;
  }

  &__cta-nav {
    padding: $spacing-sm $spacing-xl;
    background: rgba($white, 0.05);
    border: 1px solid $glass-border;
    border-radius: $radius-md;
    color: $white;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      background: rgba($white, 0.1);
      border-color: rgba($white, 0.3);
    }
  }

  &__hero {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-2xl;
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;

    @media (max-width: 768px) {
      padding: $spacing-md;
      margin-top: $spacing-2xl;
    }
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: $spacing-sm;
    background: rgba($secondary, 0.1);
    color: $secondary;
    padding: $spacing-xs $spacing-md;
    border-radius: $radius-full;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: $spacing-lg;
    border: 1px solid rgba($secondary, 0.2);
    animation: fadeInDown 0.6s ease;
  }

  &__title {
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: $spacing-lg;
    animation: fadeInUp 0.8s ease;

    span {
      background: linear-gradient(to right, $primary, $secondary);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  &__description {
    font-size: clamp(1rem, 2vw, 1.25rem);
    color: rgba($white, 0.7);
    max-width: 800px;
    line-height: 1.6;
    margin-bottom: $spacing-2xl;
    animation: fadeInUp 1s ease;
  }

  &__cta-main {
    display: inline-flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md $spacing-2xl;
    background: $primary;
    color: $white;
    border: none;
    border-radius: $radius-lg;
    font-size: 1.125rem;
    font-weight: 700;
    cursor: pointer;
    transition: all $transition-base;
    box-shadow: $shadow-glow;
    animation: fadeInUp 1.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 30px rgba($primary, 0.4);
      background: lighten($primary, 5%);
    }

    i {
      font-size: 0.875rem;
      transition: transform $transition-fast;
    }

    &:hover i {
      transform: translateX(4px);
    }
  }

  &__features {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-lg;
    margin-top: $spacing-2xl;
    width: 100%;
    animation: fadeInUp 1.4s ease;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  &__footer {
    padding: $spacing-2xl;
    text-align: center;
    color: rgba($white, 0.3);
    font-size: 0.875rem;
    border-top: 1px solid rgba($white, 0.05);
  }
}

.feature-card {
  background: rgba($white, 0.03);
  border: 1px solid $glass-border;
  border-radius: $radius-xl;
  padding: $spacing-xl;
  text-align: left;
  transition: all $transition-base;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba($white, 0.06);
    border-color: rgba($primary, 0.3);
    transform: translateY(-5px);
  }

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: $radius-md;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    margin-bottom: $spacing-lg;

    &--blue {
      background: rgba($primary, 0.15);
      color: $primary;
    }

    &--green {
      background: rgba($secondary, 0.15);
      color: $secondary;
    }

    &--purple {
      background: rgba(#8b5cf6, 0.15);
      color: #8b5cf6;
    }
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: $spacing-sm;
  }

  p {
    font-size: 0.9375rem;
    line-height: 1.6;
    color: rgba($white, 0.5);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
