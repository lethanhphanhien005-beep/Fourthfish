import { ImageOff } from 'lucide-react'
import { useState } from 'react'

export default function ProductImage({ product, loading = 'eager', column = 0 }) {
  const [failedImage, setFailedImage] = useState(null)
  if (!product.image || failedImage === product.image) return <div className="product-photo-placeholder" role="img" aria-label={`Ảnh ${product.name} đang cập nhật`}><ImageOff size={26} /><span>Ảnh đang cập nhật</span></div>

  return <div className="catalog-photo" style={{ '--photo-x': `${column * -100}%`, '--photo-y': `${product.imageRow * -100}%` }}>
    <img src={product.image} alt={product.name} loading={loading} draggable={false} onError={() => setFailedImage(product.image)} />
  </div>
}
