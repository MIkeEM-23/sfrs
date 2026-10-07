const Reservation = require('../models/Reservation');
const Facility = require('../models/Facility');
const asyncHandler = require('../utils/asyncHandler');
const { withStatus } = require('../utils/booking');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.list = asyncHandler(async (req, res) => {
  const { facility, status, date, q } = req.query;
  const filter = {};
  if (facility) filter.facility = facility;
  if (status) filter.status = status;
  if (date) filter.date = date;
  if (q) {
    const rx = new RegExp(escapeRegex(q.trim()), 'i');
    filter.$or = [{ schoolId: rx }, { fullName: rx }];
  }

  const [list, total, pending, approved, rejected, facilities] = await Promise.all([
    Reservation.find(filter).sort({ date: -1, startTime: -1 }),
    Reservation.countDocuments(),
    Reservation.countDocuments({ status: 'Pending' }),
    Reservation.countDocuments({ status: 'Approved' }),
    Reservation.countDocuments({ status: 'Rejected' }),
    Facility.countDocuments(),
  ]);
  res.json({ stats: { total, pending, approved, rejected, facilities }, reservations: list.map(withStatus) });
});

// Returns a handler that moves a reservation to `newStatus` if its current status allows it.
const changeStatus = (newStatus, allowedFrom) =>
  asyncHandler(async (req, res) => {
    const r = await Reservation.findById(req.params.id).catch(() => null);
    if (!r) return res.status(404).json({ message: 'Reservation not found.' });
    if (!allowedFrom.includes(r.status)) {
      return res.status(400).json({ message: `A ${r.status.toLowerCase()} reservation cannot be changed this way.` });
    }
    r.status = newStatus;
    if (newStatus === 'Approved') { r.approvedBy = req.user._id; r.approvedAt = new Date(); }
    await r.save();
    res.json({ message: `Reservation ${newStatus.toLowerCase()}.`, reservation: withStatus(r) });
  });

exports.approve = changeStatus('Approved', ['Pending']);
exports.reject = changeStatus('Rejected', ['Pending']);
exports.cancel = changeStatus('Cancelled', ['Pending', 'Approved']);
