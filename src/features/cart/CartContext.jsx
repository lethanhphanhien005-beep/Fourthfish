import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { products, productSizes } from '../products/productData.js'
import { cartItemKey, itemCount } from './cartPricing.js'

const CartContext = createContext(null)
const STORAGE_KEY = 'fourthfish-cart-v1'

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const items = Array.isArray(saved) ? saved : saved?.items
    const completed = Array.isArray(saved?.completed) ? saved.completed : []
    const restored = (Array.isArray(items) ? items : []).flatMap(item => {
      const product = products.find(candidate => candidate.id === item?.id)
      if (!product || !productSizes.includes(item.size) || !Number.isInteger(item.quantity) || item.quantity < 1) return []
      return [{ ...product, size: item.size, quantity: Math.min(item.quantity, 20), selected: item.selected !== false }]
    })
    return { items: restored, completed }
  } catch {
    return { items: [], completed: [] }
  }
}

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(readCart)
  const [toast, setToast] = useState('')
  const { items } = cart
  const updateItems = useCallback(update => setCart(current => ({ ...current, items: update(current.items) })), [])

  useEffect(() => {
    // Preserve the old storage key so existing customers keep their cart.
    const items = cart.items.map(({ id, size, quantity, selected }) => ({ id, size, quantity, selected }))
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, completed: cart.completed })) } catch { /* Cart remains available in this tab. */ }
  }, [cart])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2300)
    return () => window.clearTimeout(timer)
  }, [toast])

  const completeCartOrder = useCallback((orderCode, purchasedItems) => {
    if (!purchasedItems?.length) return
    const quantities = new Map(purchasedItems.map(item => [cartItemKey(item), item.quantity]))
    setCart(current => {
      if (current.completed.includes(orderCode)) return current
      const remaining = current.items.flatMap(item => {
        const quantity = item.quantity - (quantities.get(cartItemKey(item)) ?? 0)
        return quantity > 0 ? [{ ...item, quantity }] : []
      })
      return { items: remaining, completed: [...current.completed.slice(-99), orderCode] }
    })
  }, [])

  const value = useMemo(() => {
    const addItem = (product, size = 'M') => {
      const key = cartItemKey({ id: product.id, size })
      updateItems(current => {
        if (!current.some(item => cartItemKey(item) === key)) return [...current, { ...product, size, quantity: 1, selected: true }]
        return current.map(item => cartItemKey(item) === key ? { ...item, quantity: Math.min(item.quantity + 1, 20) } : item)
      })
      setToast(`${product.name} đã được thêm vào giỏ`)
    }
    const setQuantity = (id, size, quantity) => {
      const key = cartItemKey({ id, size })
      updateItems(current => current.flatMap(item => {
        if (cartItemKey(item) !== key) return [item]
        return quantity > 0 ? [{ ...item, quantity: Math.min(quantity, 20) }] : []
      }))
    }
    const removeItem = (id, size) => setQuantity(id, size, 0)
    const setSelected = (key, selected) => updateItems(current => current.map(item => cartItemKey(item) === key ? { ...item, selected } : item))
    const selectAll = selected => updateItems(current => current.map(item => ({ ...item, selected })))
    return { items, addItem, setQuantity, removeItem, setSelected, selectAll, completeCartOrder, count: itemCount(items), toast }
  }, [items, toast, updateItems, completeCartOrder])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useStore() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useStore phải được dùng bên trong StoreProvider')
  return context
}
