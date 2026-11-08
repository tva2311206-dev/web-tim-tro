import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { MOCK_ROOMS } from './mockData';
import { aiAnalyzeAndMatchRooms } from '../utils/aiMatcher';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 4000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Mock Storage Helper
function getLocalRooms() {
  const saved = localStorage.getItem('youroom_mock_rooms');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
  }
  localStorage.setItem('youroom_mock_rooms', JSON.stringify(MOCK_ROOMS));
  return MOCK_ROOMS;
}

function saveLocalRooms(rooms) {
  localStorage.setItem('youroom_mock_rooms', JSON.stringify(rooms));
}

// === Auth API ===
export const authApi = {
  register: async (data) => {
    try {
      return await api.post('/auth/register', data);
    } catch (err) {
      // Fallback mock register
      const mockUser = {
        id: Date.now(),
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || '0988776655',
        role: 'USER',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName)}&background=173B57&color=fff`,
        createdAt: new Date().toISOString(),
      };
      const token = 'mock_jwt_token_' + Date.now();
      return { data: { success: true, message: 'Đăng ký thành công (Demo Mode)', data: { user: mockUser, token } } };
    }
  },

  login: async (data) => {
    try {
      return await api.post('/auth/login', data);
    } catch (err) {
      // Fallback mock login
      const isAdminLogin = data.email === 'admin@youroom.ai' || data.email === 'admin';
      const mockUser = {
        id: isAdminLogin ? 1 : 2,
        fullName: isAdminLogin ? 'Quản trị viên' : (data.email.split('@')[0] || 'Demo User'),
        email: data.email,
        phone: '0901234567',
        role: isAdminLogin ? 'ADMIN' : 'USER',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(isAdminLogin ? 'Admin' : 'User')}&background=173B57&color=fff`,
        createdAt: new Date().toISOString(),
      };
      const token = 'mock_jwt_token_' + Date.now();
      return { data: { success: true, message: 'Đăng nhập thành công (Demo Mode)', data: { user: mockUser, token } } };
    }
  },
};

