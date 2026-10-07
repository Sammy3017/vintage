import axios from 'axios'

const BASE_URL = 'https://vintage-8d691-default-rtdb.firebaseio.com'

export const productEndpoints = {
  list: `${BASE_URL}/products.json`,
  detail: (id) => `${BASE_URL}/products/${id}.json`,
}

const localImages = import.meta.glob('../assets/img/*', {
  eager: true,
  import: 'default',
  query: '?url',
})

function formatRupiah(value) {
  const amount = Number(String(value ?? '').replace(/[^0-9]/g, ''))
  if (!Number.isFinite(amount)) return 'Rp0'
  return `Rp${amount.toLocaleString('id-ID')}`
}

function resolveImage(imageName) {
  if (!imageName) return ''
  if (imageName.startsWith('https://')) return imageName

  const imagePath = `../assets/img/${imageName}`
  return localImages[imagePath] || ''
}

export function mapProduct(id, item = {}) {
  return {
    id,
    name: item.name || '',
    price: formatRupiah(item.price),
    rawPrice: String(item.price ?? ''),
    size: item.size || '',
    likes: Number(item.likes || 0),
    image: resolveImage(item.image),
    imageName: item.image || '',
    brand: item.brand || '',
    category: item.category || '',
    color: item.color || '',
    condition: item.condition || '',
    description: item.description || '',
    uploaded: item.uploaded || '',
    shipping: formatRupiah(item.shipping),
    rawShipping: String(item.shipping ?? ''),
  }
}

export function mapProductList(data) {
  if (!data || typeof data !== 'object') return []
  return Object.keys(data).map((id) => mapProduct(id, data[id]))
}

export async function fetchProducts() {
  const response = await axios.get(productEndpoints.list)
  return mapProductList(response.data)
}

export async function fetchProductById(id) {
  const response = await axios.get(productEndpoints.detail(id))
  if (!response.data) return null
  return mapProduct(id, response.data)
}