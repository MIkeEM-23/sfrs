import { useEffect, useState } from 'react';
import api, { errorMessage } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { fmtDate, fmtTime } from '../utils/format';

const FACILITIES = ['Gymnasium', 'Auditorium', 'Chapel', 'Outdoor Court'];
const STATUSES = ['Pending', 'Approved', 'Rejected', 'Cancelled'];

export default function AdminDashboard() {
  const [data, setData] = useState({ stats: {}, reservations: [] });
  const [filters, setFilters] = useState({ facility: '', status: '', date: '', q: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = () =>
    api.get('/admin/reservations', { params: filters })
      .then((res) => setData(res.data))
      .catch((e) => setError(errorMessage(e)));
  useEffect(() => { load(); }, [filters]);

  const setFilter = (field) => (e) => setFilters({ ...filters, [field]: e.target.value });

  const act = async (id, action) => {
    setError(''); setMessage('');
    try {
      const res = await api.put(`/admin/reservations/${id}/${action}`);
      setMessage(res.data.message);
      load();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const { stats } = data;
  const cards = [
    ['Total Reservations', stats.total, 'text-blue-900'],
    ['Pending', stats.pending, 'text-amber-600'],
    ['Approved', stats.approved, 'text-green-600'],
    ['Rejected', stats.rejected, 'text-red-600'],
    ['Facilities', stats.facilities, 'text-slate-700'],
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-950">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map(([label, value, color]) => (
          <div key={label} className="card text-center !p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value ?? '-'}</p>
          </div>
        ))}
      </div>

      <div className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select className="input" value={filters.facility} onChange={setFilter('facility')}>
          <option value="">All facilities</option>{FACILITIES.map((f) => <option key={f}>{f}</option>)}
        </select>
        <select className="input" value={filters.status} onChange={setFilter('status')}>
          <option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <input className="input" type="date" value={filters.date} onChange={setFilter('date')} />
        <input className="input" placeholder="Search School ID or name" value={filters.q} onChange={setFilter('q')} />
      </div>

      {message && <p className="rounded-lg bg-green-50 border border-green-200 text-green-700 p-3 text-sm">{message}</p>}
      {error && <p className="rounded-lg bg-red-50 border border-red-200 text-red-700 p-3 text-sm">{error}</p>}

      <div className="card !p-0 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500">
            <tr>{['School ID', 'Student', 'Facility', 'Date', 'Time', 'Purpose', 'People', 'Status', 'Actions'].map((h) => <th key={h} className="px-3 py-3 font-medium whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {data.reservations.map((r) => (
              <tr key={r._id}>
                <td className="px-3 py-3">{r.schoolId}</td>
                <td className="px-3 py-3">{r.fullName}</td>
                <td className="px-3 py-3">{r.facility}</td>
                <td className="px-3 py-3 whitespace-nowrap">{fmtDate(r.date)}</td>
                <td className="px-3 py-3 whitespace-nowrap">{fmtTime(r.startTime)} - {fmtTime(r.endTime)}</td>
                <td className="px-3 py-3 max-w-[200px]">{r.purpose}</td>
                <td className="px-3 py-3">{r.participants}</td>
                <td className="px-3 py-3"><StatusBadge status={r.displayStatus} /></td>
                <td className="px-3 py-3 whitespace-nowrap space-x-1">
                  {r.status === 'Pending' && <button className="btn-success !px-2 !py-1" onClick={() => act(r._id, 'approve')}>Approve</button>}
                  {r.status === 'Pending' && <button className="btn-danger !px-2 !py-1" onClick={() => act(r._id, 'reject')}>Reject</button>}
                  {['Pending', 'Approved'].includes(r.status) && <button className="btn-outline !px-2 !py-1" onClick={() => act(r._id, 'cancel')}>Cancel</button>}
                </td>
              </tr>
            ))}
            {data.reservations.length === 0 && <tr><td colSpan="9" className="px-3 py-8 text-center text-slate-500">No reservations found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
