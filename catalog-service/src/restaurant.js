const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true, min: 0 },
});

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: String,
    ownerId: { type: String, required: true },
    menu: [itemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);
