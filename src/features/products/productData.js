export const productSizes = ['S', 'M', 'L', 'XL', 'XXL']

export const products = [
  {
    id: 'tempo-tee', name: 'Áo chạy Tempo', category: 'CHẠY BỘ', price: 590000,
    description: 'Áo chạy dáng gọn, dễ phối cùng quần shorts cho các buổi chạy hằng ngày.',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85',
    label: 'MỚI',
  },
  {
    id: 'motion-short', name: 'Quần tập Motion', category: 'TẬP LUYỆN', price: 690000,
    description: 'Quần shorts thể thao dành cho tập gym và những buổi vận động ngoài trời.',
    image: 'https://images.unsplash.com/photo-1598522325074-042db73aa4e6?auto=format&fit=crop&w=900&q=85',
    label: 'BÁN CHẠY',
  },
  {
    id: 'run-shell', name: 'Áo khoác Run Shell', category: 'CHẠY BỘ', price: 1290000,
    description: 'Áo khoác thể thao mặc ngoài, phù hợp khi khởi động hoặc di chuyển.',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85',
    label: '',
  },
  {
    id: 'core-top', name: 'Áo tập Core', category: 'GYM', price: 520000,
    description: 'Áo tập kiểu dáng tối giản, dễ phối trong phòng gym và khi mặc hằng ngày.',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85',
    label: '',
  },
]

export const formatPrice = (amount) => new Intl.NumberFormat('vi-VN').format(amount) + '₫'