function removeVietnameseTones(str) {
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

// === Rooms API ===
export const roomApi = {
  getAll: async (params = {}) => {
    try {
      return await api.get('/rooms', { params });
    } catch (err) {
      let rooms = getLocalRooms().filter(r => r.status === 'APPROVED');

      // 1. Lọc theo Thành phố (chỉ cần khớp 1 phần hoặc không dấu)
      if (params.city && params.city.trim()) {
        const cTerm = removeVietnameseTones(params.city);
        rooms = rooms.filter(r => 
          r.city && removeVietnameseTones(r.city).includes(cTerm)
        );
      }

      // 2. Lọc theo Quận/huyện (chỉ cần khớp 1 phần hoặc không dấu)
      if (params.district && params.district.trim()) {
        const dTerm = removeVietnameseTones(params.district);
        rooms = rooms.filter(r => 
          (r.district && removeVietnameseTones(r.district).includes(dTerm)) ||
          (r.address && removeVietnameseTones(r.address).includes(dTerm))
        );
      }

      // 3. Lọc theo Phường/xã
      if (params.ward && params.ward.trim()) {
        const wTerm = removeVietnameseTones(params.ward);
        rooms = rooms.filter(r => 
          r.ward && removeVietnameseTones(r.ward).includes(wTerm)
        );
      }

      // 4. Lọc theo Loại phòng
      if (params.roomType && params.roomType.trim()) {
        rooms = rooms.filter(r => r.roomType === params.roomType);
      }

      // 5. Lọc theo Giá tối thiểu (minPrice)
      if (params.minPrice && !isNaN(Number(params.minPrice)) && Number(params.minPrice) > 0) {
        rooms = rooms.filter(r => Number(r.price) >= Number(params.minPrice));
      }

      // 6. Lọc theo Giá tối đa (maxPrice)
      if (params.maxPrice && !isNaN(Number(params.maxPrice)) && Number(params.maxPrice) > 0) {
        rooms = rooms.filter(r => Number(r.price) <= Number(params.maxPrice));
      }

      // 7. Lọc theo Sức chứa
      if (params.maxOccupants && Number(params.maxOccupants) > 0) {
        rooms = rooms.filter(r => Number(r.maxOccupants || 2) <= Number(params.maxOccupants));
      }

      // 8. Lọc theo Tiện ích (chọn 1 hay nhiều tiện ích đều lọc được)
      if (params.amenities) {
        const rawAm = Array.isArray(params.amenities) 
          ? params.amenities 
          : String(params.amenities).split(',').map(s => s.trim()).filter(Boolean);
        if (rawAm.length > 0) {
          rooms = rooms.filter(r => {
            const rAmenities = Array.isArray(r.amenities) ? r.amenities : [];
            return rawAm.every(needed => 
              rAmenities.some(item => removeVietnameseTones(item).includes(removeVietnameseTones(needed)))
            );
          });
        }
      }

      // 9. Lọc theo Từ khóa tìm kiếm tự do (keyword)
      if (params.keyword && params.keyword.trim()) {
        const kw = removeVietnameseTones(params.keyword);
        rooms = rooms.filter(r => {
          const tMatch = r.title && removeVietnameseTones(r.title).includes(kw);
          const dMatch = r.description && removeVietnameseTones(r.description).includes(kw);
          const aMatch = r.address && removeVietnameseTones(r.address).includes(kw);
          const distMatch = r.district && removeVietnameseTones(r.district).includes(kw);
          const cityMatch = r.city && removeVietnameseTones(r.city).includes(kw);
          const amMatch = r.amenities && r.amenities.some(a => removeVietnameseTones(a).includes(kw));
          return tMatch || dMatch || aMatch || distMatch || cityMatch || amMatch;
        });
      }

      // Sort
      if (params.sort === 'price_asc') rooms.sort((a, b) => a.price - b.price);
      else if (params.sort === 'price_desc') rooms.sort((a, b) => b.price - a.price);
      else if (params.sort === 'area_asc') rooms.sort((a, b) => a.area - b.area);
      else rooms.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const page = Number(params.page) || 1;
      const limit = Number(params.limit) || 12;
      const total = rooms.length;
      const paginated = rooms.slice((page - 1) * limit, page * limit);

      return {
        data: {
          success: true,
          data: {
            rooms: paginated,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
          },
        },
      };
    }
  },

  getFeatured: async () => {
    try {
      return await api.get('/rooms/featured');
    } catch (err) {
      const rooms = getLocalRooms().filter(r => r.status === 'APPROVED').slice(0, 8);
      return { data: { success: true, data: rooms } };
    }
  },

  getById: async (id) => {
    try {
      return await api.get(`/rooms/${id}`);
    } catch (err) {
      const room = getLocalRooms().find(r => r.id === Number(id));
      if (!room) throw new Error('Không tìm thấy phòng');
      return { data: { success: true, data: room } };
    }
  },

  getSimilar: async (id) => {
    try {
      return await api.get(`/rooms/${id}/similar`);
    } catch (err) {
      const current = getLocalRooms().find(r => r.id === Number(id));
      const similar = getLocalRooms()
        .filter(r => r.id !== Number(id) && r.status === 'APPROVED' && (!current || r.city === current.city))
        .slice(0, 4);
      return { data: { success: true, data: similar } };
    }
  },

  create: async (data) => {
    try {
      return await api.post('/rooms', data);
    } catch (err) {
      const currentUser = useAuthStore.getState().user || { id: 1, fullName: 'Demo User', phone: data.contactPhone };
      const rooms = getLocalRooms();
      const newRoom = {
        id: Date.now(),
        ...data,
        ownerId: currentUser.id,
        owner: currentUser,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      rooms.unshift(newRoom);
      saveLocalRooms(rooms);
      return { data: { success: true, message: 'Đăng tin thành công! Tin đang chờ duyệt.', data: newRoom } };
    }
  },

  update: async (id, data) => {
    try {
      return await api.put(`/rooms/${id}`, data);
    } catch (err) {
      const rooms = getLocalRooms();
      const idx = rooms.findIndex(r => r.id === Number(id));
      if (idx !== -1) {
        rooms[idx] = { ...rooms[idx], ...data, status: 'PENDING', updatedAt: new Date().toISOString() };
        saveLocalRooms(rooms);
      }
      return { data: { success: true, message: 'Cập nhật thành công, đang chờ duyệt lại' } };
    }
  },

  delete: async (id) => {
    try {
      return await api.delete(`/rooms/${id}`);
    } catch (err) {
      const rooms = getLocalRooms().filter(r => r.id !== Number(id));
      saveLocalRooms(rooms);
      return { data: { success: true, message: 'Đã xóa tin đăng' } };
    }
  },
};

// === User API ===
export const userApi = {
  getMe: async () => {
    try {
      return await api.get('/users/me');
    } catch (err) {
      const user = useAuthStore.getState().user;
      return { data: { success: true, data: user } };
    }
  },

  updateMe: async (data) => {
    try {
      return await api.put('/users/me', data);
    } catch (err) {
      const user = useAuthStore.getState().user;
      const updated = { ...user, ...data };
      useAuthStore.getState().updateUser(updated);
      return { data: { success: true, message: 'Cập nhật thông tin thành công', data: updated } };
    }
  },

  changePassword: async (data) => {
    try {
      return await api.put('/users/me/password', data);
    } catch (err) {
      return { data: { success: true, message: 'Đổi mật khẩu thành công (Mô phỏng)' } };
    }
  },

  getMyRooms: async () => {
    try {
      return await api.get('/users/me/rooms');
    } catch (err) {
      const currentUser = useAuthStore.getState().user;
      const rooms = getLocalRooms().filter(r => r.ownerId === (currentUser?.id || 2) || r.owner?.email === currentUser?.email);
      return { data: { success: true, data: rooms } };
    }
  },

  getMyBookings: async () => {
    try {
      return await api.get('/users/me/bookings');
    } catch (err) {
      const saved = JSON.parse(localStorage.getItem('youroom_mock_bookings') || '[]');
      return { data: { success: true, data: saved } };
    }
  },

  getReceivedBookings: async () => {
    try {
      return await api.get('/users/me/received-bookings');
    } catch (err) {
      const saved = JSON.parse(localStorage.getItem('youroom_mock_received_bookings') || '[]');
      return { data: { success: true, data: saved } };
    }
  },
};

// === Favorites API ===
export const favoriteApi = {
  getAll: async () => {
    try {
      return await api.get('/favorites');
    } catch (err) {
      const favIds = JSON.parse(localStorage.getItem('youroom_favorites') || '[]');
      const allRooms = getLocalRooms();
      const favRooms = allRooms
        .filter(r => favIds.includes(r.id))
        .map(room => ({ id: room.id, roomId: room.id, room }));
      return { data: { success: true, data: favRooms } };
    }
  },

  add: async (roomId) => {
    try {
      return await api.post('/favorites', { roomId });
    } catch (err) {
      const favIds = JSON.parse(localStorage.getItem('youroom_favorites') || '[]');
      if (!favIds.includes(roomId)) {
        favIds.push(roomId);
        localStorage.setItem('youroom_favorites', JSON.stringify(favIds));
      }
      return { data: { success: true, message: 'Đã thêm vào yêu thích' } };
    }
  },

  remove: async (roomId) => {
    try {
      return await api.delete(`/favorites/${roomId}`);
    } catch (err) {
      let favIds = JSON.parse(localStorage.getItem('youroom_favorites') || '[]');
      favIds = favIds.filter(id => id !== roomId);
      localStorage.setItem('youroom_favorites', JSON.stringify(favIds));
      return { data: { success: true, message: 'Đã xóa khỏi yêu thích' } };
    }
  },
};

// === Booking API ===
export const bookingApi = {
  create: async (data) => {
    try {
      return await api.post('/bookings', data);
    } catch (err) {
      const user = useAuthStore.getState().user;
      const room = getLocalRooms().find(r => r.id === Number(data.roomId));
      const booking = {
        id: Date.now(),
        userId: user?.id || 1,
        roomId: data.roomId,
        message: data.message,
        visitDate: data.visitDate,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        room: room || {},
      };
      const bookings = JSON.parse(localStorage.getItem('youroom_mock_bookings') || '[]');
      bookings.unshift(booking);
      localStorage.setItem('youroom_mock_bookings', JSON.stringify(bookings));
      return { data: { success: true, message: 'Đã gửi yêu cầu xem phòng tới chủ trọ!', data: booking } };
    }
  },

  update: async (id, data) => {
    try {
      return await api.patch(`/bookings/${id}`, data);
    } catch (err) {
      return { data: { success: true, message: 'Cập nhật trạng thái thành công' } };
    }
  },
};

// === Reports API ===
export const reportApi = {
  create: async (data) => {
    try {
      return await api.post('/reports', data);
    } catch (err) {
      const user = useAuthStore.getState().user;
      const reports = JSON.parse(localStorage.getItem('youroom_mock_reports') || '[]');
      reports.unshift({
        id: Date.now(),
        userId: user?.id || 1,
        user: user || { fullName: 'Người dùng', email: 'user@example.com' },
        roomId: data.roomId,
        reason: data.reason,
        description: data.description,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('youroom_mock_reports', JSON.stringify(reports));
      return { data: { success: true, message: 'Đã gửi báo cáo vi phạm tới Quản trị viên' } };
    }
  },
};

// === AI API ===
export const aiApi = {
  search: async (query) => {
    try {
      return await api.post('/ai/search', { query });
    } catch (err) {
      // Sử dụng Bộ phân tích NLP & Chấm điểm tương thích thông minh
      const allRooms = getLocalRooms();
      const analysis = aiAnalyzeAndMatchRooms(query, allRooms);

      return {
        data: {
          success: true,
          data: {
            message: analysis.message,
            filters: analysis.filters,
            rooms: analysis.matchedRooms,
            isDemo: true,
            note: 'Chế độ YouRoom AI – Đã phân tích ngôn ngữ tự nhiên và truy vấn dữ liệu phòng thực tế.',
          },
        },
      };
    }
  },

  describe: async (data) => {
    try {
      return await api.post('/ai/describe', data);
    } catch (err) {
      const desc = `Cho thuê ${data.title || 'phòng trọ'} tại vị trí đắc địa ${data.address || ''}, ${data.district ? data.district + ', ' : ''}${data.city || 'Hà Nội'}.\n\n` +
        `• Diện tích: ${data.area || 25} m² thông thoáng, sạch sẽ, đón ánh sáng tự nhiên.\n` +
        `• Tiện ích trang bị sẵn: ${(data.amenities || []).join(', ') || 'Đầy đủ tiện ích cơ bản, nhà vệ sinh riêng, bình nóng lạnh, chỗ để xe rộng rãi'}.\n` +
        `• Chi phí dịch vụ minh bạch: Điện ${data.electricPrice || 3500} đ/kWh, nước ${data.waterPrice || 20000} đ/khối.\n` +
        `• Giá thuê cực tốt: ${(Number(data.price || 0) / 1_000_000).toFixed(1)} triệu/tháng.\n` +
        `• An ninh đảm bảo, giờ giấc tự do không chung chủ. Vui lòng liên hệ số ${data.contactPhone || 'chủ nhà'} để xem phòng miễn phí!`;
      return {
        data: {
          success: true,
          data: {
            description: desc,
            isDemo: true,
            note: 'Mô tả được gợi ý bởi AI mô phỏng dựa trên thông số phòng bạn cung cấp.',
          },
        },
      };
    }
  },

  chat: async (message, history = []) => {
    try {
      return await api.post('/ai/chat', { message, history });
    } catch (err) {
      const lower = message.toLowerCase();
      let reply = '';
      let suggestedRooms = [];

      // Kiểm tra xem câu hỏi có ý định tìm phòng không
      const isFindingRoom = 
        lower.includes('phòng') || lower.includes('tro') || lower.includes('trọ') ||
        lower.includes('tìm') || lower.includes('tim') || lower.includes('thuê') || lower.includes('thue') ||
        lower.includes('ở') || lower.includes('o') || lower.includes('triệu') || lower.includes('tr') ||
        lower.includes('gần') || lower.includes('gan') || lower.includes('ngân sách') || lower.includes('studio') ||
        lower.includes('căn hộ') || lower.includes('mini');

      if (isFindingRoom) {
        const allRooms = getLocalRooms();
        const analysis = aiAnalyzeAndMatchRooms(message, allRooms);
        suggestedRooms = analysis.matchedRooms;
        reply = analysis.message;
      } else if (lower.includes('đăng tin') || lower.includes('cho thuê') || lower.includes('chủ nhà') || lower.includes('chủ trọ')) {
        reply = `Để đăng tin cho thuê phòng trên YouRoom AI:\n` +
          `1. Nhấn nút **"Đăng tin miễn phí"** ở góc phải thanh menu.\n` +
          `2. Điền thông tin phòng, tiện ích và giá điện nước.\n` +
          `3. Sử dụng nút **"AI viết mô tả giúp tôi"** để tạo nội dung chuyên nghiệp tự động.\n` +
          `4. Tải ảnh lên và bấm Gửi duyệt. Tin đăng của bạn sẽ được kiểm duyệt nhanh trong vòng 24h!`;
      } else if (lower.includes('giá') || lower.includes('chi phí') || lower.includes('tiền')) {
        reply = `Giá thuê phòng trọ hiện nay phổ biến ở các mức:\n` +
          `• **1.5 - 2.5 triệu/tháng**: Phòng trọ cơ bản cho sinh viên, diện tích 15-20m².\n` +
          `• **2.5 - 4.0 triệu/tháng**: Phòng khép kín, có điều hòa, ban công, nóng lạnh, an ninh tốt.\n` +
          `• **4.0 - 6.0 triệu/tháng**: Studio, Căn hộ mini full nội thất cao cấp (máy giặt, tủ lạnh, bếp riêng).\n\n` +
          `Bạn đang có ngân sách khoảng bao nhiêu để tôi tìm phòng chính xác cho bạn?`;
      } else {
        reply = `Xin chào! Tôi là trợ lý ảo **YouRoom AI** 🏠.\n\n` +
          `Tôi có thể phân tích nhu cầu và tìm phòng trọ thực tế cho bạn. Bạn chỉ cần mô tả tự nhiên, ví dụ:\n` +
          `• *"Tìm phòng dưới 2.5 triệu gần Học viện Kỹ thuật Mật mã có điều hòa"*\n` +
          `• *"Cần thuê căn hộ mini có máy giặt tại Hà Đông tầm 3 đến 4 triệu"*\n` +
          `• *"Tìm phòng trọ giá rẻ dưới 2 triệu ở Cầu Giấy"*`;
      }

      return {
        data: {
          success: true,
          data: {
            reply,
            suggestedRooms,
            isDemo: true,
          },
        },
      };
    }
  },
};

// === Admin API ===
export const adminApi = {
  getStats: async () => {
    try {
      return await api.get('/admin/stats');
    } catch (err) {
      const rooms = getLocalRooms();
      return {
        data: {
          success: true,
          data: {
            totalUsers: 142,
            totalRooms: rooms.length,
            pendingRooms: rooms.filter(r => r.status === 'PENDING').length,
            approvedRooms: rooms.filter(r => r.status === 'APPROVED').length,
            totalBookings: 38,
            pendingReports: 4,
          },
        },
      };
    }
  },

  getRooms: async (params = {}) => {
    try {
      return await api.get('/admin/rooms', { params });
    } catch (err) {
      let rooms = getLocalRooms();
      if (params.status) rooms = rooms.filter(r => r.status === params.status);
      return {
        data: {
          success: true,
          data: { rooms, total: rooms.length },
        },
      };
    }
  },

  approveRoom: async (id) => {
    try {
      return await api.patch(`/admin/rooms/${id}/approve`);
    } catch (err) {
      const rooms = getLocalRooms();
      const room = rooms.find(r => r.id === Number(id));
      if (room) room.status = 'APPROVED';
      saveLocalRooms(rooms);
      return { data: { success: true, message: 'Đã phê duyệt tin đăng' } };
    }
  },

  rejectRoom: async (id) => {
    try {
      return await api.patch(`/admin/rooms/${id}/reject`);
    } catch (err) {
      const rooms = getLocalRooms();
      const room = rooms.find(r => r.id === Number(id));
      if (room) room.status = 'REJECTED';
      saveLocalRooms(rooms);
      return { data: { success: true, message: 'Đã từ chối / gỡ tin đăng' } };
    }
  },

  deleteRoom: async (id) => {
    try {
      return await api.delete(`/admin/rooms/${id}`);
    } catch (err) {
      const rooms = getLocalRooms().filter(r => r.id !== Number(id));
      saveLocalRooms(rooms);
      return { data: { success: true, message: 'Đã xóa hoàn toàn phòng trọ khỏi hệ thống' } };
    }
  },

  getUsers: async () => {
    try {
      return await api.get('/admin/users');
    } catch (err) {
      return {
        data: {
          success: true,
          data: {
            users: [
              { id: 1, fullName: 'Quản trị viên', email: 'admin@youroom.ai', role: 'ADMIN', createdAt: '2024-01-01' },
              { id: 2, fullName: 'Nguyễn Văn Nam', email: 'nam@example.com', role: 'USER', phone: '0912345678', createdAt: '2024-02-15' },
              { id: 3, fullName: 'Trần Thị Mai', email: 'mai@example.com', role: 'USER', phone: '0923456789', createdAt: '2024-02-20' },
              { id: 4, fullName: 'Lê Minh Tuấn', email: 'tuan@example.com', role: 'USER', phone: '0934567890', createdAt: '2024-03-01' },
            ],
            total: 4,
          },
        },
      };
    }
  },

  deleteUser: async (id) => {
    try {
      return await api.delete(`/admin/users/${id}`);
    } catch (err) {
      return { data: { success: true, message: 'Đã xóa người dùng khỏi hệ thống' } };
    }
  },

  getReports: async () => {
    try {
      return await api.get('/admin/reports');
    } catch (err) {
      const reports = JSON.parse(localStorage.getItem('youroom_mock_reports') || '[]');
      if (reports.length === 0) {
        reports.push({
          id: 101,
          userId: 2,
          user: { fullName: 'Nguyễn Văn Nam', email: 'nam@example.com' },
          roomId: 1,
          reason: 'Thông tin không đúng thực tế',
          description: 'Ảnh phòng đăng tải khác với phòng thực tế khi tới xem.',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        });
      }
      return { data: { success: true, data: { reports, total: reports.length } } };
    }
  },

  handleReport: async (id, data) => {
    try {
      return await api.patch(`/admin/reports/${id}`, data);
    } catch (err) {
      let reports = JSON.parse(localStorage.getItem('youroom_mock_reports') || '[]');
      reports = reports.map(r => r.id === Number(id) ? { ...r, status: 'RESOLVED' } : r);
      localStorage.setItem('youroom_mock_reports', JSON.stringify(reports));
      return { data: { success: true, message: 'Đã xử lý báo cáo vi phạm' } };
    }
  },
};

export default api;
