import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TariffsContent } from "@/components/tariffs/TariffsContent";

export default function TarifelerPage() {
  return (
    <DashboardLayout mainClassName="px-4 py-5 xl:px-5">
      <TariffsContent />
    </DashboardLayout>
  );
}
