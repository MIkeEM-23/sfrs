import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { School, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ schoolId: '', fullName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (Object.values(form).some((v) => !v.trim())) return setError('Please fill in all fields.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    try {
      await register(form); // saves to MongoDB and logs the user in
      navigate('/dashboard', { state: { welcome: 'Account created successfully!' } });
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
          <h1 className="text-xl font-bold text-blue-950">Create Account</h1>
          <p className="text-sm text-slate-500">School Facility Reservation System</p>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">School ID</label><input className="input" placeholder="2026-00001" value={form.schoolId} onChange={set('schoolId')} /></div>
          <div><label className="label">Full Name</label><input className="input" placeholder="Juan Dela Cruz" value={form.fullName} onChange={set('fullName')} /></div>
          <div><label className="label">School Email</label><input className="input" type="email" placeholder="juan@school.edu" value={form.email} onChange={set('email')} /></div>
          <div><label className="label">Password</label><input className="input" type="password" value={form.password} onChange={set('password')} /></div>
          <div><label className="label">Confirm Password</label><input className="input" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} /></div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading && <Loader2 size={16} className="animate-spin" />} {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-slate-600">
          Already have an account? <Link to="/login" className="text-blue-700 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
