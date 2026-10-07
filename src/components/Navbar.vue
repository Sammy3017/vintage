<template>
  <div class="navbar-demo-shell">
    <nav class="navbar navbar-expand-lg bg-light main-navbar">
      <div class="brand-area" @click="navigateTo('/')">
        <img src="@/assets/img/LogoHorizontal.png" alt="Vintage" class="brand-logo" />
      </div>

      <button
        class="navbar-toggler menu-toggle"
        type="button"
        :aria-label="t('openNavigation')"
        :aria-expanded="showNavigationMenu"
        aria-controls="main-navigation"
        @click="toggleNavigationMenu"
      >
        <ul class="hamburger-lines" aria-hidden="true">
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </button>

      <div id="main-navigation" class="collapse navbar-collapse" :class="{ show: showNavigationMenu }">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <button type="button" class="nav-link" :aria-current="$route.name === 'home' ? 'page' : null" @click="goToHome">
              {{ t('home') }}
            </button>
          </li>
          <li class="nav-item">
            <button type="button" class="nav-link" :aria-current="$route.name === 'cart' ? 'page' : null" @click="goToCart">
              {{ t('cart') }}
              <span v-if="isLoggedIn && cartCount" class="nav-count">{{ cartCount }}</span>
            </button>
          </li>
          <li class="nav-item">
            <button type="button" class="nav-link" :aria-current="$route.name === 'favorites' ? 'page' : null" @click="goToFavorites">
              {{ t('favoriteItems') }}
              <span v-if="isLoggedIn && favoriteCount" class="nav-count">{{ favoriteCount }}</span>
            </button>
          </li>
          <li class="nav-item">
            <button type="button" class="nav-link" :aria-current="$route.name === 'settings' ? 'page' : null" @click="goToAccount">
              {{ t('account') }}
            </button>
          </li>
        </ul>

        <div v-if="!isLoggedIn" class="auth-actions">
          <button class="btn-login" type="button" @click="goToLogin">{{ t('login') }}</button>
          <button class="btn-signup" type="button" @click="goToRegister">{{ t('signUp') }}</button>
        </div>

        <div v-else class="user-actions">
          <div class="profile-trigger" @click="toggleProfileMenu">
            <img :src="profileImage" alt="user" />
          </div>
        </div>

        <button class="lang-btn" type="button" @click="toggleLanguage">{{ language }} <span>▾</span></button>

        <form class="search-form" role="search" @submit.prevent="submitSearch">
          <input
            :value="modelValue"
            class="form-control form-control-sm"
            type="search"
            :placeholder="t('searchPlaceholder')"
            :aria-label="t('searchPlaceholder')"
            @input="$emit('update:modelValue', $event.target.value)"
          />
          <button class="btn btn-outline-success btn-sm" type="submit">{{ t('search') }}</button>
        </form>
      </div>
    </nav>

    <div v-if="showProfileMenu" class="profile-menu">
      <div class="menu-item" @click="goToProfile"><span>👤</span> <span>{{ t('profile') }}</span></div>
      <div class="menu-item" @click="goToCart"><span>🧾</span> <span>{{ t('order') }}</span></div>
      <div class="menu-item logout-item" @click="showLogoutModal = true"><span>↩</span> <span>{{ t('logout') }}</span></div>
    </div>

    <div v-if="showLogoutModal" class="logout-modal-backdrop" @click.self="showLogoutModal = false">
      <div class="logout-modal">
        <div class="modal-header">
          <h3>{{ t('logout') }}</h3>
          <button class="close-btn" type="button" @click="showLogoutModal = false">×</button>
        </div>

        <p>{{ t('logoutConfirm') }}</p>

        <div class="modal-actions">
          <button class="ghost-btn" type="button" @click="showLogoutModal = false">{{ t('close') }}</button>
          <button class="danger-btn" type="button" @click="doLogout">{{ t('logout') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import defaultProfileImage from '@/assets/img/profile-user.jpg'
import { logoutAccount, watchAuth } from '@/services/auth'
import { getCartCount } from '@/services/cart'
import { fetchFavorites } from '@/services/favorites'
import { i18nState, t, toggleLanguage as toggleAppLanguage } from '@/services/i18n'

export default {
  name: 'Navbar',
  props: {
    modelValue: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'search'],
  data() {
    return {
      isLoggedIn: false,
      showNavigationMenu: false,
      showProfileMenu: false,
      showLogoutModal: false,
      cartCount: 0,
      favoriteCount: 0,
      profileImage: defaultProfileImage,
    }
  },
  mounted() {
    this.stopWatchingAuth = watchAuth((profile) => {
      this.isLoggedIn = Boolean(profile)
      if (!profile) this.showProfileMenu = false
      if (profile) {
        this.syncCartCount()
        this.syncFavoriteCount()
      } else {
        this.cartCount = 0
        this.favoriteCount = 0
      }
    })
    this.syncCartCount()
    this.profileImage = localStorage.getItem('vintage_profile_image') || this.profileImage
  },
  beforeUnmount() {
    this.stopWatchingAuth?.()
  },
  computed: {
    language() {
      return i18nState.language
    },
  },
  methods: {
    t,
    submitSearch() {
      this.$emit('search', (this.modelValue || '').trim())
    },
    navigateTo(path) {
      this.$router.push(path.startsWith('/') ? path : `/${path}`)
    },
    goToLogin() {
      this.showNavigationMenu = false
      this.$router.push({ name: 'login' })
    },
    goToHome() {
      this.showNavigationMenu = false
      this.$router.push({ name: 'home' })
    },
    goToAccount() {
      this.showNavigationMenu = false
      this.$router.push({ name: 'settings' })
    },
    goToRegister() {
      this.showNavigationMenu = false
      this.$router.push({ name: 'register' })
    },
    syncLoginState() {
      try {
        const user = localStorage.getItem('vintage_user')
        this.isLoggedIn = Boolean(user)
      } catch (error) {
        this.isLoggedIn = false
      }
    },
    toggleProfileMenu() {
      this.showProfileMenu = !this.showProfileMenu
    },
    toggleNavigationMenu() {
      this.showNavigationMenu = !this.showNavigationMenu
    },
    goToProfile() {
      this.showProfileMenu = false
      this.$router.push({ name: 'settings' })
    },
    goToCart() {
      this.showNavigationMenu = false
      this.showProfileMenu = false
      this.$router.push({ name: 'cart' })
    },
    goToFavorites() {
      this.showNavigationMenu = false
      this.showProfileMenu = false
      this.$router.push({ name: 'favorites' })
    },
    async syncCartCount() {
      try {
        this.cartCount = await getCartCount()
      } catch (error) {
        this.cartCount = 0
      }
    },
    async syncFavoriteCount() {
      try {
        const favorites = await fetchFavorites()
        this.favoriteCount = favorites.length
      } catch (error) {
        this.favoriteCount = 0
      }
    },
    toggleLanguage() {
      toggleAppLanguage()
    },
    async doLogout() {
      try {
        await logoutAccount()
      } catch (error) {
        this.isLoggedIn = false
      }
      this.isLoggedIn = false
      this.showProfileMenu = false
      this.showLogoutModal = false
      this.$router.push({ name: 'home' })
    },
  },
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.navbar-demo-shell {
  position: relative;
  background: #ffffff;
  padding: 0;
  min-height: 0;
  font-family: 'Segoe UI', Tahoma, sans-serif;
}

.main-navbar {
  width: 100%;
  margin: 0;
  background: #f8f9fa;
  border-bottom: 1px solid #e7e7e7;
  border-radius: 0;
  box-shadow: none;
  padding: 8px 12px;
}

.brand-area {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  margin-right: 16px;
  cursor: pointer;
}

.brand-logo {
  display: block;
  height: 32px;
  width: auto;
  object-fit: contain;
}

.menu-toggle {
  padding: 6px 10px;
}

.hamburger-lines {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
}

.hamburger-lines li {
  width: 22px;
  height: 2px;
  list-style: none;
  border-radius: 2px;
  background: #6c757d;
}

.main-navbar .navbar-nav .nav-link {
  border: 0;
  background: transparent;
  color: #343a40;
  font: inherit;
  cursor: pointer;
}

.main-navbar .navbar-nav .nav-link:hover,
.main-navbar .navbar-nav .nav-link[aria-current="page"] {
  color: #111;
}

.nav-count {
  margin-left: 4px;
  color: #6c757d;
  font-size: 12px;
}

.auth-actions,
.user-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 10px;
}

.search-form {
  display: flex;
  gap: 6px;
  margin-left: auto;
}

.search-form .form-control {
  width: 172px;
}

.lang-btn,
.btn-login,
.btn-signup {
  border: 1px solid rgba(100, 100, 100, 0.15);
  background: transparent;
  color: #2d2d2d;
  cursor: pointer;
  font-family: inherit;
}

.btn-login,
.btn-signup {
  min-width: 66px;
  height: 31px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
}

.btn-login {
  border-color: #20b9c7;
  color: #1faec2;
  background: rgba(255,255,255,0.15);
}

.btn-signup {
  border-color: #1ebaaf;
  background: linear-gradient(180deg, #27c0c9, #1cadb6);
  color: white;
}

.lang-btn {
  min-width: 58px;
  height: 31px;
  border-radius: 6px;
  font-size: 13px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.profile-trigger {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.08);
  cursor: pointer;
  background: #f0f0f0;
}

.profile-trigger img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-menu {
  position: absolute;
  right: 18px;
  top: 68px;
  width: 180px;
  background: rgba(255,255,255,0.96);
  border: 1px solid rgba(100,100,100,0.18);
  border-radius: 8px;
  box-shadow: 0 10px 18px rgba(0,0,0,0.12);
  padding: 10px 0;
  z-index: 10;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  font-size: 14px;
  color: #373737;
  cursor: pointer;
}

.logout-item {
  color: #e55a5a;
}

.logout-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.38);
  display: grid;
  place-items: center;
  z-index: 20;
}

.logout-modal {
  width: min(100%, 420px);
  background: rgba(255,255,255,0.96);
  border-radius: 12px;
  padding: 18px 20px 16px;
  box-shadow: 0 14px 24px rgba(0,0,0,0.16);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.modal-header h3 {
  margin: 0;
  font-size: 26px;
  font-weight: 600;
  color: #2f2f2f;
}

.close-btn {
  border: 0;
  background: transparent;
  font-size: 24px;
  color: #666;
  cursor: pointer;
}

.logout-modal p {
  margin: 0;
  text-align: center;
  color: #555;
  font-size: 16px;
  line-height: 1.5;
  padding: 8px 0 18px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.ghost-btn,
.danger-btn {
  min-width: 90px;
  height: 38px;
  border-radius: 6px;
  border: 1px solid rgba(100,100,100,0.15);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.ghost-btn {
  border-color: #d7d7d7;
  background: transparent;
  color: #4e4e4e;
}

.danger-btn {
  border-color: #d94b4b;
  background: #d94b4b;
  color: white;
}

@media (max-width: 991.98px) {
  .main-navbar {
    padding: 8px 12px;
  }

  .main-navbar .navbar-collapse {
    width: 100%;
    padding-top: 8px;
  }

  .main-navbar .navbar-nav {
    margin-bottom: 8px !important;
  }

  .auth-actions,
  .user-actions {
    margin: 4px 0 8px;
  }

  .lang-btn {
    margin-bottom: 8px;
  }

  .search-form {
    width: 100%;
    margin: 0;
  }

  .search-form .form-control {
    width: auto;
    flex: 1;
  }

  .profile-menu {
    right: 12px;
    top: 58px;
  }
}

@media (min-width: 992px) {
  .profile-menu {
    right: 12px;
    top: 58px;
  }
}
</style>
