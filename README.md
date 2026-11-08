# YouRoom AI – Nền Tảng Tìm Kiếm & Cho Thuê Phòng Trọ Tích Hợp AI

> **Slogan:** *Tìm phòng dễ dàng – Chọn nơi an cư thông minh.*  
> **Phiên bản:** 1.0.0 (Production Ready)  
> **Nhóm phát triển:** YouRoom AI Team

---

## 1. Giới thiệu dự án

**YouRoom AI** là nền tảng công nghệ bất động sản dành cho người thuê (sinh viên, người đi làm) và chủ nhà cho thuê phòng trọ tại Việt Nam. Dự án giải quyết các vấn đề nan giải như thông tin sai lệch, giá ảo, phòng trôi nổi qua môi giới bằng việc:
1. **Tích hợp Trợ lý AI (LLM)**: Cho phép tìm kiếm phòng bằng ngôn ngữ tự nhiên ("*Tôi cần phòng dưới 3 triệu gần Học viện Kỹ thuật Mật mã có điều hòa và vệ sinh riêng*"), phân tích nhu cầu và truy vấn dữ liệu phòng thực tế.
2. **AI hỗ trợ chủ trọ viết bài**: Tự động sinh mô tả chi tiết, rõ ràng, hấp dẫn dựa trên thông số phòng thực tế mà không bịa đặt thông tin.
3. **Mô hình tài khoản linh hoạt**: Một tài khoản duy nhất có thể vừa tìm phòng thuê, vừa đăng tin cho thuê.
4. **Quy trình kiểm duyệt nghiêm ngặt (Admin Approval)**: Tin đăng mới được đưa vào hàng đợi kiểm duyệt để loại bỏ spam và bảo vệ người thuê.

---

## 2. Các chức năng chính

### 🌟 Người tìm trọ (Students & Workers)
- **Trang chủ trực quan**: Hero banner, thanh tìm kiếm nhanh, danh mục trực quan và danh sách phòng nổi bật.
- **Tìm kiếm thông minh bằng AI**: Chatbot AI và thanh AI Search phân tích câu hỏi tự nhiên ra bộ lọc (ngân sách, bán kính trường học, tiện ích).
- **Trang tìm kiếm & bộ lọc đa tiêu chí**: Lọc theo Tỉnh/thành phố, Quận/huyện, Phường/xã, Khoảng giá, Diện tích, Tiện ích, Sức chứa, Sắp xếp theo giá/diện tích/mới nhất.
- **Chi tiết phòng toàn diện**: Bộ ảnh gallery, bảng giá dịch vụ (điện, nước, internet), danh sách tiện ích, thông tin liên hệ chủ nhà trực tiếp.
- **Tương tác**: Đặt lịch hẹn xem phòng trực tiếp, lưu phòng vào danh sách yêu thích, chia sẻ liên kết, gửi báo cáo tin đăng vi phạm.

### 🏡 Chủ nhà & Người cho thuê (Landlords)
- **Đăng tin miễn phí 3 bước**: Nhập thông số phòng, chọn tiện ích, tải nhiều ảnh phòng.
- **AI viết mô tả tự động**: Tính năng "AI viết mô tả giúp tôi" tạo nội dung bài đăng chuẩn chỉnh chỉ với 1 cú click.
- **Quản lý tin đăng (Dashboard)**: Theo dõi trạng thái tin (Chờ duyệt, Đã duyệt, Từ chối), chỉnh sửa hoặc gỡ tin.
- **Quản lý khách hẹn**: Tiếp nhận và quản lý các yêu cầu hẹn xem phòng từ người thuê.

### 🛡️ Quản trị viên hệ thống (Administrator)
- **Dashboard số liệu**: Thống kê số lượng phòng, người dùng, tin chờ duyệt, báo cáo vi phạm.
- **Kiểm duyệt tin đăng**: Xem xét thông tin và hình ảnh, phê duyệt (Approve) hoặc từ chối (Reject).
- **Xử lý báo cáo vi phạm**: Xem lý do tố cáo từ người dùng và quyết định gỡ tin vi phạm.
- **Quản lý người dùng**: Danh sách thành viên và phân quyền bảo mật.

