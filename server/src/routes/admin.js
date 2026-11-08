import express from 'express';
import prisma from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Apply both middlewares to all admin routes
router.use(authMiddleware, adminMiddleware);

// GET /api/admin/stats - Dashboard thống kê
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalRooms, pendingRooms, approvedRooms, totalBookings, pendingReports] = await Promise.all([
      prisma.user.count(),
      prisma.room.count(),
      prisma.room.count({ where: { status: 'PENDING' } }),
      prisma.room.count({ where: { status: 'APPROVED' } }),
      prisma.booking.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
    ]);
    res.json({ success: true, data: { totalUsers, totalRooms, pendingRooms, approvedRooms, totalBookings, pendingReports } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// GET /api/admin/users - Danh sách người dùng
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, keyword } = req.query;
    const where = keyword ? { OR: [{ fullName: { contains: keyword } }, { email: { contains: keyword } }] } : {};
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, fullName: true, email: true, phone: true, role: true, avatar: true, createdAt: true, _count: { select: { rooms: true, bookings: true } } },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);
    res.json({ success: true, data: { users, total } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// DELETE /api/admin/users/:id - Xóa người dùng
router.delete('/users/:id', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Đã xóa người dùng' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// GET /api/admin/rooms - Tất cả tin đăng
router.get('/rooms', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where = status ? { status } : {};
    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        include: { owner: { select: { id: true, fullName: true, email: true } } },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.room.count({ where }),
    ]);
    res.json({
      success: true,
      data: {
        rooms: rooms.map(r => ({ ...r, images: JSON.parse(r.images || '[]'), amenities: JSON.parse(r.amenities || '[]') })),
        total,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// PATCH /api/admin/rooms/:id/approve - Duyệt phòng
router.patch('/rooms/:id/approve', async (req, res) => {
  try {
    const room = await prisma.room.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'APPROVED' },
    });
    res.json({ success: true, message: 'Đã duyệt phòng', data: room });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// PATCH /api/admin/rooms/:id/reject - Từ chối / Gỡ phòng
router.patch('/rooms/:id/reject', async (req, res) => {
  try {
    const room = await prisma.room.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'REJECTED' },
    });
    res.json({ success: true, message: 'Đã từ chối / gỡ phòng khỏi hệ thống', data: room });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// DELETE /api/admin/rooms/:id - Admin xóa phòng vĩnh viễn
router.delete('/rooms/:id', async (req, res) => {
  try {
    const roomId = parseInt(req.params.id);
    // Xóa các liên kết trước nếu có
    await prisma.favorite.deleteMany({ where: { roomId } }).catch(() => {});
    await prisma.booking.deleteMany({ where: { roomId } }).catch(() => {});
    await prisma.report.deleteMany({ where: { roomId } }).catch(() => {});
    await prisma.room.delete({ where: { id: roomId } });
    res.json({ success: true, message: 'Quản trị viên đã xóa phòng thành công' });
  } catch (err) {
    console.error('Admin delete room error:', err);
    res.status(500).json({ success: false, message: 'Lỗi khi xóa phòng' });
  }
});

// GET /api/admin/reports - Danh sách báo cáo
router.get('/reports', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where = status ? { status } : {};
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          room: { select: { id: true, title: true, address: true, images: true, ownerId: true } },
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.report.count({ where }),
    ]);
    res.json({ success: true, data: { reports, total } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// PATCH /api/admin/reports/:id - Xử lý báo cáo
router.patch('/reports/:id', async (req, res) => {
  try {
    const { status, action } = req.body; // action: 'delete_room' | 'dismiss'
    const report = await prisma.report.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!report) return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo' });

    if (action === 'delete_room') {
      await prisma.room.delete({ where: { id: report.roomId } });
    }
    await prisma.report.update({
      where: { id: parseInt(req.params.id) },
      data: { status: status || 'RESOLVED' },
    });
    res.json({ success: true, message: 'Đã xử lý báo cáo' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

export default router;
