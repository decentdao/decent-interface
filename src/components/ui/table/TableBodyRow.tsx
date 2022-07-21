import { ReactNode } from 'react';

export function TableBodyRowItem({ children }: { children: ReactNode }) {
  return <div className="pl-4 border-b border-gray-200 bg-gray-500 h-12">{children}</div>;
}
