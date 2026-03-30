"use server";

import { revalidatePath } from "next/cache";
import { getViewerContext } from "@/lib/queries";

type OrderFormState = {
  success: boolean;
  error: string | null;
};

export async function updateOrderAction(
  orderId: string,
  _prevState: OrderFormState,
  formData: FormData
): Promise<OrderFormState> {
  try {
    const { supabase, businessId } = await getViewerContext();

    if (!businessId) {
      return { success: false, error: "Business not found" };
    }

    const customerName = String(formData.get("customerName") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const product = String(formData.get("product") ?? "").trim();
    const area = String(formData.get("area") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim();
    const stage = String(formData.get("stage") ?? "new_order");
    const paymentStatus = String(formData.get("paymentStatus") ?? "unpaid");
    const amount = Number(formData.get("amount") ?? 0);

    if (!customerName || !phone || !product) {
      return { success: false, error: "Customer, phone, and product are required" };
    }

    const { data: orderRow, error: orderFetchError } = await supabase
      .from("orders")
      .select("id, customer_id")
      .eq("id", orderId)
      .eq("business_id", businessId)
      .single();

    if (orderFetchError || !orderRow) {
      return { success: false, error: "Order not found" };
    }

    let customerId = orderRow.customer_id as string | null;

    if (customerId) {
      const { error: customerUpdateError } = await supabase
        .from("customers")
        .update({
          name: customerName,
          phone,
          area,
        })
        .eq("id", customerId)
        .eq("business_id", businessId);

      if (customerUpdateError) {
        return { success: false, error: customerUpdateError.message };
      }
    } else {
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
        const { data: newCustomer, error: customerCreateError } = await supabase
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

        if (customerCreateError || !newCustomer) {
          return {
            success: false,
            error: customerCreateError?.message ?? "Unable to create customer",
          };
        }

        customerId = newCustomer.id;
      }
    }

    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({
        customer_id: customerId,
        product_name: product,
        amount,
        delivery_area: area,
        stage,
        payment_status: paymentStatus,
        notes,
      })
      .eq("id", orderId)
      .eq("business_id", businessId);

    if (orderUpdateError) {
      return { success: false, error: orderUpdateError.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/customers");
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath(`/dashboard/orders/${orderId}/edit`);

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}
