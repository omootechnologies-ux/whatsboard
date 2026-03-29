import { NextResponse } from "next/server";
import { orderSchema } from "@/lib/validations";
import { getViewerContext } from "@/lib/queries";

export async function GET() {
  const { supabase, businessId } = await getViewerContext();
  if (!businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("orders")
    .select("id, product_name, amount, delivery_area, stage, payment_status, created_at, updated_at, customers(name, phone)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const { supabase, businessId } = await getViewerContext();
  if (!businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id")
    .eq("business_id", businessId)
    .eq("phone", parsed.data.phone.trim())
    .maybeSingle();

  let customerId = existingCustomer?.id;

  if (!customerId) {
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert({ business_id: businessId, name: parsed.data.customerName, phone: parsed.data.phone.trim(), area: parsed.data.area })
      .select("id")
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ error: customerError?.message ?? "Unable to create customer" }, { status: 400 });
    }
    customerId = customer.id;
  }

  const { data, error } = await supabase.from("orders").insert({
    business_id: businessId,
    customer_id: customerId,
    product_name: parsed.data.productName,
    amount: parsed.data.amount,
    delivery_area: parsed.data.area,
    stage: parsed.data.stage,
    payment_status: parsed.data.paymentStatus,
    notes: parsed.data.notes
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
