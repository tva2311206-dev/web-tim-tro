import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Filter, SlidersHorizontal, Search, RotateCcw, Home, Sparkles, 
  MapPin, ChevronLeft, ChevronRight, X, DollarSign, Check, Tag
} from 'lucide-react';
import RoomCard from '../components/room/RoomCard';
import { roomApi } from '../services/api';
import { CITIES, ROOM_TYPES, AMENITIES_LIST, formatPrice, PRICE_RANGES, getRoomTypeLabel } from '../utils/helpers';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [district, setDistrict] = useState(searchParams.get('district') || '');
  const [roomType, setRoomType] = useState(searchParams.get('roomType') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [maxOccupants, setMaxOccupants] = useState(searchParams.get('maxOccupants') || '');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  // Data state
  const [rooms, setRooms] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Khởi tạo từ URL params một lần khi mount
  useEffect(() => {
    if (searchParams.get('keyword')) setKeyword(searchParams.get('keyword'));
    if (searchParams.get('city')) setCity(searchParams.get('city'));
    if (searchParams.get('district')) setDistrict(searchParams.get('district'));
    if (searchParams.get('roomType')) setRoomType(searchParams.get('roomType'));
    if (searchParams.get('minPrice')) setMinPrice(searchParams.get('minPrice'));
    if (searchParams.get('maxPrice')) setMaxPrice(searchParams.get('maxPrice'));
    if (searchParams.get('maxOccupants')) setMaxOccupants(searchParams.get('maxOccupants'));
  }, []);

  // Tự động lọc ngay mỗi khi BẤT KỲ 1 tiêu chí nào thay đổi (Realtime Instant Filter)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRooms();
      syncUrlParams();
    }, 200); // Debounce nhẹ 200ms khi gõ

    return () => clearTimeout(timer);
  }, [keyword, city, district, roomType, minPrice, maxPrice, maxOccupants, selectedAmenities, sort, page]);

  const syncUrlParams = () => {
    const newParams = {};
    if (keyword) newParams.keyword = keyword;
    if (city) newParams.city = city;
    if (district) newParams.district = district;
    if (roomType) newParams.roomType = roomType;
    if (minPrice) newParams.minPrice = minPrice;
    if (maxPrice) newParams.maxPrice = maxPrice;
    if (maxOccupants) newParams.maxOccupants = maxOccupants;
    setSearchParams(newParams, { replace: true });
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = {
        keyword: keyword.trim() || undefined,
        city: city || undefined,
        district: district.trim() || undefined,
        roomType: roomType || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        maxOccupants: maxOccupants || undefined,
        amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
        sort,
        page,
        limit: 9,
      };

      const res = await roomApi.getAll(params);
      if (res.data && res.data.data) {
        setRooms(res.data.data.rooms || []);
        setTotal(res.data.data.total || 0);
        setTotalPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Fetch rooms error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    fetchRooms();
    setMobileFilterOpen(false);
  };

  const handleResetFilter = () => {
    setKeyword('');
    setCity('');
    setDistrict('');
    setRoomType('');
    setMinPrice('');
    setMaxPrice('');
    setMaxOccupants('');
    setSelectedAmenities([]);
    setSearchParams({}, { replace: true });
    setPage(1);
  };

  const toggleAmenity = (amenity) => {
    setPage(1);
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleSelectQuickPrice = (min, max) => {
    setPage(1);
    setMinPrice(min > 0 ? String(min) : '');
    setMaxPrice(max > 0 ? String(max) : '');
  };

  // Đếm số lượng tiêu chí đang được áp dụng
  const activeFiltersCount = [
    keyword, city, district, roomType, minPrice, maxPrice, maxOccupants,
  ].filter(Boolean).length + selectedAmenities.length;

  return (
    <div className="bg-cream min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-navy tracking-tight">Tìm kiếm phòng trọ</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Chỉ cần chọn hoặc nhập 1 thông tin bất kỳ bên dưới, hệ thống sẽ tự động lọc phòng trọ phù hợp ngay lập tức!
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-navy rounded-xl text-sm font-semibold shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-orange-earth" />
              Bộ lọc {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>

            {/* Sort Dropdown */}
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="bg-white border border-gray-200 text-navy text-sm font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:border-navy shadow-xs cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
              <option value="area_asc">Diện tích: Tăng dần</option>
            </select>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex gap-8 items-start">

          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-72 bg-white rounded-2xl p-6 border border-gray-100 shadow-card sticky top-28 shrink-0">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-orange-earth" />
                <h2 className="font-bold text-navy text-base">Bộ lọc linh hoạt</h2>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilter}
                  className="text-xs text-orange-earth hover:text-navy flex items-center gap-1 font-semibold transition-colors"
                  title="Xóa tất cả tiêu chí"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Xóa lọc ({activeFiltersCount})
                </button>
              )}
            </div>

            <form onSubmit={handleApplyFilter} className="space-y-5 text-sm">
              {/* Tỉnh / Thành phố */}
              <div>
                <label className="block font-semibold text-navy mb-1.5 text-xs uppercase tracking-wider">
                  Tỉnh / Thành phố
                </label>
                <select
                  value={city}
                  onChange={(e) => { setCity(e.target.value); setPage(1); }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-navy focus:bg-white focus:outline-none focus:border-navy text-sm cursor-pointer"
                >
                  <option value="">Tất cả tỉnh thành</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Quận / Huyện */}
              <div>
                <label className="block font-semibold text-navy mb-1.5 text-xs uppercase tracking-wider">
                  Quận / Huyện
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => { setDistrict(e.target.value); setPage(1); }}
                  placeholder="Gõ quận: Cầu Giấy, Đống Đa..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-navy focus:bg-white focus:outline-none focus:border-navy text-sm"
                />
              </div>

              {/* Loại phòng */}
              <div>
                <label className="block font-semibold text-navy mb-1.5 text-xs uppercase tracking-wider">
                  Loại phòng
                </label>
                <select
                  value={roomType}
                  onChange={(e) => { setRoomType(e.target.value); setPage(1); }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-navy focus:bg-white focus:outline-none focus:border-navy text-sm cursor-pointer"
                >
                  {ROOM_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Mức giá */}
              <div>
                <label className="block font-semibold text-navy mb-1.5 text-xs uppercase tracking-wider">
                  Khoảng giá (VNĐ)
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                    placeholder="Giá từ"
                    step="500000"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-navy text-xs focus:bg-white focus:outline-none focus:border-navy"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                    placeholder="Giá đến"
                    step="500000"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-navy text-xs focus:bg-white focus:outline-none focus:border-navy"
                  />
                </div>

                {/* Gợi ý chọn nhanh khoảng giá */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSelectQuickPrice(0, 2000000)}
                    className="text-[11px] px-2 py-1 rounded-lg bg-gray-100 hover:bg-navy hover:text-white text-gray-700 transition-all font-medium"
                  >
                    Dưới 2tr
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectQuickPrice(2000000, 3500000)}
                    className="text-[11px] px-2 py-1 rounded-lg bg-gray-100 hover:bg-navy hover:text-white text-gray-700 transition-all font-medium"
                  >
                    2 - 3.5tr
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectQuickPrice(3500000, 5000000)}
                    className="text-[11px] px-2 py-1 rounded-lg bg-gray-100 hover:bg-navy hover:text-white text-gray-700 transition-all font-medium"
                  >
                    3.5 - 5tr
                  </button>
                </div>
              </div>

              {/* Sức chứa */}
              <div>
                <label className="block font-semibold text-navy mb-1.5 text-xs uppercase tracking-wider">
                  Sức chứa tối đa
                </label>
                <select
                  value={maxOccupants}
                  onChange={(e) => { setMaxOccupants(e.target.value); setPage(1); }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-navy focus:bg-white focus:outline-none focus:border-navy text-sm cursor-pointer"
                >
                  <option value="">Tất cả</option>
                  <option value="1">1 người</option>
                  <option value="2">2 người</option>
                  <option value="3">3 người</option>
                  <option value="4">4+ người</option>
                </select>
              </div>

              {/* Tiện ích */}
              <div>
                <label className="block font-semibold text-navy mb-2 text-xs uppercase tracking-wider">
                  Tiện ích nổi bật
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {AMENITIES_LIST.slice(0, 10).map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 hover:text-navy">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="rounded text-navy focus:ring-navy w-4 h-4 accent-navy"
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset All */}
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-50 transition-all"
                >
                  Xóa tất cả bộ lọc
                </button>
              )}
            </form>
          </aside>

          {/* Right Room Listing Grid */}
          <main className="flex-1 w-full">
            
            {/* Search Input Bar (Instant) */}
            <div className="bg-white rounded-2xl p-2.5 border border-gray-100 shadow-sm mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400 ml-2 shrink-0" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
                placeholder="Tìm tự do theo tên đường, trường ĐH (VD: Mật mã, Cầu Giấy, Ban công...)"
                className="w-full text-sm font-medium text-navy placeholder:text-gray-400 focus:outline-none py-1.5"
              />
              {keyword && (
                <button
                  onClick={() => setKeyword('')}
                  className="p-1 text-gray-400 hover:text-navy text-xs mr-1"
                  title="Xóa từ khóa"
                >
                  ✕
                </button>
              )}
              <button
                onClick={handleApplyFilter}
                className="px-5 py-2.5 bg-orange-earth text-white font-bold text-xs rounded-xl hover:bg-orange-600 transition-all shrink-0"
              >
                Tìm
              </button>
            </div>

            {/* Active Filters Badges Row (Chỉ cần 1 thông tin cũng hiển thị rõ tag để người dùng thấy) */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-white/70 rounded-2xl border border-gray-100 text-xs">
                <span className="font-bold text-navy flex items-center gap-1 text-[11px] uppercase tracking-wider text-gray-400">
                  <Tag className="w-3.5 h-3.5" /> Đang lọc theo:
                </span>

                {city && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-light text-navy font-semibold">
                    📍 {city}
                    <button onClick={() => setCity('')} className="hover:text-red-500 font-bold ml-1">✕</button>
                  </span>
                )}

                {district && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-light text-navy font-semibold">
                    🏘️ Quận: {district}
                    <button onClick={() => setDistrict('')} className="hover:text-red-500 font-bold ml-1">✕</button>
                  </span>
                )}

                {roomType && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-light text-navy font-semibold">
                    🏠 {getRoomTypeLabel(roomType)}
                    <button onClick={() => setRoomType('')} className="hover:text-red-500 font-bold ml-1">✕</button>
                  </span>
                )}

                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-semibold border border-amber-200/50">
                    💰 {minPrice ? `Từ ${(Number(minPrice)/1000000).toFixed(1)}tr` : ''} {maxPrice ? `Đến ${(Number(maxPrice)/1000000).toFixed(1)}tr` : ''}
                    <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="hover:text-red-500 font-bold ml-1">✕</button>
                  </span>
                )}

                {maxOccupants && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-navy font-semibold">
                    👥 Sức chứa: ≤ {maxOccupants} người
                    <button onClick={() => setMaxOccupants('')} className="hover:text-red-500 font-bold ml-1">✕</button>
                  </span>
                )}

                {selectedAmenities.map((am) => (
                  <span key={am} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/50">
                    ✓ {am}
                    <button onClick={() => toggleAmenity(am)} className="hover:text-red-500 font-bold ml-1">✕</button>
                  </span>
                ))}

                {keyword && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-earth font-semibold border border-orange-200/50">
                    🔍 "{keyword}"
                    <button onClick={() => setKeyword('')} className="hover:text-red-500 font-bold ml-1">✕</button>
                  </span>
                )}

                <button
                  onClick={handleResetFilter}
                  className="text-[11px] text-gray-500 hover:text-red-600 underline font-semibold ml-auto"
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* Results count indicator */}
            <div className="mb-4 flex items-center justify-between text-xs font-semibold text-gray-500 px-1">
              <span>Tìm thấy <strong>{rooms.length}</strong> phòng trọ phù hợp</span>
              {loading && <span className="text-orange-earth animate-pulse">Đang cập nhật kết quả...</span>}
            </div>

            {/* Room Cards Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 h-80 animate-pulse border border-gray-100 flex flex-col justify-between">
                    <div className="w-full h-44 bg-gray-200 rounded-xl" />
                    <div className="space-y-2 mt-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : rooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto my-8">
                <div className="w-16 h-16 bg-blue-light text-navy rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-8 h-8 text-orange-earth" />
                </div>
                <h3 className="text-lg font-bold text-navy mb-2">Không tìm thấy phòng phù hợp</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  Hiện chưa có phòng nào khớp với tiêu chí bạn đã chọn. Hãy thử xóa bớt điều kiện hoặc nhập từ khóa khác nhé!
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleResetFilter}
                    className="px-4 py-2 border border-navy text-navy rounded-xl text-sm font-semibold hover:bg-navy hover:text-white transition-all"
                  >
                    Xóa toàn bộ lọc
                  </button>
                  <a
                    href="/tro-ly-ai"
                    className="px-4 py-2 bg-orange-earth text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-sm hover:bg-orange-600 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    Hỏi Trợ lý AI
                  </a>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2.5 rounded-xl border border-gray-200 bg-white text-navy disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPage(idx + 1)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                      page === idx + 1
                        ? 'bg-navy text-white shadow-md'
                        : 'bg-white border border-gray-200 text-navy hover:bg-gray-50'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2.5 rounded-xl border border-gray-200 bg-white text-navy disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer Overlay */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end lg:hidden">
          <div className="w-80 bg-white h-full p-6 overflow-y-auto animate-slide-up flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <h3 className="font-bold text-navy text-lg">Bộ lọc phòng trọ</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="text-gray-400 font-bold p-1">✕</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Tỉnh / Thành</label>
                  <select
                    value={city}
                    onChange={(e) => { setCity(e.target.value); setPage(1); }}
                    className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm"
                  >
                    <option value="">Tất cả</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Quận / Huyện</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => { setDistrict(e.target.value); setPage(1); }}
                    placeholder="Cầu Giấy, Đống Đa..."
                    className="w-full mt-1 border border-gray-200 rounded-xl p-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Loại phòng</label>
                  <select
                    value={roomType}
                    onChange={(e) => { setRoomType(e.target.value); setPage(1); }}
                    className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm"
                  >
                    {ROOM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Giá (VNĐ)</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <input
                      type="number"
                      placeholder="Từ"
                      value={minPrice}
                      onChange={e => { setMinPrice(e.target.value); setPage(1); }}
                      className="border border-gray-200 rounded-xl p-2 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Đến"
                      value={maxPrice}
                      onChange={e => { setMaxPrice(e.target.value); setPage(1); }}
                      className="border border-gray-200 rounded-xl p-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex gap-2">
              <button
                onClick={handleResetFilter}
                className="w-1/3 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600"
              >
                Đặt lại
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-2/3 py-2.5 bg-navy text-white rounded-xl text-xs font-bold shadow-md"
              >
                Xem kết quả ({rooms.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
