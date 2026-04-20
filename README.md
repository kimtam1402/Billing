# CineStream - Nền Tảng Xem Phim Trực Tuyến 🎬

CineStream là một hệ thống website xem phim trực tuyến mang phong cách hiện đại theo tiêu chuẩn của Netflix/HBO, được xây dựng với kiến trúc Fullstack hoàn chỉnh. Dự án tích hợp đầy đủ tính năng: hệ thống quản lý giao diện, tài khoản, cấp bậc gói thành viên và hệ thống phát Video dựa vào gói cước đăng ký.

---

## 🚀 Công Nghệ Sử Dụng

- **Framework Website:** [Next.js 16](https://nextjs.org/) (App Router) với **React 19** cho hiệu suất tối đa (Server-Side Rendering & Client Components).
- **Ngôn ngữ:** TypeScript.
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) mang lại khả năng custom giao diện nhanh chóng với Dark Mode mặc định cao cấp.
- **Cơ sở dữ liệu:** [MongoDB](https://www.mongodb.com/) (thông qua Mongoose) lưu trữ thông tin User, Phim, Lịch sử truy cập.
- **Xác thực và Bảo mật:** Mật khẩu mã hoá qua `bcryptjs`, sử dụng `jsonwebtoken` (JWT) lưu lại phiên làm việc an toàn ở Cookies.
- **Biểu tượng (Icons):** `lucide-react`.
- **Thông báo (Toast):** `react-hot-toast` (UI Animation cho alert).

---

## 🌟 Các Tính Năng Nổi Bật

### 1. Hệ Thống Tài Khoản (Authentication)
* **Đăng ký / Đăng nhập:** Kiểm tra form, mã hóa mật khẩu và tạo Token JWT bảo mật tự động lưu cookie.
* **Ghi nhớ đăng nhập:** Phục hồi thông tin người dùng từ Backend dựa trên phiên Cookie, giúp người dùng không phải điền lại mỗi lần vào web.

### 2. Quản Lý Gói Cước Hệ Thống (Authorization - Access Control)
Người dùng được cấp các gói khác nhau theo các mức độ (Phân cấp tài khoản):
* **FREE:** Xem được các nội dung đánh dấu miễn phí.
* **PLUS:** Mở khoá phim chuyên mục Hành động / tình cảm hạng trung.
* **PRO:** Mở khoá các nội dung hấp dẫn, kinh điển. Tăng số lượng thiết bị truy cập...
* **PREMIUM:** Mở khóa toàn bộ nội dung, độ phân giải 4K cao nhất.
* _Kèm theo:_ Hệ thống tính toán thời gian `subscriptionEnd` để tự động thu hồi/giáng cấp tài khoản khi hết hạn.

### 3. Giao Diện Ưu Việt (Netflix - Style UI)
* Thiết kế Hero Banner trình chiếu xoay vòng (Auto-rotate) cho các bộ phim nổi bật (Featured).
* Giao diện tối (Dark-theme) quyến rũ, viền gradients điện ảnh và Typography rõ ràng (font chữ Inter/Outfit).
* Cấu trúc hệ thống Card Phim (MovieCard) linh hoạt để hiển thị các danh sách: *"Đang thịnh hành"*, *"Mới phát hành"*, *"Dành riêng cho bạn"*, *"Phim Miễn Phí"*, v.v.

### 4. Hệ Thống Seed Dữ Liệu Tự Động (Database Seeding)
Tự động dọn dẹp và chèn lượng danh sách phim và các người dùng thử nghiệm hoàn toàn tự động bằng một API Seed bảo mật qua _Headers Secret Key_.

### 5. API Độc Lập
Được tạo bằng Route Handlers của Next.js phục vụ các đầu Endpoints RESTful riêng biệt: `GET /api/movies`, `POST /api/movies`, `POST /api/auth/register`, `GET /api/auth/me`, `POST /api/user/subscribe` v.v.

---

## 🛠️ Hướng Dẫn Cài Đặt (Getting Started)

**Bước 1: Clone mã nguồn hoặc chuẩn bị thư mục**
Tải toàn bộ code dự án về máy tính và mở trên trình chỉnh sửa code (như VS Code).

**Bước 2: Cài đặt Dependency**
```bash
npm install
```

**Bước 3: Cấu hình biến môi trường**
Tạo file `.env` hoặc `.env.local` ở thư mục gốc chứa các khóa sau:
```env
MONGODB_URI=mongodb_uri_cua_ban
JWT_SECRET=mot_chuoi_bi_mat_bat_ky_dai_cho_chuc_nang_jwt
```

**Bước 4: Chạy Máy chủ Phát Triển**
```bash
npm run dev
```

**Bước 5: Thêm dữ liệu mẫu vào cơ sở dữ liệu**
Dự án được tích hợp bộ phim mẫu, nhưng cần nạp vào DB lần đầu. Mở Terminal mới và chạy lệnh (chọn 1 trong 2):

_Với PowerShell (Windows):_
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/seed -Method Post -Headers @{"x-seed-secret"="cinestream-seed-2024"}
```

_Với Curl / Bash (Linux, Git Bash):_
```bash
curl -X POST http://localhost:3000/api/seed -H "x-seed-secret: cinestream-seed-2024"
```
Khi chạy thành công web sẽ kết nối và hiển thị đầy đủ hình ảnh, phim thử nghiệm, và danh sách User.

---

## 📂 Cấu Trúc Thư Mục Tiêu Biểu

```
cinestream/
├── package.json
├── document/       -> Các tài liệu liên quan 
├── src/
│   ├── app/        -> Giao diện Pages Routing (App Router) của Next.js
│   │   ├── api/    -> API Server Handlers (Auth, Movies, Seed)
│   │   ├── ...
│   │   ├── globals.css  -> CSS toàn cục và config Tailwind v4
│   │   └── layout.tsx   -> HTML, Meta Data, Hydration Layout 
│   ├── components/ -> Các thành phần UI có thể tái sử dụng (Navbar, MovieCard)
│   ├── context/    -> State Management nội bộ (Ví dụ: AuthContext)
│   ├── lib/        -> Các helpers (mongodb.ts, auth.ts, plans.ts, data seed)
│   └── models/     -> Cấu trúc Model Databse Mongoose (User.ts, Movie.ts)
└── public/         -> Tài nguyên nội dung tĩnh (Images, Videos...)
```

## 🤝 Hỗ Trợ Đóng Góp & Kế Hoạch Tương Lai
- Bổ sung Cổng thanh toán (Stripe/PayPal hoặc chuyển khoản QR).
- Tính năng bình luận (Comments) và đánh giá sao (Ratings).
- Trang hồ sơ chi tiết và đổi avatar cho các tài khoản.
- Tối ưu hiệu năng nạp Video qua dạng chunks/HLS streaming. Mở nền tảng theo định dạng Full-Stack VOD (Video on Demand).

`Phát triển và hoàn thiện dưới sự hỗ trợ chuyên sâu toàn vẹn (End-to-End).`
