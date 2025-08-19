📅 Day 1 – Khởi tạo project
1. Tạo Backend (Node.js + Express)
Bước 1: Tạo thư mục backend
```
mkdir backend
cd backend
npm init -y
```

Bước 2: Cài thư viện cần thiết
```
npm install express cors mongoose dotenv
npm install --save-dev nodemon
```

Bước 3: Tạo file server.js

```javascript
// backend/server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Route test
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Node.js API 🚀" });
});

// Chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
```

```
Bước 4: Thêm script chạy trong package.json
```
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

```
Bước 5: Chạy thử server
npm run dev
```


Mở trình duyệt: http://localhost:5000/api/hello

👉 Nếu hiện { "message": "Hello from Node.js API 🚀" } là ok.

2. Tạo Frontend (Angular)
Bước 1: Cài Angular CLI (nếu chưa cài)
```
npm install -g @angular/cli
```
Bước 2: Tạo project Angular
```
ng new frontend
cd frontend
ng serve
```

Mở http://localhost:4200
 để xem Angular chạy.

3. Gọi API từ Angular
Bước 1: Tạo service gọi API
```
ng generate service services/api
```

File src/app/services/api.service.ts:
```
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5000/api'; // backend

  constructor(private http: HttpClient) {}

  getHello(): Observable<any> {
    return this.http.get(`${this.baseUrl}/hello`);
  }
}
```

Bước 2: Import HttpClientModule

Trong src/app/app.module.ts:
```
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [...],
  imports: [
    ...,
    HttpClientModule
  ],
  bootstrap: [...]
})
export class AppModule { }

Bước 3: Gọi API trong AppComponent

File src/app/app.component.ts:

import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  template: `
    <h1>{{ message }}</h1>
  `
})
export class AppComponent implements OnInit {
  message: string = 'Loading...';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getHello().subscribe((res) => {
      this.message = res.message;
    });
  }
}
```

✅ Kết quả Day 1:

Backend: API chạy ở http://localhost:5000/api/hello.

Frontend: Angular hiển thị "Hello from Node.js API 🚀" khi load trang.