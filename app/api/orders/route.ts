import { NextResponse } from "next/server";
import { z } from "zod";
import { adminClient } from "@/lib/supabase/admin";
import { getViewerContext } from "@/lib/queries";
import {
  canCreateOrders,
  getAllowedOrderStages,
  getAllowedPaymentStatuses,
} from "@/lib/plan-access";

const createOrderSchema = z.object({
  businessId: z.string().uuid().optional().or(z.literal("")),
  customerName: z.string().min(1),
  phone: z.string().min(1),
  area: z.string().optional().default(""),
  catalogProductId: z.string().uuid().optional().or(z.literal("")),
  product: z.string().optional(),
  productName: z.string().optional(),
  product_name: z.string().optional(),
  amount: z.coerce.number().min(0),
  stage: z.string().optional().default("new_order"),
  paymentStatus: z.string().optional().default("unpaid"),
  notes: z.string().optional().default(""),
  addFollowUp: z.boolean().optional().default(false),
  followUpDate: z.string().optional().default(""),
  followUpNote: z.string().optional().default(""),
});

function generateReferralCode(value: string, businessId: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 6)
    .padEnd(4, "x");

  return `${slug}-${businessId.replace(/-/g, "").slice(0, 6)}`.toUpperCase();
}

async function resolveOrderBusinessContext(hintedBusinessId?: string | null) {
  const context = await getViewerContext();

  if (context.businessId && context.business) {
    return context;
  }

  const user = context.user;

  if (!user) {
    return { ...context, businessId: null, business: null };
  }

  const { data: profile } = await adminClient
    .from("profiles")
    .select("business_id, full_name, email, business_name")
    .eq("id", user.id)
    .maybeSingle();

  let resolvedBusinessId = hintedBusinessId?.trim() || profile?.business_id || null;
  let membershipRole: string | null = null;
  let business = context.business;

  if (resolvedBusinessId) {
    const { data: membership } = await adminClient
      .from("business_members")
      .select("business_id, role")
      .eq("business_id", resolvedBusinessId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (membership?.business_id) {
      membershipRole = membership.role ?? null;
    } else {
      const { data: ownedBusiness } = await adminClient
        .from("businesses")
        .select("id, owner_id, name, phone, brand_color, currency, created_at, referral_code, referral_credit_days, referred_by_business_id, billing_provider, billing_plan, billing_status, billing_provider_reference, billing_provider_session_reference, billing_last_paid_at, billing_current_period_starts_at, billing_current_period_ends_at")
        .eq("id", resolvedBusinessId)
        .eq("owner_id", user.id)
        .maybeSingle();

      if (ownedBusiness?.id) {
        business = ownedBusiness;
        membershipRole = "owner";
      } else {
        resolvedBusinessId = null;
      }
    }
  }

  if (!resolvedBusinessId) {
    const { data: membership } = await adminClient
      .from("business_members")
      .select("business_id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (membership?.business_id) {
      resolvedBusinessId = membership.business_id;
      membershipRole = membership.role ?? null;
    }
  }

  if (!resolvedBusinessId) {
    const { data: ownedBusiness } = await adminClient
      .from("businesses")
      .select("id, owner_id, name, phone, brand_color, currency, created_at, referral_code, referral_credit_days, referred_by_business_id, billing_provider, billing_plan, billing_status, billing_provider_reference, billing_provider_session_reference, billing_last_paid_at, billing_current_period_starts_at, billing_current_period_ends_at")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (ownedBusiness?.id) {
      resolvedBusinessId = ownedBusiness.id;
      business = ownedBusiness;
      membershipRole = "owner";
    }
  }

  if (!resolvedBusinessId) {
    const businessName =
      String(profile?.business_name ?? "").trim() ||
      String(user.user_metadata?.business_name ?? "").trim() ||
      (String(profile?.full_name ?? user.user_metadata?.full_name ?? "").trim()
        ? `${String(profile?.full_name ?? user.user_metadata?.full_name ?? "").trim()}'s business`
        : "") ||
      (String(user.email ?? "").split("@")[0]?.trim()
        ? `${String(user.email ?? "").split("@")[0].trim()}'s business`
        : "") ||
      "My business";

    let businessInsert = await adminClient
      .from("businesses")
      .insert({
        owner_id: user.id,
        name: businessName,
        referral_code: generateReferralCode(businessName, user.id),
        billing_plan: "free",
        billing_status: "free",
      })
      .select("id, owner_id, name, phone, brand_color, currency, created_at, referral_code, referral_credit_days, referred_by_business_id, billing_provider, billing_plan, billing_status, billing_provider_reference, billing_provider_session_reference, billing_last_paid_at, billing_current_period_starts_at, billing_current_period_ends_at")
      .single();

    let errorMessage = businessInsert.error?.message?.toLowerCase() ?? "";

    if (businessInsert.error && (errorMessage.includes("column") || errorMessage.includes("does not exist"))) {
      businessInsert = await adminClient
        .from("businesses")
        .insert({
          owner_id: user.id,
          name: businessName,
          referral_code: generateReferralCode(businessName, user.id),
        })
        .select("id, owner_id, name, phone, brand_color, currency, created_at, referral_code, referral_credit_days, referred_by_business_id, billing_provider, billing_plan, billing_status, billing_provider_reference, billing_provider_session_reference, billing_last_paid_at, billing_current_period_starts_at, billing_current_period_ends_at")
        .single();
      errorMessage = businessInsert.error?.message?.toLowerCase() ?? "";
    }

    if (businessInsert.error && (errorMessage.includes("column") || errorMessage.includes("does not exist"))) {
      businessInsert = await adminClient
        .from("businesses")
        .insert({
          owner_id: user.id,
          name: businessName,
        })
        .select("id, owner_id, name, phone, brand_color, currency, created_at")
        .single();
    }

    if (businessInsert.data?.id) {
      resolvedBusinessId = businessInsert.data.id;
      business = businessInsert.data;
      membershipRole = "owner";
    }
  }

  if (!resolvedBusinessId) {
    return { ...context, businessId: null, business: null };
  }

  if (!business) {
    const { data: resolvedBusiness } = await adminClient
      .from("businesses")
      .select("id, owner_id, name, phone, brand_color, currency, created_at, referral_code, referral_credit_days, referred_by_business_id, billing_provider, billing_plan, billing_status, billing_provider_reference, billing_provider_session_reference, billing_last_paid_at, billing_current_period_starts_at, billing_current_period_ends_at")
      .eq("id", resolvedBusinessId)
      .maybeSingle();

    business = resolvedBusiness ?? null;
  }

  await adminClient.from("profiles").upsert({
    id: user.id,
    business_id: resolvedBusinessId,
    full_name: profile?.full_name ?? user.user_metadata?.full_name ?? null,
    email: profile?.email ?? user.email ?? null,
    business_name: profile?.business_name ?? business?.name ?? null,
  });

  const membershipInsert = await adminClient.from("business_members").insert({
    business_id: resolvedBusinessId,
    user_id: user.id,
    role: membershipRole ?? "owner",
    invited_by: user.id,
  });

  const membershipError = membershipInsert.error?.message?.toLowerCase() ?? "";

  if (membershipInsert.error && !membershipError.includes("duplicate key")) {
    // Ignore repair failure and continue with the resolved business.
  }

  return {
    ...context,
    businessId: resolvedBusinessId,
    business,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid order data" },
        { status: 400 }
      );
    }

    const { supabase, businessId, isAdmin, business } = await resolveOrderBusinessContext(
      parsed.data.businessId
    );

    if (!businessId) {
      return NextResponse.json({ error: "Business not found" }, { status: 401 });
    }

    if (!isAdmin) {
      const now = new Date();
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
      const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();
      const { count } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId)
        .gte("created_at", start)
        .lt("created_at", end);

      if (!canCreateOrders(business, count ?? 0)) {
        return NextResponse.json(
          { error: "Free includes 30 orders per month. Upgrade to Starter for unlimited orders." },
          { status: 403 }
        );
      }
    }

    if (!isAdmin) {
      const allowedStages = getAllowedOrderStages(business);
      const allowedPaymentStatuses = getAllowedPaymentStatuses(business);

      if (!allowedStages.includes(parsed.data.stage as any)) {
        return NextResponse.json(
          { error: "Dispatch tracking starts on Growth. Upgrade to unlock packing, dispatch, and delivery stages." },
          { status: 403 }
        );
      }

      if (!allowedPaymentStatuses.includes(parsed.data.paymentStatus as any)) {
        return NextResponse.json(
          { error: "Payment tracking starts on Starter. Free orders are saved as unpaid only." },
          { status: 403 }
        );
      }
    }

    const customerName = parsed.data.customerName.trim();
    const phone = parsed.data.phone.trim();
    const area = parsed.data.area?.trim() ?? "";
    const catalogProductId = parsed.data.catalogProductId?.trim() || "";
    const product =
      parsed.data.product?.trim() ||
      parsed.data.productName?.trim() ||
      parsed.data.product_name?.trim() ||
      "";
    let resolvedProduct = product;
    let resolvedAmount = parsed.data.amount;

    if (catalogProductId) {
      const { data: catalogProduct, error: catalogError } = await supabase
        .from("catalog_products")
        .select("id, name, price, stock_count, is_active")
        .eq("business_id", businessId)
        .eq("id", catalogProductId)
        .maybeSingle();

      if (catalogError) {
        return NextResponse.json({ error: catalogError.message }, { status: 500 });
      }

      if (!catalogProduct) {
        return NextResponse.json({ error: "Selected catalog product was not found" }, { status: 404 });
      }

      if (!catalogProduct.is_active) {
        return NextResponse.json({ error: "Selected catalog product is hidden" }, { status: 400 });
      }

      if (Number(catalogProduct.stock_count ?? 0) < 1) {
        return NextResponse.json({ error: `${catalogProduct.name} is out of stock` }, { status: 400 });
      }

      resolvedProduct = catalogProduct.name;
      resolvedAmount = Number(catalogProduct.price ?? 0);
    }

    if (!resolvedProduct) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    let customerId: string | null = null;

    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("business_id", businessId)
      .eq("phone", phone)
      .maybeSingle();

    if (existingCustomer?.id) {
      customerId = existingCustomer.id;

      await supabase
        .from("customers")
        .update({
          name: customerName,
          area,
        })
        .eq("id", customerId);
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert({
          business_id: businessId,
          name: customerName,
          phone,
          area,
          status: "active",
        })
        .select("id")
        .single();

      if (customerError || !newCustomer) {
        return NextResponse.json(
          { error: customerError?.message ?? "Unable to create customer" },
          { status: 500 }
        );
      }

      customerId = newCustomer.id;
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        business_id: businessId,
        customer_id: customerId,
        catalog_product_id: catalogProductId || null,
        product_name: resolvedProduct,
        amount: resolvedAmount,
        delivery_area: area,
        stage: parsed.data.stage,
        payment_status: parsed.data.paymentStatus,
        notes: parsed.data.notes?.trim() ?? "",
      })
      .select("*")
      .single();

    if (orderError) {
      return NextResponse.json(
        { error: orderError.message ?? "Unable to create order" },
        { status: 500 }
      );
    }

    if (catalogProductId) {
      const { data: currentCatalogProduct, error: readCatalogError } = await supabase
        .from("catalog_products")
        .select("stock_count, name")
        .eq("business_id", businessId)
        .eq("id", catalogProductId)
        .single();

      if (readCatalogError) {
        await supabase.from("orders").delete().eq("business_id", businessId).eq("id", order.id);
        return NextResponse.json({ error: readCatalogError.message }, { status: 500 });
      }

      const nextStock = Number(currentCatalogProduct.stock_count ?? 0) - 1;

      if (nextStock < 0) {
        await supabase.from("orders").delete().eq("business_id", businessId).eq("id", order.id);
        return NextResponse.json({ error: `${currentCatalogProduct.name} is out of stock` }, { status: 400 });
      }

      const { error: updateCatalogError } = await supabase
        .from("catalog_products")
        .update({ stock_count: nextStock })
        .eq("business_id", businessId)
        .eq("id", catalogProductId);

      if (updateCatalogError) {
        await supabase.from("orders").delete().eq("business_id", businessId).eq("id", order.id);
        return NextResponse.json({ error: updateCatalogError.message }, { status: 500 });
      }
    }

    if (parsed.data.addFollowUp) {
      const dueAt = parsed.data.followUpDate
        ? new Date(parsed.data.followUpDate).toISOString()
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const { error: followUpError } = await supabase.from("follow_ups").insert({
        business_id: businessId,
        order_id: order.id,
        due_at: dueAt,
        note: parsed.data.followUpNote?.trim() || `Follow up with ${customerName} about ${resolvedProduct}`,
        completed: false,
      });

      if (followUpError) {
        return NextResponse.json({ error: followUpError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
