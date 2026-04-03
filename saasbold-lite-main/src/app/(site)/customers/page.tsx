import Link from "next/link";
import { Plus } from "lucide-react";
import {
  BuyerBadge,
  CustomerRow,
  DataCell,
  DataRow,
  DataTable,
  EmptyState,
  FilterToolbar,
  KpiCard,
  PageHeader,
  SectionCard,
} from "@/components/whatsboard-dashboard/dashboard-ui";
import {
  formatCurrency,
  formatDate,
} from "@/components/whatsboard-dashboard/formatting";
import { listCustomers } from "@/lib/whatsboard-repository";
import { getPrimaryOrderLabel } from "@/lib/display-labels";

type CustomersPageSearchParams = Promise<{
  search?: string;
  status?: string;
  buyerStatus?: string;
  sourceChannel?: string;
  sort?: string;
  created?: string;
  updated?: string;
  error?: string;
}>;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: CustomersPageSearchParams;
}) {
  const query = await searchParams;
  const customerRecords = await listCustomers({
    search: query.search,
    status: query.status,
    buyerStatus:
      query.buyerStatus === "new" ||
      query.buyerStatus === "repeat" ||
      query.buyerStatus === "at_risk" ||
      query.buyerStatus === "lost"
        ? query.buyerStatus
        : undefined,
    sourceChannel:
      query.sourceChannel === "WhatsApp" ||
      query.sourceChannel === "Instagram" ||
      query.sourceChannel === "Facebook" ||
      query.sourceChannel === "TikTok"
        ? query.sourceChannel
        : undefined,
    sort:
      query.sort === "ltv" ||
      query.sort === "last_order" ||
      query.sort === "total_orders" ||
      query.sort === "days_since_last_order"
        ? query.sort
        : undefined,
  });

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title="Customers"
        description="Customer records connected to orders, follow-ups, and spend history so repeat sales are easier to manage."
        primaryAction={
          <Link href="/customers/new" className="wb-button-primary">
            <Plus className="h-4 w-4" />
            Add Customer
          </Link>
        }
      />

      {query.created === "1" || query.updated === "1" ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
          {query.created === "1"
            ? "Customer created successfully."
            : "Customer updated successfully."}
        </div>
      ) : null}

      {query.error === "not-found" ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
          Customer was not found.
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard
          label="Tracked customers"
          value={String(customerRecords.length)}
          detail="Records captured from daily selling activity."
        />
        <KpiCard
          label="Repeat buyers"
          value={String(
            customerRecords.filter((customer) => customer.buyerStatus === "repeat")
              .length,
          )}
          detail="Customers with 2+ recorded orders."
        />
        <KpiCard
          label="At-risk buyers"
          value={String(
            customerRecords.filter((customer) => customer.buyerStatus === "at_risk")
              .length,
          )}
          detail="Repeat buyers inactive for 21+ days."
        />
      </section>

      <FilterToolbar
        searchPlaceholder="Search by name, phone, WhatsApp, source channel, or notes"
        chips={[
          { key: "status", label: "All customers" },
          { key: "status", label: "New", value: "new" },
          { key: "status", label: "Repeat", value: "repeat" },
          { key: "status", label: "At-risk", value: "at_risk" },
          { key: "status", label: "Lost", value: "lost" },
          { key: "sourceChannel", label: "WhatsApp", value: "WhatsApp" },
          { key: "sourceChannel", label: "Instagram", value: "Instagram" },
          { key: "sourceChannel", label: "Facebook", value: "Facebook" },
          { key: "sort", label: "Sort: LTV", value: "ltv" },
          { key: "sort", label: "Sort: Last order", value: "last_order" },
          { key: "sort", label: "Sort: Total orders", value: "total_orders" },
          {
            key: "sort",
            label: "Sort: Days since order",
            value: "days_since_last_order",
          },
        ]}
      />

      <SectionCard
        title="Customer records"
        description="Desktop table with mobile cards for quick customer actions."
      >
        <div className="hidden lg:block">
          {customerRecords.length ? (
            <DataTable
              headers={[
                "Customer",
                "Phone",
                "Location",
                "Last order",
                "Days since last order",
                "Total spend",
                "Buyer status",
                "Action",
              ]}
            >
              {customerRecords.map((customer) => (
                <DataRow key={customer.id}>
                  <DataCell>
                    <p className="font-semibold">
                      {getPrimaryOrderLabel({
                        customerName: customer.name,
                        customerPhone: customer.phone,
                        kind: "customer",
                      })}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
                      {customer.totalOrders} total orders
                    </p>
                  </DataCell>
                  <DataCell>{customer.phone}</DataCell>
                  <DataCell>{customer.location}</DataCell>
                  <DataCell>
                    <span className="text-xs text-[var(--color-wb-text-muted)]">
                      {formatDate(customer.lastOrderAt)}
                    </span>
                  </DataCell>
                  <DataCell>
                    <span className="text-sm font-semibold text-[var(--color-wb-text)]">
                      {customer.daysSinceLastOrder || 0} days
                    </span>
                  </DataCell>
                  <DataCell>
                    <span className="font-semibold text-[var(--color-wb-primary)]">
                      {formatCurrency(customer.totalSpend)}
                    </span>
                  </DataCell>
                  <DataCell>
                    <BuyerBadge status={customer.buyerStatus} compact />
                  </DataCell>
                  <DataCell compact>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="text-sm font-semibold text-[var(--color-wb-primary)] hover:underline"
                      >
                        View
                      </Link>
                      <span className="text-[var(--color-wb-text-muted)]">•</span>
                      <Link
                        href={`/customers/${customer.id}/edit`}
                        className="text-sm font-semibold text-[var(--color-wb-primary)] hover:underline"
                      >
                        Edit
                      </Link>
                    </div>
                  </DataCell>
                </DataRow>
              ))}
            </DataTable>
          ) : (
            <EmptyState
              title="No customers yet"
              detail="Start by adding your first customer or creating an order."
              action={
                <Link href="/customers/new" className="wb-button-secondary">
                  Add customer
                </Link>
              }
            />
          )}
        </div>

        <div className="space-y-3 lg:hidden">
          {customerRecords.length ? (
            customerRecords.map((customer) => (
              <CustomerRow
                key={customer.id}
                customer={customer}
                actionHref={`/customers/${customer.id}`}
                actionLabel="View"
              />
            ))
          ) : (
            <EmptyState
              title="No customers yet"
              detail="Start by adding your first customer or creating an order."
            />
          )}
        </div>
      </SectionCard>
    </div>
  );
}
