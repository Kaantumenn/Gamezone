import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProductsStockContent } from "@/components/products/ProductsStockContent";

export default function UrunlerPage() {
  return (
    <DashboardLayout>
      <ProductsStockContent />
    </DashboardLayout>
  );
}
