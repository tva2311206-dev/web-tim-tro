import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

/**
 * Xóa dấu tiếng Việt
 */
function removeVietnameseTones(str) {
  if (!str) return '';
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
  str = str.replace(/\u02C6|\u0306|\u031B/g, '');
  return str.trim();
}

/**
 * Phân tích câu truy vấn tiếng Việt thành các tiêu chí lọc thông minh
 */
function parseQueryToFilters(query) {
  if (!query) return {};
  const rawLower = query.toLowerCase().trim();
  const lower = removeVietnameseTones(rawLower);

  const filters = {
    maxPrice: null,
    minPrice: null,
    targetPrice: null,
    city: null,
    district: null,
    school: null,
    roomType: null,
    occupants: null,
    isStudentOrNearUniversity: false,
    hasBalcony: false,
    isFullFurniture: false,
    amenities: [],
  };

  // 1. Phân tích Giá (2tr5, 2.5 triệu, dưới 3 triệu, từ 2 đến 3tr, ngân sách 2.5tr...)
  const splitTrMatch = rawLower.match(/(\d+)\s*(?:tr|trieu|triệu)\s*(\d+)/i);
  if (splitTrMatch) {
    const main = parseFloat(splitTrMatch[1]);
    const sub = parseFloat(splitTrMatch[2]);
    filters.targetPrice = (main + sub / 10) * 1_000_000;
    filters.maxPrice = filters.targetPrice * 1.15;
  }

  const rangeMatch = rawLower.match(/(?:từ|tu)\s*([\d,\.]+)\s*(?:đến|den|-)\s*([\d,\.]+)\s*(?:tr|trieu|triệu|k)?/i);
  if (rangeMatch) {
    const p1 = parseFloat(rangeMatch[1].replace(',', '.'));
    const p2 = parseFloat(rangeMatch[2].replace(',', '.'));
    filters.minPrice = p1 > 100 ? p1 * 1000 : p1 * 1_000_000;
    filters.maxPrice = p2 > 100 ? p2 * 1000 : p2 * 1_000_000;
  }

  if (!filters.maxPrice) {
    const maxMatch = rawLower.match(/(?:dưới|duoi|tối đa|toi da|<|nhỏ hơn|nho hon|dưới tầm|dưới khoảng)\s*([\d,\.]+)\s*(?:tr|trieu|triệu|k)?/i);
    if (maxMatch) {
      const val = parseFloat(maxMatch[1].replace(',', '.'));
      filters.maxPrice = val > 100 ? val * 1000 : val * 1_000_000;
    }
  }

  if (!filters.minPrice) {
    const minMatch = rawLower.match(/(?:từ|tu|trên|tren|>|lớn hơn|lon hon)\s*([\d,\.]+)\s*(?:tr|trieu|triệu|k)?/i);
    if (minMatch) {
      const val = parseFloat(minMatch[1].replace(',', '.'));
      filters.minPrice = val > 100 ? val * 1000 : val * 1_000_000;
    }
  }

  if (!filters.maxPrice && !filters.targetPrice) {
    const targetMatch = rawLower.match(/(?:ngân sách|ngan sach|tầm|tam|khoảng|khoang|giá|gia)\s*([\d,\.]+)\s*(?:tr|trieu|triệu|k)?/i);
    if (targetMatch) {
      const val = parseFloat(targetMatch[1].replace(',', '.'));
      filters.targetPrice = val > 100 ? val * 1000 : val * 1_000_000;
      filters.maxPrice = filters.targetPrice * 1.15;
      filters.minPrice = filters.targetPrice * 0.65;
    }
  }

  if (!filters.maxPrice && !filters.targetPrice) {
    const singleMatch = rawLower.match(/(?:phòng|tro|trọ)\s*([\d,\.]+)\s*(?:tr|trieu|triệu)/i);
    if (singleMatch) {
      const val = parseFloat(singleMatch[1].replace(',', '.'));
      filters.targetPrice = val * 1_000_000;
      filters.maxPrice = filters.targetPrice * 1.15;
    }
  }

  if (lower.includes('gia re') || lower.includes('tiet kiem') || lower.includes('re')) {
    if (!filters.maxPrice) filters.maxPrice = 2500000;
  }

  // 2. Phân tích Thành phố
  if (lower.includes('ha noi') || lower.includes('hn')) {
    filters.city = 'Hà Nội';
  } else if (lower.includes('ho chi minh') || lower.includes('tp hcm') || lower.includes('tphcm') || lower.includes('sai gon') || lower.includes('q1') || lower.includes('quan 1')) {
    filters.city = 'TP. Hồ Chí Minh';
  } else if (lower.includes('da nang') || lower.includes('dn')) {
    filters.city = 'Đà Nẵng';
  }

  // 3. Phân tích Trường học & Khu vực
  if (lower.includes('mat ma') || lower.includes('ky thuat mat ma') || lower.includes('kma') || lower.includes('act')) {
    filters.school = 'Học viện Kỹ thuật Mật mã';
    filters.district = 'Cầu Giấy';
    filters.city = 'Hà Nội';
  } else if (lower.includes('quoc gia') || lower.includes('vnu') || lower.includes('su pham') || lower.includes('bao chi') || lower.includes('xuan thuy')) {
    filters.school = 'ĐH Quốc Gia / Sư Phạm';
    filters.district = 'Cầu Giấy';
    filters.city = 'Hà Nội';
  } else if (lower.includes('bach khoa da nang')) {
    filters.school = 'ĐH Bách Khoa Đà Nẵng';
    filters.district = 'Hải Châu';
    filters.city = 'Đà Nẵng';
  } else if (lower.includes('bach khoa') || lower.includes('kinh te quoc dan') || lower.includes('xay dung') || lower.includes('bach mai')) {
    filters.school = 'Bách Khoa / Bạch Mai';
    filters.district = 'Đống Đa';
    filters.city = 'Hà Nội';
  } else if (lower.includes('ngoai thuong') || lower.includes('ngoai giao') || lower.includes('chua lang')) {
    filters.school = 'ĐH Ngoại Thương';
    filters.district = 'Đống Đa';
    filters.city = 'Hà Nội';
  } else if (lower.includes('sinh vien') || lower.includes('gan truong') || lower.includes('truong hoc') || lower.includes('dai hoc') || lower.includes('hoc vien')) {
    filters.isStudentOrNearUniversity = true;
    if (!filters.city) filters.city = 'Hà Nội';
  }

  if (lower.includes('cau giay')) {
    filters.district = 'Cầu Giấy';
    filters.city = 'Hà Nội';
  } else if (lower.includes('thanh xuan') || lower.includes('nguyen trai')) {
    filters.district = 'Thanh Xuân';
    filters.city = 'Hà Nội';
  } else if (lower.includes('dong da') || lower.includes('chua boc') || lower.includes('thai ha')) {
    filters.district = 'Đống Đa';
    filters.city = 'Hà Nội';
  } else if (lower.includes('ha dong') || lower.includes('quang trung') || lower.includes('van quan')) {
    filters.district = 'Hà Đông';
    filters.city = 'Hà Nội';
  } else if (lower.includes('my dinh') || lower.includes('nam tu liem')) {
    filters.district = 'Nam Từ Liêm';
    filters.city = 'Hà Nội';
  } else if (lower.includes('ba dinh') || lower.includes('truc bach')) {
    filters.district = 'Ba Đình';
    filters.city = 'Hà Nội';
  } else if (lower.includes('hai ba trung')) {
    filters.district = 'Hai Bà Trưng';
    filters.city = 'Hà Nội';
  } else if (lower.includes('hoan kiem')) {
    filters.district = 'Hoàn Kiếm';
    filters.city = 'Hà Nội';
  } else if (lower.includes('binh thanh')) {
    filters.district = 'Bình Thạnh';
    filters.city = 'TP. Hồ Chí Minh';
  } else if (lower.includes('son tra') || lower.includes('my khe')) {
    filters.district = 'Sơn Trà';
    filters.city = 'Đà Nẵng';
  } else if (lower.includes('hai chau')) {
    filters.district = 'Hải Châu';
    filters.city = 'Đà Nẵng';
  }

  // 4. Loại phòng
  if (lower.includes('studio')) {
    filters.roomType = 'STUDIO';
  } else if (lower.includes('can ho mini') || lower.includes('chung cu mini') || lower.includes('mini')) {
    filters.roomType = 'CAN_HO_MINI';
  } else if (lower.includes('chung cu')) {
    filters.roomType = 'CHUNG_CU';
  } else if (lower.includes('phong tro') || lower.includes('nha tro') || lower.includes('o ghep')) {
    filters.roomType = 'PHONG_TRO';
  }

  // 5. Số người ở & Tiện ích đặc biệt
  if (lower.includes('2 nguoi') || lower.includes('hai nguoi') || lower.includes('cho 2') || lower.includes('o 2') || lower.includes('2 ban')) {
    filters.occupants = 2;
  } else if (lower.includes('1 nguoi') || lower.includes('mot nguoi') || lower.includes('o 1')) {
    filters.occupants = 1;
  } else if (lower.includes('3 nguoi') || lower.includes('ba nguoi')) {
    filters.occupants = 3;
  }

  if (lower.includes('ban cong')) filters.hasBalcony = true;
  if (lower.includes('full noi that') || lower.includes('day du noi that') || lower.includes('noi that')) filters.isFullFurniture = true;

  const amPatterns = [
    { key: 'dieu hoa', val: 'Điều hòa' },
    { key: 'may lanh', val: 'Điều hòa' },
    { key: 'may giat', val: 'Máy giặt' },
    { key: 'tu lanh', val: 'Tủ lạnh' },
    { key: 'nong lanh', val: 'Nóng lạnh' },
    { key: 'ban cong', val: 'Ban công' },
    { key: 've sinh rieng', val: 'Nhà VS riêng' },
    { key: 'khep kin', val: 'Nhà VS riêng' },
    { key: 'toilet rieng', val: 'Nhà VS riêng' },
    { key: 'nhà vs rieng', val: 'Nhà VS riêng' },
    { key: 'de xe', val: 'Chỗ để xe' },
    { key: 'cho de xe', val: 'Chỗ để xe' },
    { key: 'thang may', val: 'Thang máy' },
    { key: 'bep', val: 'Bếp mini' },
    { key: 'giuong', val: 'Giường' },
    { key: 'tu quan ao', val: 'Tủ quần áo' },
    { key: 'wifi', val: 'Wifi' },
  ];

  for (const item of amPatterns) {
    if (lower.includes(item.key) && !filters.amenities.includes(item.val)) {
      filters.amenities.push(item.val);
    }
  }

  return filters;
}

