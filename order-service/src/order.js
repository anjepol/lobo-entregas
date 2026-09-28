const mongoose = require('mongoose');

const STATUSES = ['creado', 'preparando', 'en_camino', 'entregado', 'cancelado'];

const orderSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true },
    restaurantId: { type: String, required: true },
    items: [{ name: String, price: Number, qty: { type: Number, min: 1 } }],
    total: Number,
    status: { type: String, enum: STATUSES, default: 'creado' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
module.exports.STATUSES = STATUSES;
