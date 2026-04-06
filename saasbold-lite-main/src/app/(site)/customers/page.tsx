import Link from "next/link";
import { Plus } from "lucide-react";
import { getLocale } from "next-intl/server";
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
  const locale = await getLocale();
  const isSw = locale === "sw";
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
        title={isSw ? "Wateja" : "Customers"}
        description={
          isSw
            ? "Rekodi za wateja zilizounganishwa na orders, follow-ups, na historia ya matumizi ili mauzo ya kurudia yasimamiwe kwa urahisi."
            : "Customer records connected to orders, follow-ups, and spend history so repeat sales are easier to manage."
        }
        primaryAction={
          <Link href="/customers/new" className="wb-button-primary">
            <Plus className="h-4 w-4" />
            {isSw ? "Ongeza Mteja" : "Add Customer"}
          </Link>
        }
      />

      {query.created === "1" || query.updated === "1" ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
          {query.created === "1"
            ? isSw
              ? "Mteja ameundwa kikamilifu."
              : "Customer created successfully."
            : isSw
              ? "Mteja amehaririwa kikamilifu."
              : "Customer updated successfully."}
        </div>
      ) : null}

      {query.error === "not-found" ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
          {isSw ? "Mteja hakupatikana." : "Customer was not found."}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard
          label={isSw ? "Wateja wanaofuatiliwa" : "Tracked customers"}
          value={String(customerRecords.length)}
          detail={
            isSw
              ? "Rekodi zilizochukuliwa kutoka shughuli za kila siku za mauzo."
              : "Records captured from daily selling activity."
          }
        />
        <KpiCard
          label={isSw ? "Wanunuzi wa kurudia" : "Repeat buyers"}
          value={String(
            customerRecords.filter((customer) => customer.buyerStatus === "repeat")
              .length,
          )}
          detail={
            isSw
              ? "Wateja wenye order 2 au zaidi."
              : "Customers with 2+ recorded orders."
          }
        />
        <KpiCard
          label={isSw ? "Wanunuzi wa hatari" : "At-risk buyers"}
          value={String(
            customerRecords.filter((customer) => customer.buyerStatus === "at_risk")
              .length,
          )}
          detail={
            isSw
              ? "Wanunuzi wa kurudia wasio-active kwa siku 21+."
              : "Repeat buyers inactive for 21+ days."
          }
        />
      </section>

      <FilterToolbar
        searchPlaceholder={
          isSw
            ? "Tafuta kwa jina, simu, WhatsApp, channel au note"
            : "Search by name, phone, WhatsApp, source channel, or notes"
        }
        chips={[
          { key: "status", label: isSw ? "Wateja wote" : "All customers" },
          { key: "status", label: isSw ? "Mpya" : "New", value: "new" },
          { key: "status", label: isSw ? "Wa kurudia" : "Repeat", value: "repeat" },
          { key: "status", label: isSw ? "Wa hatari" : "At-risk", value: "at_risk" },
          { key: "status", label: isSw ? "Waliopotea" : "Lost", value: "lost" },
          { key: "sourceChannel", label: "WhatsApp", value: "WhatsApp" },
          { key: "sourceChannel", label: "Instagram", value: "Instagram" },
          { key: "sourceChannel", label: "Facebook", value: "Facebook" },
          { key: "sort", label: isSw ? "Panga: LTV" : "Sort: LTV", value: "ltv" },
          {
            key: "sort",
            label: isSw ? "Panga: Order ya mwisho" : "Sort: Last order",
            value: "last_order",
          },
          {
            key: "sort",
            label: isSw ? "Panga: Jumla ya order" : "Sort: Total orders",
            value: "total_orders",
          },
          {
            key: "sort",
            label: isSw ? "Panga: Siku tangu order" : "Sort: Days since order",
            value: "days_since_last_order",
          },
        ]}
      />

      <SectionCard
        title={isSw ? "Rekodi za wateja" : "Customer records"}
        description={
          isSw
            ? "Jedwali la desktop na kadi za simu kwa vitendo vya haraka vya mteja."
            : "Desktop table with mobile cards for quick customer actions."
        }
      >
        <div className="hidden lg:block">
          {customerRecords.length ? (
            <DataTable
              headers={[
                isSw ? "Mteja" : "Customer",
                isSw ? "Simu" : "Phone",
                isSw ? "Eneo" : "Location",
                isSw ? "Order ya mwisho" : "Last order",
                isSw ? "Siku tangu order ya mwisho" : "Days since last order",
                isSw ? "Jumla ya matumizi" : "Total spend",
                isSw ? "Hali ya mnunuzi" : "Buyer status",
                isSw ? "Kitendo" : "Action",
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
                      {isSw
                        ? `${customer.totalOrders} order kwa jumla`
                        : `${customer.totalOrders} total orders`}
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
                      {isSw
                        ? `${customer.daysSinceLastOrder || 0} siku`
                        : `${customer.daysSinceLastOrder || 0} days`}
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
                        {isSw ? "Tazama" : "View"}
                      </Link>
                      <span className="text-[var(--color-wb-text-muted)]">•</span>
                      <Link
                        href={`/customers/${customer.id}/edit`}
                        className="text-sm font-semibold text-[var(--color-wb-primary)] hover:underline"
                      >
                        {isSw ? "Hariri" : "Edit"}
                      </Link>
                    </div>
                  </DataCell>
                </DataRow>
              ))}
            </DataTable>
          ) : (
            <EmptyState
              title={isSw ? "Bado hakuna wateja" : "No customers yet"}
              detail={
                isSw
                  ? "Anza kwa kuongeza mteja wako wa kwanza au kuunda order."
                  : "Start by adding your first customer or creating an order."
              }
              action={
                <Link href="/customers/new" className="wb-button-secondary">
                  {isSw ? "Ongeza mteja" : "Add customer"}
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
                actionLabel={isSw ? "Tazama" : "View"}
              />
            ))
          ) : (
            <EmptyState
              title={isSw ? "Bado hakuna wateja" : "No customers yet"}
              detail={
                isSw
                  ? "Anza kwa kuongeza mteja wako wa kwanza au kuunda order."
                  : "Start by adding your first customer or creating an order."
              }
            />
          )}
        </div>
      </SectionCard>
    </div>
  );
}
