import type { Table, TableType } from "@/types/table";
import { Gamepad2 } from "lucide-react";
import { TableCard } from "@/components/dashboard/TableCard";
import { SteeringWheelIcon } from "@/components/icons/SteeringWheelIcon";

interface TableSectionProps {
  id?: string;
  title: string;
  type: TableType;
  tables: Table[];
}

export function TableSection({ id, title, type, tables }: TableSectionProps) {
  const isPS = type === "playstation";

  return (
    <section id={id}>
      <div className="mb-4 flex items-center gap-2.5">
        {isPS ? (
          <Gamepad2 className="h-4 w-4 text-[#818cf8]" />
        ) : (
          <SteeringWheelIcon className="h-4 w-4 text-[#60a5fa]" />
        )}
        <h2 className="text-xs font-bold tracking-[0.15em] text-white/50">
          {title}
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {tables.map((table) => (
          <TableCard key={table.id} table={table} />
        ))}
      </div>
    </section>
  );
}
