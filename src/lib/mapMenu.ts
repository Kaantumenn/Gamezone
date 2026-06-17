import type {
  ApiCategory,
  ApiProduct,
  MenuCategory,
  MenuData,
  MenuProduct,
} from "@/types/order";

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

export function mapApiProduct(product: ApiProduct): MenuProduct | null {
  if (!product.isActive) return null;

  return {
    id: product.id,
    name: product.name,
    price: Number(product.salePrice),
    categoryId: product.categoryId,
    stockQty: product.stockQty,
    imageUrl: product.imageUrl,
    imageColor: getProductColor(product.id),
  };
}

export function mapApiCategory(category: ApiCategory): MenuCategory | null {
  if (!category.isActive) return null;

  return {
    id: category.id,
    name: category.name,
    sortOrder: category.sortOrder,
  };
}

export function mapMenuFromApi(
  categories: ApiCategory[],
  products: ApiProduct[],
): MenuData {
  const mappedCategories = categories
    .map(mapApiCategory)
    .filter((c): c is MenuCategory => c !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const mappedProducts = products
    .map(mapApiProduct)
    .filter((p): p is MenuProduct => p !== null);

  return {
    categories: mappedCategories,
    products: mappedProducts,
  };
}
