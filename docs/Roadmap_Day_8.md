🗓 Day 8 – Dashboard + Chart
1. Backend (Node.js + Express)
📌 1.1. API thống kê tổng quan

📂 routes/dashboard.routes.js

import express from 'express';
import Invoice from '../models/invoice.js';
import Room from '../models/room.js';
import Tenant from '../models/tenant.js';

const router = express.Router();

// Thống kê tổng quan
router.get('/summary', async (req, res) => {
  try {
    const totalRevenue = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
    const totalTenants = await Tenant.countDocuments();

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      totalRooms,
      occupiedRooms,
      totalTenants
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Doanh thu theo tháng
router.get('/revenue-monthly', async (req, res) => {
  try {
    const data = await Invoice.aggregate([
      {
        $group: {
          _id: { $month: "$date" },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json(data.map(d => ({
      month: d._id,
      revenue: d.total
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;


👉 Thêm vào server.js:

import dashboardRoutes from './routes/dashboard.routes.js';
app.use('/api/dashboard', dashboardRoutes);

2. Frontend (Angular)
📌 2.1. Cài đặt Chart.js
npm install chart.js ng2-charts

📌 2.2. DashboardService gọi API

📂 src/app/services/dashboard.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = 'http://localhost:3000/api/dashboard';

  constructor(private http: HttpClient) {}

  getSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/summary`);
  }

  getRevenueMonthly(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/revenue-monthly`);
  }
}

📌 2.3. Dashboard Component

📂 src/app/components/dashboard/dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  summary: any = {};
  revenueChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { label: 'Doanh thu theo tháng', data: [] }
    ]
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getSummary().subscribe(data => {
      this.summary = data;
    });

    this.dashboardService.getRevenueMonthly().subscribe(data => {
      this.revenueChartData.labels = data.map(d => 'Tháng ' + d.month);
      this.revenueChartData.datasets[0].data = data.map(d => d.revenue);
    });
  }
}

📌 2.4. Dashboard Template

📂 src/app/components/dashboard/dashboard.component.html

<div class="p-4">
  <h2 class="text-2xl font-bold mb-4">📊 Dashboard</h2>

  <div class="grid grid-cols-4 gap-4">
    <div class="bg-blue-200 p-4 rounded">
      <h3 class="font-semibold">Tổng doanh thu</h3>
      <p class="text-xl">{{ summary.totalRevenue | currency:'VND' }}</p>
    </div>
    <div class="bg-green-200 p-4 rounded">
      <h3 class="font-semibold">Tổng số phòng</h3>
      <p class="text-xl">{{ summary.totalRooms }}</p>
    </div>
    <div class="bg-yellow-200 p-4 rounded">
      <h3 class="font-semibold">Phòng đang cho thuê</h3>
      <p class="text-xl">{{ summary.occupiedRooms }}</p>
    </div>
    <div class="bg-red-200 p-4 rounded">
      <h3 class="font-semibold">Tổng khách thuê</h3>
      <p class="text-xl">{{ summary.totalTenants }}</p>
    </div>
  </div>

  <div class="mt-6">
    <canvas baseChart
      [data]="revenueChartData"
      [type]="'bar'">
    </canvas>
  </div>
</div>

📌 2.5. Thêm Route

📂 src/app/app.routes.ts

import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

3. Kết quả đạt được

✅ API Backend trả về tổng quan + doanh thu theo tháng.

✅ Angular hiển thị Dashboard với số liệu và biểu đồ cột (Chart.js).

✅ Người dùng dễ dàng xem tình hình kinh doanh.