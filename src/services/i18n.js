import { computed, reactive } from 'vue'
import { messages } from '@/i18n/messages'

const STORAGE_KEY = 'vintage_language'
const storedLanguage = localStorage.getItem(STORAGE_KEY)
const state = reactive({
  language: storedLanguage === 'ID' ? 'ID' : 'EN',
})

export function t(key, params = {}) {
  const table = messages[state.language] || messages.EN
  const message = table[key] || messages.EN[key] || key
  return Object.entries(params).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    message,
  )
}

export function setLanguage(next) {
  state.language = next === 'ID' ? 'ID' : 'EN'
  localStorage.setItem(STORAGE_KEY, state.language)
}

export function toggleLanguage() {
  setLanguage(state.language === 'EN' ? 'ID' : 'EN')
}

export function useI18n() {
  return {
    language: computed(() => state.language),
    t,
    setLanguage,
    toggleLanguage,
  }
}

export const i18nState = state
