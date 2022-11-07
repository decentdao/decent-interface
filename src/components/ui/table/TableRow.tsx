import cx from 'classnames';
import { ReactNode } from 'react';
interface ITableRow {
  gridType: string;
  children: ReactNode;
}
export function TableRow({ gridType, children }: ITableRow) {
  return (
    <div className={cx('grid items-center py-2 border-b border-gray-200 bg-gray-500', gridType)}>
      {children}
    </div>
  );
}
