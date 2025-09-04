const Invoice = require("../models/Invoice.models.js");
const Room = require("../models/Room.models");
const Tenant = require("../models/Tenant.models");
const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const verifyToken = require('../middleware/auth.js').verifyToken;

const router = express.Router();

// Tinh tien tu dong 
const calculateTotal = ( roomPrice, startDate, endDate, services) => {
    const day = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const roomCost = (roomPrice / 30 ) * day;
    const serviceCost = services.reduce((sum, s) => sum + s.price * s.quantity, 0);

    return roomCost + serviceCost;
};

// Create
router.post('/', async (req, res) => {
    try 
    {
        const { roomId, tenantId, startDate, endDate, services } = req.body;

        const room = await Room.findById(roomId);
        if ( !room) return res.status(404).json({ error: 'Room not found'});

        const tenant = await Tenant.findById(tenantId);
        if ( !tenant) return res.status(404).json({ error: 'Tenant not found'})

        const totalAmount = calculateTotal(room.price, startDate, endDate, services);

        const invoice = new Invoice (
            {
                roomId, 
                tenantId,
                startDate, 
                endDate, 
                roomPrice: room.price,
                services, 
                totalAmount
            }
        );

        await invoice.save();

        res.json(invoice);
    }
    catch (err)
    {
        res.status(500).json({ error : err.message});
    }
});

// Read all 
router.get( '/' , async ( req, res) => {
    const invoices = await Invoice.find().populate('roomId').populate('tenantId');
    res.json(invoices);
});

// Read by Id 
router.get( '/:id', async(req, res) => {
    const invoices = await Invoice.findById(req.params.id).populate('roomId').populate('tenantId');
    res.json(invoices);
}
);

// [GET] Export PDF
router.get('/:id/pdf', async (req, res) => {
    try { 
        const invoice = await Invoice.findById(req.params.id).populate('roomId').populate('tenantId');

        if (!invoice) return res.status(404).json({ error: 'Invoice not found'});

        const doc = new PDFDocument();
        const filePath = path.join('uploads/invoices',`${invoice._id}.pdf`);
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

       // 👉 Load font hỗ trợ tiếng Việt (dùng non-variable font)
        doc.registerFont('Roboto', path.join('fonts', 'Roboto-Regular.ttf'));
        doc.registerFont('Roboto-Bold', path.join('fonts', 'Roboto-Bold.ttf'));

        // Dùng font khi viết text
        doc.font('Roboto-Bold').fontSize(20).text('HÓA ĐƠN THANH TOÁN', { align: 'center' });
        doc.moveDown();

        doc.font('Roboto').fontSize(12).text(`Tên khách thuê : ${invoice.tenantId.name}`);
        doc.text(`Phòng : ${invoice.roomId.name}`);
        doc.text(`Phone : ${invoice.tenantId.phone}`);

        // 👉 In ngày bằng locale tiếng Việt
        doc.text(`Thời gian : ${invoice.startDate.toLocaleDateString('vi-VN')} - ${invoice.endDate.toLocaleDateString('vi-VN')}`);
        doc.moveDown();

        // Dịch vụ
        doc.text(`Dịch vụ :`);
        invoice.services.forEach(s => {
            doc.text(`- ${s.name} : ${s.quantity} x ${s.price.toLocaleString('vi-VN')} = ${(s.quantity * s.price).toLocaleString('vi-VN')} VND`);
        });

        doc.moveDown();
        doc.font('Roboto-Bold').fontSize(14).text(`Tổng tiền : ${invoice.totalAmount.toLocaleString('vi-VN')} VND`, { align: 'right' });


        doc.end();

        stream.on('finish', () => {
            res.download(filePath);
        } );
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
})

// [GET] Generate QR Code Payment
router.get('/:id/qrcode', async (req, res) => {
    try {
         const invoice = await Invoice.findById(req.params.id).populate('roomId').populate('tenantId');

         if (!invoice) return res.status(404).json({ error: 'Invoice not found'});

         // API thanh toán Sepay
         const payUrl = `https://qr.sepay.vn/img?bank=MBBank&acc=0328310667&template=compact&amount=${invoice.totalAmount}&des=TienTro_${invoice.roomId.name}_${invoice._id}`;

         // Tra ve QR code ( base64)
        const qrDataUrl = await QRCode.toDataURL(payUrl);
        res.json({ qrCode: qrDataUrl, payUrl });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Update 
router.put('/:id', async(req, res) => {
    try {
        const { roomId, tenantId, startDate, endDate, services, status} = req.body;

        const room = await Room.findById(roomId);
        if ( !room) return res.status(404).json({ error: 'Room not found'});

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
        }, { new : true });

        res.json(invoice);

    } catch (err ) {
        res.status(500).json({error: err.message});
    }
})

// Delete 
router.delete('/:id', verifyToken(['Admin','Owner']) ,async (req, res) => {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({message: 'Invoice deleted'});
})

module.exports = router;