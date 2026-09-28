const mongoose = require('mongoose');
const { createApp } = require('./app');

const port = process.env.PORT || 3002;
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/catalog_service';

mongoose
  .connect(mongoUrl)
  .then(() => createApp().listen(port, () => console.log('catalog-service escuchando en ' + port)))
  .catch((err) => {
    console.error('Error conectando a MongoDB', err);
    process.exit(1);
  });
