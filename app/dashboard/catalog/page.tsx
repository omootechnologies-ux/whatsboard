import { Boxes, MessageCircle } from "lucide-react";
import CatalogProductForm from "@/components/forms/catalog-product-form";
import { updateCatalogStockAction } from "@/app/dashboard/actions";
import { getCatalogProductsData } from "@/lib/queries";
import { formatTZS } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getWhatsAppShareLink(businessName: string | null | undefined, product: {
  name: string;
  description: string;
  price: number;
  stockCount: number;
}) {
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
  const { business, products } = await getCatalogProductsData();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 2xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#08192d] p-6 text-white shadow-[0_24px_100px_rgba(2,8,23,0.28)] sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-200/80">Catalog</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Product catalog builder</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
            Save product photos, prices, and stock counts in one place, then generate a WhatsApp-ready share link in seconds.
          </p>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Boxes className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Catalog coverage</p>
              <p className="text-xs text-slate-500">Products your team can reuse and share</p>
            </div>
          </div>
          <p className="mt-5 text-3xl font-black tracking-tight text-slate-950">{products.length} products</p>
        </div>
      </section>

      <CatalogProductForm />

      <section className="space-y-4">
        {products.length ? (
          products.map((product) => (
            <div key={product.id} className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[120px_1fr_auto]">
              <div className="overflow-hidden rounded-2xl bg-slate-100">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-[120px] w-full object-cover" />
                ) : (
                  <div className="flex h-[120px] items-center justify-center text-xs text-slate-400">No image</div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{product.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{product.description || "No description yet."}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {product.isActive ? "Active" : "Hidden"}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Price</p>
                    <p className="mt-2 font-semibold text-slate-900">{formatTZS(product.price)}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Stock</p>
                    <p className="mt-2 font-semibold text-slate-900">{product.stockCount}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Share</p>
                    <a
                      href={getWhatsAppShareLink(business?.name, product)}
                      target="_blank"
                      className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp link
                    </a>
                  </div>
                </div>
              </div>

              <form action={updateCatalogStockAction.bind(null, product.id)} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:w-[220px]">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">Stock</span>
                  <input
                    name="stockCount"
                    type="number"
                    min="0"
                    defaultValue={product.stockCount}
                    className="h-11 rounded-2xl border border-slate-300 px-4 text-slate-900"
                  />
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <input type="checkbox" name="isActive" defaultChecked={product.isActive} className="h-4 w-4" />
                  <span className="text-sm font-semibold text-slate-700">Visible in catalog</span>
                </label>
                <button className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">Update</button>
              </form>
            </div>
          ))
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-4 py-14 text-center text-sm text-slate-500">
            No catalog products yet.
          </div>
        )}
      </section>
    </div>
  );
}
