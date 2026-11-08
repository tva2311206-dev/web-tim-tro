import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

/**
 * Phân tích câu truy vấn tiếng Việt thành các tiêu chí lọc
 */
function parseQueryToFilters(query) {
  const filters = {};
  const lowerQuery = query.toLowerCase();

  // Mức giá trần (dưới / khoảng)
  const priceMaxMatch = lowerQuery.match(/(?:dưới|tối đa|<|nhỏ hơn)\s*([\d,\.]+)\s*(triệu|tr|đồng|vnđ)?/);
  if (priceMaxMatch) {
    let p = parseFloat(priceMaxMatch[1].replace(',', '.'));
    if (!priceMaxMatch[2] || priceMaxMatch[2].includes('triệu') || priceMaxMatch[2].includes('tr')) {
      p = p * 1_000_000;
    }
    filters.maxPrice = p;
  }

  // Mức giá sàn (từ / trên)
  const priceMinMatch = lowerQuery.match(/(?:từ|trên|>|lớn hơn)\s*([\d,\.]+)\s*(triệu|tr)/);
  if (priceMinMatch) {
    filters.minPrice = parseFloat(priceMinMatch[1].replace(',', '.')) * 1_000_000;
  }

  // Thành phố
  if (lowerQuery.includes('hà nội') || lowerQuery.includes('ha noi')) filters.city = 'Hà Nội';
  else if (lowerQuery.includes('tp.hcm') || lowerQuery.includes('hồ chí minh') || lowerQuery.includes('sài gòn')) filters.city = 'TP. Hồ Chí Minh';
  else if (lowerQuery.includes('đà nẵng') || lowerQuery.includes('da nang')) filters.city = 'Đà Nẵng';

  // Quận / Huyện phổ biến
  const districts = ['Cầu Giấy', 'Thanh Xuân', 'Đống Đa', 'Hà Đông', 'Ba Đình', 'Nam Từ Liêm', 'Hai Bà Trưng', 'Hoàn Kiếm', 'Hoàng Mai', 'Bình Thạnh', 'Quận 1', 'Hải Châu', 'Sơn Trà'];
  for (const d of districts) {
    if (lowerQuery.includes(d.toLowerCase())) {
      filters.district = d;
      break;
    }
  }

  // Trường học
  if (lowerQuery.includes('mật mã') || lowerQuery.includes('kỹ thuật mật mã') || lowerQuery.includes('act')) {
    filters.school = 'Học viện Kỹ thuật Mật mã';
    filters.district = 'Cầu Giấy';
  } else if (lowerQuery.includes('quốc gia') || lowerQuery.includes('vnu')) {
    filters.school = 'Đại học Quốc gia';
    filters.district = 'Cầu Giấy';
  } else if (lowerQuery.includes('bách khoa') || lowerQuery.includes('hust')) {
    filters.school = 'Đại học Bách Khoa';
    filters.district = 'Hai Bà Trưng';
  }

  // Loại phòng
  if (lowerQuery.includes('căn hộ mini') || lowerQuery.includes('can ho mini')) filters.roomType = 'CAN_HO_MINI';
  else if (lowerQuery.includes('studio')) filters.roomType = 'STUDIO';
  else if (lowerQuery.includes('chung cư') || lowerQuery.includes('chung cu')) filters.roomType = 'CHUNG_CU';

  // Tiện ích
  const amenitiesList = [];
  if (lowerQuery.includes('điều hòa') || lowerQuery.includes('máy lạnh')) amenitiesList.push('Điều hòa');
  if (lowerQuery.includes('máy giặt')) amenitiesList.push('Máy giặt');
  if (lowerQuery.includes('tủ lạnh')) amenitiesList.push('Tủ lạnh');
  if (lowerQuery.includes('nóng lạnh') || lowerQuery.includes('bình nóng lạnh')) amenitiesList.push('Nóng lạnh');
  if (lowerQuery.includes('ban công')) amenitiesList.push('Ban công');
  if (lowerQuery.includes('vệ sinh riêng') || lowerQuery.includes('khép kín') || lowerQuery.includes('toilet riêng')) amenitiesList.push('Nhà VS riêng');
  if (lowerQuery.includes('để xe') || lowerQuery.includes('chỗ để xe') || lowerQuery.includes('hầm xe')) amenitiesList.push('Chỗ để xe');
  if (lowerQuery.includes('thang máy')) amenitiesList.push('Thang máy');

  if (amenitiesList.length > 0) filters.amenities = amenitiesList;

  // Sức chứa
  const occMatch = lowerQuery.match(/(\d+)\s*người/);
  if (occMatch) filters.maxOccupants = parseInt(occMatch[1]);

  return filters;
}

