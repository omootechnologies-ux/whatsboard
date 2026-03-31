import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Settings, Store, Phone, Globe2, MapPin, StickyNote, LogOut, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "@/app/(auth)/actions";

type SettingsProfile = {
  id: string;
  full_name: string | null;
  business_name: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  default_currency: string | null;
  default_area: string | null;
  notes: string | null;
};

async function saveSettings(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const payload = {
    id: user.id,
    full_name: String(formData.get("full_name") || "").trim() || null,
    business_name: String(formData.get("business_name") || "").trim() || null,
    phone: String(formData.get("phone") || "").trim() || null,
    whatsapp_number: String(formData.get("whatsapp_number") || "").trim() || null,
    instagram_handle: String(formData.get("instagram_handle") || "").trim() || null,
    tiktok_handle: String(formData.get("tiktok_handle") || "").trim() || null,
    default_currency: String(formData.get("default_currency") || "TZS").trim() || "TZS",
    default_area: String(formData.get("default_area") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  };

  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });

  if (error) {
    redirect(`/dashboard/settings?status=error&message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");

  redirect("/dashboard/settings?status=success");
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; message?: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedSearch = (await searchParams) ?? {};
  const status = resolvedSearch.status;
  const message = resolvedSearch.message;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const values: SettingsProfile = {
    id: user.id,
    full_name: profile?.full_name ?? user.user_metadata?.full_name ?? "",
    business_name: profile?.business_name ?? user.user_metadata?.business_name ?? "",
    phone: profile?.phone ?? "",
    whatsapp_number: profile?.whatsapp_number ?? "",
    instagram_handle: profile?.instagram_handle ?? "",
    tiktok_handle: profile?.tiktok_handle ?? "",
    default_currency: profile?.default_currency ?? "TZS",
    default_area: profile?.default_area ?? "",
    notes: profile?.notes ?? "",
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
              <Settings className="h-6 w-6" />
            </span>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">
                Settings
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                Business settings
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Update your business details, preferred contact channels, and default selling info.
                These settings help keep your WhatsBoard workspace clean and consistent.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm lg:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/55">
            Account
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-tight">
            Signed in as
          </h2>
          <p className="mt-3 break-all text-sm leading-7 text-white/75">
            {user.email}
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
            Keep this page updated so your dashboard reflects the real business behind the orders.
          </div>

          <form action={logoutAction} className="mt-6">
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </section>

      {status === "success" && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Settings saved successfully.
        </div>
      )}

      {status === "error" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {message || "Failed to save settings."}
        </div>
      )}

      <form action={saveSettings} className="space-y-6">
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-black tracking-tight text-slate-900">Business profile</h2>
            <p className="mt-2 text-sm text-slate-500">
              The core identity of your business inside the dashboard.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full name" icon={<Store className="h-4 w-4" />}>
              <input
                name="full_name"
                defaultValue={values.full_name ?? ""}
                placeholder="Your full name"
                className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-emerald-400"
              />
            </Field>

            <Field label="Business name" icon={<Store className="h-4 w-4" />}>
              <input
                name="business_name"
                defaultValue={values.business_name ?? ""}
                placeholder="Your business name"
                className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-emerald-400"
              />
            </Field>

            <Field label="Phone" icon={<Phone className="h-4 w-4" />}>
              <input
                name="phone"
                defaultValue={values.phone ?? ""}
                placeholder="e.g. +255..."
                className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-emerald-400"
              />
            </Field>

            <Field label="WhatsApp number" icon={<Phone className="h-4 w-4" />}>
              <input
                name="whatsapp_number"
                defaultValue={values.whatsapp_number ?? ""}
                placeholder="WhatsApp number"
                className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-emerald-400"
              />
            </Field>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-black tracking-tight text-slate-900">Selling channels</h2>
            <p className="mt-2 text-sm text-slate-500">
              Save your common social handles and business channels.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Instagram handle" icon={<Globe2 className="h-4 w-4" />}>
              <input
                name="instagram_handle"
                defaultValue={values.instagram_handle ?? ""}
                placeholder="@yourbrand"
                className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-emerald-400"
              />
            </Field>

            <Field label="TikTok handle" icon={<Globe2 className="h-4 w-4" />}>
              <input
                name="tiktok_handle"
                defaultValue={values.tiktok_handle ?? ""}
                placeholder="@yourbrand"
                className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-emerald-400"
              />
            </Field>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-black tracking-tight text-slate-900">Business defaults</h2>
            <p className="mt-2 text-sm text-slate-500">
              These defaults help standardize the way you manage orders.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Default currency" icon={<Globe2 className="h-4 w-4" />}>
              <select
                name="default_currency"
                defaultValue={values.default_currency ?? "TZS"}
                className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-emerald-400"
              >
                <option value="TZS">TZS</option>
                <option value="KES">KES</option>
                <option value="UGX">UGX</option>
                <option value="RWF">RWF</option>
                <option value="USD">USD</option>
              </select>
            </Field>

            <Field label="Default area / city" icon={<MapPin className="h-4 w-4" />}>
              <input
                name="default_area"
                defaultValue={values.default_area ?? ""}
                placeholder="e.g. Kariakoo, Dar es Salaam"
                className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-emerald-400"
              />
            </Field>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-black tracking-tight text-slate-900">Notes</h2>
            <p className="mt-2 text-sm text-slate-500">
              Keep internal notes about your business, delivery rules, or selling style.
            </p>
          </div>

          <Field label="Internal notes" icon={<StickyNote className="h-4 w-4" />}>
            <textarea
              name="notes"
              defaultValue={values.notes ?? ""}
              placeholder="Write anything useful for your own operations..."
              className="min-h-[160px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400"
            />
          </Field>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            <Save className="h-4 w-4" />
            Save settings
          </button>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
          >
            Back to dashboard
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
        {icon && <span className="text-slate-400">{icon}</span>}
        {label}
      </span>
      {children}
    </label>
  );
}
