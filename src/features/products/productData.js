export const products = [
  {
    id: 'tempo-tee', name: 'Áo chạy Tempo', category: 'CHẠY BỘ', price: 590000,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85',
    label: 'MỚI',
  },
  {
    id: 'motion-short', name: 'Quần tập Motion', category: 'TẬP LUYỆN', price: 690000,
    image: 'https://images.unsplash.com/photo-1598522325074-042db73aa4e6?auto=format&fit=crop&w=900&q=85',
    label: 'BÁN CHẠY',
  },
  {
    id: 'run-shell', name: 'Áo khoác Run Shell', category: 'CHẠY BỘ', price: 1290000,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85',
    label: '',
  },
  {
    id: 'core-top', name: 'Áo tập Core', category: 'GYM', price: 520000,
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85',
    label: '',
  },
]

export const formatPrice = (amount) => new Intl.NumberFormat('vi-VN').format(amount) + '₫'
