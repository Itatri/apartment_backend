const express = require('express');
const Invoice = require('../models/Invoice.models');
const Room = require('../models/Room.models');
const Tenant = require('../models/Tenant.models');

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

module.exports = router;
