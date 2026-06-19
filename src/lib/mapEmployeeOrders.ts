import type { CartItem, MenuProduct } from "@/types/order";
import type { EmployeeDetail, EmployeeOrderItem } from "@/types/employee";

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

export function flattenEmployeeOrderItems(
  employee: EmployeeDetail,
): EmployeeOrderItem[] {
  return employee.orders.flatMap((order) => order.items);
}

export function mapEmployeeOrderItem(
  item: EmployeeOrderItem,
  menuProducts: MenuProduct[],
): CartItem {
  const menuProduct = menuProducts.find((p) => p.id === item.productId);

  return {
    orderItemId: item.id,
    productId: item.productId,
    name: item.product?.name ?? menuProduct?.name ?? "Ürün",
    price: Number(
      item.unitPrice ?? item.product?.salePrice ?? menuProduct?.price ?? 0,
    ),
    quantity: item.quantity,
    imageUrl: item.product?.imageUrl ?? menuProduct?.imageUrl ?? null,
    imageColor: menuProduct?.imageColor ?? getProductColor(item.productId),
  };
}

export function mapEmployeeOrders(
  employee: EmployeeDetail | null | undefined,
  menuProducts: MenuProduct[],
): CartItem[] {
  if (!employee) return [];

  return flattenEmployeeOrderItems(employee).map((item) =>
    mapEmployeeOrderItem(item, menuProducts),
  );
}
