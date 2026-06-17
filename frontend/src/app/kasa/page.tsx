import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CashboxContent } from "@/components/cashbox/CashboxContent";

export default function KasaPage() {
  return (
    <DashboardLayout mainClassName="px-4 py-5 xl:px-5">
      <CashboxContent />
    </DashboardLayout>
  );
}
