import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SAMPLE_IMAGES = {
  studio: [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  ],
  phong_tro: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80',
  ],
  can_ho: [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400&q=80',
  ],
  noi_that: [
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&q=80',
  ],
  dep: [
    'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=800&q=80',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&q=80',
  ],
  nha_bep: [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400&q=80',
  ],
};

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu...');

  // Xóa dữ liệu cũ
  await prisma.report.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  // Tạo Admin
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.create({
    data: {
      fullName: 'Quản trị viên',
      email: 'admin@youroom.ai',
      phone: '0901234567',
      password: adminPassword,
      role: 'ADMIN',
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=173B57&color=fff',
    },
  });
  console.log('✅ Tạo Admin:', admin.email);

  // Tạo Users (vừa là chủ trọ vừa là người thuê)
  const user1Password = await bcrypt.hash('User@123', 12);
  const user1 = await prisma.user.create({
    data: {
      fullName: 'Nguyễn Văn Nam',
      email: 'nam@example.com',
      phone: '0912345678',
      password: user1Password,
      avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+Nam&background=E58B55&color=fff',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      fullName: 'Trần Thị Mai',
      email: 'mai@example.com',
      phone: '0923456789',
      password: user1Password,
      avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+Mai&background=DCEFE5&color=173B57',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      fullName: 'Lê Minh Tuấn',
      email: 'tuan@example.com',
      phone: '0934567890',
      password: user1Password,
      avatar: 'https://ui-avatars.com/api/?name=Le+Minh+Tuan&background=EAF4FB&color=173B57',
    },
  });

  // Tạo demo user
  const demoUser = await prisma.user.create({
    data: {
      fullName: 'Demo User',
      email: 'demo@youroom.ai',
      phone: '0999888777',
      password: user1Password,
      avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=173B57&color=fff',
    },
  });

  console.log('✅ Tạo 4 người dùng mẫu');

  // Tạo 15 phòng trọ mẫu
  const rooms = [
    {
      title: 'Phòng Studio gần Học viện Kỹ thuật Mật mã',
      description: 'Phòng studio hiện đại, thoáng mát, đầy đủ nội thất cơ bản. Vị trí đắc địa, cách HV Kỹ thuật Mật mã chỉ 500m. An ninh 24/7, có camera giám sát, chỗ để xe rộng rãi.',
      roomType: 'STUDIO',
      price: 2800000,
      area: 25,
      address: '15 Nguyễn Chánh, Cầu Giấy',
      district: 'Cầu Giấy',
      city: 'Hà Nội',
      ward: 'Yên Hòa',
      maxOccupants: 2,
      electricPrice: 3500,
      waterPrice: 15000,
      internetPrice: 100000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80',
      ]),
      amenities: JSON.stringify(['Điều hòa', 'Nóng lạnh', 'Nhà VS riêng', 'Chỗ để xe', 'An ninh 24/7', 'Wifi']),
      contactPhone: '0912345678',
      ownerId: user1.id,
      status: 'APPROVED',
    },
    {
      title: 'Phòng trọ có ban công tại Cầu Giấy',
      description: 'Phòng rộng rãi có ban công thoáng, nhìn ra sân vườn xanh mát. Phòng sạch sẽ, an toàn, môi trường yên tĩnh phù hợp cho sinh viên và người đi làm.',
      roomType: 'PHONG_TRO',
      price: 3500000,
      area: 30,
      address: '28 Trần Đăng Ninh, Cầu Giấy',
      district: 'Cầu Giấy',
      city: 'Hà Nội',
      ward: 'Dịch Vọng Hậu',
      maxOccupants: 2,
      electricPrice: 3500,
      waterPrice: 15000,
      internetPrice: 0,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
        'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=600&q=80',
      ]),
      amenities: JSON.stringify(['Điều hòa', 'Ban công', 'Nóng lạnh', 'Nhà VS riêng', 'Tủ lạnh', 'Chỗ để xe']),
      contactPhone: '0923456789',
      ownerId: user2.id,
      status: 'APPROVED',
    },
    {
      title: 'Phòng full nội thất tại Thanh Xuân',
      description: 'Phòng trọ cao cấp đầy đủ nội thất gồm giường, tủ quần áo, bàn học, kệ bếp mini. Khu vực yên tĩnh, an ninh, gần chợ và siêu thị tiện lợi.',
      roomType: 'PHONG_TRO',
      price: 4000000,
      area: 35,
      address: '72 Nguyễn Trãi, Thanh Xuân',
      district: 'Thanh Xuân',
      city: 'Hà Nội',
      ward: 'Thanh Xuân Nam',
      maxOccupants: 2,
      electricPrice: 3800,
      waterPrice: 15000,
      internetPrice: 100000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80',
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80',
      ]),
      amenities: JSON.stringify(['Điều hòa', 'Máy giặt', 'Tủ lạnh', 'Nóng lạnh', 'Nhà VS riêng', 'Giường', 'Tủ quần áo', 'Bàn học', 'Chỗ để xe', 'An ninh']),
      contactPhone: '0934567890',
      ownerId: user3.id,
      status: 'APPROVED',
    },
    {
      title: 'Phòng trọ giá rẻ gần ĐH Quốc gia Hà Nội',
      description: 'Phòng trọ giá rẻ dành cho sinh viên, cách Đại học Quốc gia 300m. Phòng sạch sẽ, thoáng mát, có cửa sổ, khu vực sinh viên sầm uất.',
      roomType: 'PHONG_TRO',
      price: 1800000,
      area: 18,
      address: '144 Xuân Thủy, Cầu Giấy',
      district: 'Cầu Giấy',
      city: 'Hà Nội',
      ward: 'Dịch Vọng',
      maxOccupants: 2,
      electricPrice: 3500,
      waterPrice: 10000,
      internetPrice: 50000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
      ]),
      amenities: JSON.stringify(['Nóng lạnh', 'Nhà VS riêng', 'Chỗ để xe', 'Wifi chung']),
      contactPhone: '0912345678',
      ownerId: user1.id,
      status: 'APPROVED',
    },
    {
      title: 'Căn hộ mini hiện đại tại Hà Đông',
      description: 'Căn hộ mini thiết kế tối giản nhưng đầy đủ tiện nghi. Phòng khách nhỏ, bếp mini, nhà vệ sinh riêng, ban công nhỏ hướng Đông. Môi trường yên tĩnh, cư dân văn minh.',
      roomType: 'CAN_HO_MINI',
      price: 3200000,
      area: 32,
      address: '45 Lê Văn Lương, Hà Đông',
      district: 'Hà Đông',
      city: 'Hà Nội',
      ward: 'Mộ Lao',
      maxOccupants: 2,
      electricPrice: 3500,
      waterPrice: 15000,
      internetPrice: 100000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=800&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
      ]),
      amenities: JSON.stringify(['Điều hòa', 'Nóng lạnh', 'Tủ lạnh', 'Nhà VS riêng', 'Bếp mini', 'Ban công', 'Chỗ để xe', 'Thang máy']),
      contactPhone: '0923456789',
      ownerId: user2.id,
      status: 'APPROVED',
    },
    {
      title: 'Phòng trọ dành cho 2 người tại Đống Đa',
      description: 'Phòng rộng 30m², phù hợp cho 2 người ở chung. Giá chia đôi rất hợp lý, phòng có tủ lạnh, điều hòa, 2 giường đơn hoặc 1 giường đôi theo yêu cầu.',
      roomType: 'PHONG_TRO',
      price: 2500000,
      area: 30,
      address: '33 Chùa Láng, Đống Đa',
      district: 'Đống Đa',
      city: 'Hà Nội',
      ward: 'Láng Thượng',
      maxOccupants: 2,
      electricPrice: 3500,
      waterPrice: 15000,
      internetPrice: 80000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',
        'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=600&q=80',
      ]),
      amenities: JSON.stringify(['Điều hòa', 'Tủ lạnh', 'Nóng lạnh', 'Nhà VS riêng', 'Chỗ để xe', 'An ninh']),
      contactPhone: '0934567890',
      ownerId: user3.id,
      status: 'APPROVED',
    },
    {
      title: 'Studio view đẹp tại quận Ba Đình',
      description: 'Studio cao tầng, view thoáng nhìn ra hồ Trúc Bạch. Nội thất Hàn Quốc, hiện đại, sạch sẽ. Thang máy, bảo vệ 24/7, hầm xe. Phù hợp cho người đi làm thu nhập tốt.',
      roomType: 'STUDIO',
      price: 5500000,
      area: 28,
      address: '12 Nguyễn Khắc Hiếu, Ba Đình',
      district: 'Ba Đình',
      city: 'Hà Nội',
      ward: 'Trúc Bạch',
      maxOccupants: 2,
      electricPrice: 3500,
      waterPrice: 15000,
      internetPrice: 150000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80',
        'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=600&q=80',
      ]),
      amenities: JSON.stringify(['Điều hòa', 'Máy giặt', 'Tủ lạnh', 'Nóng lạnh', 'Nhà VS riêng', 'Thang máy', 'Hầm xe', 'An ninh 24/7', 'View hồ']),
      contactPhone: '0912345678',
      ownerId: user1.id,
      status: 'APPROVED',
    },
    {
      title: 'Phòng trọ gần bệnh viện Bạch Mai',
      description: 'Phòng sạch sẽ, an toàn, cách BV Bạch Mai 200m. Phù hợp cho nhân viên y tế, sinh viên y khoa. Khu dân cư yên tĩnh, có cổng riêng khóa ban đêm.',
      roomType: 'PHONG_TRO',
      price: 2200000,
      area: 20,
      address: '8 Phương Mai, Đống Đa',
      district: 'Đống Đa',
      city: 'Hà Nội',
      ward: 'Phương Mai',
      maxOccupants: 2,
      electricPrice: 3500,
      waterPrice: 15000,
      internetPrice: 0,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
      ]),
      amenities: JSON.stringify(['Nóng lạnh', 'Nhà VS riêng', 'Chỗ để xe', 'An ninh', 'Cổng riêng']),
      contactPhone: '0923456789',
      ownerId: user2.id,
      status: 'APPROVED',
    },
    {
      title: 'Căn hộ mini full nội thất tại Nam Từ Liêm',
      description: 'Căn hộ mini mới xây, full nội thất cao cấp. Gần KĐT Mỹ Đình, trung tâm thương mại Aeon Mall. Môi trường sống hiện đại, thuận tiện di chuyển.',
      roomType: 'CAN_HO_MINI',
      price: 4500000,
      area: 38,
      address: '102 Mỹ Đình, Nam Từ Liêm',
      district: 'Nam Từ Liêm',
      city: 'Hà Nội',
      ward: 'Mỹ Đình 1',
      maxOccupants: 3,
      electricPrice: 3500,
      waterPrice: 15000,
      internetPrice: 100000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
        'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
      ]),
      amenities: JSON.stringify(['Điều hòa', 'Máy giặt', 'Tủ lạnh', 'Nóng lạnh', 'Nhà VS riêng', 'Bếp đầy đủ', 'Sofa', 'TV', 'Thang máy', 'Hầm xe', 'An ninh 24/7']),
      contactPhone: '0934567890',
      ownerId: user3.id,
      status: 'APPROVED',
    },
    {
      title: 'Phòng trọ máy lạnh giá rẻ tại Hai Bà Trưng',
      description: 'Phòng trọ có máy lạnh riêng, nhà vệ sinh riêng, giá rẻ nhất khu vực. Gần hồ Thiền Quang, khu phố đi bộ. Thích hợp cho sinh viên và người mới ra trường.',
      roomType: 'PHONG_TRO',
      price: 2000000,
      area: 22,
      address: '56 Bà Triệu, Hai Bà Trưng',
      district: 'Hai Bà Trưng',
      city: 'Hà Nội',
      ward: 'Bùi Thị Xuân',
      maxOccupants: 2,
      electricPrice: 3500,
      waterPrice: 12000,
      internetPrice: 60000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80',
      ]),
      amenities: JSON.stringify(['Điều hòa', 'Nóng lạnh', 'Nhà VS riêng', 'Chỗ để xe', 'Wifi']),
      contactPhone: '0912345678',
      ownerId: user1.id,
      status: 'APPROVED',
    },
    {
      title: 'Phòng trọ tại TP. Hồ Chí Minh – Quận 1',
      description: 'Phòng trọ trung tâm TP.HCM, cách Bến Thành 1km. Tiện đi lại, gần các tuyến xe buýt và Metro. Phòng sạch, thoáng, an ninh tốt.',
      roomType: 'PHONG_TRO',
      price: 3800000,
      area: 25,
      address: '15 Lý Tự Trọng, Quận 1',
      district: 'Quận 1',
      city: 'TP. Hồ Chí Minh',
      ward: 'Bến Thành',
      maxOccupants: 2,
      electricPrice: 4000,
      waterPrice: 15000,
      internetPrice: 100000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=800&q=80',
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80',
      ]),
      amenities: JSON.stringify(['Điều hòa', 'Nóng lạnh', 'Nhà VS riêng', 'Chỗ để xe máy', 'An ninh', 'Camera']),
      contactPhone: '0923456789',
      ownerId: user2.id,
      status: 'APPROVED',
    },
    {
      title: 'Căn hộ studio Bình Thạnh, TP.HCM',
      description: 'Studio mới xây năm 2023, nội thất hiện đại, cách trung tâm Q1 chỉ 10 phút xe máy. Khu vực an ninh, dân cư văn minh, nhiều nhà hàng và café xung quanh.',
      roomType: 'STUDIO',
      price: 4200000,
      area: 30,
      address: '88 Đinh Tiên Hoàng, Bình Thạnh',
      district: 'Bình Thạnh',
      city: 'TP. Hồ Chí Minh',
      ward: 'Phường 3',
      maxOccupants: 2,
      electricPrice: 4000,
      waterPrice: 15000,
      internetPrice: 120000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80',
      ]),
      amenities: JSON.stringify(['Điều hòa', 'Máy giặt riêng', 'Tủ lạnh', 'Nóng lạnh', 'Nhà VS riêng', 'Bếp điện', 'Chỗ để xe', 'Thang máy']),
      contactPhone: '0934567890',
      ownerId: user3.id,
      status: 'APPROVED',
    },
    {
      title: 'Phòng trọ gần Đại học Đà Nẵng',
      description: 'Phòng trọ dành cho sinh viên ĐH Đà Nẵng và ĐH Bách Khoa. Cách trường 500m, môi trường sinh viên sôi động, nhiều quán ăn bình dân xung quanh.',
      roomType: 'PHONG_TRO',
      price: 1500000,
      area: 18,
      address: '90 Ngô Quyền, Hải Châu',
      district: 'Hải Châu',
      city: 'Đà Nẵng',
      ward: 'Phước Ninh',
      maxOccupants: 2,
      electricPrice: 3500,
      waterPrice: 10000,
      internetPrice: 50000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80',
      ]),
      amenities: JSON.stringify(['Nóng lạnh', 'Nhà VS riêng', 'Chỗ để xe', 'Wifi chung']),
      contactPhone: '0912345678',
      ownerId: user1.id,
      status: 'APPROVED',
    },
    {
      title: 'Căn hộ mini view biển Đà Nẵng',
      description: 'Căn hộ mini tầng cao, có thể nhìn thấy biển Mỹ Khê từ cửa sổ. Nội thất đẹp, phù hợp cho cặp đôi hoặc người đi làm. Khu vực du lịch sầm uất.',
      roomType: 'CAN_HO_MINI',
      price: 3600000,
      area: 35,
      address: '25 Võ Nguyên Giáp, Sơn Trà',
      district: 'Sơn Trà',
      city: 'Đà Nẵng',
      ward: 'Mỹ An',
      maxOccupants: 2,
      electricPrice: 3500,
      waterPrice: 15000,
      internetPrice: 100000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
        'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=600&q=80',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
      ]),
      amenities: JSON.stringify(['Điều hòa', 'Tủ lạnh', 'Nóng lạnh', 'Nhà VS riêng', 'Ban công', 'View biển', 'Chỗ để xe', 'Thang máy']),
      contactPhone: '0923456789',
      ownerId: user2.id,
      status: 'APPROVED',
    },
    {
      title: 'Phòng trọ chờ duyệt – Hoàn Kiếm, HN',
      description: 'Phòng trọ mới đăng, đang chờ admin duyệt. Vị trí trung tâm Hoàn Kiếm, gần hồ Gươm.',
      roomType: 'PHONG_TRO',
      price: 3000000,
      area: 22,
      address: '5 Hàng Bài, Hoàn Kiếm',
      district: 'Hoàn Kiếm',
      city: 'Hà Nội',
      ward: 'Tràng Tiền',
      maxOccupants: 2,
      electricPrice: 3500,
      waterPrice: 15000,
      internetPrice: 100000,
      images: JSON.stringify(['https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80']),
      amenities: JSON.stringify(['Điều hòa', 'Nóng lạnh', 'Nhà VS riêng']),
      contactPhone: '0934567890',
      ownerId: user3.id,
      status: 'PENDING',
    },
  ];

  for (const room of rooms) {
    await prisma.room.create({ data: room });
  }

  console.log('✅ Tạo 15 phòng trọ mẫu');

  console.log('\n🎉 Seed hoàn thành!');
  console.log('📋 Tài khoản demo:');
  console.log('  Admin: admin@youroom.ai / Admin@123');
  console.log('  User:  demo@youroom.ai  / User@123');
  console.log('  Chủ trọ: nam@example.com / User@123');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
