import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchProducts } from "@/services/products";
import type { ApiCategory, ApiProduct } from "@/types/order";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 60_000,
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 30_000,
  });
}

export function useProductsStock() {
  const categoriesQuery = useCategories();
  const productsQuery = useProducts();

  const categories = (categoriesQuery.data ?? [])
    .filter((c) => c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const products = productsQuery.data ?? [];

  return {
    categories,
    products,
    isLoading: categoriesQuery.isLoading || productsQuery.isLoading,
    isError: categoriesQuery.isError || productsQuery.isError,
    refetch: () => Promise.all([categoriesQuery.refetch(), productsQuery.refetch()]),
  };
}

export function filterProductsByCategory(
  products: ApiProduct[],
  categoryId: number,
): ApiProduct[] {
  return products
    .filter((p) => p.categoryId === categoryId)
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));
}

export type { ApiCategory, ApiProduct };
