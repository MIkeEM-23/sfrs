const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  schoolId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  fullName: { type: String, required: true, trim: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  password: { type: String, required: true }, // always a bcrypt hash
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  createdAt: { type: Date, default: Date.now },
});

// Never send the password hash in API responses.
userSchema.set('toJSON', {
  transform: (doc, ret) => { delete ret.password; delete ret.__v; return ret; },
});

module.exports = mongoose.model('User', userSchema);
