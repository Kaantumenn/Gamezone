export interface ApiCategory {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  products?: ApiProduct[];
}

export interface ApiProduct {
  id: number;
  categoryId: number;
  name: string;
  barcode: string | null;
  imageUrl: string | null;
  salePrice: string;
  stockQty: number;
  minStockQty: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Omit<ApiCategory, "products">;
}

export interface MenuCategory {
  id: number;
  name: string;
  sortOrder: number;
}

export interface MenuProduct {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  stockQty: number;
  imageUrl: string | null;
  imageColor: string;
}

export interface ApiOrderItem {
  id: number;
  sessionId: number;
  productId: number;
  quantity: number;
  unitPrice?: string;
  totalPrice?: string;
  product?: Pick<ApiProduct, "id" | "name" | "salePrice" | "imageUrl">;
}

export interface CartItem {
  orderItemId: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  imageColor?: string;
}

export interface OrderItemPayload {
  sessionId: number;
  productId: number;
  quantity?: number;
}

export interface MenuData {
  categories: MenuCategory[];
  products: MenuProduct[];
}
