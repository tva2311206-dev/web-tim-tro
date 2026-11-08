import express from 'express';
import prisma from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// POST /api/reports - Báo cáo phòng
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { roomId, reason, description } = req.body;
    const report = await prisma.report.create({
      data: { userId: req.user.id, roomId: parseInt(roomId), reason, description },
    });
    res.status(201).json({ success: true, message: 'Đã gửi báo cáo', data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

export default router;
