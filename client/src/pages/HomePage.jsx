import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Search, Bot, Sparkles, MapPin, Home, Building2, GraduationCap,
  Leaf, Users, Zap, FileText, SlidersHorizontal, Smartphone,
  ArrowRight, X, Loader2, ChevronRight, Star, TrendingUp,
} from 'lucide-react'
import { aiApi, roomApi } from '../services/api'
import { formatPrice, CITIES, ROOM_TYPES, PRICE_RANGES } from '../utils/helpers'
import RoomCard from '../components/room/RoomCard'

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="bg-gray-200 rounded-xl h-48 w-full mb-4" />
      <div className="space-y-2 p-1">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="flex gap-2 mt-3">
          <div className="h-6 bg-gray-200 rounded-full w-16" />
          <div className="h-6 bg-gray-200 rounded-full w-16" />
        </div>
      </div>
    </div>
  )
}

// ─── CATEGORIES DATA ──────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    emoji: '🏠',
    title: 'Phòng giá rẻ',
    subtitle: 'Dưới 2 triệu/tháng',
    href: '/tim-phong?maxPrice=2000000',
    color: 'from-orange-50 to-orange-100',
    hoverColor: 'hover:from-navy hover:to-navy/90',
  },
  {
    emoji: '🛋️',
    title: 'Full nội thất',
    subtitle: 'Tiện nghi đầy đủ',
    href: '/tim-phong?keyword=nội thất',
    color: 'from-blue-50 to-blue-100',
    hoverColor: 'hover:from-navy hover:to-navy/90',
  },
  {
    emoji: '🏢',
    title: 'Căn hộ mini',
    subtitle: 'Không gian riêng tư',
    href: '/tim-phong?roomType=CAN_HO_MINI',
    color: 'from-purple-50 to-purple-100',
    hoverColor: 'hover:from-navy hover:to-navy/90',
  },
  {
    emoji: '🎓',
    title: 'Gần trường ĐH',
    subtitle: 'Thuận tiện đi học',
    href: '/tim-phong?keyword=đại học',
    color: 'from-green-50 to-green-100',
    hoverColor: 'hover:from-navy hover:to-navy/90',
  },
  {
    emoji: '🌿',
    title: 'Có ban công',
    subtitle: 'View thoáng mát',
    href: '/tim-phong?keyword=ban công',
    color: 'from-teal-50 to-teal-100',
    hoverColor: 'hover:from-navy hover:to-navy/90',
  },
  {
    emoji: '👨‍🎓',
    title: 'Dành cho sinh viên',
    subtitle: 'Giá ưu đãi, an toàn',
    href: '/tim-phong?keyword=sinh viên',
    color: 'from-yellow-50 to-yellow-100',
    hoverColor: 'hover:from-navy hover:to-navy/90',
  },
]

// ─── WHY CHOOSE US DATA ───────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Bot,
    emoji: '🤖',
    title: 'Tìm kiếm thông minh với AI',
    desc: 'Mô tả nhu cầu bằng ngôn ngữ tự nhiên, AI phân tích và tìm phòng phù hợp nhất cho bạn.',
  },
  {
    icon: FileText,
    emoji: '📋',
    title: 'Thông tin phòng rõ ràng',
    desc: 'Đầy đủ ảnh, giá, tiện ích, chi phí điện nước và thông tin chủ nhà minh bạch.',
  },
  {
    icon: SlidersHorizontal,
    emoji: '🔍',
    title: 'Bộ lọc linh hoạt',
    desc: 'Lọc theo khu vực, giá, diện tích, loại phòng và nhiều tiêu chí khác dễ dàng.',
  },
  {
    icon: Smartphone,
    emoji: '📱',
    title: 'Kết nối trực tiếp',
    desc: 'Liên hệ trực tiếp với chủ trọ, không qua trung gian, nhanh chóng và tiết kiệm.',
  },
]

// ─── AI QUICK SUGGESTIONS ─────────────────────────────────────────────────────
const AI_SUGGESTIONS = [
  'Phòng dưới 2 triệu',
  'Gần trường đại học',
  'Phòng có ban công',
  'Phòng cho 2 người',
  'Có điều hòa và máy giặt',
]

