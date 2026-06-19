import { api } from "@/lib/api";
import type {
  EmployeeAddItemPayload,
  EmployeeDecreaseItemPayload,
  EmployeeDetail,
  EmployeeFormValues,
  EmployeeSummary,
} from "@/types/employee";

export async function fetchEmployees(): Promise<EmployeeSummary[]> {
  const { data } = await api.get<EmployeeSummary[]>("/employees");
  return data;
}

export async function fetchEmployee(id: number): Promise<EmployeeDetail> {
  const { data } = await api.get<EmployeeDetail>(`/employees/${id}`);
  return data;
}

export async function createEmployee(
  values: EmployeeFormValues,
): Promise<EmployeeDetail> {
  const { data } = await api.post<EmployeeDetail>("/employees", {
    fullName: values.fullName.trim(),
    phone: values.phone.trim() || undefined,
  });
  return data;
}

export async function updateEmployee(
  id: number,
  values: Partial<EmployeeFormValues>,
): Promise<EmployeeDetail> {
  const payload: Record<string, string> = {};

  if (values.fullName !== undefined) {
    payload.fullName = values.fullName.trim();
  }
  if (values.phone !== undefined) {
    payload.phone = values.phone.trim();
  }

  const { data } = await api.patch<EmployeeDetail>(`/employees/${id}`, payload);
  return data;
}

export async function deleteEmployee(id: number): Promise<void> {
  await api.delete(`/employees/${id}`);
}

export async function addEmployeeItem(
  payload: EmployeeAddItemPayload,
): Promise<EmployeeDetail> {
  const { data } = await api.post<EmployeeDetail>(
    `/employees/${payload.employeeId}/add-item`,
    {
      productId: payload.productId,
      quantity: payload.quantity ?? 1,
    },
  );
  return data;
}

export async function decreaseEmployeeItem(
  payload: EmployeeDecreaseItemPayload,
): Promise<EmployeeDetail> {
  const { data } = await api.post<EmployeeDetail>(
    `/employees/${payload.employeeId}/decrease-item`,
    {
      productId: payload.productId,
    },
  );
  return data;
}

export async function deleteEmployeeOrderItem(
  orderItemId: number,
): Promise<EmployeeDetail> {
  const { data } = await api.delete<EmployeeDetail>(
    `/employees/item/${orderItemId}`,
  );
  return data;
}
