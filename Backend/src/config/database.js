// config/database.js
const mongoose = require('mongoose');

const dbURL = process.env.MONGODB_URL;

module.exports.connect = () => {
  mongoose.connect(dbURL);

  mongoose.connection.on('connected', () => {
    console.log('✅ Mongoose default connection is open to ' + dbURL);
  });

  mongoose.connection.on('error', (err) => {
    console.log('⚠️ Mongoose default connection has occurred ' + err + ' error');
  });

  mongoose.connection.on('disconnected', () => {
    console.log('🔴 Mongoose default connection is disconnected');
  });
};