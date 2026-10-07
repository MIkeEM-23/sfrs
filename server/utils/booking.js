const Facility = require('../models/Facility');
const Reservation = require('../models/Reservation');
const { getAvailability, BLOCKING } = require('./availability');
const { todayStr, nowMinutes, toMin } = require('./dates');

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

// Checks all booking rules on the SERVER. Returns { error } or { facility }.
async function checkBooking(data, excludeId) {
  const { facility, date, startTime, endTime, purpose, participants } = data;

  if (!facility) return { error: 'Please select a facility.' };
  const f = await Facility.findOne({ name: facility });
  if (!f) return { error: 'Facility not found.' };
  if (f.status !== 'Open') return { error: 'This facility is currently closed.' };

  if (!date || !DATE.test(date)) return { error: 'Please select a date.' };
  if (date < todayStr()) return { error: 'You cannot reserve a date in the past.' };
  if (!TIME.test(startTime || '') || !TIME.test(endTime || '')) return { error: 'Please select a start and end time.' };
  if (toMin(endTime) <= toMin(startTime)) return { error: 'End time must be later than start time.' };
  if (date === todayStr() && toMin(startTime) <= nowMinutes()) return { error: 'The start time has already passed.' };

  if (toMin(startTime) < toMin(f.openTime) || toMin(endTime) > toMin(f.closeTime)) {
    return { error: `${f.name} can only be reserved between ${f.openTime} and ${f.closeTime}.` };
  }
  const hours = (toMin(endTime) - toMin(startTime)) / 60;
  if (hours < f.minHours || hours > f.maxHours) {
    return { error: `Reservations must be between ${f.minHours} and ${f.maxHours} hours long.` };
  }

  if (!purpose || !purpose.trim()) return { error: 'Please enter the purpose of the reservation.' };
  const n = Number(participants);
  if (!Number.isInteger(n) || n < 1) return { error: 'Please enter the number of participants.' };
  if (n > f.capacity) return { error: `This facility has a maximum capacity of ${f.capacity}.` };

  const availability = await getAvailability(f, date);
  if (availability.status === 'Fully Booked') return { error: 'This facility is fully booked for this date.' };

  // Overlap rule: existing.start < new.end AND existing.end > new.start
  const filter = {
    facility: f.name, date, status: { $in: BLOCKING },
    startTime: { $lt: endTime }, endTime: { $gt: startTime },
  };
  if (excludeId) filter._id = { $ne: excludeId };
  if (await Reservation.findOne(filter)) return { error: 'This facility is already reserved during this time.' };

  return { facility: f };
}

// Adds "displayStatus": approved reservations whose end time has passed become "Completed".
function withStatus(reservation) {
  const r = reservation.toObject ? reservation.toObject() : reservation;
  const ended = new Date(`${r.date}T${r.endTime}:00`) < new Date();
  r.displayStatus = r.status === 'Approved' && ended ? 'Completed' : r.status;
  return r;
}

module.exports = { checkBooking, withStatus };
