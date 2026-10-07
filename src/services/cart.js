import { get, ref, remove, set, update } from 'firebase/database'
import { auth, database } from '@/firebase'
import { mapProduct } from '@/services/products'

function requireUid() {
  const uid = auth.currentUser?.uid
  if (!uid) {
    const error = new Error('Login required.')
    error.code = 'auth/required'
    throw error
  }
  return uid
}

export function mapCartPayload(product, qty = 1) {
  return {
    name: product.name || '',
    price: String(product.rawPrice || product.price || ''),
    size: product.size || '',
    image: product.imageName || product.image || '',
    shipping: String(product.rawShipping || product.shipping || 0),
    qty: Math.max(1, Number(qty || 1)),
  }
}

export async function fetchCart() {
  const uid = auth.currentUser?.uid
  if (!uid) return []
  const snapshot = await get(ref(database, `users/${uid}/cart`))
  const data = snapshot.val()
  if (!data || typeof data !== 'object') return []
  return Object.keys(data).map((id) => {
    const item = data[id] || {}
    const product = mapProduct(id, item)
    return {
      id: product.id,
      name: product.name,
      size: product.size,
      price: Number(product.rawPrice || 0),
      qty: Math.max(1, Number(item.qty || 1)),
      image: product.image,
      imageName: product.imageName,
      shipping: Number(product.rawShipping || 0),
    }
  })
}

export async function getCartCount() {
  const items = await fetchCart()
  return items.reduce((total, item) => total + item.qty, 0)
}

export async function addToCart(product, qty = 1) {
  const uid = requireUid()
  if (!product?.id) throw new Error('Product id required.')
  const itemRef = ref(database, `users/${uid}/cart/${product.id}`)
  const snapshot = await get(itemRef)
  const currentQty = snapshot.exists() ? Number(snapshot.val()?.qty || 0) : 0
  await set(itemRef, mapCartPayload(product, currentQty + Number(qty || 1)))
}

export async function updateCartQty(productId, qty) {
  const uid = requireUid()
  if (qty <= 0) {
    await remove(ref(database, `users/${uid}/cart/${productId}`))
    return
  }
  await update(ref(database, `users/${uid}/cart/${productId}`), { qty: Number(qty) })
}

export async function removeCartItem(productId) {
  const uid = requireUid()
  await remove(ref(database, `users/${uid}/cart/${productId}`))
}