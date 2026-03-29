import { getAccountData } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
  const { business } = await getAccountData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Settings</h2>
        <p className="mt-2 text-slate-600">
          Business setup, payment instructions, delivery setup, and brand configuration.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Business settings</h3>
          <div className="mt-4 grid gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Business name</p>
              <p className="mt-2 font-medium text-slate-900">{business?.name ?? "Not set"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Business phone</p>
              <p className="mt-2 font-medium text-slate-900">{business?.phone ?? "Not set"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Currency</p>
              <p className="mt-2 font-medium text-slate-900">{business?.currency ?? "TZS"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Brand color</p>
              <p className="mt-2 font-medium text-slate-900">{business?.brand_color ?? "#22c55e"}</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Operational settings</h3>
          <div className="mt-4 grid gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Payment instructions</p>
              <p className="mt-2 text-sm text-slate-700">
                Add account numbers, mobile money instructions, and “send proof after payment” guidance here later.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Delivery zones</p>
              <p className="mt-2 text-sm text-slate-700">
                Add preferred delivery areas like Mbezi, Kariakoo, Sinza, Masaki, and dispatch rules later.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Follow-up defaults</p>
              <p className="mt-2 text-sm text-slate-700">
                Add automatic reminders for unpaid orders, abandoned orders, and repeat-customer follow-ups later.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