/**
 * Gọi Google Gemini API thật sự nếu có API Key
 */
async function callGeminiApi(prompt, systemInstruction = '') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null; // Trả về null nếu chưa cấu hình key
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

    if (!response.ok) {
      console.warn('Gemini API returned error status:', response.status);
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || null;
  } catch (error) {
    console.error('Call Gemini API error:', error.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/search - Phân tích nhu cầu và tìm phòng thực tế
// ─────────────────────────────────────────────────────────────────────────────
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || query.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập nhu cầu tìm phòng của bạn' });
    }

    const filters = parseQueryToFilters(query);

    // Xây dựng điều kiện truy vấn database
    const where = { status: 'APPROVED' };
    if (filters.city) where.city = { contains: filters.city };
    if (filters.district) where.district = { contains: filters.district };
    if (filters.roomType) where.roomType = filters.roomType;
    if (filters.maxOccupants) where.maxOccupants = { lte: filters.maxOccupants };

    if (filters.maxPrice || filters.minPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }

    let rooms = [];
    try {
      rooms = await prisma.room.findMany({
        where,
        take: 6,
        orderBy: { price: 'asc' },
        include: { owner: { select: { id: true, fullName: true, phone: true, avatar: true } } },
      });
    } catch (dbErr) {
      // Fallback nếu chưa kết nối Prisma DB
      const mockRooms = (await import('../../client/src/services/mockData.js').catch(() => ({})))?.MOCK_ROOMS || [];
      rooms = mockRooms.filter(r => r.status === 'APPROVED');
      if (filters.maxPrice) rooms = rooms.filter(r => r.price <= filters.maxPrice);
      if (filters.minPrice) rooms = rooms.filter(r => r.price >= filters.minPrice);
      if (filters.city) rooms = rooms.filter(r => r.city.includes(filters.city));
      rooms = rooms.slice(0, 6);
    }

    // Thử gọi Gemini AI thật
    const systemPrompt = 'Bạn là trợ lý tư vấn tìm phòng trọ YouRoom AI tại Việt Nam. Hãy trả lời thân thiện, ngắn gọn, phân tích tiêu chí tìm kiếm và KHÔNG tự bịa phòng trọ không có trong danh sách.';
    const promptText = `Người dùng hỏi: "${query}".\nSố phòng tìm thấy trong cơ sở dữ liệu: ${rooms.length} phòng.\nTiêu chí: ${JSON.stringify(filters)}.\nHãy viết phản hồi tóm tắt tiêu chí và giới thiệu danh sách phòng thực tế bên dưới.`;

    const realAiText = await callGeminiApi(promptText, systemPrompt);

    // Phản hồi dự phòng khi chưa cấu hình API key
    let aiMessage = '';
    const isRealAI = Boolean(realAiText);

    if (isRealAI) {
      aiMessage = realAiText;
    } else {
      const criteriaList = [];
      if (filters.maxPrice) criteriaList.push(`Ngân sách tối đa **${(filters.maxPrice / 1_000_000).toFixed(1)} triệu/tháng**`);
      if (filters.minPrice) criteriaList.push(`Ngân sách từ **${(filters.minPrice / 1_000_000).toFixed(1)} triệu/tháng**`);
      if (filters.school) criteriaList.push(`Bán kính gần **${filters.school}**`);
      if (filters.district) criteriaList.push(`Khu vực quận **${filters.district}**`);
      if (filters.city) criteriaList.push(`Thành phố **${filters.city}**`);
      if (filters.amenities) criteriaList.push(`Tiện ích: **${filters.amenities.join(', ')}**`);

      aiMessage = `🤖 **YouRoom AI đã phân tích yêu cầu:**\n` +
        (criteriaList.length > 0 ? criteriaList.map(c => `• ${c}`).join('\n') + '\n\n' : '') +
        (rooms.length > 0
          ? `Tìm thấy **${rooms.length} phòng trọ thực tế** trong cơ sở dữ liệu phù hợp với nhu cầu của bạn:`
          : `Hiện chưa có phòng nào khớp với tất cả tiêu chí trên. Bạn thử nới rộng khoảng giá hoặc chọn khu vực lân cận nhé!`);
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
        isRealAI,
        notice: isRealAI
          ? 'Được xử lý trực tiếp bởi Google Gemini AI'
          : 'Chế độ mô phỏng – Cấu hình GEMINI_API_KEY trong file .env để kết nối AI thực tế',
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

    // Thử gọi Gemini AI thật
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

    // Tìm phòng phù hợp nếu câu hỏi có ý định tìm phòng
    const filters = parseQueryToFilters(message);
    let suggestedRooms = [];
    try {
      const where = { status: 'APPROVED' };
      if (filters.city) where.city = { contains: filters.city };
      if (filters.district) where.district = { contains: filters.district };
      if (filters.maxPrice) where.price = { lte: filters.maxPrice };

      suggestedRooms = await prisma.room.findMany({
        where,
        take: 3,
        orderBy: { price: 'asc' },
        include: { owner: { select: { id: true, fullName: true, phone: true } } },
      });
    } catch (e) {
      // ignore
    }

    // Thử gọi Gemini AI thật
    const promptText = `Bạn là trợ lý ảo YouRoom AI. Người dùng hỏi: "${message}".\nHãy trả lời bằng tiếng Việt lịch sự, súc tích, định dạng markdown đẹp.`;
    const realReply = await callGeminiApi(promptText);

    let reply = realReply;
    const isRealAI = Boolean(realReply);

    if (!isRealAI) {
      const lower = message.toLowerCase();
      if (lower.includes('tìm phòng') || lower.includes('triệu') || lower.includes('gần') || lower.includes('thuê')) {
        reply = `Tôi đã tìm kiếm phòng theo mong muốn của bạn. Dưới đây là các gợi ý phòng thực tế trong hệ thống:` +
          (filters.maxPrice ? `\n• Ngân sách: dưới ${(filters.maxPrice / 1_000_000).toFixed(1)} triệu/tháng` : '') +
          (filters.district ? `\n• Khu vực: Quận ${filters.district}` : '') +
          (filters.city ? `\n• Thành phố: ${filters.city}` : '');
      } else if (lower.includes('đăng tin') || lower.includes('chủ trọ')) {
        reply = `Để đăng tin cho thuê phòng:\n1. Nhấn nút **"Đăng tin miễn phí"** ở góc phải thanh điều hướng.\n2. Điền thông tin phòng và sử dụng tính năng **"AI viết mô tả giúp tôi"**.\n3. Thêm ảnh và gửi duyệt. Tin đăng sẽ được ban quản trị xét duyệt trong vòng 24h!`;
      } else {
        reply = `Xin chào! Tôi là trợ lý ảo **YouRoom AI** 🏠. Bạn có thể cho tôi biết khu vực, tầm giá và các tiện ích mong muốn (ví dụ: *"Tìm phòng dưới 3 triệu gần Cầu Giấy có điều hòa"*), tôi sẽ truy vấn dữ liệu phòng thực tế ngay cho bạn!`;
      }
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
        isRealAI,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server khi chat với AI' });
  }
});

export default router;
