import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { fmtDate, fmtDateTime, fmtTime } from '../utils/format';

const TABS = ['All', 'Upcoming', 'Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed'];

export default function MyReservations() {
  const [list, setList] = useState([]);
  const [tab, setTab] = useState('All');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [toCancel, setToCancel] = useState(null); // reservation waiting for confirmation

  const load = () =>
    api.get('/reservations/my').then((res) => setList(res.data.reservations)).catch((e) => setError(errorMessage(e)));
  useEffect(() => { load(); }, []);

  const shown = list.filter((r) => {
    if (tab === 'All') return true;
    if (tab === 'Upcoming') return ['Pending', 'Approved'].includes(r.displayStatus);
    return r.displayStatus === tab;
  });

  const confirmCancel = async () => {
    try {
      const res = await api.delete(`/reservations/${toCancel._id}`);
      setMessage(res.data.message);
      load();
    } catch (e) {
      setError(errorMessage(e));
    }
    setToCancel(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-blue-950">My Reservations</h1>
        <p className="text-slate-500">Track the status of your requests.</p>
      </div>
      {message && <p className="rounded-lg bg-green-50 border border-green-200 text-green-700 p-3 text-sm">{message}</p>}
      {error && <p className="rounded-lg bg-red-50 border border-red-200 text-red-700 p-3 text-sm">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1 text-sm ${tab === t ? 'bg-blue-900 text-white' : 'bg-white border hover:bg-slate-50'}`}>{t}</button>
        ))}
      </div>

      {shown.length === 0 && (
        <div className="card text-center text-slate-500">
          No reservations here yet. <Link to="/availability" className="text-blue-700 font-semibold">Check availability</Link>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {shown.map((r) => (
          <div key={r._id} className="card space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold">{r.facility}</h3>
              <StatusBadge status={r.displayStatus} />
            </div>
            <p className="text-sm">{fmtDate(r.date)} · {fmtTime(r.startTime)} - {fmtTime(r.endTime)}</p>
            <p className="text-sm text-slate-600">{r.purpose} · {r.participants} participants</p>
            <p className="text-xs text-slate-400">Submitted {fmtDateTime(r.createdAt)}</p>
            {r.displayStatus === 'Pending' && (
              <button className="btn-outline !text-red-600 !border-red-200" onClick={() => setToCancel(r)}>Cancel Reservation</button>
            )}
          </div>
        ))}
      </div>

      {toCancel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h2 className="font-bold text-lg">Cancel reservation?</h2>
            <p className="text-sm text-slate-600">Are you sure you want to cancel this reservation?<br /><b>{toCancel.facility}</b> on {fmtDate(toCancel.date)}</p>
            <div className="flex gap-2 justify-end">
              <button className="btn-outline" onClick={() => setToCancel(null)}>Keep Reservation</button>
              <button className="btn-danger" onClick={confirmCancel}>Cancel Reservation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