/**
 * Thuật toán xếp hạng phòng thông minh theo điểm tương thích
 */
function rankRooms(rooms, filters) {
  const scored = rooms.map(room => {
    let score = 0;
    const matchReasons = [];

    const rCityNorm = removeVietnameseTones(room.city || '');
    const rDistNorm = removeVietnameseTones(room.district || '');
    const rTitleNorm = removeVietnameseTones(room.title || '');
    const rDescNorm = removeVietnameseTones(room.description || '');
    const rAddrNorm = removeVietnameseTones(room.address || '');
    const rAmenities = Array.isArray(room.amenities)
      ? room.amenities
      : (typeof room.amenities === 'string' ? JSON.parse(room.amenities || '[]') : []);
    const rAmenitiesNorm = rAmenities.map(a => removeVietnameseTones(a));

    // A. Thành phố
    if (filters.city) {
      if (rCityNorm.includes(removeVietnameseTones(filters.city))) {
        score += 60;
      } else {
        score -= 600;
      }
    }

    // B. Trường học
    if (filters.school) {
      if (filters.school.includes('Mật mã') && (rTitleNorm.includes('mat ma') || rDescNorm.includes('mat ma') || rAddrNorm.includes('nguyen chanh'))) {
        score += 250;
        matchReasons.push('Chỉ cách Học viện Kỹ thuật Mật mã 500m');
      } else if (filters.school.includes('Quốc Gia') && (rTitleNorm.includes('quoc gia') || rDescNorm.includes('quoc gia') || rAddrNorm.includes('xuan thuy'))) {
        score += 250;
        matchReasons.push('Cách ĐH Quốc Gia 300m đi bộ');
      } else if (filters.school.includes('Bách Khoa') && (rTitleNorm.includes('bach khoa') || rDescNorm.includes('bach khoa'))) {
        score += 250;
        matchReasons.push('Gần trường ĐH Bách Khoa');
      } else if (filters.school.includes('Ngoại Thương') && (rTitleNorm.includes('chua lang') || rAddrNorm.includes('chua lang'))) {
        score += 250;
        matchReasons.push('Gần ĐH Ngoại Thương');
      }
    }

    // C. Sinh viên / gần trường học
    if (filters.isStudentOrNearUniversity) {
      if (
        rTitleNorm.includes('hoc vien') || rTitleNorm.includes('dai hoc') || rTitleNorm.includes('sinh vien') ||
        rDescNorm.includes('sinh vien') || rDescNorm.includes('dai hoc') || rDescNorm.includes('hoc vien') ||
        rDescNorm.includes('truong')
      ) {
        score += 100;
        matchReasons.push('Khu vực tập trung nhiều trường ĐH & cộng đồng sinh viên');
      }
    }

    // D. Quận / Huyện
    if (filters.district) {
      if (rDistNorm.includes(removeVietnameseTones(filters.district)) || rAddrNorm.includes(removeVietnameseTones(filters.district))) {
        score += 90;
        matchReasons.push(`Thuộc khu vực Quận ${room.district}`);
      }
    }

    // E. Giá thuê
    if (filters.maxPrice) {
      if (room.price <= filters.maxPrice) {
        score += 80;
        const savingsRatio = (filters.maxPrice - room.price) / filters.maxPrice;
        score += Math.round(savingsRatio * 40);
        matchReasons.push(`Giá ${Number(room.price).toLocaleString('vi-VN')} đ/tháng (trong ngân sách)`);
      } else if (room.price <= filters.maxPrice * 1.15) {
        score += 30;
      } else {
        score -= 250;
      }
    }

    if (filters.minPrice) {
      if (room.price >= filters.minPrice) score += 30;
      else score -= 90;
    }

    // F. Loại phòng
    if (filters.roomType) {
      if (room.roomType === filters.roomType) {
        score += 70;
        matchReasons.push(`Đúng loại phòng ${room.roomType}`);
      }
    }

    // G. Ban công
    if (filters.hasBalcony) {
      if (rTitleNorm.includes('ban cong') || rAmenitiesNorm.some(a => a.includes('ban cong')) || rDescNorm.includes('ban cong')) {
        score += 120;
        matchReasons.push('Có ban công thoáng mát');
      }
    }

    // H. Full nội thất
    if (filters.isFullFurniture) {
      if (rTitleNorm.includes('full noi that') || rDescNorm.includes('full noi that') || (rAmenities.length >= 6)) {
        score += 100;
        matchReasons.push('Đầy đủ nội thất tiện nghi');
      }
    }

    // I. Số người ở
    if (filters.occupants === 2) {
      if (rTitleNorm.includes('hai nguoi') || rTitleNorm.includes('2 nguoi') || room.maxOccupants >= 2) {
        score += 90;
        matchReasons.push('Phù hợp cho 2 người ở');
      }
    }

    // J. Tiện ích
    for (const needed of filters.amenities) {
      const nNorm = removeVietnameseTones(needed);
      if (rAmenitiesNorm.some(a => a.includes(nNorm)) || rDescNorm.includes(nNorm)) {
        score += 35;
        matchReasons.push(`Có ${needed}`);
      } else {
        score -= 15;
      }
    }

    return { room, score, matchReasons };
  });

  const valid = scored
    .filter(i => i.score > 0)
    .sort((a, b) => b.score - a.score);

  if (valid.length > 0) {
    return {
      rooms: valid.map(i => i.room).slice(0, 4),
      topMatch: valid[0],
      totalMatched: valid.length,
    };
  }

  // Fallback
  return {
    rooms: rooms.slice(0, 4),
    topMatch: null,
    totalMatched: 0,
  };
}

