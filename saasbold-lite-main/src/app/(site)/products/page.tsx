import { Package2 } from "lucide-react";
import { getLocale } from "next-intl/server";
import {
  DataCell,
  DataRow,
  DataTable,
  EmptyState,
  KpiCard,
  PageHeader,
  SectionCard,
} from "@/components/whatsboard-dashboard/dashboard-ui";
import {
  formatCurrency,
  formatDate,
} from "@/components/whatsboard-dashboard/formatting";
import { resolveLegacyBusinessIdForRequest } from "@/lib/repositories/supabase-legacy-repository";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { translateUiText } from "@/lib/ui-translations";

export const dynamic = "force-dynamic";

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number | string | null;
  stock_count: number | string | null;
  is_active: boolean | null;
  updated_at: string | null;
};

function asNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export default async function ProductsPage() {
  const locale = await getLocale();
  const tr = (value: string) => translateUiText(value, locale as "en" | "sw");
  const businessId = await resolveLegacyBusinessIdForRequest();
  const client = createSupabaseServiceClient();
  const { data, error } = await client
    .from("catalog_products")
    .select("id,name,description,price,stock_count,is_active,updated_at")
    .eq("business_id", businessId)
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(`Failed to load products: ${JSON.stringify(error)}`);
  }

  const products = (data || []) as ProductRow[];
  const activeCount = products.filter((product) => product.is_active).length;
  const inactiveCount = products.length - activeCount;
  const totalCatalogValue = products.reduce(
    (sum, product) =>
      sum + asNumber(product.price) * asNumber(product.stock_count || 0),
    0,
  );

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title={tr("Products")}
        description={tr(
          "Manage your catalog with real stock and pricing visibility linked to your business.",
        )}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard
          label={tr("Catalog products")}
          value={String(products.length)}
          detail={tr("Products currently tracked in your business catalog.")}
          accent={<Package2 className="h-5 w-5" />}
        />
        <KpiCard
          label={tr("Active products")}
          value={String(activeCount)}
          detail={`${inactiveCount} ${tr("inactive products currently hidden.")}`}
          accent={<Package2 className="h-5 w-5" />}
        />
        <KpiCard
          label={tr("Catalog value")}
          value={formatCurrency(totalCatalogValue)}
          detail={tr("Estimated based on current listed price and stock count.")}
          accent={<Package2 className="h-5 w-5" />}
        />
      </section>

      <SectionCard
        title={tr("Catalog table")}
        description={tr("Live catalog rows from Supabase. No template/demo data.")}
      >
        {products.length ? (
          <>
            <div className="hidden md:block">
              <DataTable
                headers={[
                  tr("Product"),
                  tr("Price"),
                  tr("Stock"),
                  tr("Status"),
                  tr("Last updated"),
                ]}
              >
                {products.map((product) => (
                  <DataRow key={product.id}>
                    <DataCell>
                      <p className="font-semibold text-[var(--color-wb-text)]">
                        {product.name}
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
                        {product.description || tr("No description")}
                      </p>
                    </DataCell>
                    <DataCell>
                      <span className="font-semibold text-[var(--color-wb-primary)]">
                        {formatCurrency(asNumber(product.price))}
                      </span>
                    </DataCell>
                    <DataCell>{asNumber(product.stock_count)}</DataCell>
                    <DataCell>
                      <span className="rounded-full border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] px-3 py-1 text-xs font-semibold capitalize text-[var(--color-wb-text-muted)]">
                        {product.is_active ? tr("active") : tr("inactive")}
                      </span>
                    </DataCell>
                    <DataCell>
                      <span className="text-xs text-[var(--color-wb-text-muted)]">
                        {product.updated_at
                          ? formatDate(product.updated_at)
                          : tr("N/A")}
                      </span>
                    </DataCell>
                  </DataRow>
                ))}
              </DataTable>
            </div>

            <div className="space-y-3 md:hidden">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="rounded-[22px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--color-wb-text)]">
                        {product.name}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
                        {product.description || tr("No description")}
                      </p>
                    </div>
                    <span className="rounded-full border border-[var(--color-wb-border)] bg-white px-3 py-1 text-xs font-semibold capitalize text-[var(--color-wb-text-muted)]">
                      {product.is_active ? tr("active") : tr("inactive")}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-wb-text-muted)]">
                        {tr("Price")}
                      </p>
                      <p className="mt-1 font-semibold text-[var(--color-wb-primary)]">
                        {formatCurrency(asNumber(product.price))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-wb-text-muted)]">
                        {tr("Stock")}
                      </p>
                      <p className="mt-1 font-semibold text-[var(--color-wb-text)]">
                        {asNumber(product.stock_count)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-[var(--color-wb-text-muted)]">
                    Updated{" "}
                    {product.updated_at
                      ? formatDate(product.updated_at)
                      : tr("N/A")}
                  </p>
                </article>
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            title={tr("No products yet")}
            detail={tr(
              "Your catalog is empty. Add products through your product creation flow to populate this table.",
            )}
          />
        )}
      </SectionCard>
    </div>
  );
}
