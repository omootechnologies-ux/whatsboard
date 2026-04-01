import { Boxes, MessageCircle } from "lucide-react";
import CatalogProductForm from "@/components/forms/catalog-product-form";
import { updateCatalogStockAction } from "@/app/dashboard/actions";
import { getDashboardWriteAccess, requireDashboardFeatureAccess } from "@/lib/dashboard-access";
import { getCatalogProductsData } from "@/lib/queries";
import {
  DashboardBadge,
  DashboardEmptyState,
  DashboardHero,
  DashboardPage,
  DashboardPanel,
  DashboardPanelHeader,
} from "@/components/dashboard/page-primitives";
import { formatTZS } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getWhatsAppShareLink(
  businessName: string | null | undefined,
  product: {
    name: string;
    description: string;
    price: number;
    stockCount: number;
  }
) {
  const message = [
    `Hi, here is a product from ${businessName || "our store"}.`,
    `${product.name}`,
    product.description ? product.description : null,
    `Price: ${formatTZS(product.price)}`,
    `Stock left: ${product.stockCount}`,
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export default async function CatalogPage() {
  await requireDashboardFeatureAccess("catalog");
  const { canManageRecords } = await getDashboardWriteAccess();
  const { business, products, setupRequired } = await getCatalogProductsData();

  return (
    <DashboardPage>
      <DashboardHero
        eyebrow="Catalog"
        title="Keep reusable product details in one clean catalog."
        description="Save product photos, prices, and stock counts in one place, then generate a WhatsApp-ready share link in seconds."
        aside={
          <div className="flex items-start gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Boxes className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Catalog coverage</p>
              <p className="mt-1 text-xs text-muted-foreground">Products your team can reuse and share.</p>
              <p className="mt-5 text-3xl font-black tracking-tight text-foreground">{products.length}</p>
              <p className="mt-2 text-sm text-muted-foreground">Products currently saved.</p>
            </div>
          </div>
        }
      />

      <CatalogProductForm canManageRecords={canManageRecords} />

      {setupRequired ? (
        <div className="rounded-2xl border border-[#e9d4d1] bg-[#f9efed] px-4 py-3 text-sm text-[#8f3e36]">
          Catalog database setup is not applied yet. Run the latest Supabase migration to enable persistent catalog storage.
        </div>
      ) : null}

      <DashboardPanel>
        <DashboardPanelHeader
          eyebrow="Saved products"
          title="Catalog inventory"
          description="A clearer product list with pricing, stock, visibility, and a WhatsApp share shortcut."
        />
        <div className="mt-5 space-y-4">
          {products.length ? (
            products.map((product) => (
              <div key={product.id} className="grid gap-4 rounded-[24px] border border-border bg-secondary/40 p-4 lg:grid-cols-[120px_minmax(0,1fr)_240px]">
                <div className="overflow-hidden rounded-2xl bg-card">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-[120px] w-full object-cover" />
                  ) : (
                    <div className="flex h-[120px] items-center justify-center text-xs text-muted-foreground">No image</div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold text-foreground">{product.name}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{product.description || "No description yet."}</p>
                    </div>
                    <DashboardBadge tone={product.isActive ? "success" : "neutral"}>
                      {product.isActive ? "Active" : "Hidden"}
                    </DashboardBadge>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-card p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Price</p>
                      <p className="mt-2 font-semibold text-foreground">{formatTZS(product.price)}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Stock</p>
                      <p className="mt-2 font-semibold text-foreground">{product.stockCount}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Share</p>
                      <a
                        href={getWhatsAppShareLink(business?.name, product)}
                        target="_blank"
                        className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-[#0a3d2e]"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp link
                      </a>
                    </div>
                  </div>
                </div>

                <form action={updateCatalogStockAction.bind(null, product.id)} className="grid gap-3 rounded-2xl border border-border bg-card p-4">
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-foreground">Stock</span>
                    <input
                      name="stockCount"
                      type="number"
                      min="0"
                      defaultValue={product.stockCount}
                      className="h-11 rounded-2xl border border-border px-4 text-foreground"
                    />
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/50 px-4 py-3">
                    <input type="checkbox" name="isActive" defaultChecked={product.isActive} className="h-4 w-4" />
                    <span className="text-sm font-semibold text-foreground">Visible in catalog</span>
                  </label>
                  <button className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0a3d2e]">
                    Update
                  </button>
                </form>
              </div>
            ))
          ) : (
            <DashboardEmptyState
              title="No catalog products yet"
              description="Add your first product above to start reusing product details and share links."
            />
          )}
        </div>
      </DashboardPanel>
    </DashboardPage>
  );
}
