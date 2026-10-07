const Reservation = require('../models/Reservation');
const { toMin, fromMin } = require('./dates');

// Reservations in these statuses block the time slot.
const BLOCKING = ['Pending', 'Approved'];

/*
  How availability works:
  1. Split the facility's operating hours into 1-hour slots.
  2. A slot is "Reserved" if any Pending/Approved reservation overlaps it.
  3. 0 reserved slots  -> Available
     some reserved     -> Partially Booked
     all reserved      -> Fully Booked
*/
async function getAvailability(facility, date) {
  const reservations = await Reservation.find({
    facility: facility.name, date, status: { $in: BLOCKING },
  });

  const slots = [];
  for (let t = toMin(facility.openTime); t + 60 <= toMin(facility.closeTime); t += 60) {
    const reserved = reservations.some((r) => toMin(r.startTime) < t + 60 && toMin(r.endTime) > t);
    slots.push({ start: fromMin(t), end: fromMin(t + 60), status: reserved ? 'Reserved' : 'Available' });
  }

  const reservedCount = slots.filter((s) => s.status === 'Reserved').length;
  let status = 'Partially Booked';
  if (reservedCount === 0) status = 'Available';
  else if (reservedCount === slots.length) status = 'Fully Booked';

  return { facility: facility.name, date, status, slots };
}

module.exports = { getAvailability, BLOCKING };
