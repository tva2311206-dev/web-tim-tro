import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Heart, Calendar, Building, Inbox, Lock, PlusCircle, 
  Trash2, Edit, CheckCircle, Clock, XCircle, Phone, Mail, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { userApi, favoriteApi, roomApi } from '../services/api';
import { formatPriceFull, formatDate, getStatusClass, getStatusLabel } from '../utils/helpers';
import RoomCard from '../components/room/RoomCard';

export default function DashboardPage() {
  const { user, updateUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  // State
  const [myRooms, setMyRooms] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [sentBookings, setSentBookings] = useState([]);
  const [receivedBookings, setReceivedBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Edit Profile Form
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'rooms') {
        const res = await userApi.getMyRooms();
        if (res.data) setMyRooms(res.data.data || []);
      } else if (activeTab === 'favorites') {
        const res = await favoriteApi.getAll();
        if (res.data) setFavorites(res.data.data || []);
      } else if (activeTab === 'bookings') {
        const res = await userApi.getMyBookings();
        if (res.data) setSentBookings(res.data.data || []);
      } else if (activeTab === 'received') {
        const res = await userApi.getReceivedBookings();
        if (res.data) setReceivedBookings(res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await userApi.updateMe({ fullName, phone, avatar });
      toast.success('Cập nhật thông tin cá nhân thành công');
    } catch (e) {
      toast.error('Lỗi khi cập nhật thông tin');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    try {
      await userApi.changePassword({ currentPassword, newPassword });
      toast.success('Đổi mật khẩu thành công');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      toast.error('Mật khẩu hiện tại không đúng');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tin đăng phòng này?')) return;
    try {
      await roomApi.delete(roomId);
      toast.success('Đã xóa bài đăng phòng trọ');
      setMyRooms(myRooms.filter(r => r.id !== roomId));
    } catch (e) {
      toast.error('Không thể xóa bài đăng');
    }
  };

  return (
    <div className="bg-cream min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Dashboard Header Banner */}
        <div className="bg-navy rounded-3xl p-6 sm:p-8 text-white shadow-card mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=E58B55&color=fff`}
              alt=""
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black">{user?.fullName || 'Người dùng YouRoom'}</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/20 text-white">
                  {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1 flex items-center gap-3">
                <span>{user?.email}</span>
                <span>•</span>
                <span>{user?.phone || 'Chưa cập nhật SĐT'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dang-tin"
              className="px-5 py-3 bg-orange-earth hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Đăng tin phòng mới
            </Link>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Navigation Sidebar */}
          <aside className="bg-white rounded-3xl p-4 shadow-card border border-gray-100 space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-left transition-all ${
                activeTab === 'profile' ? 'bg-navy text-white shadow-sm' : 'text-navy hover:bg-gray-50'
              }`}
            >
              <User className="w-4 h-4" />
              Thông tin cá nhân
            </button>

            <button
              onClick={() => setActiveTab('rooms')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-left transition-all ${
                activeTab === 'rooms' ? 'bg-navy text-white shadow-sm' : 'text-navy hover:bg-gray-50'
              }`}
            >
              <Building className="w-4 h-4" />
              Tin đăng của tôi
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-left transition-all ${
                activeTab === 'favorites' ? 'bg-navy text-white shadow-sm' : 'text-navy hover:bg-gray-50'
              }`}
            >
              <Heart className="w-4 h-4" />
              Phòng yêu thích
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-left transition-all ${
                activeTab === 'bookings' ? 'bg-navy text-white shadow-sm' : 'text-navy hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Yêu cầu xem phòng đã gửi
            </button>

            <button
              onClick={() => setActiveTab('received')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-left transition-all ${
                activeTab === 'received' ? 'bg-navy text-white shadow-sm' : 'text-navy hover:bg-gray-50'
              }`}
            >
              <Inbox className="w-4 h-4" />
              Yêu cầu hẹn nhận được
            </button>
          </aside>

          {/* Tab Content */}
          <main className="lg:col-span-3 space-y-8">
            
            {/* TAB 1: Profile */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                
                {/* User Info Form */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100">
                  <h2 className="text-lg font-bold text-navy pb-4 border-b border-gray-100 mb-6">
                    Cập nhật thông tin cá nhân
                  </h2>

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-navy uppercase mb-1.5">Họ và tên</label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:outline-none focus:border-navy"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-navy uppercase mb-1.5">Số điện thoại</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:outline-none focus:border-navy"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy uppercase mb-1.5">URL Ảnh đại diện</label>
                      <input
                        type="url"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:outline-none focus:border-navy"
                      />
                    </div>

                    <div className="pt-2">
                      <button type="submit" className="btn-primary text-xs">
                        Lưu thay đổi
                      </button>
                    </div>
                  </form>
                </div>

                {/* Change Password Form */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100">
                  <h2 className="text-lg font-bold text-navy pb-4 border-b border-gray-100 mb-6">
                    Đổi mật khẩu
                  </h2>

                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-xs font-bold text-navy uppercase mb-1.5">Mật khẩu hiện tại</label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:outline-none focus:border-navy"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy uppercase mb-1.5">Mật khẩu mới</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:outline-none focus:border-navy"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy uppercase mb-1.5">Xác nhận mật khẩu mới</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:outline-none focus:border-navy"
                      />
                    </div>

                    <div className="pt-2">
                      <button type="submit" className="btn-secondary text-xs">
                        Cập nhật mật khẩu
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            )}

            {/* TAB 2: My Rooms */}
            {activeTab === 'rooms' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-navy">Tin đăng phòng trọ của bạn</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Quản lý trạng thái duyệt, chỉnh sửa hoặc gỡ tin đăng</p>
                  </div>
                  <Link to="/dang-tin" className="btn-primary text-xs flex items-center gap-1.5">
                    <PlusCircle className="w-3.5 h-3.5" /> Đăng tin mới
                  </Link>
                </div>

                {loading ? (
                  <p className="text-sm text-gray-500 text-center py-8">Đang tải danh sách phòng...</p>
                ) : myRooms.length > 0 ? (
                  <div className="space-y-4">
                    {myRooms.map((room) => (
                      <div key={room.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-200 gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={Array.isArray(room.images) ? room.images[0] : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300'}
                            alt=""
                            className="w-16 h-16 rounded-xl object-cover shrink-0"
                          />
                          <div>
                            <Link to={`/phong/${room.id}`} className="font-bold text-navy text-sm hover:underline line-clamp-1">
                              {room.title}
                            </Link>
                            <p className="text-xs text-gray-500 mt-0.5">{room.address}, {room.city}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-bold text-orange-earth text-xs">{formatPriceFull(room.price)}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusClass(room.status)}`}>
                                {getStatusLabel(room.status)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <Link
                            to={`/phong/${room.id}`}
                            className="p-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-navy hover:bg-navy hover:text-white transition-all"
                          >
                            Xem tin
                          </Link>
                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                            title="Xóa phòng"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Building className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Bạn chưa có bài đăng cho thuê nào.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Favorites */}
            {activeTab === 'favorites' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100">
                <h2 className="text-lg font-bold text-navy pb-4 border-b border-gray-100 mb-6">
                  Danh sách phòng yêu thích
                </h2>

                {loading ? (
                  <p className="text-sm text-gray-500 text-center py-8">Đang tải...</p>
                ) : favorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {favorites.map((fav) => (
                      <RoomCard key={fav.id} room={fav.room} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Chưa có phòng nào trong danh sách yêu thích.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: Sent Bookings */}
            {activeTab === 'bookings' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100">
                <h2 className="text-lg font-bold text-navy pb-4 border-b border-gray-100 mb-6">
                  Yêu cầu xem phòng bạn đã gửi
                </h2>

                {sentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {sentBookings.map((b) => (
                      <div key={b.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <p className="font-bold text-navy text-sm">{b.room?.title || 'Phòng trọ YouRoom'}</p>
                          <p className="text-xs text-gray-500 mt-1">Lịch hẹn: {b.visitDate ? new Date(b.visitDate).toLocaleString('vi-VN') : 'Thương lượng'}</p>
                          <p className="text-xs text-gray-600 mt-1 italic">"{b.message}"</p>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-light text-navy">
                          {b.status === 'PENDING' ? 'Đang đợi phản hồi' : 'Đã xác nhận'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Bạn chưa gửi yêu cầu xem phòng nào.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: Received Bookings */}
            {activeTab === 'received' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100">
                <h2 className="text-lg font-bold text-navy pb-4 border-b border-gray-100 mb-6">
                  Yêu cầu liên hệ và xem phòng nhận được
                </h2>

                {receivedBookings.length > 0 ? (
                  <div className="space-y-4">
                    {receivedBookings.map((b) => (
                      <div key={b.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-navy text-sm">{b.user?.fullName} ({b.user?.phone})</p>
                            <p className="text-xs text-gray-500">Quan tâm phòng: {b.room?.title}</p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            Chờ liên hệ
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 italic">Lời nhắn: "{b.message}"</p>
                        <div className="mt-3 flex gap-2">
                          <a href={`tel:${b.user?.phone}`} className="px-3 py-1.5 bg-navy text-white text-xs font-bold rounded-lg flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" /> Gọi lại khách
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Inbox className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Chưa có khách thuê nào gửi yêu cầu xem phòng.</p>
                  </div>
                )}
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
}
