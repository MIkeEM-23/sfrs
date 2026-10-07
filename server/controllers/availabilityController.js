const Facility = require('../models/Facility');
const asyncHandler = require('../utils/asyncHandler');
const { getAvailability } = require('../utils/availability');
const { todayStr } = require('../utils/dates');

// Slots contain NO personal information: only time + Reserved/Available.
exports.one = asyncHandler(async (req, res) => {
  const { facility, date } = req.query;
  if (!date) return res.status(400).json({ message: 'Please select a date.' });
  const f = await Facility.findOne({ name: facility });
  if (!f) return res.status(404).json({ message: 'Facility not found.' });
  res.json(await getAvailability(f, date));
});

// Summary of all facilities for one date (dashboard + calendar)
exports.all = asyncHandler(async (req, res) => {
  const date = req.query.date || todayStr();
  const facilities = await Facility.find().sort({ _id: 1 });
  const result = [];
  for (const f of facilities) {
    const a = await getAvailability(f, date);
    result.push({
      name: f.name, description: f.description, capacity: f.capacity,
      openTime: f.openTime, closeTime: f.closeTime, minHours: f.minHours, maxHours: f.maxHours,
      availability: a.status,
    });
  }
  res.json({ date, facilities: result });
});
