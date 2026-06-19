"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Cake,
  Candy,
  Clock,
  Coffee,
  Cookie,
  GlassWater,
  Hamburger,
  Loader2,
  Minus,
  Plus,
  Receipt,
  Trash2,
  X,
} from "lucide-react";
import { ProductThumbnail } from "@/components/ui/ProductThumbnail";
import { useMenu } from "@/hooks/useMenu";
import { useSessionOrders } from "@/hooks/useSessionOrders";
import {
  formatCurrency,
  formatDateTimeFromIso,
} from "@/lib/format";
import { mapSessionOrders } from "@/lib/mapSessionOrders";
import {
  addOrderItem,
  decreaseOrderItem,
  deleteOrderItem,
} from "@/services/orders";
import { useAddOrderModalStore } from "@/stores/addOrderModalStore";
import type { MenuProduct } from "@/types/order";
import { cn } from "@/lib/utils";

const categoryIconsByName: Record<string, React.ReactNode> = {
  "Soğuk İçecekler": <GlassWater className="h-4 w-4" />,
  "Sıcak İçecekler": <Coffee className="h-4 w-4" />,
  Bisküviler: <Cookie className="h-4 w-4" />,
  Çikolatalar: <Candy className="h-4 w-4" />,
  "Fast Food": <Hamburger className="h-4 w-4" />,
  Kekler: <Cake className="h-4 w-4" />,
};

