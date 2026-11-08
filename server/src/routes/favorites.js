import express from 'express';
import prisma from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/favorites - Danh sách phòng yêu thích
router.get('/', authMiddleware, async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        room: {
          include: { owner: { select: { id: true, fullName: true, phone: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({
      success: true,
      data: favorites.map(f => ({
        ...f,
        room: { ...f.room, images: JSON.parse(f.room.images || '[]'), amenities: JSON.parse(f.room.amenities || '[]') },
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// POST /api/favorites - Thêm vào yêu thích
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.body;
    const favorite = await prisma.favorite.create({
      data: { userId: req.user.id, roomId: parseInt(roomId) },
    });
    res.status(201).json({ success: true, message: 'Đã thêm vào yêu thích', data: favorite });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Phòng đã có trong danh sách yêu thích' });
    }
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// DELETE /api/favorites/:roomId - Xóa khỏi yêu thích
router.delete('/:roomId', authMiddleware, async (req, res) => {
  try {
    await prisma.favorite.deleteMany({
      where: { userId: req.user.id, roomId: parseInt(req.params.roomId) },
    });
    res.json({ success: true, message: 'Đã xóa khỏi yêu thích' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

export default router;
