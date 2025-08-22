📅 Day 4: Quản lý khách thuê (CRUD + Upload ảnh)
🎯 Mục tiêu

Xây dựng API trong NodeJS/Express để quản lý khách thuê (Tenants/Customers).

Hỗ trợ CRUD (Create, Read, Update, Delete).

Cho phép upload ảnh khách thuê (lưu ảnh vào thư mục hoặc cloud).

Trên Angular: tạo màn hình quản lý khách thuê (form + table + upload ảnh).

🛠️ Backend (NodeJS + Express + MongoDB)
1. Cài đặt thư viện upload ảnh

Trong thư mục apartment_backend:

npm install multer

2. Tạo model Tenant (MongoDB - mongoose)

📂 models/Tenant.js

const mongoose = require("mongoose");

const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  avatar: { type: String }, // đường dẫn ảnh
}, { timestamps: true });

module.exports = mongoose.model("Tenant", TenantSchema);

3. Tạo router cho Tenant

📂 routes/tenantRoutes.js

const express = require("express");
const multer = require("multer");
const path = require("path");
const Tenant = require("../models/Tenant");

const router = express.Router();

// Cấu hình nơi lưu ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/tenants/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ✅ Lấy danh sách tenants
router.get("/", async (req, res) => {
  const tenants = await Tenant.find().populate("roomId");
  res.json(tenants);
});

// ✅ Thêm mới tenant
router.post("/", upload.single("avatar"), async (req, res) => {
  const { name, phone, email, roomId } = req.body;
  const avatar = req.file ? "/uploads/tenants/" + req.file.filename : null;

  const tenant = new Tenant({ name, phone, email, roomId, avatar });
  await tenant.save();
  res.json(tenant);
});

// ✅ Cập nhật tenant
router.put("/:id", upload.single("avatar"), async (req, res) => {
  const { name, phone, email, roomId } = req.body;
  const updateData = { name, phone, email, roomId };
  if (req.file) {
    updateData.avatar = "/uploads/tenants/" + req.file.filename;
  }
  const tenant = await Tenant.findByIdAndUpdate(req.params.id, updateData, { new: true });
  res.json(tenant);
});

// ✅ Xóa tenant
router.delete("/:id", async (req, res) => {
  await Tenant.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
});

module.exports = router;

4. Thêm vào server.js
const tenantRoutes = require("./routes/tenantRoutes");
app.use("/api/tenants", tenantRoutes);
app.use("/uploads", express.static("uploads"));

🎨 Frontend (Angular)
1. Tạo service cho Tenant

📂 src/app/services/tenant.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private apiUrl = 'http://localhost:3000/api/tenants';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  create(data: FormData): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  update(id: string, data: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

2. Tạo component Tenant

📂 src/app/components/tenant/tenant.component.ts

import { Component, OnInit } from '@angular/core';
import { TenantService } from '../../services/tenant.service';

@Component({
  selector: 'app-tenant',
  templateUrl: './tenant.component.html',
  styleUrls: ['./tenant.component.css']
})
export class TenantComponent implements OnInit {
  tenants: any[] = [];
  tenantForm: any = { name: '', phone: '', email: '', roomId: '' };
  selectedFile: File | null = null;

  constructor(private tenantService: TenantService) {}

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants() {
    this.tenantService.getAll().subscribe(data => this.tenants = data);
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
  }

  saveTenant() {
    const formData = new FormData();
    formData.append('name', this.tenantForm.name);
    formData.append('phone', this.tenantForm.phone);
    formData.append('email', this.tenantForm.email);
    if (this.selectedFile) {
      formData.append('avatar', this.selectedFile);
    }

    this.tenantService.create(formData).subscribe(() => {
      this.loadTenants();
      this.tenantForm = { name: '', phone: '', email: '', roomId: '' };
      this.selectedFile = null;
    });
  }

  deleteTenant(id: string) {
    this.tenantService.delete(id).subscribe(() => this.loadTenants());
  }
}

3. Template HTML

📂 src/app/components/tenant/tenant.component.html

<h2>Quản lý khách thuê</h2>

<form (ngSubmit)="saveTenant()">
  <input type="text" [(ngModel)]="tenantForm.name" name="name" placeholder="Tên" required>
  <input type="text" [(ngModel)]="tenantForm.phone" name="phone" placeholder="SĐT" required>
  <input type="email" [(ngModel)]="tenantForm.email" name="email" placeholder="Email">
  <input type="file" (change)="onFileChange($event)">
  <button type="submit">Thêm khách thuê</button>
</form>

<hr>

<table border="1">
  <tr>
    <th>Tên</th>
    <th>SĐT</th>
    <th>Email</th>
    <th>Ảnh</th>
    <th>Hành động</th>
  </tr>
  <tr *ngFor="let tenant of tenants">
    <td>{{tenant.name}}</td>
    <td>{{tenant.phone}}</td>
    <td>{{tenant.email}}</td>
    <td>
      <img *ngIf="tenant.avatar" [src]="'http://localhost:3000' + tenant.avatar" width="80">
    </td>
    <td>
      <button (click)="deleteTenant(tenant._id)">Xóa</button>
    </td>
  </tr>
</table>


✅ Kết quả sau Day 4:

Có API cho khách thuê (CRUD + upload ảnh).

Angular có màn hình thêm khách + hiển thị danh sách.

Upload ảnh và hiển thị trực tiếp.