import { api } from "@/lib/api";
import type { CloseSessionBody } from "@/types/closeSession";
import type { SessionCheckoutResponse } from "@/types/checkout";
import type {
  OpenSessionPayload,
  SessionControllerChangePayload,
  UpdateSessionPayload,
  UpdateSessionStartTimePayload,
} from "@/types/session";

export async function openSession(payload: OpenSessionPayload) {
  const { data } = await api.post("/sessions/open", payload);
  return data;
}

export async function fetchSessionCheckout(
  sessionId: number,
): Promise<SessionCheckoutResponse> {
  const { data } = await api.get<SessionCheckoutResponse>(
    `/sessions/${sessionId}/checkout`,
  );
  return data;
}

export async function closeSession(sessionId: number, body: CloseSessionBody) {
  const { data } = await api.post(`/sessions/${sessionId}/close`, body);
  return data;
}

export async function updateSession(
  sessionId: number,
  payload: UpdateSessionPayload,
) {
  const { data } = await api.patch(`/sessions/${sessionId}`, payload);
  return data;
}

export async function updateSessionStartTime(
  sessionId: number,
  payload: UpdateSessionStartTimePayload,
) {
  const { data } = await api.patch(
    `/sessions/${sessionId}/start-time`,
    payload,
  );
  return data;
}

export async function changeSessionController(
  sessionId: number,
  payload: SessionControllerChangePayload,
) {
  const { data } = await api.post(
    `/sessions/${sessionId}/controller-change`,
    payload,
  );
  return data;
}

export async function reopenSession(sessionId: number) {
  const { data } = await api.post(`/sessions/${sessionId}/reopen`);
  return data;
}
