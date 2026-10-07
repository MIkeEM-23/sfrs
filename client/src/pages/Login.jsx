import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, School, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [schoolId, setSchoolId] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!schoolId.trim() || !password) return setError('Please enter your School ID and password.');
    setLoading(true);
    try {
      const u = await login(schoolId, password);
      navigate(u.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 to-blue-700 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 rounded-full bg-blue-900 text-white flex items-center justify-center mb-3"><School size={28} /></div>
          <h1 className="text-xl font-bold text-blue-950">School Facility Reservation System</h1>
          <p className="text-sm text-slate-500">Log in with your School ID</p>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">School ID</label>
            <input className="input" placeholder="2026-00001" value={schoolId} onChange={(e) => setSchoolId(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input className="input pr-10" type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-2.5 text-slate-500" aria-label="Show or hide password">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading && <Loader2 size={16} className="animate-spin" />} {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-slate-600">
          Don't have an account? <Link to="/register" className="text-blue-700 font-semibold hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
