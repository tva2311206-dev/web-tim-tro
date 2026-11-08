import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Building2,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Home,
  Search,
  PlusCircle,
  Bot,
  Shield,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  { label: 'Trang chủ', to: '/', icon: Home },
  { label: 'Tìm phòng', to: '/tim-phong', icon: Search },
  { label: 'Đăng tin cho thuê', to: '/dang-tin', icon: PlusCircle },
  { label: 'Trợ lý AI', to: '/tro-ly-ai', icon: Bot },
]

export default function Header() {
  const { user, token, logout, isAdmin } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
    setDropdownOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    setMobileOpen(false)
    toast.success('Đã đăng xuất thành công!')
    navigate('/')
  }

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  const getAvatarInitial = () => {
    if (!user) return 'U'
    if (user.name) return user.name.charAt(0).toUpperCase()
    if (user.email) return user.email.charAt(0).toUpperCase()
    return 'U'
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-9 h-9 bg-navy rounded-xl flex items-center justify-center shadow group-hover:shadow-md transition-shadow">
              <Building2 className="w-5 h-5 text-orange-earth" />
            </div>
            <span className="font-bold text-xl text-navy leading-none">
              YouRoom{' '}
              <span className="text-orange-earth">AI</span>
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive(to)
                    ? 'bg-blue-light text-navy font-semibold'
                    : 'text-gray-600 hover:text-navy hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* ── Desktop Auth ── */}
          <div className="hidden md:flex items-center gap-2">
            {!token ? (
              <>
                <Link to="/dang-nhap" className="btn-ghost text-sm px-4 py-2">
                  Đăng nhập
                </Link>
                <Link to="/dang-ky" className="btn-outline text-sm px-4 py-2">
                  Đăng ký
                </Link>
                <Link to="/dang-tin" className="btn-primary text-sm px-4 py-2">
                  Đăng tin miễn phí
                </Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getAvatarInitial()
                    )}
                  </div>
                  <span className="text-sm font-medium text-navy max-w-[120px] truncate">
                    {user?.name || user?.email || 'Tài khoản'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                        Đã đăng nhập
                      </p>
                      <p className="text-sm font-semibold text-navy truncate mt-0.5">
                        {user?.name || user?.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/tai-khoan"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-light hover:text-navy transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Tài khoản của tôi
                      </Link>

                      <Link
                        to="/tai-khoan/phong-cua-toi"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-light hover:text-navy transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Building2 className="w-4 h-4" />
                        Phòng của tôi
                      </Link>

                      {isAdmin() && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-orange-earth hover:bg-orange-50 transition-colors font-medium"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Shield className="w-4 h-4" />
                          Quản trị viên
                        </Link>
                      )}

                      <Link
                        to="/tai-khoan/cai-dat"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-light hover:text-navy transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Cài đặt
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
          <nav className="px-4 py-3 space-y-1">
            {NAV_LINKS.map(({ label, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-blue-light text-navy font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-navy'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="px-4 py-3 border-t border-gray-100 space-y-2">
            {!token ? (
              <>
                <Link
                  to="/dang-nhap"
                  className="btn-ghost w-full text-center text-sm py-2.5"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/dang-ky"
                  className="btn-outline w-full text-center text-sm py-2.5"
                >
                  Đăng ký
                </Link>
                <Link
                  to="/dang-tin"
                  className="btn-primary w-full text-center text-sm py-2.5"
                >
                  Đăng tin miễn phí
                </Link>
              </>
            ) : (
              <>
                {/* Mobile user info */}
                <div className="flex items-center gap-3 px-2 py-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-white font-bold">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getAvatarInitial()
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-navy text-sm">
                      {user?.name || 'Người dùng'}
                    </p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                </div>

                <Link
                  to="/tai-khoan"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-blue-light hover:text-navy transition-colors"
                >
                  <User className="w-4 h-4" />
                  Tài khoản của tôi
                </Link>

                <Link
                  to="/tai-khoan/phong-cua-toi"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-blue-light hover:text-navy transition-colors"
                >
                  <Building2 className="w-4 h-4" />
                  Phòng của tôi
                </Link>

                {isAdmin() && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-orange-earth font-medium hover:bg-orange-50 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Quản trị viên
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
