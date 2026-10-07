const styles = {
  Available: 'bg-green-100 text-green-700',
  'Partially Booked': 'bg-amber-100 text-amber-700',
  'Fully Booked': 'bg-red-100 text-red-700',
  Reserved: 'bg-red-100 text-red-700',
  Pending: 'bg-amber-100 text-amber-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
  Cancelled: 'bg-slate-200 text-slate-600',
  Completed: 'bg-blue-100 text-blue-700',
};
const icons = { Available: '✓', 'Partially Booked': '●', 'Fully Booked': '✕' };

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || 'bg-slate-100'}`}>
      {icons[status]} {status}
    </span>
  );
}
