export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="mt-2 text-slate-600">Business profile, payment instructions, delivery zones, and brand setup.</p>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">Business name</p>
        <p className="mt-1">WHATSBOARD Demo Store</p>
      </div>
    </div>
  );
}
