const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  quantity: { type: Number, required: true, min: 1 },
  customizations: { type: String },  // e.g., "extra cheese"
  notes: { type: String },           // e.g., "no onions"
});

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerContact: { type: String }, // phone or email
  user: { type: mongoose.Schema.Types.ObjectId,ref: 'User',required: true},
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Placed'
  },
  totalAmount: { type: Number, required: true },
  orderTime: { type: Date, default: Date.now },
  deliveryTime: { type: Date },  // optional, when order was delivered
  notes: { type: String },       // any extra instructions
  isActive: { type: Boolean, default: true }  // for soft delete
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
