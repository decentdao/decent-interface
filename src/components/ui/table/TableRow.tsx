import { ReactNode } from 'react';

interface ITableRow {
  gridType: string;
  children: ReactNode;
}
export function TableRow({ gridType, children }: ITableRow) {
  return (
    <div
      className={`grid grid-cols-${gridType} grid-rows-${gridType} items-center py-2 border-b border-gray-200 bg-gray-500`}
    >
      {children}
    </div>
  );
}
