const express = require('express');
const Room = require('../models/Room.models');


const router = express.Router();

// Lấy danh sách phòng
router.get("/", async (req, res) => {
    const room = await Room.find();
    res.json(room);
}
);

// Thêm phòng mới
router.post("/", async (req, res) => {
    try {
        // console.log(req.body); // Thêm dòng này để kiểm tra dữ liệu
        const room = new Room(req.body);
        await room.save();
        res.json(room);
    }
    catch (err) {
        res.status(400).json({error: err.message});
    }
});
// Cập nhật phòng
router.put("/:id", async (req, res) => {
    try{
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true});
        res.json(room);
    }
    catch (err){
        res.status(400).json({error: err.message});
    }
}
);

// Xóa phòng
router.delete("/:id", async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        res.json({ message: "Room deleted successfully", room });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;

// This code defines routes for managing rooms in an apartment management system.
// It includes endpoints to get all rooms, add a new room, update an existing room, and delete a room.