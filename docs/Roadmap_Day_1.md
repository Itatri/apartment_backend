📅 Day 1 – Khởi tạo project (Angular 17 + Node.js API)
1. Backend (Node.js + Express)

Phần này giữ nguyên như trước:

Tạo thư mục backend

Cài express, cors, dotenv

File server.js:

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Node.js API 🚀" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));


👉 Chạy thử: http://localhost:5000/api/hello

2. Frontend (Angular 17+ Standalone)
Bước 1: Tạo dự án Angular
ng new apartment_frontend --standalone
cd apartment_frontend
ng serve


Mở http://localhost:4200
 để kiểm tra.

Bước 2: Bật HttpClient trong cấu hình toàn cục

File src/app/app.config.ts:

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient() // 👈 thêm dòng này để gọi API
  ]
};

Bước 3: Tạo Service gọi API
ng generate service services/api


File src/app/services/api.ts:

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getHello(): Observable<any> {
    return this.http.get(`${this.baseUrl}/hello`);
  }
}

Bước 4: Gọi API trong app.ts

File src/app/app.ts:

import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  template: `
    <h1>{{ message }}</h1>
  `,
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  message = 'Loading...';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getHello().subscribe(res => {
      this.message = res.message;
    });
  }
}

✅ Kết quả Day 1

Backend: API chạy ở http://localhost:5000/api/hello

Frontend: Angular hiển thị Hello from Node.js API 🚀