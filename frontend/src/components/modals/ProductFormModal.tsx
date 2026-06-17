"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, X } from "lucide-react";
import { productToFormValues } from "@/lib/productForm";
import { createProduct, updateProduct } from "@/services/products";
import type { ApiCategory, ApiProduct } from "@/types/order";
import type { ProductFormValues } from "@/types/product";
import { getEmptyProductForm } from "@/types/product";
import { cn } from "@/lib/utils";

interface ProductFormModalProps {
  mode: "create" | "edit";
  product: ApiProduct | null;
  categories: ApiCategory[];
  defaultCategoryId: number;
  isOpen: boolean;
  onClose: () => void;
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#12121e] px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#6366f1]/50";

export function ProductFormModal({
  mode,
  product,
  categories,
  defaultCategoryId,
  isOpen,
  onClose,
}: ProductFormModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProductFormValues>(() =>
    getEmptyProductForm(defaultCategoryId),
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      if (mode === "create") {
        return createProduct(values);
      }
      if (!product) throw new Error("Ürün bulunamadı");
      return updateProduct(product.id, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      onClose();
    },
    onError: () => {
      setSubmitError(
        mode === "create"
          ? "Ürün eklenirken bir hata oluştu."
          : "Ürün güncellenirken bir hata oluştu.",
      );
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && product) {
      setForm(productToFormValues(product));
      setImagePreview(product.imageUrl);
    } else {
      setForm(getEmptyProductForm(defaultCategoryId));
      setImagePreview(null);
    }
    setSubmitError(null);
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, mode, product, defaultCategoryId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !mutation.isPending) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, mutation.isPending]);

  if (!isOpen) return null;

  const handleImageChange = (file: File | null) => {
    setForm((prev) => ({ ...prev, image: file }));
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else if (mode === "edit" && product?.imageUrl) {
      setImagePreview(product.imageUrl);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!form.name.trim()) {
      setSubmitError("Ürün adı zorunludur.");
      return;
    }
    if (!form.salePrice.trim() || Number.isNaN(Number(form.salePrice))) {
      setSubmitError("Geçerli bir satış fiyatı girin.");
      return;
    }

    mutation.mutate({
      ...form,
      name: form.name.trim(),
      salePrice: String(Number(form.salePrice)),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !mutation.isPending && onClose()}
        aria-label="Kapat"
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e14] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">
            {mode === "create" ? "Yeni Ürün Ekle" : "Ürünü Düzenle"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/5 hover:text-white/80 disabled:opacity-50"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-5">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-white/40">Kategori</label>
              <select
                value={form.categoryId}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    categoryId: Number(e.target.value),
                  }))
                }
                className={cn(inputClass, "cursor-pointer")}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[#12121e]">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-white/40">Ürün Adı</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Örn: Coca-Cola"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs text-white/40">
                  Satış Fiyatı (₺)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.salePrice}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, salePrice: e.target.value }))
                  }
                  placeholder="75"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-white/40">Barkod</label>
                <input
                  type="text"
                  value={form.barcode}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, barcode: e.target.value }))
                  }
                  placeholder="Opsiyonel"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs text-white/40">Stok Adedi</label>
                <input
                  type="number"
                  min="0"
                  value={form.stockQty}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      stockQty: Number(e.target.value),
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-white/40">
                  Min. Stok Uyarısı
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.minStockQty}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      minStockQty: Number(e.target.value),
                    }))
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-white/40">Ürün Görseli</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center gap-3 rounded-xl border border-dashed border-white/15 bg-[#12121e] p-3 text-left transition-colors hover:border-[#6366f1]/40"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#0b0e14]">
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        imagePreview.startsWith("blob:") ||
                        imagePreview.startsWith("http")
                          ? imagePreview
                          : imagePreview.startsWith("/")
                            ? imagePreview
                            : `/${imagePreview}`
                      }
                      alt="Önizleme"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImagePlus className="h-5 w-5 text-white/30" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-white/70">
                    {form.image ? form.image.name : "Görsel seç veya sürükle"}
                  </p>
                  <p className="mt-0.5 text-xs text-white/30">PNG, JPG — opsiyonel</p>
                </div>
              </button>
            </div>
          </div>

          {submitError && (
            <p className="mt-4 text-sm text-rose-400">{submitError}</p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="flex-1 rounded-xl border border-white/10 bg-[#12121e] py-2.5 text-sm font-medium text-white/70 hover:text-white disabled:opacity-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#6366f1] py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:bg-[#5558e3] disabled:opacity-60"
            >
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? "Ürün Ekle" : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
