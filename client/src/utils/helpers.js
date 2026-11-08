// Tiện ích format dữ liệu

export function formatPrice(price) {
  if (!price && price !== 0) return 'Liên hệ'
  if (price >= 1_000_000) {
    const m = price / 1_000_000
    return `${m % 1 === 0 ? m : m.toFixed(1)} triệu`
  }
  return price.toLocaleString('vi-VN') + 'đ'
}

export function formatPriceFull(price) {
  if (!price) return 'Liên hệ'
  return price.toLocaleString('vi-VN') + ' đ/tháng'
}

export function formatArea(area) {
  return `${area} m²`
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatTimeAgo(dateStr) {
  if (!dateStr) return ''
  const now = new Date()
  const d = new Date(dateStr)
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Vừa xong'
  if (diffMins < 60) return `${diffMins} phút trước`
  if (diffHours < 24) return `${diffHours} giờ trước`
  if (diffDays < 7) return `${diffDays} ngày trước`
  return formatDate(dateStr)
}

export function getRoomTypeLabel(type) {
  const map = {
    PHONG_TRO: 'Phòng trọ',
    CAN_HO_MINI: 'Căn hộ mini',
    STUDIO: 'Studio',
    CHUNG_CU: 'Chung cư',
    NHAT_CAN: 'Nhà trọ',
  }
  return map[type] || type
}

export function getStatusLabel(status) {
  const map = {
    APPROVED: 'Đã duyệt',
    PENDING: 'Chờ duyệt',
    REJECTED: 'Từ chối',
  }
  return map[status] || status
}

export function getStatusClass(status) {
  const map = {
    APPROVED: 'badge-approved',
    PENDING: 'badge-pending',
    REJECTED: 'badge-rejected',
  }
  return map[status] || 'badge'
}

export function getBookingStatusLabel(status) {
  const map = {
    PENDING: 'Chờ phản hồi',
    CONFIRMED: 'Đã xác nhận',
    CANCELLED: 'Đã hủy',
  }
  return map[status] || status
}

export function truncate(str, maxLen = 100) {
  if (!str) return ''
  return str.length > maxLen ? str.slice(0, maxLen) + '...' : str
}

export const CITIES = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Biên Hòa', 'Nha Trang']

export const ROOM_TYPES = [
  { value: '', label: 'Tất cả loại phòng' },
  { value: 'PHONG_TRO', label: 'Phòng trọ' },
  { value: 'CAN_HO_MINI', label: 'Căn hộ mini' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'CHUNG_CU', label: 'Chung cư' },
  { value: 'NHAT_CAN', label: 'Nhà trọ' },
]

export const AMENITIES_LIST = [
  'Điều hòa', 'Máy giặt', 'Tủ lạnh', 'Nóng lạnh', 'Nhà VS riêng',
  'Ban công', 'Chỗ để xe', 'An ninh 24/7', 'Thang máy', 'Wifi',
  'Giường', 'Tủ quần áo', 'Bàn học', 'Bếp mini', 'TV',
  'Camera', 'Hầm xe', 'View đẹp',
]

export function removeVietnameseTones(str) {
  if (!str) return '';
  str = String(str).toLowerCase().trim();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  return str;
}

export const PRICE_RANGES = [
  { label: 'Tất cả', min: 0, max: 0 },
  { label: 'Dưới 2 triệu', min: 0, max: 2_000_000 },
  { label: '2 – 3 triệu', min: 2_000_000, max: 3_000_000 },
  { label: '3 – 5 triệu', min: 3_000_000, max: 5_000_000 },
  { label: '5 – 8 triệu', min: 5_000_000, max: 8_000_000 },
  { label: 'Trên 8 triệu', min: 8_000_000, max: 0 },
]
