import FacilityGrid from '../components/FacilityGrid';

export default function Facilities() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-950">Facilities</h1>
        <p className="text-slate-500">Choose a facility to check its schedule or reserve it.</p>
      </div>
      <FacilityGrid />
    </div>
  );
}
