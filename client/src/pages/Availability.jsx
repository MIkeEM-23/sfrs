import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { errorMessage } from '../services/api';
import Calendar from '../components/Calendar';
import StatusBadge from '../components/StatusBadge';
import { fmtDate, fmtTime, todayStr } from '../utils/format';

export default function Availability() {
  const [params] = useSearchParams();
  const [date, setDate] = useState(params.get('date') || todayStr());
  const [facility, setFacility] = useState(params.get('facility') || 'Gymnasium');
  const [summary, setSummary] = useState([]); // status of all 4 facilities for the date
  const [detail, setDetail] = useState(null); // time slots of the chosen facility
  const [error, setError] = useState('');

  // Whenever the date changes, load all facilities' status from MongoDB.
  useEffect(() => {
    setError('');
    api.get('/availability/all', { params: { date } })
      .then((res) => setSummary(res.data.facilities))
      .catch((e) => setError(errorMessage(e)));
  }, [date]);

  // Whenever facility or date changes, load the time slots.
  useEffect(() => {
    api.get('/availability', { params: { facility, date } })
      .then((res) => setDetail(res.data))
      .catch((e) => setError(errorMessage(e)));
  }, [facility, date]);

  const full = detail?.status === 'Fully Booked';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-950">Check Facility Availability</h1>
        <p className="text-slate-500">Pick a date to see which facilities are free.</p>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <div>
            <label className="label">Facility</label>
            <select className="input" value={facility} onChange={(e) => setFacility(e.target.value)}>
              {summary.map((f) => <option key={f.name}>{f.name}</option>)}
              {summary.length === 0 && <option>{facility}</option>}
            </select>
          </div>
          <Calendar value={date} onChange={setDate} minDate={todayStr()} />
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="font-semibold mb-2">{fmtDate(date)}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {summary.map((f) => (
                <button key={f.name} onClick={() => setFacility(f.name)}
                  className={`card text-left !p-4 ${f.name === facility ? 'ring-2 ring-blue-600' : 'hover:shadow-md'}`}>
                  <p className="font-semibold mb-2">{f.name}</p>
                  <StatusBadge status={f.availability} />
                </button>
              ))}
            </div>
          </section>

          {detail && (
            <section className="card">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="font-bold text-lg uppercase">{detail.facility}</h3>
                  <p className="text-sm text-slate-500">{fmtDate(detail.date)}</p>
                </div>
                <StatusBadge status={detail.status} />
              </div>

              {detail.status === 'Available' && <p className="text-sm text-slate-600 mb-3">No reservations for this day.</p>}
              {full && <p className="text-sm text-slate-600 mb-3">This facility is fully reserved for this date.</p>}

              <ul className="divide-y">
                {detail.slots.map((s) => (
                  <li key={s.start} className="flex items-center justify-between py-2 text-sm">
                    <span>{fmtTime(s.start)} - {fmtTime(s.end)}</span>
                    {s.status === 'Available'
                      ? <Link to={`/reserve?facility=${encodeURIComponent(facility)}&date=${date}&start=${s.start}&end=${s.end}`} className="text-green-700 font-semibold hover:underline">✓ Available</Link>
                      : <span className="text-red-600 font-semibold">Reserved</span>}
                  </li>
                ))}
              </ul>

              <div className="mt-4">
                {full
                  ? <button className="btn-primary" disabled>Reserve Now</button>
                  : <Link to={`/reserve?facility=${encodeURIComponent(facility)}&date=${date}`} className="btn-primary">Reserve Now</Link>}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
