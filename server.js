const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cors = require('cors');
const analytics = require('./routes/analytics');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');


const app = express();
dotenv.config();
const allowedOrigins = [
  'http://localhost:5173',
  'https://restaurantmongo.netlify.app'
];
// app.use(cors({ origin: allowedOrigins,credentials: true,}));
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());  // Allow JSON body parsing
app.use('/api', menuRoutes); // menu route added
app.use('/api/menu', menuRoutes); 
app.use('/api', orderRoutes); // order route added
app.use('/api/analytics', analytics);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
// console.log('Mongo URI:', process.env.MONGO_URI);
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    const port = process.env.PORT || 3000;
    console.log('✅ MongoDB connected');
    app.listen(port, () => console.log(`🚀 Server running on ${port}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('📴 MongoDB connection closed');
  process.exit(0);
});

//mongoose.connection.close();