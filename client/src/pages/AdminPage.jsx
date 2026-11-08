import React, { useState, useEffect } from 'react';
import { 
  Shield, Check, X, Trash2, Users, Building, AlertTriangle, 
  Eye, FileText, CheckCircle2, XCircle, Search, RefreshCw 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../services/api';
import { formatPriceFull, formatDate, getStatusClass, getStatusLabel } from '../utils/helpers';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('rooms');

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRooms: 0,
    pendingRooms: 0,
    approvedRooms: 0,
    pendingReports: 0,
  });

  // Data lists
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [filterStatus, setFilterStatus] = useState('PENDING'); // PENDING / ALL / APPROVED
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
    loadData();
  }, [activeTab, filterStatus]);

  const loadStats = async () => {
    try {
      const res = await adminApi.getStats();
      if (res.data) setStats(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'rooms') {
        const res = await adminApi.getRooms({
          status: filterStatus === 'ALL' ? undefined : filterStatus,
        });
        if (res.data) setRooms(res.data.data.rooms || []);
      } else if (activeTab === 'users') {
        const res = await adminApi.getUsers();
        if (res.data) setUsers(res.data.data.users || []);
      } else if (activeTab === 'reports') {
        const res = await adminApi.getReports();
        if (res.data) setReports(res.data.data.reports || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminApi.approveRoom(id);
      toast.success('Đã phê duyệt tin đăng');
      setRooms(rooms.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r));
      loadStats();
    } catch (e) {
      toast.error('Lỗi khi duyệt tin');
    }
  };

  const handleReject = async (id) => {
    try {
      await adminApi.rejectRoom(id);
      toast.success('Đã từ chối / gỡ tin đăng khỏi hệ thống');
      setRooms(rooms.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r));
      loadStats();
    } catch (e) {
      toast.error('Lỗi khi từ chối tin');
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('XÁC NHẬN CỦA QUẢN TRỊ VIÊN:\nBạn có chắc chắn muốn XÓA VĨNH VIỄN phòng trọ này khỏi hệ thống? Thao tác này không thể hoàn tác.')) {
      return;
    }
    try {
      await adminApi.deleteRoom(id);
      toast.success('Quản trị viên đã xóa phòng thành công!');
      setRooms(rooms.filter(r => r.id !== id));
      loadStats();
    } catch (e) {
      toast.error('Không thể xóa phòng, vui lòng thử lại');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản này khỏi hệ thống?')) return;
    try {
      await adminApi.deleteUser(id);
      toast.success('Đã xóa người dùng');
      setUsers(users.filter(u => u.id !== id));
      loadStats();
    } catch (e) {
      toast.error('Không thể xóa');
    }
  };

  const handleProcessReport = async (reportId, action) => {
    try {
      await adminApi.handleReport(reportId, { action });
      toast.success(action === 'delete_room' ? 'Đã gỡ phòng vi phạm' : 'Đã xóa báo cáo');
      setReports(reports.filter(r => r.id !== reportId));
      loadStats();
    } catch (e) {
      toast.error('Có lỗi xảy ra');
    }
  };

  return (
    <div className="bg-cream min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Admin Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-7 h-7 text-orange-earth" />
              <h1 className="text-2xl md:text-3xl font-black text-navy tracking-tight">Hệ thống Quản trị YouRoom AI</h1>
            </div>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Kiểm duyệt tin đăng, giám sát an toàn và quản lý người dùng nền tảng
            </p>
          </div>

          <button
            onClick={() => { loadStats(); loadData(); }}
            className="self-start md:self-auto flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-navy hover:bg-gray-50 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Làm mới dữ liệu
          </button>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Chờ duyệt</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                ⏳
              </div>
            </div>
            <p className="text-2xl font-black text-amber-600">{stats.pendingRooms}</p>
            <p className="text-[11px] text-gray-500 mt-1">Tin đăng cần xem xét</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Đã duyệt</span>
              <div className="w-8 h-8 rounded-xl bg-green-50 text-emerald-700 flex items-center justify-center font-bold">
                ✓
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-600">{stats.approvedRooms}</p>
            <p className="text-[11px] text-gray-500 mt-1">Tin đang hiển thị</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Báo cáo</span>
              <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                ⚠️
              </div>
            </div>
            <p className="text-2xl font-black text-red-600">{stats.pendingReports}</p>
            <p className="text-[11px] text-gray-500 mt-1">Phản ánh từ người dùng</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Người dùng</span>
              <div className="w-8 h-8 rounded-xl bg-blue-light text-navy flex items-center justify-center font-bold">
                👥
              </div>
            </div>
            <p className="text-2xl font-black text-navy">{stats.totalUsers}</p>
            <p className="text-[11px] text-gray-500 mt-1">Tài khoản đã đăng ký</p>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'rooms' ? 'bg-navy text-white shadow-md' : 'bg-white text-gray-600 hover:text-navy'
            }`}
          >
            <Building className="w-4 h-4" />
            Quản lý duyệt phòng ({stats.pendingRooms})
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'reports' ? 'bg-navy text-white shadow-md' : 'bg-white text-gray-600 hover:text-navy'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Báo cáo vi phạm ({reports.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'users' ? 'bg-navy text-white shadow-md' : 'bg-white text-gray-600 hover:text-navy'
            }`}
          >
            <Users className="w-4 h-4" />
            Quản lý người dùng
          </button>
        </div>

        {/* Tab 1: Rooms Approval */}
        {activeTab === 'rooms' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold text-navy">Danh sách tin đăng phòng trọ</h2>
              
              <div className="flex gap-2">
                {['PENDING', 'APPROVED', 'ALL'].map(st => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      filterStatus === st ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {st === 'PENDING' ? 'Chờ duyệt' : st === 'APPROVED' ? 'Đã duyệt' : 'Tất cả'}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <p className="text-center py-8 text-gray-400 text-sm">Đang tải...</p>
            ) : rooms.length > 0 ? (
              <div className="space-y-4">
                {rooms.map((room) => (
                  <div key={room.id} className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                      <img
                        src={Array.isArray(room.images) ? room.images[0] : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300'}
                        alt=""
                        className="w-20 h-20 rounded-2xl object-cover shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-navy text-sm sm:text-base line-clamp-1">{room.title}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusClass(room.status)}`}>
                            {getStatusLabel(room.status)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{room.address}, {room.district}, {room.city}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Đăng bởi: <strong>{room.owner?.fullName || 'Chủ trọ'}</strong> ({room.contactPhone || '0912345678'}) • {formatDate(room.createdAt)}
                        </p>
                        <p className="text-xs font-bold text-orange-earth mt-1">{formatPriceFull(room.price)} / {room.area}m²</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap justify-end">
                      <a
                        href={`/phong/${room.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-navy hover:text-white transition-all shadow-2xs"
                        title="Xem chi tiết trên website"
                      >
                        <Eye className="w-4 h-4" />
                      </a>

                      {/* Nút hành động theo trạng thái */}
                      {room.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(room.id)}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                            title="Phê duyệt cho phép hiển thị"
                          >
                            <Check className="w-3.5 h-3.5" /> Duyệt
                          </button>
                          <button
                            onClick={() => handleReject(room.id)}
                            className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                            title="Từ chối tin đăng"
                          >
                            <X className="w-3.5 h-3.5" /> Từ chối
                          </button>
                        </>
                      )}

                      {room.status === 'APPROVED' && (
                        <button
                          onClick={() => handleReject(room.id)}
                          className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                          title="Hạ tin đăng này xuống, không cho hiển thị công khai nữa"
                        >
                          <X className="w-3.5 h-3.5" /> Gỡ bài đăng
                        </button>
                      )}

                      {room.status === 'REJECTED' && (
                        <button
                          onClick={() => handleApprove(room.id)}
                          className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                          title="Duyệt lại tin đăng này"
                        >
                          <Check className="w-3.5 h-3.5" /> Phê duyệt lại
                        </button>
                      )}

                      {/* Nút Xóa vĩnh viễn (Admin có toàn quyền xóa mọi bài trọ) */}
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="p-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1"
                        title="Xóa vĩnh viễn trọ này khỏi hệ thống"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Xóa</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-emerald-500 opacity-60" />
                <p className="text-sm font-semibold text-navy">Không có tin đăng nào cần xử lý</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Reports */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100">
            <h2 className="text-lg font-bold text-navy mb-6">Báo cáo vi phạm từ người dùng</h2>

            {reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="p-5 rounded-2xl bg-red-50/40 border border-red-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-red-700 uppercase bg-red-100 px-2.5 py-0.5 rounded-full">
                          {report.reason}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(report.createdAt)}</span>
                      </div>
                      <p className="text-xs text-gray-700 mt-2 font-medium italic">
                        "{report.description || 'Không có mô tả chi tiết'}"
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Người gửi: <strong>{report.user?.fullName}</strong> ({report.user?.email}) • ID Phòng: <strong>#{report.roomId}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <a
                        href={`/phong/${report.roomId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-white border border-gray-200 text-navy rounded-xl text-xs font-bold hover:bg-gray-50"
                      >
                        Kiểm tra phòng
                      </a>
                      <button
                        onClick={() => handleProcessReport(report.id, 'delete_room')}
                        className="px-3 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 shadow-xs"
                      >
                        Gỡ tin phòng
                      </button>
                      <button
                        onClick={() => handleProcessReport(report.id, 'dismiss')}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-300"
                      >
                        Bỏ qua báo cáo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Shield className="w-12 h-12 mx-auto mb-2 text-navy opacity-40" />
                <p className="text-sm">Hiện tại không có báo cáo sai phạm nào.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Users */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100">
            <h2 className="text-lg font-bold text-navy mb-6">Danh sách tài khoản người dùng</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider">
                    <th className="pb-3 font-bold">Người dùng</th>
                    <th className="pb-3 font-bold">Email</th>
                    <th className="pb-3 font-bold">Số điện thoại</th>
                    <th className="pb-3 font-bold">Vai trò</th>
                    <th className="pb-3 font-bold">Ngày tham gia</th>
                    <th className="pb-3 font-bold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50">
                      <td className="py-3 font-bold text-navy">{u.fullName}</td>
                      <td className="py-3 text-gray-600">{u.email}</td>
                      <td className="py-3 text-gray-600">{u.phone || '—'}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          u.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-blue-light text-navy'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400">{formatDate(u.createdAt)}</td>
                      <td className="py-3 text-right">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
