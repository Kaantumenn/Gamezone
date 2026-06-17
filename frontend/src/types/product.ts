export interface ProductFormValues {
  categoryId: number;
  name: string;
  salePrice: string;
  stockQty: number;
  minStockQty: number;
  barcode: string;
  image?: File | null;
}

export function getEmptyProductForm(categoryId = 1): ProductFormValues {
  return {
    categoryId,
    name: "",
    salePrice: "",
    stockQty: 0,
    minStockQty: 0,
    barcode: "",
    image: null,
  };
}
