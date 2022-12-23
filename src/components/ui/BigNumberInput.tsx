import { FormControlOptions, Input, InputElementProps } from '@chakra-ui/react';
import { utils, BigNumber, constants } from 'ethers';
import { useState, useCallback, useEffect } from 'react';

export interface BigNumberValuePair {
  value: string;
  bigNumberValue: BigNumber;
}

export interface BigNumberInputProps
  extends Omit<InputElementProps, 'value' | 'onChange'>,
    FormControlOptions {
  value: BigNumber | undefined;
  onChange: (value: BigNumberValuePair) => void;
  decimalPlaces?: number;
  min?: string;
  max?: string;
}

export function BigNumberInput({
  value,
  onChange,
  decimalPlaces = 18,
  min = '0',
  max = constants.MaxUint256.toString(),
  ...rest
}: BigNumberInputProps) {
  const removeTrailingZeros = (input: string) => {
    if (input.includes('.')) {
      const [leftDigits, rightDigits] = input.split('.');
      if (Number(rightDigits) === 0) {
        return input.slice(0, leftDigits.length);
      }
    }
    return input;
  };
  const initialValue = () =>
    value && !value.isZero() ? removeTrailingZeros(utils.formatUnits(value, decimalPlaces)) : '';
  const [inputValue, setInputValue] = useState<string>(initialValue);

  // this will insure the caret in the input button does not shift to the end of the input when the value is changed
  const resetCaretPositionForInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const caret = event.target.selectionStart;
    const element = event.target;
    window.requestAnimationFrame(() => {
      element.selectionStart = caret && caret - 1;
      element.selectionEnd = caret && caret - 1;
    });
  };

  const removeOnlyDecimalPoint = (input: string) => {
    return !input || input === '.' ? '0' : input;
  };

  const truncateDecimalPlaces = useCallback(
    (eventValue: string) => {
      if (eventValue.includes('.')) {
        const [leftDigits, rightDigits] = eventValue.split('.');
        //trunc right side of number if more than max decimal places
        if (rightDigits && rightDigits.length > decimalPlaces) {
          const maxLength = leftDigits.length + decimalPlaces + 1;
          return eventValue.slice(0, maxLength);
        }
      }
      return eventValue;
    },
    [decimalPlaces]
  );

  const onChangeInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      //test input is a decimal number
      const numberMask =
        decimalPlaces === 0 ? new RegExp('^\\d*$') : new RegExp('^\\d*(\\.\\d*)?$');
      if (!numberMask.test(event.target.value)) {
        resetCaretPositionForInput(event);
        event.preventDefault();
        return;
      }

      let newValue = truncateDecimalPlaces(event.target.value);
      let bigNumberValue = utils.parseUnits(removeOnlyDecimalPoint(newValue), decimalPlaces);

      //set value to max if greater than max
      const bigNumberMax = utils.parseUnits(max, decimalPlaces);
      if (bigNumberValue.gt(bigNumberMax)) {
        newValue = max;
        bigNumberValue = bigNumberMax;
      }

      onChange({
        value: removeOnlyDecimalPoint(newValue),
        bigNumberValue: bigNumberValue,
      });
      if (newValue !== event.target.value) {
        resetCaretPositionForInput(event);
      }
      setInputValue(newValue);
    },
    [decimalPlaces, max, onChange, truncateDecimalPlaces]
  );

  //set value to min if less than min, when focus is lost
  const onBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      if (event.target.value) {
        const bigNumberValue = utils.parseUnits(event.target.value, decimalPlaces);
        const bigNumberMin = utils.parseUnits(min, decimalPlaces);
        if (bigNumberValue.lt(bigNumberMin)) {
          onChange({
            value: min,
            bigNumberValue: BigNumber.from(bigNumberMin),
          });
          setInputValue(min.toString());
        }
      }
    },
    [decimalPlaces, min, onChange]
  );

  // if the decimalPlaces change, need to update the value
  useEffect(() => {
    const newValue = truncateDecimalPlaces(inputValue);
    const bigNumberValue = utils.parseUnits(removeOnlyDecimalPoint(newValue), decimalPlaces);
    onChange({
      value: removeOnlyDecimalPoint(newValue),
      bigNumberValue: bigNumberValue,
    });
    setInputValue(newValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decimalPlaces]);

  return (
    <Input
      value={inputValue}
      onChange={onChangeInput}
      onBlur={onBlur}
      {...rest}
    />
  );
}
