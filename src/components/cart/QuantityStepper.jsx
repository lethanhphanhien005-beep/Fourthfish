import { Minus, Plus } from 'lucide-react'

export default function QuantityStepper({ value, onChange, label = 'Số lượng' }) {
  return <div className="quantity-stepper" aria-label={label}><button type="button" onClick={() => onChange(value - 1)} aria-label="Giảm số lượng"><Minus size={13} /></button><span>{value}</span><button type="button" onClick={() => onChange(value + 1)} aria-label="Tăng số lượng"><Plus size={13} /></button></div>
}