---

## 3. Công nghệ sử dụng

| Tầng | Công nghệ | Chi tiết |
|---|---|---|
| **Frontend** | React 18 + Vite | Giao diện Single Page Application tối ưu tốc độ |
| **Styling** | Tailwind CSS | Bảng màu chuyên nghiệp: Navy (`#173B57`), Cam đất (`#E58B55`), Kem (`#FAFAF7`), Xanh nhạt (`#EAF4FB`) |
| **Icons** | Lucide React | Hệ thống icon tối giản, hiện đại |
| **State & HTTP**| Zustand, Axios, React Hot Toast | Quản lý phiên đăng nhập và thông báo |
| **Backend** | Node.js + Express.js | RESTful API chuẩn mực, phân tách Router/Controller/Middleware |
| **Database** | MySQL | Cơ sở dữ liệu quan hệ hoàn chỉnh |
| **ORM** | Prisma ORM | Model User, Room, Booking, Report, Favorite |
| **Bảo mật** | JWT + bcryptjs | Mã hóa mật khẩu và xác thực Token an toàn |
| **AI Integration**| Gemini API / OpenAI API / Mock Mode | Hỗ trợ fallback thông minh khi chạy demo |

---

## 4. Cấu trúc thư mục

```text
Website tìm trọ/
├── client/                     # Mã nguồn Frontend (React + Vite)
│   ├── public/                 # Ảnh logo, favicon
│   ├── src/
│   │   ├── components/         # Components tái sử dụng
│   │   │   ├── layout/         # Header, Footer, Layout
│   │   │   ├── room/           # RoomCard
│   │   │   └── ui/             # SearchBar, Badges
│   │   ├── pages/              # Các trang giao diện
│   │   │   ├── HomePage.jsx
│   │   │   ├── SearchPage.jsx
│   │   │   ├── RoomDetailPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── PostRoomPage.jsx
│   │   │   ├── AiAssistantPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── AdminPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/           # api.js & mockData.js (Live + Fallback)
│   │   ├── store/              # authStore.js (Zustand)
│   │   ├── utils/              # helpers.js (format tiền, ngày, loại phòng)
│   │   ├── App.jsx             # Router config & Auth Guard
│   │   └── index.css           # Tailwind CSS directives
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Mã nguồn Backend (Express + Prisma)
│   ├── prisma/
│   │   └── schema.prisma       # Database schema (MySQL)
│   ├── src/
│   │   ├── middleware/         # auth.js (JWT & Admin Guard)
│   │   ├── routes/             # auth, rooms, users, admin, ai, bookings, reports, favorites
│   │   ├── seed.js             # 15 phòng trọ mẫu đa dạng
│   │   ├── prisma.js           # Prisma client singleton
│   │   └── index.js            # Express app entrypoint
│   ├── .env                    # Biến môi trường
│   ├── .env.example
│   └── package.json
│
└── README.md                   # Hướng dẫn chi tiết
```

---

## 5. Hướng dẫn cài đặt & Chạy dự án

### Bước 1: Yêu cầu môi trường
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MySQL** >= 8.0 (Tùy chọn nếu muốn chạy database thật)

---

### Bước 2: Cài đặt và Chạy Frontend

Mở cửa sổ dòng lệnh tại thư mục `client`:

```bash
cd "c:\Users\Viet Anh\Documents\Website tìm trọ\client"

# Cài đặt thư viện
npm install

# Khởi chạy giao diện phát triển
npm run dev
```

Ứng dụng sẽ chạy tại: **`http://localhost:5173`**

> **💡 Lưu ý quan trọng về Chế độ Demo:**  
> Frontend đã được tích hợp sẵn chế độ **Mock Data & Fallback thông minh** trong `src/services/api.js`. Bạn có thể trải nghiệm **toàn bộ tính năng** (tìm kiếm, bộ lọc, xem chi tiết, đăng ký/đăng nhập, đăng tin mới chờ duyệt, hỏi AI, lưu yêu thích, đặt lịch hẹn và bảng điều khiển Admin) ngay cả khi chưa khởi động MySQL!

