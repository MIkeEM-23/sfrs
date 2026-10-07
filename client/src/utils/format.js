export const pad = (n) => String(n).padStart(2, '0');

export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// "13:00" -> "1:00 PM"
export const fmtTime = (t) => {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`;
};

// "2026-10-15" -> "October 15, 2026"
export const fmtDate = (s) =>
  new Date(`${s}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export const fmtDateTime = (s) =>
  new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
