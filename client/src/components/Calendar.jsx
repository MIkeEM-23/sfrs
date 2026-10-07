import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { pad } from '../utils/format';

// Simple month calendar. value / minDate are "YYYY-MM-DD" strings.
export default function Calendar({ value, onChange, minDate }) {
  const [view, setView] = useState(() => {
    const d = value ? new Date(`${value}T00:00:00`) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const y = view.getFullYear();
  const m = view.getMonth();
  const blanks = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const iso = (day) => `${y}-${pad(m + 1)}-${pad(day)}`;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <button className="btn-outline !px-2" onClick={() => setView(new Date(y, m - 1, 1))} aria-label="Previous month"><ChevronLeft size={16} /></button>
        <h3 className="font-semibold">{view.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
        <button className="btn-outline !px-2" onClick={() => setView(new Date(y, m + 1, 1))} aria-label="Next month"><ChevronRight size={16} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: blanks }).map((_, i) => <div key={`b${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const date = iso(day);
          const disabled = minDate && date < minDate;
          const selected = date === value;
          return (
            <button key={day} disabled={disabled} onClick={() => onChange(date)}
              className={`aspect-square rounded-lg text-sm ${selected ? 'bg-blue-900 text-white font-semibold' : 'hover:bg-blue-100'} ${disabled ? 'text-slate-300 cursor-not-allowed hover:bg-transparent' : ''}`}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
