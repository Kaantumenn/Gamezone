"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Cake,
  Candy,
  Coffee,
  Cookie,
  GlassWater,
  Hamburger,
  Loader2,
  Package,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { ProductFormModal } from "@/components/modals/ProductFormModal";
import { ProductThumbnail } from "@/components/ui/ProductThumbnail";
import {
  filterProductsByCategory,
  useProductsStock,
} from "@/hooks/useProductsStock";
import { formatCurrency } from "@/lib/format";
import { canManageProducts } from "@/lib/permissions";
import { deleteProduct } from "@/services/products";
import { useAuthStore } from "@/stores/authStore";
import type { ApiProduct } from "@/types/order";
import { cn } from "@/lib/utils";

const categoryIconsByName: Record<string, React.ReactNode> = {
  "Soğuk İçecekler": <GlassWater className="h-4 w-4" />,
  "Sıcak İçecekler": <Coffee className="h-4 w-4" />,
  Bisküviler: <Cookie className="h-4 w-4" />,
  Çikolatalar: <Candy className="h-4 w-4" />,
  "Fast Food": <Hamburger className="h-4 w-4" />,
  Kekler: <Cake className="h-4 w-4" />,
};

const productColors = [
  "#b91c1c",
  "#ea580c",
  "#16a34a",
  "#ca8a04",
  "#d97706",
  "#854d0e",
  "#78350f",
  "#44403c",
  "#7c3aed",
  "#2563eb",
];

function getProductColor(id: number): string {
  return productColors[id % productColors.length];
}

function isLowStock(product: ApiProduct): boolean {
  return product.minStockQty > 0 && product.stockQty <= product.minStockQty;
}

export function ProductsStockContent() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const canManage = canManageProducts(user);
  const { categories, products, isLoading, isError } = useProductsStock();

  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiProduct | null>(null);

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      setDeleteTarget(null);
    },
  });

  useEffect(() => {
    if (categories.length && activeCategoryId === null) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  const filteredProducts = useMemo(() => {
    if (activeCategoryId === null) return [];
    return filterProductsByCategory(products, activeCategoryId);
  }, [products, activeCategoryId]);

  const openCreate = () => {
    setFormMode("create");
    setEditingProduct(null);
    setFormOpen(true);
  };

  const openEdit = (product: ApiProduct) => {
    setFormMode("edit");
    setEditingProduct(product);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6366f1]/15 text-[#818cf8]">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Ürünler / Stok</h1>
            <p className="text-sm text-white/40">
              Kategoriye göre ürün yönetimi ve stok takibi
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreate}
          disabled={!categories.length}
          className="flex items-center gap-2 rounded-xl bg-[#6366f1] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-colors hover:bg-[#5558e3] disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Ürün Ekle
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e14]">
        <div className="flex gap-1 overflow-x-auto border-b border-white/5 px-4 py-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategoryId(cat.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                activeCategoryId === cat.id
                  ? "bg-[#6366f1] text-white"
                  : "text-white/45 hover:bg-white/5 hover:text-white/70",
              )}
            >
              {categoryIconsByName[cat.name] ?? (
                <GlassWater className="h-4 w-4" />
              )}
              {cat.name}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  activeCategoryId === cat.id
                    ? "bg-white/20 text-white"
                    : "bg-white/5 text-white/40",
                )}
              >
                {products.filter((p) => p.categoryId === cat.id).length}
              </span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-white/40">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Yükleniyor...
            </div>
          ) : isError ? (
            <div className="flex h-48 items-center justify-center text-sm text-rose-400">
              Ürünler yüklenirken hata oluştu.
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-white/30">
              <Package className="mb-2 h-8 w-8" />
              <p className="text-sm">Bu kategoride ürün yok</p>
              <button
                type="button"
                onClick={openCreate}
                className="mt-3 text-sm text-[#818cf8] hover:text-white"
              >
                İlk ürünü ekle →
              </button>
            </div>
          ) : (
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="sticky top-0 z-10 bg-[#0b0e14] text-xs text-white/40">
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 font-medium">Ürün</th>
                  <th className="px-4 py-3 font-medium">Fiyat</th>
                  <th className="px-4 py-3 font-medium">Stok</th>
                  <th className="px-4 py-3 font-medium">Min. Stok</th>
                  <th className="px-4 py-3 font-medium">Barkod</th>
                  {canManage && (
                    <th className="px-4 py-3 text-right font-medium">İşlemler</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductThumbnail
                          name={product.name}
                          imageUrl={product.imageUrl}
                          imageColor={getProductColor(product.id)}
                          className="h-11 w-11 shrink-0"
                          imageClassName="object-cover p-0"
                        />
                        <div>
                          <p className="font-medium text-white">{product.name}</p>
                          {!product.isActive && (
                            <span className="text-[10px] text-white/30">Pasif</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#818cf8]">
                      ₺{formatCurrency(Number(product.salePrice))}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 font-medium",
                          isLowStock(product)
                            ? "text-amber-400"
                            : product.stockQty === 0
                              ? "text-rose-400"
                              : "text-white",
                        )}
                      >
                        {isLowStock(product) && (
                          <AlertTriangle className="h-3.5 w-3.5" />
                        )}
                        {product.stockQty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/50">
                      {product.minStockQty}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-white/40">
                      {product.barcode ?? "—"}
                    </td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(product)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/5 hover:text-[#818cf8]"
                            aria-label={`${product.name} düzenle`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(product)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-rose-500/10 hover:text-rose-400"
                            aria-label={`${product.name} sil`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ProductFormModal
        mode={formMode}
        product={editingProduct}
        categories={categories}
        defaultCategoryId={activeCategoryId ?? categories[0]?.id ?? 1}
        isOpen={formOpen}
        onClose={closeForm}
      />

      {canManage && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !deleteMutation.isPending && setDeleteTarget(null)}
            aria-label="Kapat"
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-[#0b0e14] p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Ürünü Sil</h3>
            <p className="mt-2 text-sm text-white/50">
              <span className="text-white">{deleteTarget.name}</span> ürününü
              silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            {deleteMutation.isError && (
              <p className="mt-3 text-sm text-rose-400">
                Silme işlemi başarısız oldu.
              </p>
            )}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-xl border border-white/10 bg-[#12121e] py-2.5 text-sm text-white/70 hover:text-white disabled:opacity-50"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
              >
                {deleteMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
