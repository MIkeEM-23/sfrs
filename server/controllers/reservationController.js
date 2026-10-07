const Reservation = require('../models/Reservation');
const asyncHandler = require('../utils/asyncHandler');
const { checkBooking, withStatus } = require('../utils/booking');

exports.create = asyncHandler(async (req, res) => {
  const { error } = await checkBooking(req.body);
  if (error) return res.status(400).json({ message: error });

  const { facility, date, startTime, endTime, purpose, participants } = req.body;
  const reservation = await Reservation.create({
    userId: req.user._id,
    schoolId: req.user.schoolId,   // taken from the account, not from the form
    fullName: req.user.fullName,
    facility, date, startTime, endTime, purpose: purpose.trim(), participants: Number(participants),
    status: 'Pending',
  });
  res.status(201).json({
    message: 'Your reservation has been submitted and is waiting for approval.',
    reservation: withStatus(reservation),
  });
});

exports.mine = asyncHandler(async (req, res) => {
  const list = await Reservation.find({ userId: req.user._id }).sort({ date: -1, startTime: -1 });
  res.json({ reservations: list.map(withStatus) });
});

// Loads a reservation and checks that the logged-in user may access it.
async function loadOwned(req, res) {
  const r = await Reservation.findById(req.params.id).catch(() => null);
  if (!r) { res.status(404).json({ message: 'Reservation not found.' }); return null; }
  if (String(r.userId) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403).json({ message: 'You cannot access this reservation.' }); return null;
  }
  return r;
}

exports.getOne = asyncHandler(async (req, res) => {
  const r = await loadOwned(req, res);
  if (r) res.json({ reservation: withStatus(r) });
});

// Edit a reservation (only while Pending)
exports.update = asyncHandler(async (req, res) => {
  const r = await loadOwned(req, res);
  if (!r) return;
  if (r.status !== 'Pending') return res.status(400).json({ message: 'Only pending reservations can be edited.' });

  const data = { ...r.toObject(), ...req.body, facility: r.facility };
  const { error } = await checkBooking(data, r._id);
  if (error) return res.status(400).json({ message: error });

  ['date', 'startTime', 'endTime', 'purpose', 'participants'].forEach((k) => { if (req.body[k] !== undefined) r[k] = req.body[k]; });
  await r.save();
  res.json({ message: 'Reservation updated.', reservation: withStatus(r) });
});

// Students cancel their own pending reservation
exports.cancel = asyncHandler(async (req, res) => {
  const r = await loadOwned(req, res);
  if (!r) return;
  if (r.status !== 'Pending') return res.status(400).json({ message: 'Only pending reservations can be cancelled.' });
  r.status = 'Cancelled';
  await r.save();
  res.json({ message: 'Reservation cancelled.', reservation: withStatus(r) });
});
