📅 Day 2 – Authentication (Auth)
1. Backend (Node.js + Express + MongoDB)
Bước 1: Cài thêm thư viện
npm install mongoose bcryptjs jsonwebtoken

Bước 2: Tạo model User

File backend/models/User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" }
});

module.exports = mongoose.model("User", userSchema);

Bước 3: Tạo route auth

File backend/routes/auth.js

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Đăng ký
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.json({ message: "Register success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" }
    );

    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

Bước 4: Import route vào server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/apartment");

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Node.js API 🚀" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));


👉 Test bằng Postman:

POST http://localhost:5000/api/auth/register (body: { "username": "test", "password": "123456" })

POST http://localhost:5000/api/auth/login (body: { "username": "test", "password": "123456" })

2. Frontend (Angular 17+ Standalone)
Bước 1: Tạo component Auth
ng generate component auth/login --standalone
ng generate component auth/register --standalone

Bước 2: Auth Service

File src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) {}

  register(username: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, { username, password });
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { username, password });
  }
}

Bước 3: Login Component

File src/app/auth/login/login.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Đăng nhập</h2>
    <form (ngSubmit)="onLogin()">
      <input type="text" [(ngModel)]="username" name="username" placeholder="Username" required>
      <input type="password" [(ngModel)]="password" name="password" placeholder="Password" required>
      <button type="submit">Login</button>
    </form>
    <p>{{ message }}</p>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  message = '';

  constructor(private authService: AuthService) {}

  onLogin() {
    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.message = "Login success ✅";
      },
      error: (err) => {
        this.message = "Login failed ❌";
      }
    });
  }
}

Bước 4: Register Component

File src/app/auth/register/register.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Đăng ký</h2>
    <form (ngSubmit)="onRegister()">
      <input type="text" [(ngModel)]="username" name="username" placeholder="Username" required>
      <input type="password" [(ngModel)]="password" name="password" placeholder="Password" required>
      <button type="submit">Register</button>
    </form>
    <p>{{ message }}</p>
  `
})
export class RegisterComponent {
  username = '';
  password = '';
  message = '';

  constructor(private authService: AuthService) {}

  onRegister() {
    this.authService.register(this.username, this.password).subscribe({
      next: () => {
        this.message = "Register success ✅";
      },
      error: () => {
        this.message = "Register failed ❌";
      }
    });
  }
}

Bước 5: Thêm routes

File src/app/app.routes.ts

import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AppComponent } from './app';

export const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];

✅ Kết quả Day 2

Backend: có API /api/auth/register & /api/auth/login với JWT.

Frontend: có form Đăng nhập & Đăng ký, lưu token vào LocalStorage khi login thành công.