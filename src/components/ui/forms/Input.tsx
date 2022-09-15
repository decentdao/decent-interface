import { ChangeEvent, FormEvent, useCallback, useId } from 'react';
import cx from 'classnames';

export enum RestrictCharTypes {
  WHOLE_NUMBERS_ONLY,
  FLOAT_NUMBERS,
}

interface InputProps {
  type: 'text' | 'number' | 'textarea';
  value?: string | number;
  containerClassName?: string;
  inputClassName?: string;
  label?: string;
  subLabel?: string;
  unit?: string;
  helperText?: string;
  exampleText?: string;
  exampleLabel?: string;
  disabled?: boolean;
  errorMessage?: string;
  placeholder?: string;
  min?: string | number;
  max?: string | number;
  onClickMax?: () => void;
  restrictChar?: RestrictCharTypes;
  onChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void;
  decimals?: number;
  maxLength?: number;
}

/**
 * FormField builds and renders Input fields based on given parameters
 * includes: surrounding wrapper, label, input and error handling
 *
 */
function Input({
  value,
  min,
  max,
  placeholder,
  type,
  label,
  subLabel,
  unit,
  errorMessage,
  disabled,
  helperText,
  exampleText,
  exampleLabel,
  restrictChar,
  containerClassName,
  inputClassName,
  onChange,
  onClickMax,
  decimals,
  maxLength,
}: InputProps) {
  const id = useId();
  const FieldType = type === 'textarea' ? 'textarea' : 'input';
  const hasError = !!errorMessage;

  function Label() {
    return !!label ? (
      <label
        htmlFor={id}
        className={cx('text-xs font-medium mb-1', {
          'text-gray-50': disabled,
          'text-gray-25': !disabled,
        })}
      >
        {label}
      </label>
    ) : null;
  }

  function HelperText() {
    return !!helperText ? <div className="text-gray-50 font-sans text-xs">{helperText}</div> : null;
  }
  function HelperExampleText() {
    return !!helperText && exampleText ? (
      <div className="text-gold-300 font-mono font-medium text-xxs mb-4">
        <div>{exampleLabel ? exampleLabel : 'Example'}:</div>
        <div>{exampleText}</div>
      </div>
    ) : null;
  }

  function UnitsDisplay() {
    return unit ? <div className="absolute text-gray-50 text-sm top-7 right-6">{unit}</div> : null;
  }

  function SubLabel() {
    return !!subLabel && !hasError ? (
      <div className="text-gray-50 text-xs font-medium mt-1">{subLabel}</div>
    ) : null;
  }
  function ErrorMessage() {
    return !!hasError ? (
      <div className="text-red text-xs mt-1">{errorMessage}</div>
    ) : (
      <div className={cx({ 'mt-5': subLabel })} />
    );
  }

  function SetMax() {
    return !max ? null : (
      <div
        className="absolute text-sm text-gold-500 top-1.5 right-2 cursor-pointer hover:text-gold-300"
        onClick={onClickMax}
      >
        max
      </div>
    );
  }

  const INPUT_BASE_STYLES =
    'w-full border border-gray-20 bg-gray-400 rounded py-1 px-2 shadow-inner text-gray-25 focus:outline-none placeholder:text-gray-100';
  const INPUT_DISABLED_STYLED =
    'disabled:bg-gray-300 disabled:border-gray-200 disabled:text-gray-50';
  const borderColor = hasError ? 'border border-red' : '';
  const inputTextColor = hasError ? 'text-red' : 'text-gray-25';

  const inputType = type !== 'textarea' ? type : undefined;

  const wholeNumbersOnly = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    return ['e', '+', '-', '.'].includes(event.key) && event.preventDefault();
  };
  const floatNumbersOnly = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    return ['e', '+', '-'].includes(event.key) && event.preventDefault();
  };

  const limitDecimals = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!value || ['Backspace', 'Delete'].includes(event.key)) {
        return;
      }
      const [, dec] = value.toString().split('.');
      if (!!dec && !!decimals && dec.length >= decimals) {
        event.preventDefault();
      }
    },
    [decimals, value]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (decimals) {
        limitDecimals(event);
      }

      switch (restrictChar) {
        case RestrictCharTypes.WHOLE_NUMBERS_ONLY: {
          wholeNumbersOnly(event);
          break;
        }
        case RestrictCharTypes.FLOAT_NUMBERS: {
          floatNumbersOnly(event);
          break;
        }
      }

      return event;
    },
    [decimals, limitDecimals, restrictChar]
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // handle any externally set change listener
    if (onChange) onChange(event);

    // handle max length (typing or pasting)
    const newValue = event.currentTarget.value;
    if (maxLength && newValue.length > maxLength) {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      const input = document.getElementById(id);
      setter?.call(input, newValue.substring(0, maxLength));
      input?.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  return (
    <div
      className={cx(
        'w-full',
        {
          'flex flex-wrap sm:flex-nowrap': !!helperText,
        },
        containerClassName
      )}
    >
      <div className={cx('flex flex-col w-full relative', { 'pr-4': !!helperText })}>
        <Label />
        <FieldType
          id={id}
          type={inputType}
          placeholder={placeholder}
          className={cx(
            INPUT_BASE_STYLES,
            INPUT_DISABLED_STYLED,
            borderColor,
            inputTextColor,
            inputClassName
          )}
          disabled={disabled}
          value={value}
          min={min}
          max={max}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          onWheel={(e: FormEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            (e.target as HTMLInputElement).blur()
          }
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck="false"
        />
        <SetMax />
        <UnitsDisplay />
        <SubLabel />
        <ErrorMessage />
      </div>
      <div className="flex flex-col gap-4 sm:max-w-xxs sm:min-w-xxs sm:ml-2 sm:pl-6 pt-2 sm:pt-0 sm:border-l sm:border-gray-300">
        <HelperText />
        <HelperExampleText />
      </div>
    </div>
  );
}

export default Input;
