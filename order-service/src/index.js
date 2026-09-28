const mongoose = require('mongoose');
const { createApp } = require('./app');

const port = process.env.PORT || 3003;
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/order_service';

mongoose
  .connect(mongoUrl)
  .then(() => createApp().listen(port, () => console.log('order-service escuchando en ' + port)))
  .catch((err) => {
    console.error('Error conectando a MongoDB', err);
    process.exit(1);
  });
