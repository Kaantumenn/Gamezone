"use client";

import { useEffect } from "react";
import { useDevices } from "@/hooks/useDevices";
import {
  getElapsedMinutesFromStart,
  hasActiveTimeLimit,
  isTimeLimitExpired,
} from "@/lib/timeLimit";
import { useCloseTableModalStore } from "@/stores/closeTableModalStore";
import { useTimeExpiredModalStore } from "@/stores/timeExpiredModalStore";

export function TimeLimitWatcher() {
  const { data } = useDevices();
  const {
    table: openTable,
    isOpen,
    suppressedSessionIds,
    open,
    close,
  } = useTimeExpiredModalStore();
  const isCloseTableOpen = useCloseTableModalStore((s) => s.isOpen);
  const closeTableSessionId = useCloseTableModalStore(
    (s) => s.table?.sessionId,
  );

  useEffect(() => {
    const check = () => {
      if (!data) return;

      const allTables = [...data.playstation, ...data.steering];
      const expiredTable = allTables.find((table) => {
        if (!hasActiveTimeLimit(table) || !table.timeLimitMin || !table.sessionId) {
          return false;
        }
        const elapsed = getElapsedMinutesFromStart(table.startedAt);
        return isTimeLimitExpired(elapsed, table.timeLimitMin);
      });

      if (!expiredTable?.sessionId) {
        if (isOpen) close();
        return;
      }

      const sessionId = expiredTable.sessionId;
      const isClosingThisSession =
        isCloseTableOpen && closeTableSessionId === sessionId;
      const isSuppressed = suppressedSessionIds.includes(sessionId);

      if (isClosingThisSession || isSuppressed) {
        if (isOpen && openTable?.sessionId === sessionId) {
          close();
        }
        return;
      }

      if (!isOpen || openTable?.sessionId !== sessionId) {
        open(expiredTable);
      }
    };

    check();
    const intervalId = window.setInterval(check, 1000);
    return () => window.clearInterval(intervalId);
  }, [
    data,
    isOpen,
    openTable?.sessionId,
    suppressedSessionIds,
    isCloseTableOpen,
    closeTableSessionId,
    open,
    close,
  ]);

  return null;
}
