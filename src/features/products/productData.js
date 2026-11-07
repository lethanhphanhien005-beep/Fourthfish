import { sports } from './sports.js'

export const productSizes = ['S', 'M', 'L', 'XL', 'XXL']
export const galleryViews = ['Mặt trước', 'Góc nghiêng', 'Mặt sau', 'Cận bề mặt vải', 'Chi tiết đường may']

const entries = [
  ['tempo-tee', 'Áo chạy Tempo', 'chay-bo', 590000, 'Trắng', 'MỚI', 'Áo chạy cổ tròn, tay ngắn, dáng gọn.', 'Tempo là lớp áo cơ bản cho những buổi chạy quanh khu nhà hoặc trên đường chạy. Thiết kế cổ tròn và tay ngắn giúp bạn phối nhanh với quần shorts. Với tông trắng đơn giản, áo có thể mặc riêng hoặc phối cùng một lớp khoác khi cần.'],
  ['run-shell', 'Áo khoác Run Shell', 'chay-bo', 1290000, 'Than chì', '', 'Áo khoác có mũ và khóa kéo trước.', 'Run Shell là lớp mặc ngoài khi khởi động, di chuyển đến điểm chạy hoặc nghỉ sau buổi tập. Khóa kéo trước giúp mặc và cởi nhanh, còn mũ áo tạo điểm nhấn cho dáng khoác. Phối với áo chạy Tempo và quần Sprint để có một bộ chạy tông trung tính.'],
  ['sprint-short', 'Quần chạy Sprint', 'chay-bo', 620000, 'Xám đậm', '', 'Quần shorts chạy bộ với cạp co giãn.', 'Sprint có dáng shorts gọn, dễ phối với áo chạy tay ngắn hoặc singlet. Phần cạp co giãn giúp mặc nhanh trước buổi chạy và giữ dáng quần khi di chuyển. Chọn size theo vòng eo và mức độ thoải mái bạn muốn khi sải bước.'],
  ['pace-singlet', 'Áo chạy Pace', 'chay-bo', 480000, 'Xám nhạt', '', 'Áo chạy không tay, dáng đơn giản.', 'Pace phù hợp với người thích áo không tay khi chạy hoặc tập ngoài trời. Phần vai và nách mở giúp bạn dễ cử động tay, đồng thời thuận tiện khi mặc dưới áo khoác. Tông xám nhạt phối được với quần đen, xám hoặc các màu trung tính khác.'],
  ['motion-short', 'Quần tập Motion', 'tap-luyen', 690000, 'Đen', 'BÁN CHẠY', 'Quần shorts tập luyện, cạp bản rộng.', 'Motion là mẫu quần shorts cho buổi tập gym, các bài vận động hoặc đi bộ. Cạp bản rộng tạo dáng gọn khi phối với áo thun và tank top. Dáng quần đơn giản giúp bạn dùng cùng nhiều bộ đồ tập trong tuần.'],
  ['core-top', 'Áo tập Core', 'tap-luyen', 520000, 'Xám than', '', 'Áo tập tay ngắn với cổ tròn.', 'Core có kiểu dáng tối giản cho buổi tập tạ, tập tại nhà hoặc mặc sau giờ tập. Tông xám than dễ phối với quần Motion và những mẫu quần thể thao khác. Chọn size theo sở thích mặc vừa người hoặc rộng nhẹ để cử động thoải mái.'],
  ['form-legging', 'Quần legging Form', 'tap-luyen', 790000, 'Đen', '', 'Quần dài ôm gọn dành cho tập luyện.', 'Form có dáng ôm dài đến mắt cá, phù hợp khi bạn thích quần gọn cho các bài giãn cơ hoặc vận động trong phòng tập. Cạp cao là điểm nhấn của kiểu dáng và dễ phối với áo tập rộng vừa. Khi chọn size, ưu tiên độ vừa ở eo và hông.'],
  ['studio-tank', 'Áo tập Studio', 'tap-luyen', 460000, 'Xám sáng', '', 'Áo tập không tay, dễ phối theo lớp.', 'Studio có dáng không tay cho những buổi tập cần cử động vai và tay thường xuyên. Kiểu áo gọn và màu trung tính dễ phối với shorts hoặc legging. Bạn có thể mặc riêng khi tập và khoác thêm áo ngoài khi di chuyển.'],
  ['pitch-jersey', 'Áo bóng đá Pitch', 'bong-da', 560000, 'Trắng', '', 'Áo bóng đá trắng viền đen.', 'Pitch hướng đến những trận đấu sân nhỏ hoặc các buổi tập cùng đội. Viền đen ở cổ và tay tạo tương phản trên nền trắng, dễ phối với quần Match. Kiểu áo tay ngắn phù hợp cho lúc khởi động và chơi bóng.'],
  ['match-short', 'Quần bóng đá Match', 'bong-da', 490000, 'Đen', '', 'Quần bóng đá với mảng phối hai bên.', 'Match có dáng shorts gọn để phối cùng áo bóng đá Pitch hoặc Touch. Mảng sáng hai bên tạo điểm nhấn cho bộ đồ tông đen trắng. Hãy chọn size đủ thoải mái để bước rộng và đổi hướng trong lúc chơi.'],
  ['warmup-top', 'Áo khởi động Warmup', 'bong-da', 890000, 'Than chì', '', 'Áo dài tay, khóa kéo ngắn ở cổ.', 'Warmup là lớp mặc thêm trước trận đấu hoặc khi ngồi nghỉ giữa hiệp. Thiết kế dài tay và khóa kéo ngắn ở cổ dễ phối bên ngoài áo bóng đá. Tông than chì giúp bạn kết hợp với quần shorts hoặc quần tập dài.'],
  ['touch-jersey', 'Áo bóng đá Touch', 'bong-da', 610000, 'Đen', '', 'Áo bóng đá đen có họa tiết sọc chìm.', 'Touch dành cho người thích bộ đồ bóng đá tông tối. Các sọc chìm tạo chiều sâu khi nhìn gần mà vẫn giữ vẻ tối giản từ xa. Phối với quần Match để dùng cho buổi tập nhóm hoặc các trận giao hữu cuối tuần.'],
]

const collectionAssets = {
  'chay-bo': 'running',
  'tap-luyen': 'training',
  'bong-da': 'football',
}

export const products = entries.map(([id, name, sport, price, color, label, description, detail], index) => {
  const category = sports.find(item => item.id === sport).title.toUpperCase()
  const image = `/catalog/${collectionAssets[sport]}.webp`
  const imageRow = index % 4
  return {
    id, name, sport, category, price, color, label, description, detail, image, imageRow,
    gallery: galleryViews.map((view, column) => ({ view, column })),
  }
})

export const featuredProducts = ['tempo-tee', 'motion-short', 'run-shell', 'core-top'].map(id => products.find(product => product.id === id))
export const formatPrice = amount => new Intl.NumberFormat('vi-VN').format(amount) + '₫'
