import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  Globe2,
  LogOut,
  MapPin,
  Phone,
  Save,
  Settings,
  StickyNote,
  Store,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "@/app/(auth)/actions";
import {
  DashboardActionLink,
  DashboardHero,
  DashboardInfoGrid,
  DashboardPage,
  DashboardPanel,
  DashboardPanelHeader,
  DashboardStatCard,
} from "@/components/dashboard/page-primitives";

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

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

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
    <DashboardPage>
      <DashboardHero
        eyebrow="Settings"
        title="Keep workspace details clean so the rest of the dashboard stays consistent."
        description="Update the core business defaults your team uses across orders, customers, and daily operations."
        actions={
          <>
            <DashboardActionLink href="/dashboard">Back to overview</DashboardActionLink>
            <form action={logoutAction}>
              <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#e9d4d1] bg-[#f9efed] px-5 py-3 text-sm font-semibold text-[#8f3e36] transition hover:bg-[#f3e1de]">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </>
        }
        aside={
          <div className="space-y-3">
            <DashboardStatCard
              label="Workspace email"
              value={user.email ?? "Not set"}
              detail="Account currently signed into this workspace"
              icon={<Settings className="h-5 w-5" />}
            />
          </div>
        }
      />

      {status === "success" ? (
        <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
          Settings saved successfully.
        </div>
      ) : null}

      {status === "error" ? (
        <div className="rounded-2xl border border-[#e9d4d1] bg-[#f9efed] px-4 py-3 text-sm text-[#8f3e36]">
          {message || "Failed to save settings."}
        </div>
      ) : null}

      <DashboardInfoGrid columns="three">
        <DashboardStatCard
          label="Business name"
          value={values.business_name || "Not set"}
          detail="Displayed in your workspace and customer-facing context"
          icon={<Store className="h-5 w-5" />}
        />
        <DashboardStatCard
          label="Default currency"
          value={values.default_currency || "TZS"}
          detail="Used as the starting point for pricing and orders"
          icon={<Globe2 className="h-5 w-5" />}
        />
        <DashboardStatCard
          label="Default area"
          value={values.default_area || "Not set"}
          detail="Helpful for delivery defaults and common destinations"
          icon={<MapPin className="h-5 w-5" />}
        />
      </DashboardInfoGrid>

      <form action={saveSettings} className="space-y-5">
        <DashboardPanel>
          <DashboardPanelHeader
            eyebrow="Profile"
            title="Business profile"
            description="The basic identity and contact information attached to your workspace."
          />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Full name" icon={<Store className="h-4 w-4" />}>
              <input
                name="full_name"
                defaultValue={values.full_name ?? ""}
                placeholder="Your full name"
                className="form-input"
              />
            </Field>

            <Field label="Business name" icon={<Store className="h-4 w-4" />}>
              <input
                name="business_name"
                defaultValue={values.business_name ?? ""}
                placeholder="Your business name"
                className="form-input"
              />
            </Field>

            <Field label="Phone" icon={<Phone className="h-4 w-4" />}>
              <input
                name="phone"
                defaultValue={values.phone ?? ""}
                placeholder="e.g. +255..."
                className="form-input"
              />
            </Field>

            <Field label="WhatsApp number" icon={<Phone className="h-4 w-4" />}>
              <input
                name="whatsapp_number"
                defaultValue={values.whatsapp_number ?? ""}
                placeholder="WhatsApp number"
                className="form-input"
              />
            </Field>
          </div>
        </DashboardPanel>

        <DashboardPanel>
          <DashboardPanelHeader
            eyebrow="Channels"
            title="Selling channels"
            description="Store the social handles you repeatedly use in sales conversations."
          />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Instagram handle" icon={<Globe2 className="h-4 w-4" />}>
              <input
                name="instagram_handle"
                defaultValue={values.instagram_handle ?? ""}
                placeholder="@yourbrand"
                className="form-input"
              />
            </Field>

            <Field label="TikTok handle" icon={<Globe2 className="h-4 w-4" />}>
              <input
                name="tiktok_handle"
                defaultValue={values.tiktok_handle ?? ""}
                placeholder="@yourbrand"
                className="form-input"
              />
            </Field>
          </div>
        </DashboardPanel>

        <DashboardPanel>
          <DashboardPanelHeader
            eyebrow="Defaults"
            title="Workspace defaults"
            description="Small defaults that reduce repetitive data entry across the dashboard."
          />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Default currency" icon={<Globe2 className="h-4 w-4" />}>
              <select
                name="default_currency"
                defaultValue={values.default_currency ?? "TZS"}
                className="form-select"
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
                className="form-input"
              />
            </Field>
          </div>
        </DashboardPanel>

        <DashboardPanel>
          <DashboardPanelHeader
            eyebrow="Notes"
            title="Operational notes"
            description="Capture any recurring delivery rules, business preferences, or internal reminders."
          />
          <div className="mt-5">
            <Field label="Internal notes" icon={<StickyNote className="h-4 w-4" />}>
              <textarea
                name="notes"
                defaultValue={values.notes ?? ""}
                placeholder="Write anything useful for your own operations..."
                className="form-textarea min-h-[160px]"
              />
            </Field>
          </div>
        </DashboardPanel>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0a3d2e]"
          >
            <Save className="h-4 w-4" />
            Save settings
          </button>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-2xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
          >
            Back to dashboard
          </Link>
        </div>
      </form>
    </DashboardPage>
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
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon ? <span className="text-muted-foreground">{icon}</span> : null}
        {label}
      </span>
      {children}
    </label>
  );
}
