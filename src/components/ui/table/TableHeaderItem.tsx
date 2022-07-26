import cx from 'classnames';

interface ITableHeaderItem {
  itemTitle?: string;
  position?: string;
}

export function TableHeaderItem({ itemTitle, position }: ITableHeaderItem) {
  return (
    <div
      className={cx('bg-gray-400 flex items-end h-12 pb-2 px-4 text-gray-50 text-xs font-medium', {
        [`${position}`]: position,
      })}
    >
      {itemTitle}
    </div>
  );
}
