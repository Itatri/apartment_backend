📅 Day 3 – Quản lý phòng (CRUD)
1. Backend (Node.js + Express + MongoDB)
Bước 1: Tạo model Room

File backend/models/Room.js

const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },      // Tên phòng
  price: { type: Number, required: true },     // Giá thuê
  status: { type: String, default: "available" } // available / rented
});

module.exports = mongoose.model("Room", roomSchema);

Bước 2: Tạo route Room

File backend/routes/room.js

const express = require("express");
const Room = require("../models/Room");
const router = express.Router();

// Lấy tất cả phòng
router.get("/", async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
});

// Thêm phòng
router.post("/", async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Cập nhật phòng
router.put("/:id", async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Xóa phòng
router.delete("/:id", async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

Bước 3: Import route vào server.js
const roomRoutes = require("./routes/room");
app.use("/api/rooms", roomRoutes);


👉 Test Postman:

GET: http://localhost:5000/api/rooms

POST: { "name": "Phòng 101", "price": 1500000, "status": "available" }

2. Frontend (Angular 17+ Standalone)
Bước 1: Tạo Room Service

File src/app/services/room.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Room {
  _id?: string;
  name: string;
  price: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private baseUrl = 'http://localhost:5000/api/rooms';

  constructor(private http: HttpClient) {}

  getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.baseUrl);
  }

  addRoom(room: Room): Observable<Room> {
    return this.http.post<Room>(this.baseUrl, room);
  }

  updateRoom(id: string, room: Room): Observable<Room> {
    return this.http.put<Room>(`${this.baseUrl}/${id}`, room);
  }

  deleteRoom(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}

Bước 2: Tạo Room Component
ng generate component rooms/room-list --standalone


File src/app/rooms/room-list/room-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Room, RoomService } from '../../services/room.service';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Danh sách phòng</h2>

    <form (ngSubmit)="addRoom()">
      <input [(ngModel)]="newRoom.name" name="name" placeholder="Tên phòng" required>
      <input [(ngModel)]="newRoom.price" name="price" placeholder="Giá thuê" type="number" required>
      <select [(ngModel)]="newRoom.status" name="status">
        <option value="available">Available</option>
        <option value="rented">Rented</option>
      </select>
      <button type="submit">Thêm</button>
    </form>

    <table border="1" width="100%" style="margin-top: 20px;">
      <tr>
        <th>Tên phòng</th>
        <th>Giá</th>
        <th>Trạng thái</th>
        <th>Hành động</th>
      </tr>
      <tr *ngFor="let room of rooms">
        <td>
          <input [(ngModel)]="room.name" name="name{{room._id}}">
        </td>
        <td>
          <input [(ngModel)]="room.price" type="number" name="price{{room._id}}">
        </td>
        <td>
          <select [(ngModel)]="room.status" name="status{{room._id}}">
            <option value="available">Available</option>
            <option value="rented">Rented</option>
          </select>
        </td>
        <td>
          <button (click)="updateRoom(room)">Lưu</button>
          <button (click)="deleteRoom(room._id!)">Xóa</button>
        </td>
      </tr>
    </table>
  `
})
export class RoomListComponent implements OnInit {
  rooms: Room[] = [];
  newRoom: Room = { name: '', price: 0, status: 'available' };

  constructor(private roomService: RoomService) {}

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    this.roomService.getRooms().subscribe(res => {
      this.rooms = res;
    });
  }

  addRoom() {
    this.roomService.addRoom(this.newRoom).subscribe(() => {
      this.newRoom = { name: '', price: 0, status: 'available' };
      this.loadRooms();
    });
  }

  updateRoom(room: Room) {
    if (!room._id) return;
    this.roomService.updateRoom(room._id, room).subscribe(() => {
      this.loadRooms();
    });
  }

  deleteRoom(id: string) {
    this.roomService.deleteRoom(id).subscribe(() => {
      this.loadRooms();
    });
  }
}

Bước 3: Thêm route

File src/app/app.routes.ts

import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { RoomListComponent } from './rooms/room-list/room-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'rooms', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'rooms', component: RoomListComponent }
];

✅ Kết quả Day 3

Backend: API CRUD phòng (/api/rooms).

Frontend: Trang Danh sách phòng với chức năng:

Thêm phòng mới.

Sửa trực tiếp trong bảng.

Xóa phòng.