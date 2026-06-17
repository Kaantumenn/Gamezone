import { api } from "@/lib/api";
import { buildProductFormData } from "@/lib/productForm";
import type { ApiCategory, ApiProduct } from "@/types/order";
import type { ProductFormValues } from "@/types/product";

export async function fetchCategories(): Promise<ApiCategory[]> {
  const { data } = await api.get<ApiCategory[]>("/categories");
  return data;
}

export async function fetchProducts(): Promise<ApiProduct[]> {
  const { data } = await api.get<ApiProduct[]>("/products");
  return data;
}

export async function createProduct(values: ProductFormValues): Promise<ApiProduct> {
  const formData = buildProductFormData(values);
  const { data } = await api.post<ApiProduct>("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateProduct(
  id: number,
  values: Partial<ProductFormValues>,
): Promise<ApiProduct> {
  const formData = buildProductFormData(values);
  const { data } = await api.patch<ApiProduct>(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/products/${id}`);
}
