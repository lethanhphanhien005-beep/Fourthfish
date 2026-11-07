import { ImageOff } from 'lucide-react'
import { useState } from 'react'

export default function ProductImage({ product, loading = 'eager' }) {
  const [failedImage, setFailedImage] = useState(null)
  if (!product.image || failedImage === product.image) return <div className="product-photo-placeholder" role="img" aria-label={`Ảnh ${product.name} đang cập nhật`}><ImageOff size={26} /><span>Ảnh đang cập nhật</span></div>
  return <img src={product.image} alt={product.name} loading={loading} onError={() => setFailedImage(product.image)} />
}
