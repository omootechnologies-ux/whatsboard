import Link from "next/link";
import { Plus } from "lucide-react";
import {
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
          label="VIP buyers"
          value={String(
            customerRecords.filter((customer) => customer.status === "vip")
              .length,
          )}
          detail="High-value customers worth active follow-up."
        />
        <KpiCard
          label="Waiting sellers"
          value={String(
            customerRecords.filter((customer) => customer.status === "waiting")
              .length,
          )}
          detail="Customers still waiting for next action."
        />
      </section>

      <FilterToolbar
        searchPlaceholder="Search by name, phone, city, or last order"
        chips={[
          { key: "status", label: "All customers" },
          { key: "status", label: "VIP", value: "vip" },
          { key: "status", label: "Waiting", value: "waiting" },
          { key: "status", label: "Active", value: "active" },
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
                "Total spend",
                "Status",
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
                    <span className="font-semibold text-[var(--color-wb-primary)]">
                      {formatCurrency(customer.totalSpend)}
                    </span>
                  </DataCell>
                  <DataCell>
                    <span className="rounded-full border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] px-3 py-1 text-xs font-semibold capitalize text-[var(--color-wb-text-muted)]">
                      {customer.status}
                    </span>
                  </DataCell>
                  <DataCell compact>
                    <Link
                      href={`/customers/${customer.id}/edit`}
                      className="text-sm font-semibold text-[var(--color-wb-primary)] hover:underline"
                    >
                      Edit
                    </Link>
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
                actionHref={`/customers/${customer.id}/edit`}
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