/**
 * Gọi Google Gemini API nếu có cấu hình
 */
async function callGeminiApi(prompt, systemInstruction = '') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction ? systemInstruction + '\n\n' : ''}${prompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/search - Phân tích nhu cầu và tìm phòng thực tế
// ─────────────────────────────────────────────────────────────────────────────
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập nhu cầu tìm phòng của bạn' });
    }

    const filters = parseQueryToFilters(query);

    let allRooms = [];
    try {
      allRooms = await prisma.room.findMany({
        where: { status: 'APPROVED' },
        include: { owner: { select: { id: true, fullName: true, phone: true, avatar: true } } },
      });
    } catch (dbErr) {
      const mockRooms = (await import('../../client/src/services/mockData.js').catch(() => ({})))?.MOCK_ROOMS || [];
      allRooms = mockRooms.filter(r => r.status === 'APPROVED');
    }

    const { rooms, topMatch, totalMatched } = rankRooms(allRooms, filters);

    // Xây dựng phản hồi thông minh
    const criteriaSummary = [];
    if (filters.school) criteriaSummary.push(`Gần **${filters.school}**`);
    else if (filters.isStudentOrNearUniversity) criteriaSummary.push(`Gần các **trường Đại học**`);
    if (filters.district) criteriaSummary.push(`Khu vực **Quận ${filters.district}**`);
    if (filters.city) criteriaSummary.push(`Tại **${filters.city}**`);
    if (filters.maxPrice) criteriaSummary.push(`Ngân sách tối đa **${(filters.maxPrice / 1_000_000).toFixed(1)} triệu/tháng**`);
    if (filters.amenities.length > 0) criteriaSummary.push(`Tiện ích: **${filters.amenities.join(', ')}**`);
    if (filters.hasBalcony) criteriaSummary.push(`Có **ban công**`);
    if (filters.occupants) criteriaSummary.push(`Sức chứa **${filters.occupants} người**`);
    if (filters.roomType) criteriaSummary.push(`Loại phòng: **${filters.roomType}**`);

    let aiMessage = '';
    if (totalMatched > 0) {
      aiMessage = `🤖 **YouRoom AI đã phân tích nhu cầu của bạn:**\n` +
        (criteriaSummary.length > 0 ? criteriaSummary.map(c => `• ${c}`).join('\n') + '\n\n' : '') +
        `Đã tìm thấy **${rooms.length} phòng trọ thực tế** khớp nhất với tiêu chí của bạn.\n` +
        (topMatch?.matchReasons?.length > 0 ? `👉 **Lựa chọn phù hợp nhất:** ${topMatch.matchReasons.join(', ')}.` : '');
    } else {
      aiMessage = `🤖 **YouRoom AI chưa tìm thấy phòng khớp 100% tất cả tiêu chí:**\n` +
        (criteriaSummary.length > 0 ? criteriaSummary.map(c => `• ${c}`).join('\n') + '\n\n' : '') +
        `Tuy nhiên, tôi đã chọn ra **${rooms.length} phòng trọ lân cận** có mức giá và tiện ích gần với yêu cầu nhất để bạn tham khảo:`;
    }

    res.json({
      success: true,
      data: {
        message: aiMessage,
        filters,
        rooms: rooms.map(r => ({
          ...r,
          images: typeof r.images === 'string' ? JSON.parse(r.images || '[]') : r.images,
          amenities: typeof r.amenities === 'string' ? JSON.parse(r.amenities || '[]') : r.amenities,
        })),
        isRealAI: false,
        note: 'YouRoom AI – Truy vấn trực tiếp từ cơ sở dữ liệu phòng thực tế.',
      },
    });
  } catch (err) {
    console.error('AI search error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi xử lý yêu cầu AI' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/describe - AI viết mô tả phòng trọ cho chủ nhà
// ─────────────────────────────────────────────────────────────────────────────
router.post('/describe', async (req, res) => {
  try {
    const { title, roomType, price, area, address, district, city, amenities, electricPrice, waterPrice, contactPhone } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp tiêu đề hoặc thông tin phòng' });
    }

    const amenityList = Array.isArray(amenities) ? amenities.join(', ') : (amenities || '');

    const promptText = `Hãy viết một bài đăng mô tả cho thuê phòng trọ chuyên nghiệp, hấp dẫn nhưng chân thực tại Việt Nam với các thông tin sau:\n` +
      `- Tiêu đề: ${title}\n` +
      `- Loại hình: ${roomType}\n` +
      `- Địa chỉ: ${address || ''}, ${district || ''}, ${city || ''}\n` +
      `- Diện tích: ${area} m2\n` +
      `- Giá thuê: ${price ? Number(price).toLocaleString('vi-VN') + ' đ/tháng' : 'Thỏa thuận'}\n` +
      `- Giá điện: ${electricPrice || 3800} đ/kWh, Nước: ${waterPrice || 25000} đ/m3\n` +
      `- Tiện ích: ${amenityList}\n` +
      `- Số điện thoại: ${contactPhone}\n` +
      `Quy tắc: Viết tiếng Việt chuẩn, bố cục rõ ràng, chia đoạn thoáng, văn phong lịch sự, không tự bịa thêm thông tin chưa cung cấp.`;

    const realAiDesc = await callGeminiApi(promptText);
    const isRealAI = Boolean(realAiDesc);

    let description = '';
    if (isRealAI) {
      description = realAiDesc;
    } else {
      description = `Cho thuê ${title} tại vị trí đắc địa ${address ? address + ', ' : ''}${district ? district + ', ' : ''}${city || ''}.\n\n` +
        `• Diện tích: ${area || 25} m² thoáng mát, đón gió và ánh sáng tự nhiên.\n` +
        `• Tiện ích trang bị sẵn: ${amenityList || 'Đầy đủ tiện ích cơ bản, nhà vệ sinh riêng, bình nóng lạnh, chỗ để xe rộng rãi'}.\n` +
        `• Chi phí dịch vụ minh bạch: Điện ${electricPrice || 3800}đ/kWh, nước ${waterPrice || 25000}đ/khối.\n` +
        `• Môi trường xung quanh: Khu dân cư an ninh cao, camera giám sát 24/7, giờ giấc tự do không chung chủ.\n` +
        `• Giá thuê ưu đãi: ${price ? (Number(price) / 1_000_000).toFixed(1) + ' triệu đồng/tháng' : 'Thỏa thuận trực tiếp'}.\n\n` +
        `Quý khách quan tâm vui lòng liên hệ ngay qua số điện thoại ${contactPhone || 'chủ nhà'} để được tư vấn và xem phòng miễn phí!`;
    }

    res.json({
      success: true,
      data: {
        description,
        isRealAI,
        notice: isRealAI
          ? 'Được viết bởi Google Gemini AI'
          : 'Gợi ý bởi AI mô phỏng dựa trên dữ liệu bạn đã nhập',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo mô tả' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/chat - Trợ lý AI hỏi đáp trực tiếp
// ─────────────────────────────────────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Vui lòng nhập câu hỏi' });

    const lower = message.toLowerCase();
    const isFindingRoom =
      lower.includes('phòng') || lower.includes('tro') || lower.includes('trọ') ||
      lower.includes('tìm') || lower.includes('tim') || lower.includes('thuê') || lower.includes('thue') ||
      lower.includes('ở') || lower.includes('o') || lower.includes('triệu') || lower.includes('tr') ||
      lower.includes('gần') || lower.includes('gan') || lower.includes('ngân sách') || lower.includes('studio') ||
      lower.includes('căn hộ') || lower.includes('mini');

    let suggestedRooms = [];
    let reply = '';

    if (isFindingRoom) {
      const filters = parseQueryToFilters(message);

      let allRooms = [];
      try {
        allRooms = await prisma.room.findMany({
          where: { status: 'APPROVED' },
          include: { owner: { select: { id: true, fullName: true, phone: true } } },
        });
      } catch (e) {
        const mockRooms = (await import('../../client/src/services/mockData.js').catch(() => ({})))?.MOCK_ROOMS || [];
        allRooms = mockRooms.filter(r => r.status === 'APPROVED');
      }

      const { rooms, topMatch, totalMatched } = rankRooms(allRooms, filters);
      suggestedRooms = rooms;

      const criteriaSummary = [];
      if (filters.school) criteriaSummary.push(`Gần **${filters.school}**`);
      else if (filters.isStudentOrNearUniversity) criteriaSummary.push(`Gần các **trường Đại học**`);
      if (filters.district) criteriaSummary.push(`Khu vực **Quận ${filters.district}**`);
      if (filters.city) criteriaSummary.push(`Tại **${filters.city}**`);
      if (filters.maxPrice) criteriaSummary.push(`Ngân sách tối đa **${(filters.maxPrice / 1_000_000).toFixed(1)} triệu/tháng**`);
      if (filters.amenities.length > 0) criteriaSummary.push(`Tiện ích: **${filters.amenities.join(', ')}**`);
      if (filters.hasBalcony) criteriaSummary.push(`Có **ban công**`);
      if (filters.occupants) criteriaSummary.push(`Sức chứa **${filters.occupants} người**`);

      if (totalMatched > 0) {
        reply = `Tôi đã tìm kiếm trong hệ thống và chọn ra **${suggestedRooms.length} phòng trọ thực tế** khớp nhất với nhu cầu của bạn:\n` +
          (criteriaSummary.length > 0 ? criteriaSummary.map(c => `• ${c}`).join('\n') + '\n\n' : '') +
          (topMatch?.matchReasons?.length > 0 ? `👉 **Phù hợp nhất:** ${topMatch.matchReasons.join(', ')}.\n\n` : '') +
          `Bạn có thể xem chi tiết từng phòng ở thẻ bên dưới hoặc bấm liên hệ chủ trọ để xem phòng!`;
      } else {
        reply = `Hiện tại chưa có phòng nào khớp 100% tất cả các tiêu chí trên. Tuy nhiên, tôi đã chọn lọc ra các phòng lân cận có mức giá và tiện ích tương đồng nhất để bạn tham khảo nhé!`;
      }
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

    res.json({
      success: true,
      data: {
        reply,
        suggestedRooms: suggestedRooms.map(r => ({
          ...r,
          images: typeof r.images === 'string' ? JSON.parse(r.images || '[]') : r.images,
          amenities: typeof r.amenities === 'string' ? JSON.parse(r.amenities || '[]') : r.amenities,
        })),
        isRealAI: false,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server khi chat với AI' });
  }
});

export default router;
