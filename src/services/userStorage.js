import { auth } from '@/firebase'

function getCurrentUserId() {
  if (auth.currentUser?.uid) return auth.currentUser.uid

  try {
    const session = JSON.parse(localStorage.getItem('vintage_user') || '{}')
    return session.uid || 'guest'
  } catch {
    return 'guest'
  }
}

export function getUserStorageKey(collection) {
  return `${collection}_${getCurrentUserId()}`
}

export function readUserCollection(collection) {
  try {
    return JSON.parse(localStorage.getItem(getUserStorageKey(collection)) || '[]')
  } catch {
    return []
  }
}

export function writeUserCollection(collection, value) {
  localStorage.setItem(getUserStorageKey(collection), JSON.stringify(value))
}

export function removeUserCollection(collection) {
  localStorage.removeItem(getUserStorageKey(collection))
}
