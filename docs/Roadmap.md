🛠 Roadmap Học Angular + Node.js (Dự án Quản Lý Phòng Trọ)
📅 Day 1 – Khởi tạo project
Backend (Node.js + Express)

Cài Node.js, tạo thư mục backend.

npm init -y

Cài package cơ bản:
```
npm install express mongoose cors dotenv bcryptjs jsonwebtoken multer
npm install --save-dev nodemon
```

Tạo server.js:

Import express.

Tạo route test /api/hello.

Kết nối MongoDB (nếu dùng MongoDB Atlas hoặc cài local).

Frontend (Angular)

Cài Angular CLI:
```
npm install -g @angular/cli
```

Tạo project frontend:
```
ng new frontend
```

Chạy thử ng serve và test hiển thị Angular app.

📅 Day 2 – Auth (Đăng nhập, Đăng ký)
Backend

Tạo model User (username, password, role).

Tạo route /auth/register, /auth/login.

Hash mật khẩu bằng bcryptjs.

Tạo JWT token khi login thành công.

Frontend

Tạo module auth gồm:

Component login

Component register

Sử dụng ReactiveFormsModule để validate.

Dùng HttpClient gọi API backend.

Lưu JWT vào localStorage.

📅 Day 3 – Quản lý phòng
Backend

Model Room: (maPhong, tenPhong, trangThai, giaThue).

CRUD route: /api/rooms.

Frontend

Tạo module rooms.

Component room-list (hiển thị table).

Component room-form (thêm/sửa phòng).

Dùng Angular Material Table + Dialog.

📅 Day 4 – Quản lý khách thuê
Backend

Model Tenant: (maKhach, hoTen, gioiTinh, ngaySinh, phone, maPhong, anhNhanDien).

CRUD route: /api/tenants.

Upload ảnh với multer.

Frontend

Module tenants.

Component tenant-list (bảng khách thuê).

Component tenant-form (thêm/sửa).

Upload ảnh (dùng FormData).

📅 Day 5 – Quản lý phiếu thu
Backend

Model Invoice: (maPT, maPhong, tongTien, ngayLap, danhSachDichVu[]).

CRUD route: /api/invoices.

API xuất PDF (/api/invoices/:id/pdf) dùng pdfkit.

Frontend

Module invoices.

Component invoice-list.

Component invoice-detail (xem chi tiết, in hóa đơn).

Gọi API PDF và tải file.

📅 Day 6 – Hoàn thiện + Dashboard
Backend

API thống kê doanh thu theo tháng.

Frontend

Trang Dashboard:

Biểu đồ doanh thu (Chart.js hoặc ngx-charts).

Tổng số phòng, khách, hóa đơn.

📅 Day 7 – Deploy

Deploy backend lên Render/Heroku hoặc VPS.

Deploy frontend lên Netlify/Vercel.

Cấu hình API base URL trong Angular.

👉 Như vậy sau 7 ngày bạn sẽ có một Fullstack Web App quản lý phòng trọ:

Angular làm frontend

Node.js + MongoDB làm backend