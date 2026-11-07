import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'fourthfish-cart-v1'

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function StoreProvider({ children }) {
  const [items, setItems] = useState(readCart)
  const [toast, setToast] = useState('')

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(items)), [items])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 2300)
    return () => window.clearTimeout(timer)
  }, [toast])

  const value = useMemo(() => {
    const addItem = (product, size = 'M') => {
      setItems((current) => {
        const found = current.find((item) => item.id === product.id && item.size === size)
        return found
          ? current.map((item) => item.id === product.id && item.size === size ? { ...item, quantity: item.quantity + 1 } : item)
          : [...current, { ...product, size, quantity: 1 }]
      })
      setToast(`${product.name} đã được thêm vào giỏ`)
    }
    const setQuantity = (id, size, quantity) => {
      setItems((current) => quantity < 1
        ? current.filter((item) => !(item.id === id && item.size === size))
        : current.map((item) => item.id === id && item.size === size ? { ...item, quantity } : item))
    }
    const removeItem = (id, size) => setItems((current) => current.filter((item) => !(item.id === id && item.size === size)))
    const clearCart = () => setItems([])
    const count = items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    return { items, addItem, setQuantity, removeItem, clearCart, count, subtotal, toast }
  }, [items, toast])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useStore() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useStore phải được dùng bên trong StoreProvider')
  return context
}
