import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { get, ref, set } from 'firebase/database'
import { auth, database } from '@/firebase'

const SESSION_KEY = 'vintage_user'

function saveSession(profile) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(profile))
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function mapAuthError(error) {
  const code = error?.code || ''

  if (code === 'auth/email-already-in-use') return 'authEmailInUse'
  if (code === 'auth/invalid-email') return 'authInvalidEmail'
  if (code === 'auth/weak-password') return 'passwordMinLength'
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'authInvalidCredentials'
  }
  if (code === 'auth/too-many-requests') return 'authTooManyRequests'
  if (code === 'PERMISSION_DENIED' || code.includes('permission-denied')) {
    return 'authPermissionDenied'
  }

  return 'authGenericError'
}

async function readProfile(user) {
  const snapshot = await get(ref(database, `users/${user.uid}`))
  const data = snapshot.val() || {}

  return {
    uid: user.uid,
    fullName: data.fullName || '',
    username: data.username || '',
    email: data.email || user.email || '',
  }
}

export async function registerAccount({ fullName, username, email, password }) {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password)
  const profile = {
    fullName: fullName.trim(),
    username: username.trim(),
    email: email.trim(),
  }

  await set(ref(database, `users/${credential.user.uid}`), profile)

  const session = { uid: credential.user.uid, ...profile }
  saveSession(session)
  return session
}

export async function loginAccount(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
  let profile

  try {
    profile = await readProfile(credential.user)
  } catch {
    profile = {
      uid: credential.user.uid,
      fullName: '',
      username: '',
      email: credential.user.email || email.trim(),
    }
  }

  saveSession(profile)
  return profile
}

export async function logoutAccount() {
  await signOut(auth)
  clearSession()
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      clearSession()
      callback(null)
      return
    }

    try {
      const profile = await readProfile(user)
      saveSession(profile)
      callback(profile)
    } catch {
      const profile = {
        uid: user.uid,
        fullName: '',
        username: '',
        email: user.email || '',
      }
      saveSession(profile)
      callback(profile)
    }
  })
}

export function resolveAuthUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}
