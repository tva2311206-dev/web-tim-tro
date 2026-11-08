import express from 'express';
import prisma from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// POST /api/bookings - Gửi yêu cầu xem phòng
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { roomId, message, visitDate } = req.body;
    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        roomId: parseInt(roomId),
        message,
        visitDate: visitDate ? new Date(visitDate) : null,
        status: 'PENDING',
      },
    });
    res.status(201).json({ success: true, message: 'Đã gửi yêu cầu xem phòng', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// PATCH /api/bookings/:id - Cập nhật trạng thái
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await prisma.booking.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
    });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

export default router;
