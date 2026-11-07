import { Check } from 'lucide-react'

const fields = [
  ['fullName', 'Họ và tên', 'Nguyễn Văn A', 'text'], ['phone', 'Số điện thoại', '09xx xxx xxx', 'tel'],
  ['city', 'Tỉnh / Thành phố', 'Chọn tỉnh / thành phố', 'text'], ['district', 'Quận / Huyện', 'Chọn quận / huyện', 'text'],
  ['ward', 'Phường / Xã', 'Chọn phường / xã', 'text'], ['street', 'Đường / Tòa nhà / Số nhà', 'Số nhà, tên đường, tòa nhà', 'text'],
]

export default function AddressForm({ address, setAddress }) {
  const update = (key, value) => setAddress((current) => ({ ...current, [key]: value }))
  return <div className="address-form">
    <div className="form-grid">{fields.map(([key, label, placeholder, type]) => <label className={`form-field ${key === 'street' ? 'field-wide' : ''}`} key={key}><span>{label} *</span><input type={type} value={address[key]} onChange={(event) => update(key, event.target.value)} placeholder={placeholder} /></label>)}</div>
    <label className="form-field note-field"><span>Ghi chú giao hàng</span><input value={address.note} onChange={(event) => update('note', event.target.value)} placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến..." /></label>
      <div className="address-extra"><div className="checkbox-stack"><label className="check-row"><input type="checkbox" checked={address.isDefault} onChange={(event) => update('isDefault', event.target.checked)} /><span className="check-box"><Check size={13} /></span>Đặt làm địa chỉ mặc định</label><label className="check-row"><input type="checkbox" checked={address.isPickupAddress} onChange={(event) => update('isPickupAddress', event.target.checked)} /><span className="check-box"><Check size={13} /></span>Đặt làm địa chỉ lấy hàng</label><label className="check-row"><input type="checkbox" checked={address.isReturnAddress} onChange={(event) => update('isReturnAddress', event.target.checked)} /><span className="check-box"><Check size={13} /></span>Đặt làm địa chỉ nhận hàng đổi trả</label></div>
      <div className="address-type"><span>LOẠI ĐỊA CHỈ</span><label><input type="radio" name="addressType" checked={address.type === 'Nhà riêng'} onChange={() => update('type', 'Nhà riêng')} /> Nhà riêng</label><label><input type="radio" name="addressType" checked={address.type === 'Văn phòng'} onChange={() => update('type', 'Văn phòng')} /> Văn phòng</label></div></div>
  </div>
}
