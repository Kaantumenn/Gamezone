import { api } from "@/lib/api";
import type { CloseSessionBody } from "@/types/closeSession";
import type { SessionCheckoutResponse } from "@/types/checkout";
import type {
  MergeSessionPayload,
  MergeSessionResponse,
  OpenSessionPayload,
  SessionControllerChangePayload,
  TransferSessionPayload,
  TransferSessionResponse,
  SessionBonusPayload,
  UpdateSessionPayload,
  UpdateSessionStartTimePayload,
  UpdateSessionTimeLimitPayload,
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

export async function updateSessionTimeLimit(
  sessionId: number,
  payload: UpdateSessionTimeLimitPayload,
) {
  const { data } = await api.patch(
    `/sessions/${sessionId}/time-limit`,
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

export async function addSessionBonus(
  sessionId: number,
  payload: SessionBonusPayload,
) {
  const { data } = await api.post(`/sessions/${sessionId}/bonus`, payload);
  return data;
}

export async function removeSessionBonus(
  sessionId: number,
  payload: SessionBonusPayload,
) {
  const { data } = await api.post(
    `/sessions/${sessionId}/remove-bonus`,
    payload,
  );
  return data;
}

export async function reopenSession(sessionId: number) {
  const { data } = await api.post(`/sessions/${sessionId}/reopen`);
  return data;
}

export async function mergeSessions(
  sourceSessionId: number,
  payload: MergeSessionPayload,
): Promise<MergeSessionResponse> {
  const { data } = await api.post<MergeSessionResponse>(
    `/sessions/${sourceSessionId}/merge`,
    payload,
  );
  return data;
}

export async function transferSession(
  sessionId: number,
  payload: TransferSessionPayload,
): Promise<TransferSessionResponse> {
  const { data } = await api.post<TransferSessionResponse>(
    `/sessions/${sessionId}/transfer`,
    payload,
  );
  return data;
}