// ═════════════════════════════════════════════════════════════════════════════
//  HOMEPAGE COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function HomePage() {
  const navigate = useNavigate()

  // ── Hero search form state ──────────────────────────────────────────────
  const [heroSearch, setHeroSearch] = useState({
    city: '',
    roomType: '',
    priceRange: '',
    keyword: '',
  })

  // ── Featured rooms state ────────────────────────────────────────────────
  const [featuredRooms, setFeaturedRooms] = useState([])
  const [featuredLoading, setFeaturedLoading] = useState(true)

  // ── AI search state ─────────────────────────────────────────────────────
  const [aiQuery, setAiQuery] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResults, setAiResults] = useState([])
  const [aiMessage, setAiMessage] = useState('')
  const [isDemo, setIsDemo] = useState(false)
  const aiResultsRef = useRef(null)

  // ── Fetch featured rooms on mount ───────────────────────────────────────
  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await roomApi.getFeatured()
        setFeaturedRooms(res.data?.data || res.data || [])
      } catch {
        // silently fail – show empty state
      } finally {
        setFeaturedLoading(false)
      }
    }
    loadFeatured()
  }, [])

  // ── Hero search submit ──────────────────────────────────────────────────
  const handleHeroSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (heroSearch.city) params.set('city', heroSearch.city)
    if (heroSearch.roomType) params.set('roomType', heroSearch.roomType)
    if (heroSearch.priceRange) {
      const range = PRICE_RANGES.find((_, i) => String(i) === heroSearch.priceRange)
      if (range) {
        if (range.min) params.set('minPrice', range.min)
        if (range.max) params.set('maxPrice', range.max)
      }
    }
    if (heroSearch.keyword) params.set('keyword', heroSearch.keyword)
    navigate(`/tim-phong${params.toString() ? '?' + params.toString() : ''}`)
  }

  // ── AI search submit ────────────────────────────────────────────────────
  const handleAiSearch = async () => {
    const q = aiQuery.trim()
    if (!q) {
      toast.error('Vui lòng nhập mô tả nhu cầu tìm phòng của bạn.')
      return
    }
    setAiLoading(true)
    setAiResults([])
    setAiMessage('')
    setIsDemo(false)
    try {
      const res = await aiApi.search(q)
      const data = res.data
      setAiResults(data?.rooms || data?.data || [])
      setAiMessage(data?.message || data?.aiMessage || '')
      if (data?.isDemo || data?.provider === 'mock') setIsDemo(true)
      // Scroll to results
      setTimeout(() => {
        aiResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.'
      toast.error(msg)
    } finally {
      setAiLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setAiQuery(suggestion)
  }

  const handleClearAi = () => {
    setAiQuery('')
    setAiResults([])
    setAiMessage('')
    setIsDemo(false)
  }

  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-cream">

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1 — HERO
      ═══════════════════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-[70vh] flex items-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #173B57 0%, #1e5080 50%, #EAF4FB 100%)',
        }}
      >
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1600&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-navy/30" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* LEFT — Copy */}
            <div className="text-white space-y-6">
              {/* AI badge */}
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-1.5 text-sm font-medium text-white">
                <Bot size={15} />
                Tìm phòng thông minh với AI
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                Tìm phòng trọ phù hợp –<br />
                <span className="text-orange-earth">Bắt đầu hành trình mới</span>
              </h1>

              <p className="text-blue-100 text-base sm:text-lg leading-relaxed max-w-lg">
                Khám phá hàng nghìn phòng trọ phù hợp với ngân sách, vị trí và nhu cầu của bạn.
                Để AI giúp bạn tìm được nơi ở lý tưởng.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  to="/tim-phong"
                  className="inline-flex items-center gap-2 bg-orange-earth hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-orange-earth/40 hover:-translate-y-0.5"
                >
                  <Search size={18} />
                  Tìm phòng ngay
                </Link>
                <Link
                  to="/tro-ly-ai"
                  className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Sparkles size={18} />
                  Tìm phòng bằng AI
                </Link>
              </div>

              {/* Stats bar */}
              <div className="flex flex-wrap gap-6 pt-4 border-t border-white/20">
                {[
                  { label: 'phòng trọ', value: '1,200+', icon: Home },
                  { label: 'người dùng', value: '5,000+', icon: Users },
                  { label: 'quận huyện', value: '50+', icon: MapPin },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="bg-white/15 rounded-lg p-1.5">
                      <Icon size={14} className="text-orange-earth" />
                    </div>
                    <div>
                      <span className="font-bold text-white text-lg">{value}</span>
                      <span className="text-blue-200 text-sm ml-1">{label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Search card */}
            <div className="bg-white rounded-2xl shadow-2xl shadow-navy/20 p-6 space-y-4">
              <h2 className="text-navy font-bold text-xl flex items-center gap-2">
                <Search size={20} className="text-orange-earth" />
                Tìm phòng nhanh
              </h2>

              <form onSubmit={handleHeroSearch} className="space-y-3">
                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-1">Thành phố</label>
                  <select
                    className="select-field"
                    value={heroSearch.city}
                    onChange={(e) => setHeroSearch((p) => ({ ...p, city: e.target.value }))}
                  >
                    <option value="">Tất cả thành phố</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Room type */}
                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-1">Loại phòng</label>
                  <select
                    className="select-field"
                    value={heroSearch.roomType}
                    onChange={(e) => setHeroSearch((p) => ({ ...p, roomType: e.target.value }))}
                  >
                    {ROOM_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Price range */}
                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-1">Khoảng giá</label>
                  <select
                    className="select-field"
                    value={heroSearch.priceRange}
                    onChange={(e) => setHeroSearch((p) => ({ ...p, priceRange: e.target.value }))}
                  >
                    {PRICE_RANGES.map((r, i) => (
                      <option key={i} value={i}>{r.label}</option>
                    ))}
                  </select>
                </div>

                {/* Keyword */}
                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-1">Từ khoá</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Địa chỉ, tiện ích, mô tả..."
                    value={heroSearch.keyword}
                    onChange={(e) => setHeroSearch((p) => ({ ...p, keyword: e.target.value }))}
                  />
                </div>

                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                  <Search size={18} />
                  Tìm kiếm
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2 — AI SEARCH
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-blue-light py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">

            {/* Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 bg-navy/10 border border-navy/20 rounded-full px-4 py-1.5 text-sm font-semibold text-navy">
                <Sparkles size={15} className="text-orange-earth" />
                Powered by AI
              </div>
            </div>

            <h2 className="section-title text-center">Bạn muốn tìm phòng như thế nào?</h2>
            <p className="section-subtitle text-center max-w-xl mx-auto">
              Chỉ cần mô tả nhu cầu bằng ngôn ngữ tự nhiên, AI sẽ giúp bạn tìm kiếm phòng phù hợp.
            </p>

            {/* Textarea */}
            <div className="relative mt-6">
              <textarea
                rows={4}
                className="w-full input-field resize-none text-base leading-relaxed pr-12"
                placeholder="Ví dụ: Tôi cần phòng dưới 3 triệu, gần Học viện Kỹ thuật Mật mã, có điều hòa, nhà vệ sinh riêng và chỗ để xe..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) handleAiSearch()
                }}
              />
              {aiQuery && (
                <button
                  onClick={handleClearAi}
                  className="absolute top-3 right-3 text-gray-400 hover:text-navy transition-colors"
                  title="Xóa nội dung"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Quick suggestion chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              {AI_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestionClick(s)}
                  className="inline-flex items-center gap-1 bg-white border border-navy/20 hover:border-navy hover:bg-navy hover:text-white text-navy text-sm font-medium px-3 py-1.5 rounded-full transition-all duration-150"
                >
                  <ChevronRight size={12} />
                  {s}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mt-5">
              <button
                onClick={handleAiSearch}
                disabled={aiLoading}
                className="btn-primary flex items-center gap-2 px-6 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {aiLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Bot size={18} />
                )}
                {aiLoading ? 'Đang tìm kiếm...' : '🤖 AI tìm phòng cho tôi'}
              </button>
              {(aiQuery || aiResults.length > 0) && (
                <button
                  onClick={handleClearAi}
                  className="btn-ghost flex items-center gap-2 px-5 py-3"
                >
                  <X size={16} />
                  Xóa nội dung
                </button>
              )}
            </div>

            {/* Demo notice */}
            {isDemo && (
              <div className="mt-4 inline-flex items-center gap-2 bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm font-medium px-4 py-2 rounded-full">
                <Sparkles size={14} />
                Chế độ demo – dữ liệu mô phỏng
              </div>
            )}

            {/* AI Message speech bubble */}
            {aiMessage && (
              <div className="mt-6 relative bg-white border border-navy/15 rounded-2xl rounded-tl-none shadow-sm p-4">
                <div className="absolute -top-3 left-4 bg-navy text-white rounded-full p-1.5 shadow">
                  <Bot size={14} />
                </div>
                <p className="text-navy/80 text-sm leading-relaxed pt-1">{aiMessage}</p>
              </div>
            )}
          </div>

          {/* AI Results */}
          {(aiLoading || aiResults.length > 0) && (
            <div ref={aiResultsRef} className="mt-12">
              <h3 className="text-xl font-bold text-navy text-center mb-6 flex items-center justify-center gap-2">
                <TrendingUp size={20} className="text-orange-earth" />
                {aiLoading ? 'AI đang tìm phòng phù hợp...' : `Tìm thấy ${aiResults.length} phòng phù hợp`}
              </h3>
              {aiLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {aiResults.map((room) => (
                    <RoomCard key={room._id || room.id} room={room} />
                  ))}
                </div>
              )}
              {!aiLoading && aiResults.length === 0 && (
                <p className="text-center text-navy/60 py-8">AI không tìm thấy phòng phù hợp. Hãy thử mô tả khác.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3 — FEATURED ROOMS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-cream py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star size={18} className="text-orange-earth fill-orange-earth" />
                <span className="text-sm font-semibold text-orange-earth uppercase tracking-wide">Nổi bật</span>
              </div>
              <h2 className="section-title mb-1">Phòng trọ nổi bật</h2>
              <p className="section-subtitle">Khám phá các phòng trọ được đánh giá cao nhất</p>
            </div>
            <Link
              to="/tim-phong"
              className="btn-outline inline-flex items-center gap-2 shrink-0"
            >
              Xem tất cả phòng
              <ArrowRight size={16} />
            </Link>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : featuredRooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRooms.map((room) => (
                <RoomCard key={room._id || room.id} room={room} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-navy/50">
              <Home size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-lg">Chưa có phòng nổi bật. Hãy quay lại sau!</p>
            </div>
          )}

          {!featuredLoading && featuredRooms.length > 0 && (
            <div className="text-center mt-10">
              <Link to="/tim-phong" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
                Xem tất cả phòng trọ
                <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4 — CATEGORIES
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="section-title">Danh mục phòng trọ</h2>
            <p className="section-subtitle">Chọn danh mục phù hợp với nhu cầu của bạn</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.title}
                to={cat.href}
                className={`
                  group relative flex flex-col items-center text-center p-5 rounded-2xl
                  bg-gradient-to-br ${cat.color} ${cat.hoverColor}
                  border border-transparent hover:border-navy/10
                  transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-navy/10
                `}
              >
                <span className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
                  {cat.emoji}
                </span>
                <h3 className="font-bold text-navy group-hover:text-white text-sm leading-tight mb-1 transition-colors duration-200">
                  {cat.title}
                </h3>
                <p className="text-xs text-navy/60 group-hover:text-white/80 transition-colors duration-200">
                  {cat.subtitle}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 5 — WHY CHOOSE US
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-cream py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="section-title">Vì sao chọn YouRoom AI?</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              Nền tảng tìm phòng trọ thông minh hàng đầu, kết hợp AI và dữ liệu thực tế.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {FEATURES.map(({ icon: Icon, emoji, title, desc }) => (
              <div
                key={title}
                className="group bg-green-light hover:bg-navy rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/15 cursor-default"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-white group-hover:bg-white/15 rounded-xl p-3 shrink-0 transition-colors duration-200">
                    <Icon size={24} className="text-navy group-hover:text-white transition-colors duration-200" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy group-hover:text-white text-base mb-2 transition-colors duration-200">
                      {title}
                    </h3>
                    <p className="text-navy/70 group-hover:text-white/80 text-sm leading-relaxed transition-colors duration-200">
                      {desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 6 — LANDLORD CTA
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-navy py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-white">
              <Building2 size={15} />
              Dành cho chủ nhà
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Bạn có phòng trọ cần cho thuê?
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Đăng tin miễn phí, tiếp cận người thuê phù hợp và quản lý phòng trọ dễ dàng.
            </p>

            <div className="flex flex-wrap gap-4 justify-center pt-2">
              <Link
                to="/dang-tin"
                className="inline-flex items-center gap-2 bg-orange-earth hover:bg-orange-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-orange-earth/30 hover:-translate-y-0.5 text-base"
              >
                <Zap size={20} />
                Đăng tin ngay
              </Link>
              <Link
                to="/tim-phong"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 text-base"
              >
                <Search size={18} />
                Khám phá phòng trọ
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 pt-4 border-t border-white/15">
              {[
                { icon: Zap, label: 'Đăng tin miễn phí' },
                { icon: Users, label: 'Tiếp cận 5,000+ người thuê' },
                { icon: Star, label: 'Hỗ trợ 24/7' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-white/70 text-sm">
                  <Icon size={15} className="text-orange-earth" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
