import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Mic, Church, Trophy, Users, Clock } from 'lucide-react';
import api, { errorMessage } from '../services/api';
import StatusBadge from './StatusBadge';
import { fmtTime, todayStr } from '../utils/format';

const icons = { Gymnasium: Dumbbell, Auditorium: Mic, Chapel: Church, 'Outdoor Court': Trophy };

// Loads today's availability for every facility from the backend and shows one card each.
export default function FacilityGrid() {
  const [facilities, setFacilities] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/availability/all', { params: { date: todayStr() } })
      .then((res) => setFacilities(res.data.facilities))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Loading facilities...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {facilities.map((f) => {
        const Icon = icons[f.name] || Users;
        const full = f.availability === 'Fully Booked';
        return (
          <div key={f.name} className="card flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-xl bg-blue-100 text-blue-800 p-3"><Icon size={24} /></div>
              <h3 className="font-bold text-lg">{f.name}</h3>
            </div>
            <p className="text-sm text-slate-600 flex-1">{f.description}</p>
            <div className="text-xs text-slate-500 mt-3 space-y-1">
              <p className="flex items-center gap-1"><Users size={14} /> Capacity: {f.capacity}</p>
              <p className="flex items-center gap-1"><Clock size={14} /> {fmtTime(f.openTime)} - {fmtTime(f.closeTime)}</p>
            </div>
            <div className="mt-3"><StatusBadge status={f.availability} /> <span className="text-xs text-slate-400">today</span></div>
            <div className="mt-4 flex gap-2">
              <Link to={`/availability?facility=${encodeURIComponent(f.name)}&date=${todayStr()}`} className="btn-outline flex-1 !px-2">View Availability</Link>
              {full
                ? <button className="btn-primary flex-1 !px-2" disabled>Reserve Now</button>
                : <Link to={`/reserve?facility=${encodeURIComponent(f.name)}`} className="btn-primary flex-1 !px-2">Reserve Now</Link>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
