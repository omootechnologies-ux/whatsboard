import { Bell, Building2, Shield, Smartphone } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/whatsboard-dashboard/dashboard-ui";

export default function SettingsPage() {
  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title="Settings"
        description="One place for profile, business info, notifications, and security preferences."
        primaryAction={<button className="wb-button-primary">Save Changes</button>}
      />

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Profile and business info" description="Core details used across orders, payment references, and customer communication.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">Business name</label>
              <input className="wb-input" defaultValue="WhatsBoard Store" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">Primary channel</label>
              <input className="wb-input" defaultValue="WhatsApp + Instagram" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">Base city</label>
              <input className="wb-input" defaultValue="Dar es Salaam" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">Currency</label>
              <input className="wb-input" defaultValue="TZS" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">Team size</label>
              <input className="wb-input" defaultValue="3 sellers" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Alerts and security" description="Control notification noise while keeping critical alerts visible.">
          <div className="space-y-3">
            {[
              { icon: Bell, label: "Order alerts", detail: "Notify when a new order lands from WhatsApp or social." },
              { icon: Smartphone, label: "Mobile reminders", detail: "Keep overdue follow-ups visible throughout the day." },
              { icon: Building2, label: "Dispatch updates", detail: "Notify when dispatch stages need immediate action." },
              { icon: Shield, label: "Security notices", detail: "Receive sign-in and account protection alerts." },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 rounded-[22px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--color-wb-primary)]">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--color-wb-text)]">{item.label}</p>
                    <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">{item.detail}</p>
                  </div>
                </div>
                <div className="h-7 w-12 rounded-full bg-[var(--color-wb-primary)]/15 p-1">
                  <div className="ml-auto h-5 w-5 rounded-full bg-[var(--color-wb-primary)]" />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
