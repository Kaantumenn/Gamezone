import type { ApiProduct } from "@/types/order";

export interface EmployeeSummary {
  id: number;
  fullName: string;
  phone: string | null;
  itemCount: number;
  total: number;
  createdAt: string;
}

export interface EmployeeOrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: string;
  total: string;
  createdAt: string;
  product?: ApiProduct;
}

export interface EmployeeOrder {
  id: number;
  employeeId: number;
  total: string;
  createdAt: string;
  updatedAt: string;
  items: EmployeeOrderItem[];
}

export interface EmployeeDetail {
  id: number;
  fullName: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  orders: EmployeeOrder[];
  total: number;
}

export interface EmployeeFormValues {
  fullName: string;
  phone: string;
}

export interface EmployeeAddItemPayload {
  employeeId: number;
  productId: number;
  quantity?: number;
}

export interface EmployeeDecreaseItemPayload {
  employeeId: number;
  productId: number;
}

export function getEmptyEmployeeForm(): EmployeeFormValues {
  return { fullName: "", phone: "" };
}
