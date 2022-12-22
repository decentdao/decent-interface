import { FormControlOptions, Input, InputElementProps } from '@chakra-ui/react';
import { utils, BigNumber, constants } from 'ethers';
import { useState, useCallback, useEffect } from 'react';

export interface BigNumberValuePair {
  value: number;
  bigNumberValue: BigNumber;
}

export interface BigNumberInputProps
  extends Omit<InputElementProps, 'value' | 'onChange'>,
    FormControlOptions {
  value: BigNumber | undefined;
  onChange: (value: BigNumberValuePair) => void;
  decimalPlaces?: number;
}

// the value property can be either a BigNumber or a BigNumberValuePair
// choose if you need to use the value converted to a Number, then use the Pair, otherwise, just use a BigNumber
export function BigNumberInput({
  value,
  onChange,
  decimalPlaces = 18,
  ...rest
}: BigNumberInputProps) {
  const initialValue = value && !value.isZero() ? utils.formatUnits(value, decimalPlaces) : '';
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
      const numberMask = new RegExp('^\\d*(\\.\\d*)?$');
      if (!numberMask.test(event.target.value)) {
        resetCaretPositionForInput(event);
        event.preventDefault();
        return;
      }

      const newValue = truncateDecimalPlaces(event.target.value);
      const bigNumberValue = utils.parseUnits(removeOnlyDecimalPoint(newValue), decimalPlaces);

      // check value is not greater than maxUint256
      if (constants.MaxUint256.lt(bigNumberValue)) {
        resetCaretPositionForInput(event);
        event.preventDefault();
        return;
      }

      onChange({
        value: Number(removeOnlyDecimalPoint(newValue)),
        bigNumberValue: bigNumberValue,
      });
      if (newValue !== event.target.value) {
        resetCaretPositionForInput(event);
      }
      setInputValue(newValue);
    },
    [decimalPlaces, onChange, truncateDecimalPlaces]
  );

  // if the decimalPlaces change, need to update the value
  useEffect(() => {
    const newValue = truncateDecimalPlaces(inputValue);
    const bigNumberValue = utils.parseUnits(removeOnlyDecimalPoint(newValue), decimalPlaces);
    onChange({
      value: Number(removeOnlyDecimalPoint(newValue)),
      bigNumberValue: bigNumberValue,
    });
    setInputValue(newValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decimalPlaces]);

  return (
    <Input
      value={inputValue}
      onChange={onChangeInput}
      {...rest}
    />
  );
}
