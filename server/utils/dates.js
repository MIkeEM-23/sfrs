const pad = (n) => String(n).padStart(2, '0');
const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

exports.todayStr = () => toDateStr(new Date());
exports.addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return toDateStr(d); };
exports.nowMinutes = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
exports.toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
exports.fromMin = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
