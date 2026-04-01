import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OrderForm } from "@/components/forms/order-form";
import { getDashboardWriteAccess } from "@/lib/dashboard-access";
import {
  canUsePlanCapabilityForUser,
  getAllowedOrderStagesForUser,
  getAllowedPaymentStatusesForUser,
} from "@/lib/plan-access";
import { getOrderCatalogOptions } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewOrderPage() {
  const { business, isAdmin, canCreateOrders, monthlyOrderLimit, orderCountThisMonth, remainingMonthlyOrders } =
    await getDashboardWriteAccess();
  const catalogProducts = await getOrderCatalogOptions();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Create Order</h2>
          <p className="mt-2 text-slate-600">
            Fill in the customer and order details, then save.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <OrderForm
          catalogProducts={catalogProducts}
          canManageRecords={canCreateOrders}
          allowedStages={getAllowedOrderStagesForUser(business, isAdmin)}
          allowedPaymentStatuses={getAllowedPaymentStatusesForUser(business, isAdmin)}
          canUseFollowUps={canUsePlanCapabilityForUser("followUpReminders", business, isAdmin)}
          canUsePaymentTracking={canUsePlanCapabilityForUser("paymentTracking", business, isAdmin)}
          monthlyOrderLimit={monthlyOrderLimit}
          orderCountThisMonth={orderCountThisMonth}
          remainingMonthlyOrders={remainingMonthlyOrders}
        />
      </section>
    </div>
  );
}
