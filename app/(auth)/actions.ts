"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { loginSchema, registerSchema } from "@/lib/validations";

type AuthFormState = {
  error: string;
};

function generateReferralCode(businessName: string, userId: string) {
  const slug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 6)
    .padEnd(4, "x");

  return `${slug}-${userId.replace(/-/g, "").slice(0, 6)}`.toUpperCase();
}

function matchesMissingSchemaError(message?: string) {
  const value = (message || "").toLowerCase();
  return (
    value.includes("schema cache") ||
    value.includes("could not find the table") ||
    value.includes("column") ||
    value.includes("does not exist")
  );
}

export async function registerAction(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    businessName: formData.get("businessName"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const password = parsed.data.password;
  const fullName = parsed.data.fullName.trim();
  const businessName = parsed.data.businessName.trim();
  const referralCode = String(parsed.data.referralCode || "").trim().toUpperCase();

  const { data: createdUser, error: createUserError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        business_name: businessName
      }
    });

  if (createUserError || !createdUser.user) {
    return { error: createUserError?.message ?? "Unable to create account" };
  }

  const userId = createdUser.user.id;

  const { data: business, error: businessError } = await adminClient
    .from("businesses")
    .insert({
      owner_id: userId,
      name: businessName,
      referral_code: generateReferralCode(businessName, userId),
    })
    .select("id")
    .single();

  if (businessError || !business) {
    await adminClient.auth.admin.deleteUser(userId);
    return { error: businessError?.message ?? "Unable to create business" };
  }

  const { error: profileError } = await adminClient.from("profiles").upsert({
    id: userId,
    business_id: business.id,
    full_name: fullName,
    email
  });

  if (profileError) {
    await adminClient.from("businesses").delete().eq("id", business.id);
    await adminClient.auth.admin.deleteUser(userId);
    return { error: profileError.message };
  }

  if (referralCode) {
    const { data: candidateBusinesses } = await adminClient
      .from("businesses")
      .select("id, name, billing_status, billing_current_period_ends_at, referral_credit_days")
      .neq("id", business.id);

    const referrerBusiness =
      (candidateBusinesses ?? []).find(
        (item) => generateReferralCode(item.name ?? "", item.id) === referralCode
      ) ?? null;

    if (referrerBusiness?.id) {
      const convertedAt = new Date().toISOString();

      const referralInsert = await adminClient.from("referral_events").insert({
        referrer_business_id: referrerBusiness.id,
        referred_business_id: business.id,
        referred_email: email,
        referral_code: referralCode,
        reward_days: 30,
        status: "converted",
        converted_at: convertedAt,
      });

      if (!referralInsert.error || !matchesMissingSchemaError(referralInsert.error?.message)) {
        const nextCreditDays = Number(referrerBusiness.referral_credit_days ?? 0) + 30;
        let nextBillingPeriodEnd = referrerBusiness.billing_current_period_ends_at;

        if (referrerBusiness.billing_status === "active" && referrerBusiness.billing_current_period_ends_at) {
          const end = new Date(referrerBusiness.billing_current_period_ends_at);
          end.setUTCDate(end.getUTCDate() + 30);
          nextBillingPeriodEnd = end.toISOString();
        }

        const referrerUpdate = await adminClient
          .from("businesses")
          .update({
            referral_credit_days: nextCreditDays,
            billing_current_period_ends_at: nextBillingPeriodEnd,
          })
          .eq("id", referrerBusiness.id);

        if (!referrerUpdate.error || !matchesMissingSchemaError(referrerUpdate.error?.message)) {
          await adminClient
            .from("businesses")
            .update({
              referred_by_business_id: referrerBusiness.id,
            })
            .eq("id", business.id);
        }
      }
    }
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    return { error: "Account created, but auto-login failed. Please log in manually." };
  }

  redirect("/dashboard");
}

export async function loginAction(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid login details" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email.toLowerCase().trim(),
    password: parsed.data.password
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
