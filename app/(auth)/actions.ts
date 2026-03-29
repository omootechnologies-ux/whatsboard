"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { loginSchema, registerSchema } from "@/lib/validations";

type AuthFormState = {
  error: string;
};

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
      name: businessName
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
