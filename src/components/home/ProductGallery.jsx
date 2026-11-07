import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState } from 'react'
import ProductImage from './ProductImage.jsx'

export default function ProductGallery({ product }) {
  const viewport = useRef(null)
  const [index, setIndex] = useState(0)
  const photos = product.gallery
  const last = photos.length - 1

  function showPhoto(next) {
    const track = viewport.current
    if (!track) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    track.scrollTo({ left: Math.max(0, Math.min(last, next)) * track.clientWidth, behavior: reduceMotion ? 'instant' : 'smooth' })
  }

  return <section className="product-gallery" aria-label={`Bộ ảnh ${product.name}`}>
    <div className="gallery-frame">
      <div className="gallery-track" ref={viewport} tabIndex={0} aria-label="Vuốt ngang hoặc dùng phím mũi tên để xem ảnh"
        onScroll={event => {
          const track = event.currentTarget
          if (track.clientWidth) setIndex(Math.max(0, Math.min(last, Math.round(track.scrollLeft / track.clientWidth))))
        }}
        onKeyDown={event => {
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
          event.preventDefault()
          showPhoto(index + (event.key === 'ArrowRight' ? 1 : -1))
        }}>
        {photos.map((photo, position) => <div className="gallery-slide" key={photo.column}>
          <ProductImage product={{ ...product, name: `${product.name} · ${photo.view}` }} column={photo.column} loading={position ? 'lazy' : 'eager'} />
        </div>)}
      </div>
      {product.label && <span className="product-badge">{product.label}</span>}
      <button type="button" className="gallery-arrow gallery-previous" aria-label="Ảnh trước" disabled={index === 0} onClick={() => showPhoto(index - 1)}><ChevronLeft size={20} /></button>
      <button type="button" className="gallery-arrow gallery-next" aria-label="Ảnh tiếp theo" disabled={index === last} onClick={() => showPhoto(index + 1)}><ChevronRight size={20} /></button>
    </div>
    <div className="gallery-caption" aria-live="polite"><span>{photos[index].view}</span><span>{index + 1} / {photos.length}</span></div>
    <div className="gallery-thumbs" aria-label="Chọn góc xem">
      {photos.map((photo, position) => <button type="button" key={photo.column} aria-label={`Xem ảnh ${position + 1} · ${photo.view}`} aria-pressed={index === position} onClick={() => showPhoto(position)}><ProductImage product={{ ...product, name: '' }} column={photo.column} loading="lazy" /></button>)}
    </div>
    <p className="gallery-note">Ảnh minh họa sản phẩm</p>
  </section>
}
