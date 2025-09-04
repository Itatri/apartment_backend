🗓 Day 7 – Phân quyền & Auth Guard
1. Backend (Node.js + Express + JWT)
📌 1.1. User Model thêm role

📂 models/user.js

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Owner', 'Tenant'], default: 'Tenant' }
});

export default mongoose.model('User', userSchema);

📌 1.2. Đăng nhập trả về JWT chứa role

📂 routes/auth.routes.js

import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';

const router = express.Router();

// Đăng nhập
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: 'User not found' });

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(400).json({ error: 'Invalid password' });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({ token, role: user.role });
});

export default router;

📌 1.3. Middleware kiểm tra quyền

📂 middleware/auth.js

import jwt from 'jsonwebtoken';

export const verifyToken = (roles = []) => {
  return (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Forbidden: insufficient rights' });
      }
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
};


👉 Ví dụ dùng Middleware trong Invoice API (chỉ Admin/Owner mới được xóa):

import { verifyToken } from '../middleware/auth.js';

router.delete('/:id', verifyToken(['Admin','Owner']), async (req, res) => {
  await Invoice.findByIdAndDelete(req.params.id);
  res.json({ message: 'Invoice deleted' });
});

2. Frontend (Angular)
📌 2.1. AuthService quản lý login

📂 src/app/services/auth.service.ts

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'app_token';
  private roleKey = 'app_role';

  login(token: string, role: string) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.roleKey, role);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

📌 2.2. Tạo AuthGuard

📂 src/app/guards/auth.guard.ts

import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}

📌 2.3. Tạo RoleGuard

📂 src/app/guards/role.guard.ts

import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: any): boolean {
    const expectedRoles = route.data?.['roles'] as string[];
    const userRole = this.auth.getRole();

    if (!userRole || (expectedRoles && !expectedRoles.includes(userRole))) {
      this.router.navigate(['/forbidden']);
      return false;
    }
    return true;
  }
}

📌 2.4. Áp dụng Guard vào route

📂 src/app/app.routes.ts

import { Routes } from '@angular/router';
import { InvoiceListComponent } from './components/invoice-list/invoice-list.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: 'invoices', component: InvoiceListComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['Admin','Owner'] } },
  { path: 'tenants', loadComponent: () => import('./components/tenant-list/tenant-list.component').then(m => m.TenantListComponent), canActivate: [AuthGuard], data: { roles: ['Admin','Owner'] } },
  { path: '', redirectTo: 'invoices', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];

📌 2.5. Ẩn/Hiện UI theo role
<!-- Ví dụ trong invoice-list.component.html -->
<button *ngIf="auth.getRole() === 'Admin'" (click)="deleteInvoice(invoice._id)">Xóa</button>

3. Kết quả đạt được

✅ Backend có Middleware kiểm tra JWT + quyền.

✅ Frontend có AuthService, AuthGuard, RoleGuard.

✅ Route được bảo vệ theo role (Admin/Owner mới xem Invoice, Tenant chỉ xem trang của mình).

✅ UI hiển thị/nút bấm theo role.