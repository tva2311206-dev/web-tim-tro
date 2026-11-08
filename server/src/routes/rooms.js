import express from 'express';
import prisma from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/rooms - Danh sách phòng (có filter, sort, pagination)
router.get('/', async (req, res) => {
  try {
    const {
      city, district, ward, minPrice, maxPrice, minArea, maxArea,
      roomType, amenities, maxOccupants, sort = 'newest',
      page = 1, limit = 12, keyword,
    } = req.query;

    const where = { status: 'APPROVED' };

    if (city) where.city = { contains: city };
    if (district) where.district = { contains: district };
    if (ward) where.ward = { contains: ward };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice);
      if (maxPrice) where.price.lte = parseInt(maxPrice);
    }
    if (minArea || maxArea) {
      where.area = {};
      if (minArea) where.area.gte = parseFloat(minArea);
      if (maxArea) where.area.lte = parseFloat(maxArea);
    }
    if (roomType) where.roomType = roomType;
    if (maxOccupants) where.maxOccupants = { lte: parseInt(maxOccupants) };
    if (amenities) {
      const amList = Array.isArray(amenities) ? amenities : [amenities];
      where.AND = amList.map(a => ({ amenities: { contains: a } }));
    }
    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { description: { contains: keyword } },
        { address: { contains: keyword } },
        { district: { contains: keyword } },
      ];
    }

    const orderBy = sort === 'price_asc' ? { price: 'asc' }
      : sort === 'price_desc' ? { price: 'desc' }
      : sort === 'area_asc' ? { area: 'asc' }
      : { createdAt: 'desc' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        orderBy,
        skip,
        take: parseInt(limit),
        include: { owner: { select: { id: true, fullName: true, phone: true, avatar: true } } },
      }),
      prisma.room.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        rooms: rooms.map(r => ({ ...r, images: JSON.parse(r.images || '[]'), amenities: JSON.parse(r.amenities || '[]') })),
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Get rooms error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// GET /api/rooms/featured - Phòng nổi bật
router.get('/featured', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { owner: { select: { id: true, fullName: true, phone: true, avatar: true } } },
    });
    res.json({
      success: true,
      data: rooms.map(r => ({ ...r, images: JSON.parse(r.images || '[]'), amenities: JSON.parse(r.amenities || '[]') })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// GET /api/rooms/:id - Chi tiết phòng
router.get('/:id', async (req, res) => {
  try {
    const room = await prisma.room.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { owner: { select: { id: true, fullName: true, phone: true, avatar: true, email: true } } },
    });
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });
    if (room.status !== 'APPROVED') return res.status(403).json({ success: false, message: 'Phòng chưa được duyệt' });
    res.json({
      success: true,
      data: { ...room, images: JSON.parse(room.images || '[]'), amenities: JSON.parse(room.amenities || '[]') },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// GET /api/rooms/:id/similar - Phòng tương tự
router.get('/:id/similar', async (req, res) => {
  try {
    const room = await prisma.room.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });
    const similar = await prisma.room.findMany({
      where: {
        status: 'APPROVED',
        city: room.city,
        id: { not: room.id },
        price: { gte: room.price * 0.7, lte: room.price * 1.3 },
      },
      take: 4,
      include: { owner: { select: { id: true, fullName: true, phone: true, avatar: true } } },
    });
    res.json({
      success: true,
      data: similar.map(r => ({ ...r, images: JSON.parse(r.images || '[]'), amenities: JSON.parse(r.amenities || '[]') })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// POST /api/rooms - Đăng tin phòng (cần đăng nhập)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title, description, roomType, price, area, address, district, city, ward,
      maxOccupants, electricPrice, waterPrice, internetPrice,
      images, amenities, contactPhone,
    } = req.body;

    if (!title || !price || !area || !address || !city) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
    }

    const room = await prisma.room.create({
      data: {
        title, description: description || '', roomType: roomType || 'PHONG_TRO',
        price: parseInt(price), area: parseFloat(area),
        address, district: district || '', city, ward: ward || '',
        maxOccupants: parseInt(maxOccupants) || 2,
        electricPrice: parseInt(electricPrice) || 3500,
        waterPrice: parseInt(waterPrice) || 15000,
        internetPrice: parseInt(internetPrice) || 100000,
        images: JSON.stringify(images || []),
        amenities: JSON.stringify(amenities || []),
        contactPhone: contactPhone || '',
        ownerId: req.user.id,
        status: 'PENDING',
      },
    });

    res.status(201).json({ success: true, message: 'Đăng tin thành công, đang chờ duyệt', data: room });
  } catch (err) {
    console.error('Create room error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// PUT /api/rooms/:id - Cập nhật phòng
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const room = await prisma.room.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });
    if (room.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Không có quyền chỉnh sửa' });
    }

    const { images, amenities, ...rest } = req.body;
    const updated = await prisma.room.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...rest,
        ...(images !== undefined && { images: JSON.stringify(images) }),
        ...(amenities !== undefined && { amenities: JSON.stringify(amenities) }),
        status: 'PENDING', // Cần duyệt lại sau khi sửa
      },
    });
    res.json({ success: true, message: 'Cập nhật thành công, đang chờ duyệt lại', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// DELETE /api/rooms/:id - Xóa phòng
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const room = await prisma.room.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });
    if (room.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Không có quyền xóa' });
    }
    await prisma.room.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Đã xóa phòng' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

export default router;
