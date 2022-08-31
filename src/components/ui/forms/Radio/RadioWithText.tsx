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
  disabled?: boolean;
}

export function RadioWithText({
  description,
  id,
  isSelected,
  label,
  onChange,
  disabled,
  ...rest
}: IRadioWithText) {
  return (
    <div
      className={cx('p-4 flex border h-full', {
        'border-gray-50': isSelected,
        'border-gray-400': !isSelected,
        'bg-gray-500': !disabled,
        'bg-gray-700 cursor-not-allowed': disabled,
      })}
      onClick={onChange}
    >
      <div className="flex items-center">
        <input
          id={id}
          type="radio"
          checked={isSelected}
          disabled={disabled}
          {...rest}
        />
      </div>
      <div className="pl-4">
        <label
          className={cx('font-mono font-bold', { 'text-gray-50': disabled })}
          htmlFor={id}
        >
          {label}
        </label>
        <div
          className={cx('mt-2 text-gray-50', {
            'text-gray-200': disabled,
            'text-gray-50': !disabled,
          })}
        >
          {description}
        </div>
      </div>
    </div>
  );
}