---

### Bước 3: Cài đặt và Chạy Backend (Tùy chọn khi có MySQL)

1. Cấu hình file `server/.env`:
```env
DATABASE_URL="mysql://root:mat_khau_cua_ban@localhost:3306/youroom_ai"
JWT_SECRET="youroom_ai_secret_key_2024"
PORT=5000
NODE_ENV=development
AI_PROVIDER=mock
# Nếu có Gemini API Key thật:
# AI_PROVIDER=gemini
# GEMINI_API_KEY=AIzaSy...
```

2. Cài đặt và khởi tạo database:
```bash
cd "c:\Users\Viet Anh\Documents\Website tìm trọ\server"

# Cài đặt dependencies
npm install

# Đồng bộ bảng vào MySQL
npx prisma db push

# Nạp 15 phòng mẫu và tài khoản demo
npm run db:seed

# Chạy server
npm run dev
```

Server sẽ lắng nghe tại: **`http://localhost:5000`**

---

## 6. Tài khoản dùng thử nhanh (Demo Accounts)

Giao diện đăng nhập đã có sẵn 2 nút **1-Click Login** để thử nghiệm ngay:

| Vai trò | Email đăng nhập | Mật khẩu | Quyền hạn |
|---|---|---|---|
| **Quản trị viên (Admin)** | `admin@youroom.ai` | `Admin@123` | Quản lý toàn bộ hệ thống, duyệt tin đăng, xử lý báo cáo, xóa người dùng |
| **Người dùng (User & Chủ trọ)** | `demo@youroom.ai` | `User@123` | Tìm phòng, lưu yêu thích, hẹn lịch xem phòng, đăng tin cho thuê |
| **Chủ trọ mẫu (Landlord)** | `nam@example.com` | `User@123` | Sở hữu các phòng trọ mẫu, quản lý tin đăng |

---

## 7. Kịch bản kiểm thử các tính năng chính

1. **Kiểm tra Trang chủ**:
   - Cuộn xem Hero Section, thanh tìm kiếm lớn, danh mục và các card phòng nổi bật.
   - Thử nghiệm khung **"AI tìm phòng"**: bấm gợi ý nhanh *"Gần trường đại học"* hoặc *"Phòng có ban công"* để xem AI phân tích và trả về phòng thực tế.
2. **Kiểm tra Tìm kiếm & Bộ lọc**:
   - Vào mục **Tìm phòng**: lọc theo Tỉnh thành "Hà Nội", khoảng giá "Dưới 3 triệu".
   - Thử sắp xếp "Giá: Thấp đến Cao".
3. **Kiểm tra Chi tiết phòng**:
   - Chọn phòng *"Phòng Studio gần Học viện Kỹ thuật Mật mã"*.
   - Bấm chuyển đổi ảnh trong Gallery.
   - Bấm **"Đặt lịch hẹn xem phòng"** hoặc **"Lưu tin"**.
4. **Kiểm tra Đăng tin cho thuê**:
   - Đăng nhập tài khoản bất kỳ.
   - Bấm **"Đăng tin miễn phí"** trên thanh Header.
   - Nhập tiêu đề, giá, diện tích, sau đó bấm **"AI viết mô tả giúp tôi"** để xem đoạn văn bản gợi ý sinh động.
   - Hoàn tất đăng tin -> Tin sẽ chuyển về trạng thái **Chờ duyệt (Pending)**.
5. **Kiểm tra Quản trị Admin**:
   - Đăng nhập tài khoản `admin@youroom.ai`.
   - Vào trang **Quản trị hệ thống** (`/admin`).
   - Duyệt tin đăng mới hoặc từ chối tin đăng.
   - Xem danh sách báo cáo vi phạm và thực hiện gỡ tin vi phạm.
