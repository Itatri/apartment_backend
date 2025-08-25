Ok mình viết tiếp Day 5: Quản lý Hóa đơn (Invoice CRUD + tính tiền tự động) theo đúng format các ngày trước nhé 🚀.
Ở ngày này, ta sẽ làm CRUD Invoice (hóa đơn), đồng thời tự động tính tiền dựa trên dịch vụ, giá phòng và số ngày thuê.

🚀 Day 5: Quản lý Hóa đơn (Invoice CRUD + Tính tiền tự động)
1. Backend (Node.js + Express + MongoDB)
📌 1.1. Tạo Model Invoice

models/invoice.js

import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  roomPrice: { type: Number, required: true },
  services: [
    {
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Unpaid', 'Paid'], default: 'Unpaid' }
}, { timestamps: true });

export default mongoose.model('Invoice', invoiceSchema);

📌 1.2. Tạo Route invoice.routes.js

routes/invoice.routes.js

import express from 'express';
import Invoice from '../models/invoice.js';
import Room from '../models/room.js';
import Tenant from '../models/tenant.js';

const router = express.Router();

// Tính tiền tự động
const calculateTotal = (roomPrice, startDate, endDate, services) => {
  const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
  const roomCost = (roomPrice / 30) * days;
  const serviceCost = services.reduce((sum, s) => sum + s.price * s.quantity, 0);
  return roomCost + serviceCost;
};

// Create
router.post('/', async (req, res) => {
  try {
    const { roomId, tenantId, startDate, endDate, services } = req.body;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

    const totalAmount = calculateTotal(room.price, startDate, endDate, services);

    const invoice = new Invoice({
      roomId,
      tenantId,
      startDate,
      endDate,
      roomPrice: room.price,
      services,
      totalAmount
    });

    await invoice.save();
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read all
router.get('/', async (req, res) => {
  const invoices = await Invoice.find().populate('roomId').populate('tenantId');
  res.json(invoices);
});

// Read by id
router.get('/:id', async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate('roomId').populate('tenantId');
  res.json(invoice);
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const { roomId, tenantId, startDate, endDate, services, status } = req.body;
    const room = await Room.findById(roomId);
    const totalAmount = calculateTotal(room.price, startDate, endDate, services);

    const invoice = await Invoice.findByIdAndUpdate(req.params.id, {
      roomId,
      tenantId,
      startDate,
      endDate,
      roomPrice: room.price,
      services,
      totalAmount,
      status
    }, { new: true });

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  await Invoice.findByIdAndDelete(req.params.id);
  res.json({ message: 'Invoice deleted' });
});

export default router;


👉 Thêm vào server.js

import invoiceRoutes from './routes/invoice.routes.js';
app.use('/api/invoices', invoiceRoutes);

2. Frontend (Angular Standalone)
📌 2.1. Service gọi API

src/app/services/invoice.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private baseUrl = 'http://localhost:5000/api/invoices';

  constructor(private http: HttpClient) {}

  getInvoices(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getInvoice(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  createInvoice(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  updateInvoice(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  deleteInvoice(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}

📌 2.2. Component hiển thị danh sách hóa đơn

src/app/components/invoice-list/invoice-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../services/invoice.service';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Danh sách hóa đơn</h2>
    <table border="1" cellpadding="5">
      <tr>
        <th>Phòng</th>
        <th>Khách thuê</th>
        <th>Từ ngày</th>
        <th>Đến ngày</th>
        <th>Tổng tiền</th>
        <th>Trạng thái</th>
        <th>Hành động</th>
      </tr>
      <tr *ngFor="let invoice of invoices">
        <td>{{ invoice.roomId?.name }}</td>
        <td>{{ invoice.tenantId?.name }}</td>
        <td>{{ invoice.startDate | date }}</td>
        <td>{{ invoice.endDate | date }}</td>
        <td>{{ invoice.totalAmount | currency:'VND' }}</td>
        <td>{{ invoice.status }}</td>
        <td>
          <button (click)="deleteInvoice(invoice._id)">Xóa</button>
        </td>
      </tr>
    </table>
  `
})
export class InvoiceListComponent implements OnInit {
  invoices: any[] = [];

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices() {
    this.invoiceService.getInvoices().subscribe(data => {
      this.invoices = data;
    });
  }

  deleteInvoice(id: string) {
    this.invoiceService.deleteInvoice(id).subscribe(() => this.loadInvoices());
  }
}

📌 2.3. Thêm route vào app.routes.ts
import { Routes } from '@angular/router';
import { InvoiceListComponent } from './components/invoice-list/invoice-list.component';

export const routes: Routes = [
  { path: 'invoices', component: InvoiceListComponent },
  { path: '', redirectTo: 'invoices', pathMatch: 'full' }
];

3. Kết quả đạt được

✅ Có thể thêm/sửa/xóa/xem hóa đơn.

✅ Tính tiền tự động dựa trên số ngày thuê + dịch vụ.

✅ Frontend hiển thị danh sách hóa đơn, có thể xóa trực tiếp.