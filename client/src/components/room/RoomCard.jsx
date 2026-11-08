import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MapPin, Maximize2, Users, Check, Image } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { favoriteApi } from '../../services/api'
import {
  formatPriceFull,
  formatArea,
  getRoomTypeLabel,
  getStatusLabel,
  getStatusClass,
} from '../../utils/helpers'
import toast from 'react-hot-toast'

/**
 * RoomCard
 * @param {Object}   room              - Room data object from API
 * @param {boolean}  showStatus        - Whether to show approval status badge
 * @param {boolean}  isFavorited       - Initial favorite state
 * @param {Function} onFavoriteChange  - Called with (roomId, newState) after toggle
 */
export default function RoomCard({
  room,
  showStatus = false,
  isFavorited = false,
  onFavoriteChange,
}) {
  const { token } = useAuthStore()
  const [favorited, setFavorited] = useState(isFavorited)
  const [favLoading, setFavLoading] = useState(false)

  if (!room) return null

  const {
    _id,
    id,
    title,
    price,
    city,
    district,
    area,
    maxOccupants,
    roomType,
    amenities = [],
    images = [],
    status,
  } = room

  const roomId = _id || id
  const coverImage = images?.[0]?.url || images?.[0] || null
  const topAmenities = amenities.slice(0, 3)
  const showStatusBadge = showStatus && status && status !== 'APPROVED'

  /* ── Favorite toggle ── */
  const handleFavorite = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!token) {
      toast.error('Vui lòng đăng nhập để lưu phòng yêu thích!')
      return
    }

    setFavLoading(true)
    try {
      if (favorited) {
        await favoriteApi.remove(roomId)
        setFavorited(false)
        toast.success('Đã xóa khỏi yêu thích')
        onFavoriteChange?.(roomId, false)
      } else {
        await favoriteApi.add(roomId)
        setFavorited(true)
        toast.success('Đã thêm vào yêu thích!')
        onFavoriteChange?.(roomId, true)
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setFavLoading(false)
    }
  }

  return (
    <div className="card group flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full">
      {/* ── Image ── */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-light to-green-light flex-shrink-0">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-navy/30">
            <Image className="w-12 h-12" />
            <span className="text-xs font-medium">Chưa có ảnh</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

        {/* Room type badge (top-left) */}
        <div className="absolute top-3 left-3">
          <span className="badge bg-navy/80 text-white backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-lg">
            {getRoomTypeLabel(roomType)}
          </span>
        </div>

        {/* Favorite button (top-right) */}
        <button
          onClick={handleFavorite}
          disabled={favLoading}
          aria-label={favorited ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-200 shadow-md
            ${favorited
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-white/80 text-gray-400 hover:bg-white hover:text-red-400'
            }
            ${favLoading ? 'opacity-60 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}
          `}
        >
          <Heart
            className={`w-4 h-4 transition-transform ${favLoading ? 'animate-pulse' : ''}`}
            fill={favorited ? 'currentColor' : 'none'}
          />
        </button>

        {/* Status badge (only if not APPROVED) */}
        {showStatusBadge && (
          <div className="absolute bottom-3 left-3">
            <span className={`badge text-xs font-semibold px-2.5 py-1 rounded-lg ${getStatusClass(status)}`}>
              {getStatusLabel(status)}
            </span>
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Title */}
        <h3 className="text-navy font-semibold text-sm leading-snug line-clamp-2 group-hover:text-orange-earth transition-colors min-h-[2.5rem]">
          {title || 'Phòng trọ chưa có tiêu đề'}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-orange-earth font-bold text-lg">
            {formatPriceFull(price)}
          </span>
          <span className="text-gray-400 text-xs">/tháng</span>
        </div>

        {/* Meta info */}
        <div className="flex flex-col gap-1.5 text-xs text-gray-500">
          {/* Location */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">
              {[district, city].filter(Boolean).join(', ') || 'Chưa cập nhật địa chỉ'}
            </span>
          </div>

          {/* Area & Occupants */}
          <div className="flex items-center gap-4">
            {area && (
              <div className="flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span>{formatArea(area)}</span>
              </div>
            )}
            {maxOccupants && (
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span>Tối đa {maxOccupants} người</span>
              </div>
            )}
          </div>
        </div>

        {/* Amenities chips */}
        {topAmenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topAmenities.map((amenity, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-xs bg-green-light text-navy px-2 py-0.5 rounded-full font-medium"
              >
                <Check className="w-3 h-3 flex-shrink-0" />
                {typeof amenity === 'string' ? amenity : amenity?.name || amenity?.label || 'Tiện ích'}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="text-xs text-gray-400 self-center">
                +{amenities.length - 3} khác
              </span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA Button */}
        <Link
          to={`/phong/${roomId}`}
          className="btn-outline w-full text-center text-sm py-2.5 mt-1 !rounded-xl hover:!bg-navy hover:!text-white hover:!border-navy transition-colors"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  )
}
