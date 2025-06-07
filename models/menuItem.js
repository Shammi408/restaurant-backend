const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Item name is required.'] },
  category: { type: String, required: [true, 'Category is required.'] },
  price: {
    type: Number,
    required: [true, 'Price is required.'],
    min: [0, 'Price must be a positive number.']
  },
  ingredients: [String],
  tags: [String], // e.g., ['vegan', 'spicy']
  available: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true},
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',  // Make sure this is correct
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', MenuItemSchema);
