import { removeVietnameseTones } from './helpers.js';

/**
 * Bộ phân tích ngôn ngữ tự nhiên (NLP) & Chấm điểm tương thích phòng trọ thông minh
 * Dành cho Trợ lý YouRoom AI
 */
export function aiAnalyzeAndMatchRooms(query, allRooms = []) {
  if (!query || !query.trim()) {
    return { filters: {}, matchedRooms: [], message: '' };
  }

  const rawLower = query.toLowerCase().trim();
  const lower = removeVietnameseTones(rawLower);

  const approvedRooms = allRooms.filter(r => r.status === 'APPROVED');
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

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Phân tích Giá thông minh
  // ─────────────────────────────────────────────────────────────────────────
  // 1.1: Kiểu "2tr5", "1tr8", "3tr2", "2trieu5", "2 triệu 5"
  const splitTrMatch = rawLower.match(/(\d+)\s*(?:tr|trieu|triệu)\s*(\d+)/i);
  if (splitTrMatch) {
    const main = parseFloat(splitTrMatch[1]);
    const sub = parseFloat(splitTrMatch[2]);
    filters.targetPrice = (main + sub / 10) * 1_000_000;
    filters.maxPrice = filters.targetPrice * 1.15;
  }

  // 1.2: Kiểu "từ X đến Y triệu"
  const rangeMatch = rawLower.match(/(?:từ|tu)\s*([\d,\.]+)\s*(?:đến|den|-)\s*([\d,\.]+)\s*(?:tr|trieu|triệu|k)?/i);
  if (rangeMatch) {
    const p1 = parseFloat(rangeMatch[1].replace(',', '.'));
    const p2 = parseFloat(rangeMatch[2].replace(',', '.'));
    filters.minPrice = p1 > 100 ? p1 * 1000 : p1 * 1_000_000;
    filters.maxPrice = p2 > 100 ? p2 * 1000 : p2 * 1_000_000;
  }

  // 1.3: Kiểu "dưới / tối đa / < X triệu"
  if (!filters.maxPrice) {
    const maxMatch = rawLower.match(/(?:dưới|duoi|tối đa|toi da|<|nhỏ hơn|nho hon|dưới tầm|dưới khoảng)\s*([\d,\.]+)\s*(?:tr|trieu|triệu|k)?/i);
    if (maxMatch) {
      const val = parseFloat(maxMatch[1].replace(',', '.'));
      filters.maxPrice = val > 100 ? val * 1000 : val * 1_000_000;
    }
  }

  // 1.4: Kiểu "từ / trên / > X triệu"
  if (!filters.minPrice) {
    const minMatch = rawLower.match(/(?:từ|tu|trên|tren|>|lớn hơn|lon hon)\s*([\d,\.]+)\s*(?:tr|trieu|triệu|k)?/i);
    if (minMatch) {
      const val = parseFloat(minMatch[1].replace(',', '.'));
      filters.minPrice = val > 100 ? val * 1000 : val * 1_000_000;
    }
  }

  // 1.5: Kiểu "ngân sách / tầm / khoảng / giá X triệu" (VD: "ngân sách 2,5 triệu")
  if (!filters.maxPrice && !filters.targetPrice) {
    const targetMatch = rawLower.match(/(?:ngân sách|ngan sach|tầm|tam|khoảng|khoang|giá|gia)\s*([\d,\.]+)\s*(?:tr|trieu|triệu|k)?/i);
    if (targetMatch) {
      const val = parseFloat(targetMatch[1].replace(',', '.'));
      filters.targetPrice = val > 100 ? val * 1000 : val * 1_000_000;
      filters.maxPrice = filters.targetPrice * 1.15; // chấp nhận dung sai nhẹ
      filters.minPrice = filters.targetPrice * 0.65;
    }
  }

  // 1.6: Kiểu câu đơn: "phòng 2 triệu", "phòng 3tr", "dưới 2tr"
  if (!filters.maxPrice && !filters.targetPrice) {
    const singleMatch = rawLower.match(/(?:phòng|tro|trọ)\s*([\d,\.]+)\s*(?:tr|trieu|triệu)/i);
    if (singleMatch) {
      const val = parseFloat(singleMatch[1].replace(',', '.'));
      filters.targetPrice = val * 1_000_000;
      filters.maxPrice = filters.targetPrice * 1.15;
    }
  }

  // 1.7: Gợi ý "giá rẻ" hoặc "tiết kiệm"
  if (lower.includes('gia re') || lower.includes('tiet kiem') || lower.includes('re')) {
    if (!filters.maxPrice) filters.maxPrice = 2500000;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Phân tích Thành phố
  // ─────────────────────────────────────────────────────────────────────────
  if (lower.includes('ha noi') || lower.includes('hn')) {
    filters.city = 'Hà Nội';
  } else if (lower.includes('ho chi minh') || lower.includes('tp hcm') || lower.includes('tphcm') || lower.includes('sai gon') || lower.includes('q1') || lower.includes('quan 1')) {
    filters.city = 'TP. Hồ Chí Minh';
  } else if (lower.includes('da nang') || lower.includes('dn')) {
    filters.city = 'Đà Nẵng';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Phân tích Trường học & Địa danh mục tiêu
  // ─────────────────────────────────────────────────────────────────────────
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

  // Quận / Huyện cụ thể
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

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Phân tích Loại phòng
  // ─────────────────────────────────────────────────────────────────────────
  if (lower.includes('studio')) {
    filters.roomType = 'STUDIO';
  } else if (lower.includes('can ho mini') || lower.includes('chung cu mini') || lower.includes('mini')) {
    filters.roomType = 'CAN_HO_MINI';
  } else if (lower.includes('chung cu')) {
    filters.roomType = 'CHUNG_CU';
  } else if (lower.includes('phong tro') || lower.includes('nha tro') || lower.includes('o ghep')) {
    filters.roomType = 'PHONG_TRO';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Số người ở & Tiện ích đặc biệt
  // ─────────────────────────────────────────────────────────────────────────
  if (lower.includes('2 nguoi') || lower.includes('hai nguoi') || lower.includes('cho 2') || lower.includes('o 2') || lower.includes('2 ban') || lower.includes('hai ban')) {
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

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Tính điểm phù hợp (Relevance Scoring)
  // ─────────────────────────────────────────────────────────────────────────
  const scoredRooms = approvedRooms.map(room => {
    let score = 0;
    const matchReasons = [];

    const rCityNorm = removeVietnameseTones(room.city || '');
    const rDistNorm = removeVietnameseTones(room.district || '');
    const rTitleNorm = removeVietnameseTones(room.title || '');
    const rDescNorm = removeVietnameseTones(room.description || '');
    const rAddrNorm = removeVietnameseTones(room.address || '');
    const rAmenities = Array.isArray(room.amenities) ? room.amenities : [];
    const rAmenitiesNorm = rAmenities.map(a => removeVietnameseTones(a));

    // A. Thành phố
    if (filters.city) {
      if (rCityNorm.includes(removeVietnameseTones(filters.city))) {
        score += 60;
      } else {
        score -= 600; // Phạt nặng nếu sai thành phố
      }
    }

    // B. Trường học cụ thể
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

    // C. Sinh viên / Gần trường học chung
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
        // Điểm thưởng nếu giá càng tiết kiệm
        const savingsRatio = (filters.maxPrice - room.price) / filters.maxPrice;
        score += Math.round(savingsRatio * 40);
        matchReasons.push(`Giá ${Number(room.price).toLocaleString('vi-VN')} đ/tháng (trong ngân sách)`);
      } else if (room.price <= filters.maxPrice * 1.15) {
        // Vượt nhẹ trong ngưỡng 15% (như ngân sách 2.5tr tìm thấy phòng 2.8tr)
        score += 30;
      } else {
        score -= 250; // Quá ngân sách nhiều
      }
    }

    if (filters.minPrice) {
      if (room.price >= filters.minPrice) {
        score += 30;
      } else {
        score -= 90;
      }
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

    // J. Tiện ích mong muốn
    for (const needed of filters.amenities) {
      const nNorm = removeVietnameseTones(needed);
      if (rAmenitiesNorm.some(a => a.includes(nNorm)) || rDescNorm.includes(nNorm)) {
        score += 35;
        matchReasons.push(`Có ${needed}`);
      } else {
        score -= 15;
      }
    }

    return {
      room,
      score,
      matchReasons,
    };
  });

  // Sắp xếp theo score giảm dần
  const validMatches = scoredRooms
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  let finalRooms = validMatches.map(item => item.room);

  // Nếu bộ lọc quá chặt không có kết quả, tự động nới lỏng theo khu vực/thành phố
  if (finalRooms.length === 0) {
    if (filters.city) {
      finalRooms = approvedRooms.filter(r => removeVietnameseTones(r.city).includes(removeVietnameseTones(filters.city))).slice(0, 4);
    } else {
      finalRooms = approvedRooms.slice(0, 4);
    }
  }

  // Tạo phản hồi giải thích thông minh từ AI
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

  const topMatch = validMatches[0];
  let aiMessage = '';

  if (validMatches.length > 0) {
    aiMessage = `🤖 **YouRoom AI đã phân tích nhu cầu của bạn:**\n` +
      (criteriaSummary.length > 0 ? criteriaSummary.map(c => `• ${c}`).join('\n') + '\n\n' : '') +
      `Đã tìm thấy **${finalRooms.slice(0, 4).length} phòng trọ thực tế** khớp nhất với tiêu chí của bạn.\n` +
      (topMatch?.matchReasons?.length > 0 ? `👉 **Lựa chọn phù hợp nhất:** ${topMatch.matchReasons.join(', ')}.` : '');
  } else {
    aiMessage = `🤖 **YouRoom AI chưa tìm thấy phòng khớp 100% tất cả tiêu chí:**\n` +
      (criteriaSummary.length > 0 ? criteriaSummary.map(c => `• ${c}`).join('\n') + '\n\n' : '') +
      `Tuy nhiên, tôi đã chọn ra **${finalRooms.length} phòng trọ lân cận** có mức giá và tiện ích gần với yêu cầu nhất để bạn tham khảo:`;
  }

  return {
    filters,
    matchedRooms: finalRooms.slice(0, 4),
    message: aiMessage,
  };
}
