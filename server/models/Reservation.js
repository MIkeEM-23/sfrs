const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    schoolId: { type: String, required: true },
    fullName: { type: String, required: true },
    facility: { type: String, required: true },
    date: { type: String, required: true },      // "2026-10-15"
    startTime: { type: String, required: true }, // "10:00" (24-hour)
    endTime: { type: String, required: true },   // "12:00"
    purpose: { type: String, required: true, trim: true },
    participants: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'], default: 'Pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
  },
  { timestamps: true } // adds createdAt and updatedAt
);

// Indexes for the fields we search most
reservationSchema.index({ facility: 1, date: 1, status: 1 });
reservationSchema.index({ userId: 1 });
reservationSchema.index({ schoolId: 1 });
reservationSchema.index({ status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
