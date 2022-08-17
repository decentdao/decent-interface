import React, { ChangeEvent } from 'react';
import cx from 'classnames';

interface IRadioWithText {
  description: string;
  id: string;
  name: string;
  isSelected: boolean;
  label: string;
  onChange: (e: ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLDivElement>) => void;
  value?: any;
  readOnly?: boolean;
}

export function RadioWithText({
  description,
  id,
  isSelected,
  label,
  onChange,
  ...rest
}: IRadioWithText) {
  return (
    <div
      className={cx('p-4 bg-gray-500 flex border h-full', {
        'border-gray-50': isSelected,
        'border-gray-400': !isSelected,
      })}
      onClick={onChange}
    >
      <div className="flex items-center">
        <input
          id={id}
          type="radio"
          checked={isSelected}
          {...rest}
        />
      </div>
      <div className="pl-4">
        <label
          className="font-mono font-bold"
          htmlFor={id}
        >
          {label}
        </label>
        <div className="mt-2 text-gray-50">{description}</div>
      </div>
    </div>
  );
}
