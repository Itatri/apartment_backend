🗓 Day 4 – Quản lý khách thuê (CRUD + Upload ảnh)

Hôm nay ta sẽ xây dựng chức năng CRUD cho Tenant (khách thuê), kèm upload ảnh đại diện.

1. Backend (Node.js + Express + Multer)
Cài thêm thư viện để upload ảnh
npm install multer

Tạo model Tenant

📂 models/Tenant.js

const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female'], default: 'Male' },
  phone: { type: String, required: true },
  idCard: { type: String, required: true },
  address: { type: String },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  avatar: { type: String } // link ảnh upload
}, { timestamps: true });

module.exports = mongoose.model('Tenant', tenantSchema);

Tạo routes cho Tenant

📂 routes/tenant.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const Tenant = require('../models/Tenant');

const router = express.Router();

// Cấu hình Multer để lưu file ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/tenants'); // thư mục lưu ảnh
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // tên file: timestamp + đuôi
  }
});

const upload = multer({ storage });

// 📌 [POST] Thêm khách thuê
router.post('/', upload.single('avatar'), async (req, res) => {
  try {
    const tenant = new Tenant({
      ...req.body,
      avatar: req.file ? `/uploads/tenants/${req.file.filename}` : null
    });
    await tenant.save();
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 [GET] Lấy tất cả khách thuê
router.get('/', async (req, res) => {
  const tenants = await Tenant.find().populate('roomId');
  res.json(tenants);
});

// 📌 [GET] Lấy khách thuê theo ID
router.get('/:id', async (req, res) => {
  const tenant = await Tenant.findById(req.params.id).populate('roomId');
  res.json(tenant);
});

// 📌 [PUT] Cập nhật khách thuê
router.put('/:id', upload.single('avatar'), async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.avatar = `/uploads/tenants/${req.file.filename}`;
  
  const tenant = await Tenant.findByIdAndUpdate(req.params.id, data, { new: true });
  res.json(tenant);
});

// 📌 [DELETE] Xóa khách thuê
router.delete('/:id', async (req, res) => {
  await Tenant.findByIdAndDelete(req.params.id);
  res.json({ message: 'Tenant deleted' });
});

module.exports = router;

Cập nhật server.js
const tenantRoutes = require('./routes/tenant');
app.use('/api/tenants', tenantRoutes);

2. Frontend (Angular)
Tạo service cho Tenant

📂 src/app/services/tenant.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private apiUrl = 'http://localhost:3000/api/tenants';

  constructor(private http: HttpClient) {}

  getTenants(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getTenant(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  addTenant(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  updateTenant(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }

  deleteTenant(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

Tạo component quản lý Tenant
ng generate component tenants


📂 src/app/tenants/tenants.component.ts

import { Component, OnInit } from '@angular/core';
import { TenantService } from '../services/tenant.service';

@Component({
  selector: 'app-tenants',
  templateUrl: './tenants.component.html',
  styleUrls: ['./tenants.component.css']
})
export class TenantsComponent implements OnInit {
  tenants: any[] = [];
  selectedFile: File | null = null;
  tenantForm: any = { name: '', gender: 'Male', phone: '', idCard: '', address: '', roomId: '' };

  constructor(private tenantService: TenantService) {}

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants() {
    this.tenantService.getTenants().subscribe(data => {
      this.tenants = data;
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  addTenant() {
    const formData = new FormData();
    Object.keys(this.tenantForm).forEach(key => formData.append(key, this.tenantForm[key]));
    if (this.selectedFile) formData.append('avatar', this.selectedFile);

    this.tenantService.addTenant(formData).subscribe(() => this.loadTenants());
  }

  deleteTenant(id: string) {
    this.tenantService.deleteTenant(id).subscribe(() => this.loadTenants());
  }
}


📂 src/app/tenants/tenants.component.html

<h2>Danh sách khách thuê</h2>

<ul>
  <li *ngFor="let t of tenants">
    <img *ngIf="t.avatar" [src]="'http://localhost:3000' + t.avatar" width="50">
    {{t.name}} - {{t.phone}}
    <button (click)="deleteTenant(t._id)">Xóa</button>
  </li>
</ul>

<h3>Thêm khách thuê</h3>
<form (ngSubmit)="addTenant()">
  <input [(ngModel)]="tenantForm.name" name="name" placeholder="Tên" required>
  <input [(ngModel)]="tenantForm.phone" name="phone" placeholder="SĐT" required>
  <input [(ngModel)]="tenantForm.idCard" name="idCard" placeholder="CCCD" required>
  <input [(ngModel)]="tenantForm.address" name="address" placeholder="Địa chỉ">
  
  <select [(ngModel)]="tenantForm.gender" name="gender">
    <option value="Male">Nam</option>
    <option value="Female">Nữ</option>
  </select>

  <input type="file" (change)="onFileSelected($event)">

  <button type="submit">Thêm</button>
</form>

3. Demo Test

Chạy backend: node server.js

Chạy frontend: ng serve

Vào http://localhost:4200/tenants

→ Thêm khách thuê với ảnh → Kiểm tra DB + thư mục uploads/tenants

👉 Day 4 ta đã có:

API Nodejs cho Tenant CRUD + Upload ảnh

Angular service + component quản lý khách thuê

Hiển thị danh sách + thêm mới + xóa