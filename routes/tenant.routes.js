const express = require('express');
const multer = require('multer');
const path = require('path');
const Tenant = require('../models/Tenant.models'); // Changed from '../models/Tenant' to '../models/Tenant.models'

const router = express.Router();

// Cấu hình Multer để lưu file ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/tenants'); // thư mục lưu ảnh
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // tên file: timestamp + đuôi
  }
});

const upload = multer({ storage });

// 📌 [POST] Thêm khách thuê
router.post('/', upload.single('avatar'), async (req, res) => {
  try {
    const tenant = new Tenant({
      ...req.body,
      avatar: req.file ? `/uploads/tenants/${req.file.filename}` : null
    });
    await tenant.save();
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 [GET] Lấy tất cả khách thuê
router.get('/', async (req, res) => {
  const tenants = await Tenant.find().populate('roomId');
  res.json(tenants);
});

// 📌 [GET] Lấy khách thuê theo ID
router.get('/:id', async (req, res) => {
  const tenant = await Tenant.findById(req.params.id).populate('roomId');
  res.json(tenant);
});

// 📌 [PUT] Cập nhật khách thuê
router.put('/:id', upload.single('avatar'), async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.avatar = `/uploads/tenants/${req.file.filename}`;
  
  const tenant = await Tenant.findByIdAndUpdate(req.params.id, data, { new: true });
  res.json(tenant);
});

// 📌 [DELETE] Xóa khách thuê
router.delete('/:id', async (req, res) => {
  await Tenant.findByIdAndDelete(req.params.id);
  res.json({ message: 'Tenant deleted' });
});

module.exports = router;
