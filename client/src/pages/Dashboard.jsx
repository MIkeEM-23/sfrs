import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FacilityGrid from '../components/FacilityGrid';

export default function Dashboard() {
  const { user } = useAuth();
  const { state } = useLocation();

  return (
    <div className="space-y-6">
      {state?.welcome && (
        <p className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 text-green-700 p-3 text-sm">
          <CheckCircle2 size={18} /> {state.welcome}
        </p>
      )}
      <div>
        <h1 className="text-2xl font-bold text-blue-950">Welcome, {user.fullName.split(' ')[0]}!</h1>
        <p className="text-slate-500">Check facility availability and make your reservation.</p>
      </div>
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Today's Facility Availability</h2>
          <Link to="/availability" className="text-sm text-blue-700 font-semibold hover:underline">View Full Calendar →</Link>
        </div>
        <FacilityGrid />
      </section>
    </div>
  );
}
