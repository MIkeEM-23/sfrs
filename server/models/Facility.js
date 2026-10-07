const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  capacity: Number,
  openTime: { type: String, required: true },  // "08:00"
  closeTime: { type: String, required: true }, // "17:00"
  minHours: { type: Number, default: 1 },
  maxHours: { type: Number, default: 4 },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
});

module.exports = mongoose.model('Facility', facilitySchema);
