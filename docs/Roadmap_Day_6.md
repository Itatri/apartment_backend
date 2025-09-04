🗓 Day 6 – Xuất PDF + QR Code Thanh toán
1. Backend (Node.js + Express)
📌 1.1. Cài thêm thư viện
npm install pdfkit qrcode

📌 1.2. API Xuất PDF

📂 routes/invoice.routes.js (thêm code dưới)

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import Invoice from '../models/invoice.js';

// [GET] Xuất PDF
router.get('/:id/pdf', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('roomId')
      .populate('tenantId');

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const doc = new PDFDocument();
    const filePath = path.join('uploads/invoices', `${invoice._id}.pdf`);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Tiêu đề
    doc.fontSize(20).text('HÓA ĐƠN THANH TOÁN', { align: 'center' });
    doc.moveDown();

    // Thông tin khách thuê
    doc.fontSize(12).text(`Khách thuê: ${invoice.tenantId.name}`);
    doc.text(`Phòng: ${invoice.roomId.name}`);
    doc.text(`SĐT: ${invoice.tenantId.phone}`);
    doc.text(`Thời gian: ${invoice.startDate.toDateString()} - ${invoice.endDate.toDateString()}`);
    doc.moveDown();

    // Bảng dịch vụ
    doc.text('Dịch vụ:');
    invoice.services.forEach(s => {
      doc.text(`- ${s.name}: ${s.quantity} x ${s.price} = ${s.quantity * s.price} VND`);
    });

    doc.moveDown();
    doc.fontSize(14).text(`Tổng tiền: ${invoice.totalAmount} VND`, { align: 'right' });

    doc.end();

    stream.on('finish', () => {
      res.download(filePath);
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

📌 1.3. API QR Code Thanh toán
// [GET] Tạo QR Code thanh toán
router.get('/:id/qrcode', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('tenantId').populate('roomId');
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    // Mô phỏng link thanh toán bank (có thể thay bằng API Momo/ZaloPay)
    const payUrl = `https://qr.sepay.vn/img?bank=MBBank&acc=0328310667&template=compact&amount=${invoice.totalAmount}&des=TienTro_${invoice.roomId.name}_${invoice._id}`;

    // Trả về QR code (base64)
    const qrDataUrl = await QRCode.toDataURL(payUrl);
    res.json({ qr: qrDataUrl, payUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

2. Frontend (Angular)
📌 2.1. Cập nhật Service

src/app/services/invoice.service.ts

getInvoicePdf(id: string) {
  return this.http.get(`${this.baseUrl}/${id}/pdf`, { responseType: 'blob' });
}

getInvoiceQr(id: string) {
  return this.http.get<any>(`${this.baseUrl}/${id}/qrcode`);
}

📌 2.2. Cập nhật Component hiển thị hóa đơn

src/app/components/invoice-list/invoice-list.component.ts

import { DomSanitizer } from '@angular/platform-browser';

export class InvoiceListComponent implements OnInit {
  invoices: any[] = [];
  qrCode: any = null;

  constructor(private invoiceService: InvoiceService, private sanitizer: DomSanitizer) {}

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

  exportPdf(id: string) {
    this.invoiceService.getInvoicePdf(id).subscribe((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'invoice.pdf';
      a.click();
    });
  }

  showQr(id: string) {
    this.invoiceService.getInvoiceQr(id).subscribe(data => {
      this.qrCode = this.sanitizer.bypassSecurityTrustUrl(data.qr);
    });
  }
}

📌 2.3. Template HTML

src/app/components/invoice-list/invoice-list.component.html

<h2>Danh sách hóa đơn</h2>
<table border="1" cellpadding="5">
  <tr>
    <th>Phòng</th>
    <th>Khách thuê</th>
    <th>Tổng tiền</th>
    <th>Trạng thái</th>
    <th>Hành động</th>
  </tr>
  <tr *ngFor="let invoice of invoices">
    <td>{{ invoice.roomId?.name }}</td>
    <td>{{ invoice.tenantId?.name }}</td>
    <td>{{ invoice.totalAmount | currency:'VND' }}</td>
    <td>{{ invoice.status }}</td>
    <td>
      <button (click)="deleteInvoice(invoice._id)">Xóa</button>
      <button (click)="exportPdf(invoice._id)">Xuất PDF</button>
      <button (click)="showQr(invoice._id)">QR Thanh toán</button>
    </td>
  </tr>
</table>

<div *ngIf="qrCode">
  <h3>QR Code Thanh toán</h3>
  <img [src]="qrCode" width="200">
</div>

3. Kết quả đạt được

✅ Xuất hóa đơn ra PDF với đầy đủ thông tin.

✅ Tạo QR Code thanh toán ngân hàng/Momo từ API.

✅ Angular hiển thị danh sách hóa đơn + nút xuất PDF + hiển thị QR Code.