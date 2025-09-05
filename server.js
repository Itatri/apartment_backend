const express = require('express');
const cors = require('cors');
const path = require('path');
const router = require('./routes/auth.routes');
const mongoose = require('mongoose');
require('dotenv').config();


const app = express();
app.use(cors());
app.use(express.json());

// Cho phép truy cập thư mục uploads qua URL
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/apartment_management");

// Import routes
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

const roomRoutes = require('./routes/room.routes');
app.use('/api/rooms', roomRoutes);

const tenantRoutes = require('./routes/tenant.routes');
app.use('/api/tenants', tenantRoutes);

const invoiceRoutes = require('./routes/invoice.routes');
app.use('/api/invoices', invoiceRoutes); 

const dashboardRoutes = require('./routes/dashboard.routes');
app.use('/api/dashboard', dashboardRoutes);


// Routes test 
app.get('/api/hello', (req, res) => {
  res.json({ message: 'API Apartment Management is working!' });
});

// Run server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});