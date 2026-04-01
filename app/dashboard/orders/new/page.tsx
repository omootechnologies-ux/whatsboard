import { ArrowLeft, PackageCheck, ShoppingBag } from "lucide-react";
import { OrderForm } from "@/components/forms/order-form";
import { getDashboardWriteAccess } from "@/lib/dashboard-access";
import {
  canUsePlanCapabilityForUser,
  getAllowedOrderStagesForUser,
  getAllowedPaymentStatusesForUser,
} from "@/lib/plan-access";
import { getOrderCatalogOptions } from "@/lib/queries";
import {
  DashboardActionLink,
  DashboardHero,
  DashboardPage,
  DashboardPanel,
  DashboardPanelHeader,
  DashboardStatCard,
} from "@/components/dashboard/page-primitives";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewOrderPage() {
  const { business, isAdmin, canCreateOrders, monthlyOrderLimit, orderCountThisMonth, remainingMonthlyOrders } =
    await getDashboardWriteAccess();
  const catalogProducts = await getOrderCatalogOptions();
  const canUsePaymentTracking = canUsePlanCapabilityForUser("paymentTracking", business, isAdmin);
  const canUseFollowUps = canUsePlanCapabilityForUser("followUpReminders", business, isAdmin);

  return (
    <DashboardPage>
      <DashboardHero
        eyebrow="Orders"
        title="Create a new order without leaving the operating workflow."
        description="Capture the customer, amount, stage, and next action in one place so the order immediately becomes trackable."
        actions={
          <DashboardActionLink href="/dashboard/orders">
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </DashboardActionLink>
        }
        aside={
          <div className="grid gap-3">
            <DashboardStatCard
              label="Catalog products"
              value={String(catalogProducts.length)}
              detail="Ready to reuse in new orders"
              icon={<ShoppingBag className="h-5 w-5" />}
            />
            <DashboardStatCard
              label="Tracking level"
              value={canUsePaymentTracking ? "Full" : "Basic"}
              detail={canUseFollowUps ? "Includes follow-ups" : "Follow-ups unlock on Starter"}
              icon={<PackageCheck className="h-5 w-5" />}
            />
          </div>
        }
      />

      <DashboardPanel>
        <DashboardPanelHeader
          eyebrow="Order form"
          title="New order details"
          description="This form follows the same workflow as the dashboard lists: customer first, then order, payment, and next action."
        />
        <div className="mt-5">
        <OrderForm
          catalogProducts={catalogProducts}
          canManageRecords={canCreateOrders}
          allowedStages={getAllowedOrderStagesForUser(business, isAdmin)}
          allowedPaymentStatuses={getAllowedPaymentStatusesForUser(business, isAdmin)}
          canUseFollowUps={canUseFollowUps}
          canUsePaymentTracking={canUsePaymentTracking}
          monthlyOrderLimit={monthlyOrderLimit}
          orderCountThisMonth={orderCountThisMonth}
          remainingMonthlyOrders={remainingMonthlyOrders}
        />
        </div>
      </DashboardPanel>
    </DashboardPage>
  );
}
