import { Check } from 'lucide-react'
import { useStore } from '../../features/cart/CartContext.jsx'

export default function Toast() {
  const { toast } = useStore()
  return toast ? <div className="toast" role="status"><span className="toast-check"><Check size={15} /></span>{toast}<span className="toast-link">ĐÃ THÊM</span></div> : null
}
