import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, Maximize2, Users, Calendar, Phone, Heart, Flag, Share2, 
  CheckCircle2, Zap, Droplet, Wifi, ShieldCheck, ArrowLeft, Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import { roomApi, favoriteApi, bookingApi, reportApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { formatPriceFull, formatArea, formatDate, getRoomTypeLabel } from '../utils/helpers';
import RoomCard from '../components/room/RoomCard';

export default function RoomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();

  const [room, setRoom] = useState(null);
  const [similarRooms, setSimilarRooms] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Thông tin không đúng thực tế');
  const [reportDesc, setReportDesc] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchRoomDetail();
  }, [id]);

  const fetchRoomDetail = async () => {
    setLoading(true);
    try {
      const res = await roomApi.getById(id);
      if (res.data && res.data.data) {
        setRoom(res.data.data);
      }

      // Check favorites
      const favIds = JSON.parse(localStorage.getItem('youroom_favorites') || '[]');
      setIsFavorited(favIds.includes(Number(id)));

      // Fetch similar
      const simRes = await roomApi.getSimilar(id);
      if (simRes.data && simRes.data.data) {
        setSimilarRooms(simRes.data.data);
      }
    } catch (err) {
      console.error('Fetch room error:', err);
      toast.error('Không tìm thấy thông tin phòng');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để lưu phòng yêu thích');
      navigate('/dang-nhap');
      return;
    }
    try {
      if (isFavorited) {
        await favoriteApi.remove(Number(id));
        setIsFavorited(false);
        toast.success('Đã xóa khỏi yêu thích');
      } else {
        await favoriteApi.add(Number(id));
        setIsFavorited(true);
        toast.success('Đã thêm vào danh sách yêu thích');
      }
    } catch (e) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Vui lòng đăng nhập để gửi yêu cầu xem phòng');
      navigate('/dang-nhap');
      return;
    }
    setBookingLoading(true);
    try {
      await bookingApi.create({
        roomId: Number(id),
        visitDate: bookingDate,
        message: bookingMessage || 'Tôi muốn hẹn lịch qua xem phòng trực tiếp.',
      });
      toast.success('Yêu cầu xem phòng đã được gửi tới chủ nhà!');
      setBookingModalOpen(false);
      setBookingDate('');
      setBookingMessage('');
    } catch (e) {
      toast.error('Không thể gửi yêu cầu, vui lòng thử lại');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Vui lòng đăng nhập để gửi báo cáo');
      navigate('/dang-nhap');
      return;
    }
    setReportLoading(true);
    try {
      await reportApi.create({
        roomId: Number(id),
        reason: reportReason,
        description: reportDesc,
      });
      toast.success('Cảm ơn bạn đã phản hồi! Quản trị viên sẽ kiểm tra lại tin đăng.');
      setReportModalOpen(false);
      setReportDesc('');
    } catch (e) {
      toast.error('Lỗi khi gửi báo cáo');
    } finally {
      setReportLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Đã sao chép liên kết phòng trọ!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream py-16 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-navy border-t-orange-earth rounded-full animate-spin" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-cream py-20 text-center">
        <h2 className="text-2xl font-bold text-navy mb-4">Phòng không tồn tại</h2>
        <Link to="/tim-phong" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Quay lại tìm phòng
        </Link>
      </div>
    );
  }

  const images = Array.isArray(room.images) && room.images.length > 0 
    ? room.images 
    : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80'];

  const amenities = Array.isArray(room.amenities) ? room.amenities : [];

  return (
    <div className="bg-cream min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-6">
          <nav className="text-xs md:text-sm font-medium text-gray-500 flex items-center gap-2">
            <Link to="/" className="hover:text-navy">Trang chủ</Link>
            <span>/</span>
            <Link to="/tim-phong" className="hover:text-navy">Tìm phòng</Link>
            <span>/</span>
            <span className="text-navy font-bold truncate max-w-[200px] md:max-w-md">{room.title}</span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:text-navy hover:bg-gray-50 transition-all shadow-xs flex items-center gap-1.5 text-xs font-semibold"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Chia sẻ</span>
            </button>
            <button
              onClick={handleToggleFavorite}
              className={`p-2.5 border rounded-xl transition-all shadow-xs flex items-center gap-1.5 text-xs font-semibold ${
                isFavorited ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-200 text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{isFavorited ? 'Đã lưu' : 'Lưu tin'}</span>
            </button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-8 bg-white p-3 md:p-4 rounded-3xl shadow-card border border-gray-100">
          <div className="relative w-full h-[320px] md:h-[500px] rounded-2xl overflow-hidden bg-gray-900 group">
            <img
              src={images[activeImageIndex]}
              alt={room.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            />
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-semibold">
              Ảnh {activeImageIndex + 1} / {images.length}
            </div>
            <div className="absolute top-4 left-4">
              <span className="bg-navy/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                {getRoomTypeLabel(room.roomType)}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 mt-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-16 md:w-24 md:h-18 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIndex === idx ? 'border-orange-earth scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Two-Column Info Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left Column (2/3): Room Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header info */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-card border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-navy leading-snug">{room.title}</h1>
                  <p className="flex items-center gap-1.5 text-gray-500 text-sm mt-2">
                    <MapPin className="w-4 h-4 text-orange-earth shrink-0" />
                    <span>{room.address}, {room.district}, {room.city}</span>
                  </p>
                </div>
                <div className="md:text-right shrink-0">
                  <span className="text-2xl md:text-3xl font-black text-orange-earth">
                    {formatPriceFull(room.price)}
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">Đặt cọc thương lượng</p>
                </div>
              </div>

              {/* Key Specs Row */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="bg-blue-light/50 p-4 rounded-2xl text-center">
                  <Maximize2 className="w-5 h-5 text-navy mx-auto mb-1.5" />
                  <p className="text-xs text-gray-500 font-medium">Diện tích</p>
                  <p className="font-bold text-navy text-sm md:text-base">{formatArea(room.area)}</p>
                </div>
                <div className="bg-blue-light/50 p-4 rounded-2xl text-center">
                  <Users className="w-5 h-5 text-navy mx-auto mb-1.5" />
                  <p className="text-xs text-gray-500 font-medium">Sức chứa</p>
                  <p className="font-bold text-navy text-sm md:text-base">Tối đa {room.maxOccupants || 2} người</p>
                </div>
                <div className="bg-blue-light/50 p-4 rounded-2xl text-center">
                  <Calendar className="w-5 h-5 text-navy mx-auto mb-1.5" />
                  <p className="text-xs text-gray-500 font-medium">Ngày đăng</p>
                  <p className="font-bold text-navy text-sm md:text-base">{formatDate(room.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-card border border-gray-100">
              <h2 className="text-lg md:text-xl font-bold text-navy mb-4">Mô tả chi tiết</h2>
              <div className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-line font-normal">
                {room.description}
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-card border border-gray-100">
              <h2 className="text-lg md:text-xl font-bold text-navy mb-4">Tiện ích phòng</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs md:text-sm font-semibold text-navy">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Utilities Expenses Table */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-card border border-gray-100">
              <h2 className="text-lg md:text-xl font-bold text-navy mb-4">Chi phí dịch vụ</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border border-gray-100 bg-amber-50/50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Tiền điện</p>
                    <p className="font-bold text-navy text-sm">{room.electricPrice?.toLocaleString('vi-VN')} đ/kWh</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-gray-100 bg-cyan-50/50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                    <Droplet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Tiền nước</p>
                    <p className="font-bold text-navy text-sm">{room.waterPrice?.toLocaleString('vi-VN')} đ/khối</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-gray-100 bg-indigo-50/50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Internet / Wifi</p>
                    <p className="font-bold text-navy text-sm">
                      {room.internetPrice === 0 ? 'Miễn phí' : `${room.internetPrice?.toLocaleString('vi-VN')} đ/tháng`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (1/3): Landlord & Action Box */}
          <div className="space-y-6 lg:sticky lg:top-28">
            
            {/* Landlord Card */}
            <div className="bg-white p-6 rounded-3xl shadow-card border border-gray-100">
              <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                <img
                  src={room.owner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(room.owner?.fullName || 'Chủ trọ')}&background=173B57&color=fff`}
                  alt=""
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <h3 className="font-bold text-navy text-base">{room.owner?.fullName || 'Chủ trọ YouRoom'}</h3>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                    Đã xác minh tài khoản
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Tham gia từ 2024</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-6">
                <a
                  href={`tel:${room.contactPhone || room.owner?.phone}`}
                  className="w-full py-3.5 bg-navy text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-navy-dark shadow-md transition-all active:scale-95"
                >
                  <Phone className="w-4 h-4 text-orange-earth" />
                  Gọi ngay: {room.contactPhone || room.owner?.phone || '0912345678'}
                </a>

                <button
                  onClick={() => setBookingModalOpen(true)}
                  className="w-full py-3.5 bg-orange-earth text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-600 shadow-md transition-all active:scale-95"
                >
                  <Calendar className="w-4 h-4" />
                  Đặt lịch hẹn xem phòng
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="text-xs text-gray-400 hover:text-red-500 flex items-center justify-center gap-1.5 mx-auto transition-colors font-medium"
                >
                  <Flag className="w-3.5 h-3.5" />
                  Báo cáo tin đăng sai phạm
                </button>
              </div>
            </div>

            {/* Quick Safety Tips */}
            <div className="bg-green-light/40 p-5 rounded-3xl border border-green-200/50">
              <h4 className="font-bold text-navy text-xs uppercase tracking-wider mb-2">Lưu ý an toàn YouRoom</h4>
              <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside">
                <li>Luôn đến xem phòng trực tiếp trước khi đặt cọc.</li>
                <li>Kiểm tra kỹ hợp đồng thuê và biên nhận tiền cọc.</li>
                <li>Xác nhận số công tơ điện và đồng hồ nước lúc nhận phòng.</li>
              </ul>
            </div>

          </div>

        </div>

        {/* Similar Rooms Section */}
        {similarRooms.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gray-200">
            <h2 className="text-2xl font-black text-navy mb-6">Phòng trọ tương tự trong khu vực</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarRooms.map((sRoom) => (
                <RoomCard key={sRoom.id} room={sRoom} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Booking Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl animate-fade-in relative">
            <button
              onClick={() => setBookingModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-navy text-xl font-bold"
            >
              ✕
            </button>

            <h3 className="text-xl font-black text-navy mb-2">Hẹn lịch xem phòng</h3>
            <p className="text-xs text-gray-500 mb-6">Chủ trọ sẽ nhận được thông báo và liên hệ lại xác nhận với bạn.</p>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy uppercase mb-1.5">Ngày muốn đến xem</label>
                <input
                  type="datetime-local"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase mb-1.5">Lời nhắn gửi chủ trọ</label>
                <textarea
                  rows={3}
                  value={bookingMessage}
                  onChange={(e) => setBookingMessage(e.target.value)}
                  placeholder="Ví dụ: Tôi muốn qua xem phòng vào khoảng 17h chiều nay..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:outline-none focus:border-navy"
                />
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full py-3.5 bg-orange-earth text-white font-bold rounded-xl text-sm shadow-md hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {bookingLoading ? 'Đang gửi...' : 'Gửi yêu cầu xem phòng'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl animate-fade-in relative">
            <button
              onClick={() => setReportModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-navy text-xl font-bold"
            >
              ✕
            </button>

            <h3 className="text-xl font-black text-navy mb-2">Báo cáo vi phạm</h3>
            <p className="text-xs text-gray-500 mb-6">Giúp chúng tôi giữ cho YouRoom AI an toàn và minh bạch.</p>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy uppercase mb-1.5">Lý do báo cáo</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:outline-none focus:border-navy"
                >
                  <option value="Thông tin không đúng thực tế">Thông tin không đúng thực tế</option>
                  <option value="Giá thuê sai lệch hoặc mập mờ">Giá thuê sai lệch hoặc mập mờ</option>
                  <option value="Ảnh phòng giả mạo / copy">Ảnh phòng giả mạo / copy</option>
                  <option value="Phòng đã cho thuê nhưng không gỡ tin">Phòng đã cho thuê nhưng không gỡ tin</option>
                  <option value="Hành vi lừa đảo hoặc thái độ xấu">Hành vi lừa đảo hoặc thái độ xấu</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase mb-1.5">Mô tả thêm</label>
                <textarea
                  rows={3}
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Cung cấp thêm chi tiết để Admin hỗ trợ xác minh..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:outline-none focus:border-navy"
                />
              </div>

              <button
                type="submit"
                disabled={reportLoading}
                className="w-full py-3.5 bg-red-600 text-white font-bold rounded-xl text-sm shadow-md hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              >
                <Flag className="w-4 h-4" />
                {reportLoading ? 'Đang gửi...' : 'Gửi báo cáo vi phạm'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
