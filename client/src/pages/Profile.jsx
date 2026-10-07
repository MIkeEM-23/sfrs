import { useAuth } from '../context/AuthContext';
import { fmtDateTime } from '../utils/format';

export default function Profile() {
  const { user } = useAuth();
  const rows = [
    ['School ID', user.schoolId],
    ['Full Name', user.fullName],
    ['Email', user.email || '-'],
    ['Role', user.role],
    ['Member Since', fmtDateTime(user.createdAt)],
  ];
  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-bold text-blue-950">Profile</h1>
      <div className="card divide-y">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between py-3 text-sm">
            <span className="text-slate-500">{k}</span><span className="font-medium">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
