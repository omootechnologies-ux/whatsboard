import Link from "next/link";
import { Gift, Link2, Sparkles } from "lucide-react";
import { ensureReferralCodeAction } from "@/app/dashboard/actions";
import { getAppUrl } from "@/lib/billing";
import { getReferralProgramData } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReferralsPage() {
  const { business, referralEvents } = await getReferralProgramData();
  const referralCode = business?.referral_code;
  const referralLink = referralCode ? `${getAppUrl()}/register?ref=${encodeURIComponent(referralCode)}` : "";

  return (
    <div className="space-y-6">
      <section className="grid gap-4 2xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#08192d] p-6 text-white shadow-[0_24px_100px_rgba(2,8,23,0.28)] sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-200/80">Referrals</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Invite a seller, get 30 days free</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
            Built for community selling networks. Share your referral link inside seller groups and earn free time on your plan whenever a referred seller signs up.
          </p>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Gift className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Reward balance</p>
              <p className="text-xs text-slate-500">Free plan days earned from referrals</p>
            </div>
          </div>
          <p className="mt-5 text-3xl font-black tracking-tight text-slate-950">{business?.referral_credit_days ?? 0} days</p>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Your invite link</p>
            <p className="mt-1 text-xs text-slate-500">Share this directly with another seller.</p>
          </div>
          {!referralCode ? (
            <form action={ensureReferralCodeAction}>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white">
                <Sparkles className="h-4 w-4" />
                Generate referral link
              </button>
            </form>
          ) : null}
        </div>

        {referralCode ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Referral code</p>
              <p className="mt-2 font-semibold text-slate-900">{referralCode}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Referral link</p>
              <p className="mt-2 break-all text-sm font-medium text-slate-900">{referralLink}</p>
            </div>
            <Link
              href={`https://wa.me/?text=${encodeURIComponent(`Join WHATSBOARD with my referral link and both of us win. ${referralLink}`)}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
            >
              <Link2 className="h-4 w-4" />
              Share on WhatsApp
            </Link>
          </div>
        ) : null}
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-slate-900">Referral activity</p>
          <p className="mt-1 text-xs text-slate-500">Completed signups and reward grants.</p>
        </div>

        <div className="mt-4 space-y-3">
          {referralEvents.length ? (
            referralEvents.map((event: any) => (
              <div key={event.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{event.referred_email || "Seller signup"}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {event.status} • reward {event.reward_days} days
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {event.converted_at ? new Date(event.converted_at).toLocaleDateString() : new Date(event.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
              No referral conversions yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
