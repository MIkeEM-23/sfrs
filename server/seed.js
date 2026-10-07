// Run with: npm run seed   (WARNING: clears users, facilities and reservations)
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Facility = require('./models/Facility');
const Reservation = require('./models/Reservation');
const { addDays } = require('./utils/dates');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all([User.deleteMany(), Facility.deleteMany(), Reservation.deleteMany()]);

  await Facility.insertMany([
    { name: 'Gymnasium', description: 'Indoor court for basketball, volleyball and PE classes.', capacity: 500, openTime: '08:00', closeTime: '17:00' },
    { name: 'Auditorium', description: 'Air-conditioned hall for programs, seminars and performances.', capacity: 800, openTime: '08:00', closeTime: '20:00' },
    { name: 'Chapel', description: 'Quiet space for masses, recollections and prayer gatherings.', capacity: 300, openTime: '07:00', closeTime: '19:00' },
    { name: 'Outdoor Court', description: 'Open-air court for sports practice and school events.', capacity: 200, openTime: '06:00', closeTime: '18:00' },
  ]);

  const hash = (p) => bcrypt.hash(p, 10);
  const admin = await User.create({ schoolId: 'ADMIN001', fullName: 'System Administrator', email: 'admin@school.edu', password: await hash('Admin123!'), role: 'admin' });
  const juan = await User.create({ schoolId: 'STU001', fullName: 'Juan Dela Cruz', email: 'juan@school.edu', password: await hash('Student123!'), role: 'student' });
  const maria = await User.create({ schoolId: 'STU002', fullName: 'Maria Santos', email: 'maria@school.edu', password: await hash('Student123!'), role: 'student' });

  const mk = (u, facility, date, startTime, endTime, purpose, participants, status = 'Approved') => ({
    userId: u._id, schoolId: u.schoolId, fullName: u.fullName,
    facility, date, startTime, endTime, purpose, participants, status,
    ...(status === 'Approved' ? { approvedBy: admin._id, approvedAt: new Date() } : {}),
  });
  const today = addDays(0), tomorrow = addDays(1);

  await Reservation.insertMany([
    // TODAY: Gymnasium Available, Auditorium Partially Booked, Chapel Fully Booked, Outdoor Court Available
    mk(maria, 'Auditorium', today, '08:00', '10:00', 'Student council assembly', 150),
    mk(juan, 'Auditorium', today, '13:00', '15:00', 'Music club rehearsal', 40, 'Pending'),
    mk(maria, 'Chapel', today, '07:00', '11:00', 'Morning recollection', 100),
    mk(maria, 'Chapel', today, '11:00', '15:00', 'Choir practice', 30),
    mk(juan, 'Chapel', today, '15:00', '19:00', 'Evening prayer meeting', 60, 'Pending'),
    // TOMORROW: Gymnasium partially booked
    mk(maria, 'Gymnasium', tomorrow, '10:00', '12:00', 'Volleyball tryouts', 40),
    mk(juan, 'Gymnasium', tomorrow, '13:00', '15:00', 'Basketball practice for PE class', 20, 'Pending'),
    // Sample history for Juan (Completed, Rejected, Cancelled)
    mk(juan, 'Gymnasium', addDays(-3), '14:00', '16:00', 'Intramurals practice', 25),
    mk(juan, 'Outdoor Court', addDays(2), '09:00', '11:00', 'Badminton club', 16, 'Rejected'),
    mk(juan, 'Auditorium', addDays(3), '09:00', '11:00', 'Film showing', 80, 'Cancelled'),
  ]);

  console.log('Seed complete.\nAdmin: ADMIN001 / Admin123!\nStudent: STU001 / Student123!');
  await mongoose.disconnect();
}
seed().catch((e) => { console.error(e); process.exit(1); });
