const Invoice = require("../models/Invoice.models.js");
const Room = require("../models/Room.models");
const Tenant = require("../models/Tenant.models");
const express = require('express');

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
}
);

// Update 
router.put('/:id', async(req, res) => {
    try {
        const { roomId, tenantId, startDate, endDate, services, status} = req.body;

        const room = Room.findById(roomId);
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
router.delete('/:id', async (req, res) => {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({message: 'Invoice deleted'});
})

module.exports = router;