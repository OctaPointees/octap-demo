import { useTable, type RowData, type SortingState } from "@tanstack/react-table";
import { CaretDown, CaretLeft, CaretRight, CaretUp, MagnifyingGlass } from "phosphor-react";
import { type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Skeleton } from "./Display";
import { tableFeatureSet, type AppColumnDef } from "./table";

type Props<T extends RowData> = {
  data: T[] | undefined;
  columns: AppColumnDef<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  toolbar?: ReactNode;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
  initialSort?: SortingState;
  dense?: boolean;
};

const EMPTY: never[] = [];

export function DataTable<T extends RowData>({
  data,
  columns,
  loading,
  searchable,
  searchPlaceholder = "Filter rows…",
  toolbar,
  pageSize = 10,
  onRowClick,
  empty,
  initialSort = EMPTY,
  dense,
}: Props<T>) {
  const table = useTable({
    features: tableFeatureSet,
    data: data ?? (EMPTY as T[]),
    columns,
    globalFilterFn: "includesString",
    initialState: { sorting: initialSort, pagination: { pageIndex: 0, pageSize } },
  });

  const rows = table.getRowModel().rows;
  const total = table.getFilteredRowModel().rows.length;
  const { pageIndex } = table.state.pagination;

  return (
    <div className="flex flex-col gap-3">
      {(searchable || toolbar) && (
        <div className="flex flex-wrap items-center gap-2">
          {searchable && (
            <label className="input input-sm w-full sm:w-72">
              <MagnifyingGlass className="opacity-50" />
              <input value={(table.state.globalFilter as string) ?? ""} onChange={(e) => table.setGlobalFilter(e.target.value)} placeholder={searchPlaceholder} />
            </label>
          )}
          {toolbar}
        </div>
      )}

      <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
        <table className={cn("table", dense && "table-sm")}>
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="bg-base-200/60">
                {hg.headers.map((h) => {
                  const sort = h.column.getIsSorted();
                  return (
                    <th
                      key={h.id}
                      className={cn("whitespace-nowrap", h.column.getCanSort() && "cursor-pointer select-none")}
                      onClick={h.column.getCanSort() ? h.column.getToggleSortingHandler() : undefined}
                    >
                      <span className="inline-flex items-center gap-1">
                        {h.isPlaceholder ? null : <table.FlexRender header={h} />}
                        {sort === "asc" && <CaretUp weight="bold" />}
                        {sort === "desc" && <CaretDown weight="bold" />}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }, (_, i) => (
                <tr key={i}>
                  {columns.map((_, j) => (
                    <td key={j}>
                      <Skeleton className="h-4 w-full rounded" />
                    </td>
                  ))}
                </tr>
              ))}
            {!loading &&
              rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(onRowClick && "cursor-pointer hover:bg-base-200/60")}
                  onClick={onRowClick ? () => onRowClick(row.original as T) : undefined}
                >
                  {row.getAllCells().map((cell) => (
                    <td key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length}>{empty ?? <div className="py-10 text-center text-sm opacity-60">No results.</div>}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && total > pageSize && (
        <div className="flex items-center justify-between text-sm">
          <span className="opacity-60">
            {pageIndex * pageSize + 1}–{Math.min((pageIndex + 1) * pageSize, total)} of {total}
          </span>
          <div className="join">
            <button className="btn join-item btn-sm" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()} aria-label="Previous page">
              <CaretLeft />
            </button>
            <span className="btn join-item btn-sm pointer-events-none">
              {pageIndex + 1} / {table.getPageCount()}
            </span>
            <button className="btn join-item btn-sm" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()} aria-label="Next page">
              <CaretRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
