import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users/me - Thông tin cá nhân
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, fullName: true, email: true, phone: true, role: true, avatar: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// PUT /api/users/me - Cập nhật thông tin
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { fullName, phone, avatar } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { fullName, phone, avatar },
      select: { id: true, fullName: true, email: true, phone: true, role: true, avatar: true },
    });
    res.json({ success: true, message: 'Cập nhật thành công', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// PUT /api/users/me/password - Đổi mật khẩu
router.put('/me/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// GET /api/users/me/rooms - Tin đăng của tôi
router.get('/me/rooms', authMiddleware, async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      where: { ownerId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: rooms.map(r => ({ ...r, images: JSON.parse(r.images || '[]'), amenities: JSON.parse(r.amenities || '[]') })) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// GET /api/users/me/bookings - Yêu cầu xem phòng đã gửi
router.get('/me/bookings', authMiddleware, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        room: {
          select: { id: true, title: true, address: true, city: true, price: true, images: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: bookings.map(b => ({ ...b, room: { ...b.room, images: JSON.parse(b.room.images || '[]') } })) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// GET /api/users/me/received-bookings - Yêu cầu liên hệ nhận được (với tư cách chủ trọ)
router.get('/me/received-bookings', authMiddleware, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { room: { ownerId: req.user.id } },
      include: {
        user: { select: { id: true, fullName: true, phone: true, email: true, avatar: true } },
        room: { select: { id: true, title: true, address: true, city: true, price: true, images: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: bookings.map(b => ({ ...b, room: { ...b.room, images: JSON.parse(b.room.images || '[]') } })) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

export default router;
