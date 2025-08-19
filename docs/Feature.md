🔹 Ý tưởng dự án: Quản lý Phòng Trọ (Apartment Management)

(gần giống với bạn đã làm bằng WinForms, nhưng lần này chuyển sang Angular + Node.js để luyện web fullstack)

🖥 Frontend (Angular)

Trang Đăng nhập / Đăng ký (JWT Authentication).

Trang Danh sách khách thuê (table + phân trang + tìm kiếm).

Trang Quản lý phòng (CRUD phòng, trạng thái: trống, đang thuê).

Trang Quản lý phiếu thu (hóa đơn tiền phòng, tiền điện, nước, dịch vụ).

Biểu đồ Doanh thu theo tháng (dùng thư viện Chart.js hoặc ngx-charts).

⚙️ Backend (Node.js + Express + MongoDB hoặc MySQL/PostgreSQL)

API Xác thực: /auth/login, /auth/register.

API Khách thuê: /api/tenants (CRUD).

API Phòng: /api/rooms (CRUD).

API Phiếu thu: /api/invoices (CRUD + export PDF).

Middleware JWT để bảo vệ các route.

Lưu ảnh đại diện khách thuê bằng Multer (upload file).

🔑 Các tính năng chính bạn sẽ học được

Angular:

Routing (điều hướng giữa các trang).

Reactive Forms (validate form login, thêm khách).

Service gọi API (HttpClient).

Guards (chặn truy cập khi chưa login).

Component + Data Binding.

Hiển thị bảng với Angular Material.

Node.js (Express):

Xây dựng REST API chuẩn.

Dùng MongoDB (Mongoose) hoặc SQL (Sequelize/TypeORM).

Upload & quản lý file ảnh.

Xác thực JWT.

Xuất hóa đơn PDF (dùng thư viện pdfkit).

📂 Cấu trúc dự án mẫu

```
/apartment-management
   /backend   (Node.js + Express + MongoDB/MySQL)
       /models
       /routes
       /controllers
       /middlewares
       server.js
   /frontend  (Angular)
       /src
          /app
             /auth
             /tenants
             /rooms
             /invoices
             /shared

```
