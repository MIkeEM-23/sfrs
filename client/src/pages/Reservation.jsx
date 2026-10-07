import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import api, { errorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { fmtDate, fmtTime, todayStr } from '../utils/format';

export default function Reservation() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [facilities, setFacilities] = useState([]);
  const [form, setForm] = useState({
    facility: params.get('facility') || 'Gymnasium',
    date: params.get('date') || '',
    startTime: params.get('start') || '',
    endTime: params.get('end') || '',
    purpose: '',
    participants: '',
  });
  const [availability, setAvailability] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null); // the saved reservation (confirmation screen)

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const chosen = facilities.find((f) => f.name === form.facility);

  useEffect(() => {
    api.get('/availability/all').then((res) => setFacilities(res.data.facilities)).catch(() => {});
  }, []);

  // Show the reserved/available slots for the chosen facility and date.
  useEffect(() => {
    setAvailability(null);
    if (!form.date) return;
    api.get('/availability', { params: { facility: form.facility, date: form.date } })
      .then((res) => setAvailability(res.data)).catch(() => {});
  }, [form.facility, form.date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.date) return setError('Please select a date.');
    if (!form.startTime || !form.endTime) return setError('Please select a start and end time.');
    if (form.endTime <= form.startTime) return setError('End time must be later than start time.');
    setLoading(true);
    try {
      const res = await api.post('/reservations', form); // backend does the real validation
      setDone(res.data.reservation);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="card max-w-lg mx-auto text-center space-y-3">
        <CheckCircle2 size={48} className="mx-auto text-green-600" />
        <h1 className="text-xl font-bold">Reservation Submitted!</h1>
        <p className="text-sm text-slate-500">Your reservation has been submitted and is waiting for approval.</p>
        <div className="text-left bg-slate-50 rounded-lg p-4 text-sm space-y-1">
          <p><b>Facility:</b> {done.facility}</p>
          <p><b>Date:</b> {fmtDate(done.date)}</p>
          <p><b>Time:</b> {fmtTime(done.startTime)} - {fmtTime(done.endTime)}</p>
          <p><b>Status:</b> <StatusBadge status={done.status} /></p>
        </div>
        <Link to="/my-reservations" className="btn-primary">View My Reservations</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 max-w-5xl">
      <div className="card">
        <h1 className="text-xl font-bold text-blue-950 mb-4">Reserve a Facility</h1>
        {error && <p className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Facility</label>
            <select className="input" value={form.facility} onChange={set('facility')}>
              {facilities.map((f) => <option key={f.name}>{f.name}</option>)}
              {facilities.length === 0 && <option>{form.facility}</option>}
            </select>
            {chosen && <p className="text-xs text-slate-500 mt-1">Open {fmtTime(chosen.openTime)} - {fmtTime(chosen.closeTime)} · {chosen.minHours} to {chosen.maxHours} hours per reservation</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">School ID</label><input className="input" value={user.schoolId} readOnly /></div>
            <div><label className="label">Full Name</label><input className="input" value={user.fullName} readOnly /></div>
          </div>
          <div><label className="label">Date</label><input className="input" type="date" min={todayStr()} value={form.date} onChange={set('date')} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Start Time</label><input className="input" type="time" value={form.startTime} onChange={set('startTime')} /></div>
            <div><label className="label">End Time</label><input className="input" type="time" value={form.endTime} onChange={set('endTime')} /></div>
          </div>
          <div><label className="label">Purpose</label><textarea className="input" rows="3" placeholder="Basketball practice for PE class" value={form.purpose} onChange={set('purpose')} /></div>
          <div><label className="label">Number of Participants</label><input className="input" type="number" min="1" value={form.participants} onChange={set('participants')} /></div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading && <Loader2 size={16} className="animate-spin" />} Submit Reservation
          </button>
        </form>
      </div>

      <div className="card self-start">
        <h2 className="font-semibold mb-3">Availability for this date</h2>
        {!availability && <p className="text-sm text-slate-500">Select a date to see which times are taken.</p>}
        {availability && (
          <>
            <div className="mb-3"><StatusBadge status={availability.status} /></div>
            <ul className="divide-y text-sm">
              {availability.slots.map((s) => (
                <li key={s.start} className="flex justify-between py-2">
                  <span>{fmtTime(s.start)} - {fmtTime(s.end)}</span>
                  <span className={s.status === 'Reserved' ? 'text-red-600 font-semibold' : 'text-green-700'}>{s.status === 'Reserved' ? 'Reserved' : '✓ Available'}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
