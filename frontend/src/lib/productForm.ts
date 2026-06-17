import type { ApiProduct } from "@/types/order";
import type { ProductFormValues } from "@/types/product";

export function buildProductFormData(
  values: Partial<ProductFormValues>,
): FormData {
  const formData = new FormData();

  if (values.categoryId !== undefined) {
    formData.append("categoryId", String(values.categoryId));
  }
  if (values.name !== undefined) {
    formData.append("name", values.name);
  }
  if (values.salePrice !== undefined) {
    formData.append("salePrice", values.salePrice);
  }
  if (values.stockQty !== undefined) {
    formData.append("stockQty", String(values.stockQty));
  }
  if (values.minStockQty !== undefined) {
    formData.append("minStockQty", String(values.minStockQty));
  }
  if (values.barcode !== undefined && values.barcode.trim()) {
    formData.append("barcode", values.barcode.trim());
  }
  if (values.image) {
    formData.append("image", values.image);
  }

  return formData;
}

export function productToFormValues(product: ApiProduct): ProductFormValues {
  return {
    categoryId: product.categoryId,
    name: product.name,
    salePrice: product.salePrice,
    stockQty: product.stockQty,
    minStockQty: product.minStockQty,
    barcode: product.barcode ?? "",
    image: null,
  };
}
