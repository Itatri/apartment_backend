const express = require('express');
const multer = require('multer');
const path = require('path');
const Tenant = require('../models/tenant.models');


const router = express.Router();

// Cấu hình nơi lưu trữ ảnh đại diện
const storage = multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, 'uploads/tenants');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Thêm thời gian để tránh trùng tên file
    }
});
const upload = multer({ storage });

// Lấy danh sách tenants
router.get("/", async(req, res) => {
    const tenants = await Tenant.find().populate('roomId');
    res.json(tenants);
});

// Thêm tenant mới
router.post( "/", upload.single("avatar"), async (req, res) => {
    const { name, phone, email, roomId } = req.body;
    const avatar = req.file ? "/uploads/tenants/" + req.file.filename : null;

    const tenant = new Tenant({ name, phone, email, roomId, avatar });
    await tenant.save();
    res.json(tenant);
});

// Cập nhật tenant
router.put("/:id", upload.single("avatar"), async (req, res) => {
    const {name, phone, email, roomId } = req.body;
    const updateData = { name, phone, email, roomId };

    if (req.file) {
        updateData.avatar = "/uploads/tenants/" + req.file.filename;
    }

    const tenant = await Tenant.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(tenant);
});

// Xóa tenant
router.delete("/:id", async (req, res) => {
    await Tenant.findByIdAndDelete(req.params.id);
    res.json({ message: "Tenant deleted successfully" });
});

module.exports = router;
// This code defines routes for managing tenants in an apartment management system.