import { NextResponse } from "next/server";
import { z } from "zod";
import { getViewerContext } from "@/lib/queries";

const createOrderSchema = z.object({
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
});

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

    const { supabase, businessId } = await getViewerContext();

    if (!businessId) {
      return NextResponse.json({ error: "Business not found" }, { status: 401 });
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

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