export function AddOrderModal() {
  const queryClient = useQueryClient();
  const { table, isOpen, close } = useAddOrderModalStore();
  const { data: menu, isLoading: menuLoading } = useMenu();
  const {
    data: sessionOrders = [],
    isLoading: ordersLoading,
  } = useSessionOrders(table?.sessionId, isOpen);

  const [activeCategoryId, setActiveCategoryId] = useState(1);
  const [note, setNote] = useState("");

  const invalidateOrderData = () => {
    queryClient.invalidateQueries({ queryKey: ["session-orders"] });
    queryClient.invalidateQueries({ queryKey: ["devices"] });
    queryClient.invalidateQueries({ queryKey: ["session-checkout"] });
  };

  const addItemMutation = useMutation({
    mutationFn: addOrderItem,
    onSuccess: invalidateOrderData,
  });

  const decreaseItemMutation = useMutation({
    mutationFn: decreaseOrderItem,
    onSuccess: invalidateOrderData,
  });

  const deleteItemMutation = useMutation({
    mutationFn: deleteOrderItem,
    onSuccess: invalidateOrderData,
  });

  const isOrderMutating =
    addItemMutation.isPending ||
    decreaseItemMutation.isPending ||
    deleteItemMutation.isPending;

  useEffect(() => {
    if (isOpen) {
      setNote("");
      setActiveCategoryId(1);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isOrderMutating) {
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close, isOrderMutating]);

  useEffect(() => {
    if (menu?.categories.length && isOpen) {
      setActiveCategoryId(menu.categories[0].id);
    }
  }, [menu?.categories, isOpen]);

  const categoryList = menu?.categories ?? [];
  const productList = menu?.products ?? [];

  const cart = useMemo(
    () => mapSessionOrders(sessionOrders, productList),
    [sessionOrders, productList],
  );

  const filteredProducts = useMemo(
    () => productList.filter((p) => p.categoryId === activeCategoryId),
    [productList, activeCategoryId],
  );

  const orderSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  if (!isOpen || !table) return null;

  const isPS = table.type === "playstation";
  const accentClass = isPS ? "text-[#818cf8]" : "text-[#60a5fa]";
  const accentBg = isPS ? "bg-[#6366f1]" : "bg-[#3b82f6]";
  const tableTotal = table.grandTotal;

  const addProduct = (product: MenuProduct) => {
    if (product.stockQty <= 0 || !table.sessionId || isOrderMutating) return;

    addItemMutation.mutate({
      sessionId: table.sessionId,
      productId: product.id,
      quantity: 1,
    });
  };

  const increaseItem = (productId: number) => {
    if (!table.sessionId || isOrderMutating) return;

    addItemMutation.mutate({
      sessionId: table.sessionId,
      productId,
      quantity: 1,
    });
  };

  const decreaseItem = (productId: number) => {
    if (!table.sessionId || isOrderMutating) return;

    decreaseItemMutation.mutate({
      sessionId: table.sessionId,
      productId,
    });
  };

  const removeItem = (orderItemId: number) => {
    if (isOrderMutating) return;
    deleteItemMutation.mutate(orderItemId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={close}
        aria-label="Kapat"
      />

      <div className="relative z-10 flex h-[min(96vh,1000px)] w-full max-w-[1320px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e14] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <h2 className="text-lg font-semibold text-white">{table.name}</h2>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                AÇIK
              </span>
            </div>
            <p className="mt-1 text-xs text-white/40">
              Açılış Saati: {formatDateTimeFromIso(table.startedAt)} • Süre:{" "}
              {table.elapsedText}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/5 hover:text-white/80"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          {/* Left: categories + products */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:border-r lg:border-white/5">
            <div className="flex gap-1 overflow-x-auto border-b border-white/5 px-4 py-3">
              {categoryList.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    activeCategoryId === cat.id
                      ? cn(accentBg, "text-white")
                      : "text-white/45 hover:bg-white/5 hover:text-white/70",
                  )}
                >
                  {categoryIconsByName[cat.name] ?? (
                    <GlassWater className="h-4 w-4" />
                  )}
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {menuLoading ? (
                <div className="flex h-full min-h-[280px] items-center justify-center text-white/40">
                  Yükleniyor...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex h-full min-h-[280px] items-center justify-center text-sm text-white/30">
                  Bu kategoride ürün yok
                </div>
              ) : (
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 lg:gap-3 xl:grid-cols-5">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addProduct(product)}
                    disabled={product.stockQty <= 0}
                    className={cn(
                      "group relative flex w-full overflow-hidden rounded-xl border border-white/10 bg-[#12121e] text-left transition-all hover:border-[#6366f1]/40 hover:shadow-[0_0_16px_rgba(99,102,241,0.12)]",
                      "flex-col gap-1.5 p-2.5 lg:gap-0 lg:p-0",
                      product.stockQty <= 0 && "cursor-not-allowed opacity-40",
                    )}
                  >
                    <div className="relative hidden aspect-[3/4] w-full lg:block">
                      <ProductThumbnail
                        name={product.name}
                        imageUrl={product.imageUrl}
                        imageColor={product.imageColor}
                        className="absolute inset-0 rounded-none"
                        imageClassName="object-cover p-0"
                      />
                      <div
                        className={cn(
                          "absolute right-1.5 bottom-1.5 flex h-6 w-6 items-center justify-center rounded-md text-white opacity-90 shadow-md",
                          accentBg,
                        )}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 lg:w-full lg:shrink-0 lg:border-t lg:border-white/5 lg:px-2 lg:py-1.5">
                      <p className="line-clamp-2 text-xs font-medium leading-snug text-white lg:truncate lg:text-xs">
                        {product.name}
                      </p>
                      <p className={cn("mt-1 text-xs font-semibold lg:mt-0.5 lg:text-sm", accentClass)}>
                        ₺{product.price}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center self-end rounded-lg text-white lg:hidden",
                        accentBg,
                      )}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </div>
                  </button>
                ))}
              </div>
              )}
            </div>
          </div>

          {/* Right: order list */}
          <div className="flex max-h-[28vh] min-h-[130px] shrink-0 flex-col border-t border-white/5 bg-[#0a0d12] lg:max-h-none lg:min-h-0 lg:w-[360px] lg:flex-none">
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-2 lg:py-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">Sipariş Listesi</h3>
                <span
                  className={cn(
                    "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white",
                    accentBg,
                  )}
                >
                  {cart.length}
                </span>
              </div>
              {ordersLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-white/30" />
              )}
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-2 lg:p-3">
              {ordersLoading ? (
                <div className="flex h-20 items-center justify-center text-sm text-white/30 lg:h-32">
                  Siparişler yükleniyor...
                </div>
              ) : cart.length === 0 ? (
                <p className="py-4 text-center text-xs text-white/25 lg:py-8 lg:text-sm">
                  Ürüne tıklayarak sipariş ekleyin
                </p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.orderItemId}
                    className="flex items-center gap-2 rounded-xl border border-white/5 bg-[#12121e] p-2.5"
                  >
                    <ProductThumbnail
                      name={item.name}
                      imageUrl={item.imageUrl}
                      imageColor={item.imageColor}
                      className="hidden h-10 w-10 shrink-0 lg:block"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">{item.name}</p>
                      <p className="text-xs text-white/40">₺{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => decreaseItem(item.productId)}
                        disabled={isOrderMutating}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 text-white/50 hover:text-white disabled:opacity-40"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center text-sm text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => increaseItem(item.productId)}
                        disabled={isOrderMutating}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 text-white/50 hover:text-white disabled:opacity-40"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="w-14 text-right text-sm font-medium text-white">
                      ₺{formatCurrency(item.price * item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.orderItemId)}
                      disabled={isOrderMutating}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-rose-400/60 hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-40"
                      aria-label={`${item.name} sil`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-white/5 p-2.5 lg:p-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/45">Ara Toplam</span>
                <span className={cn("font-semibold", accentClass)}>
                  ₺{formatCurrency(orderSubtotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer — desktop only; mobile uses header X to close */}
        <div className="hidden border-t border-white/5 px-5 py-4 lg:block">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto_auto] lg:items-end">
            <div>
              <p className="mb-1.5 text-xs text-white/40">Not Ekle (Opsiyonel)</p>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Notunuzu buraya yazabilirsiniz..."
                className="w-full rounded-xl border border-white/10 bg-[#12121e] px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#6366f1]/50"
              />
            </div>

            <div className="rounded-xl border border-white/10 bg-[#12121e] px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Clock className="h-3.5 w-3.5" />
                Oyun Süresi
              </div>
              <p className="mt-1 font-mono text-sm text-white">{table.elapsedText}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#12121e] px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Receipt className="h-3.5 w-3.5" />
                Sipariş Toplamı
              </div>
              <p className={cn("mt-1 text-lg font-bold", accentClass)}>
                ₺{formatCurrency(orderSubtotal)}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#12121e] px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Receipt className="h-3.5 w-3.5" />
                Masa Toplamı
              </div>
              <p className="mt-1 text-lg font-bold text-white">
                ₺{formatCurrency(tableTotal)}
              </p>
            </div>

            <button
              type="button"
              onClick={close}
              className="rounded-xl border border-white/10 bg-[#12121e] px-5 py-3 text-sm font-medium text-white/70 transition-colors hover:border-white/20 hover:text-white lg:col-start-4"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
