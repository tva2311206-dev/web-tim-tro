import { Link } from 'react-router-dom'
import { Building2, Mail, Phone, MapPin, Heart } from 'lucide-react'

// Simple SVG social icons
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

const EXPLORE_LINKS = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Tìm phòng', to: '/tim-phong' },
  { label: 'Đăng tin cho thuê', to: '/dang-tin' },
  { label: 'Phòng nổi bật', to: '/tim-phong?featured=true' },
  { label: 'Mới đăng gần đây', to: '/tim-phong?sort=newest' },
]

const SUPPORT_LINKS = [
  { label: 'Trợ lý AI', to: '/tro-ly-ai' },
  { label: 'Hướng dẫn sử dụng', to: '/huong-dan' },
  { label: 'Điều khoản sử dụng', to: '/dieu-khoan' },
  { label: 'Chính sách bảo mật', to: '/chinh-sach-bao-mat' },
  { label: 'Câu hỏi thường gặp', to: '/faq' },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-navy text-white">
      {/* ── Main Footer Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* ── Brand Column ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 group mb-4">
              <div className="w-9 h-9 bg-orange-earth rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white leading-none">
                YouRoom <span className="text-orange-earth">AI</span>
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
              Nền tảng tìm kiếm và đăng tin phòng trọ thông minh hàng đầu Việt Nam.
              Kết nối người thuê và chủ nhà nhanh chóng, tiện lợi với sự hỗ trợ của
              trí tuệ nhân tạo.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-orange-earth transition-colors duration-200"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-orange-earth transition-colors duration-200"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Youtube"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-orange-earth transition-colors duration-200"
              >
                <YoutubeIcon />
              </a>
            </div>
          </div>

          {/* ── Khám phá ── */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-5">
              Khám phá
            </h3>
            <ul className="space-y-3">
              {EXPLORE_LINKS.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-white/60 text-sm hover:text-orange-earth transition-colors duration-150 hover:translate-x-1 inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Hỗ trợ ── */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-5">
              Hỗ trợ
            </h3>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-white/60 text-sm hover:text-orange-earth transition-colors duration-150 hover:translate-x-1 inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Liên hệ ── */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-5">
              Liên hệ
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:hello@youroom.ai"
                  className="flex items-start gap-3 text-white/60 text-sm hover:text-orange-earth transition-colors group"
                >
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 group-hover:text-orange-earth" />
                  <span>hello@youroom.ai</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:1800968766"
                  className="flex items-start gap-3 text-white/60 text-sm hover:text-orange-earth transition-colors group"
                >
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 group-hover:text-orange-earth" />
                  <span>1800-YOUROOM</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-white/60 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    268 Lý Thường Kiệt, Phường 14,<br />
                    Quận 10, TP. Hồ Chí Minh
                  </span>
                </div>
              </li>
            </ul>

            {/* Newsletter teaser */}
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-xs text-white/70 font-medium mb-2">
                📬 Nhận tin tức mới nhất
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/40 text-xs rounded-lg px-3 py-2 outline-none focus:border-orange-earth transition-colors"
                />
                <button className="bg-orange-earth text-white text-xs px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium flex-shrink-0">
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-white/10" />

      {/* ── Bottom Bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs text-center sm:text-left">
            © {currentYear} YouRoom AI. Tất cả quyền được bảo lưu.
          </p>
          <p className="text-white/40 text-xs flex items-center gap-1 text-center sm:text-right">
            Thiết kế và phát triển bởi{' '}
            <Heart className="w-3 h-3 text-orange-earth inline fill-current" />{' '}
            <span className="text-orange-earth font-medium">YouRoom AI Team</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
