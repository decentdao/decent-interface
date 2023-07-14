import {
  FormControlOptions,
  Input,
  InputGroup,
  InputElementProps,
  InputRightElement,
  Button,
} from '@chakra-ui/react';
import { utils, BigNumber, constants } from 'ethers';
import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BigNumberValuePair } from '../../../types';
export interface BigNumberInputProps
  extends Omit<InputElementProps, 'value' | 'onChange'>,
    FormControlOptions {
  value: BigNumber | undefined;
  onChange: (value: BigNumberValuePair) => void;
  decimalPlaces?: number;
  min?: string;
  max?: string;
  maxValue?: BigNumber;
}
/**
 * This component will add a chakra Input component that accepts and sets a BigNumber
 *
 * @param value input value to the control as a BigNumber. If undefined is set then the component will be blank.
 * @param onChange event is raised whenever the component changes. Sends back a value / BigNumber pair. The value sent back is a string representation of the BigNumber as a decimal number.
 * @param decimalPlaces number of decimal places to be used to parse the value to set the BigNumber
 * @param min Setting a minimum value will reset the Input value to min when the component's focus is lost. Can set decimal number for minimum, but must respect the decimalPlaces value.
 * @param max Setting this will cause the value of the Input control to be reset to the maximum when a number larger than it is inputted.
 * @param maxValue The maximum value that can be inputted. This is used to set the max value of the Input control.
 * @parma ...rest component accepts all properties for Input and FormControl
 * @returns
 */
export function BigNumberInput({
  value,
  onChange,
  decimalPlaces = 18,
  min,
  max,
  maxValue,
  ...rest
}: BigNumberInputProps) {
  const { t } = useTranslation('common');
  const removeTrailingZeros = (input: string) => {
    if (input.includes('.')) {
      const [leftDigits, rightDigits] = input.split('.');
      if (Number(rightDigits) === 0) {
        return input.slice(0, leftDigits.length);
      }
    }
    return input;
  };

  const [inputValue, setInputValue] = useState<string>();

  useEffect(() => {
    if (!value || inputValue !== undefined) return;
    setInputValue(
      value
        ? !value.isZero()
          ? removeTrailingZeros(utils.formatUnits(value, decimalPlaces))
          : '0'
        : ''
    );
  }, [value, decimalPlaces, inputValue]);

  // this will insure the caret in the input component does not shift to the end of the input when the value is changed
  const resetCaretPositionForInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const caret = event.target.selectionStart;
    const element = event.target;
    window.requestAnimationFrame(() => {
      element.selectionStart = caret && caret - 1;
      element.selectionEnd = caret && caret - 1;
    });
  };

  const removeOnlyDecimalPoint = (input: string) => (!input || input === '.' ? '0' : input);

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

  const processValue = useCallback(
    (event?: React.ChangeEvent<HTMLInputElement>, _value = '') => {
      console.log(event?.target.value);
      let stringValue = _value;
      if (event) {
        stringValue = event.target.value;
      }
      if (stringValue === '' || stringValue === undefined) {
        onChange({
          value: stringValue,
          bigNumberValue: BigNumber.from(0),
        });
        setInputValue('');
        return;
      }

      const numberMask =
        decimalPlaces === 0 ? new RegExp('^\\d*$') : new RegExp('^\\d*(\\.\\d*)?$');

      if (!numberMask.test(stringValue)) {
        if (event) {
          resetCaretPositionForInput(event);
          event.preventDefault();
        }
        return;
      }

      let newValue = truncateDecimalPlaces(stringValue);
      let bigNumberValue = utils.parseUnits(removeOnlyDecimalPoint(newValue), decimalPlaces);

      //set value to max if greater than max
      const maxBigNumber = max ? utils.parseUnits(max, decimalPlaces) : constants.MaxUint256;
      if (bigNumberValue.gt(maxBigNumber)) {
        newValue = utils.formatUnits(maxBigNumber, decimalPlaces);
        bigNumberValue = maxBigNumber;
      }

      onChange({
        value: removeOnlyDecimalPoint(newValue),
        bigNumberValue,
      });
      if (event && newValue !== event.target.value) {
        resetCaretPositionForInput(event);
      }
      setInputValue(newValue);
    },
    [decimalPlaces, max, onChange, truncateDecimalPlaces]
  );

  const onChangeInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      processValue(event);
    },
    [processValue]
  );

  //set value to min if less than min, when focus is lost
  const onBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      if (min) {
        const eventValue = event.target.value;
        const hasValidValue = eventValue && eventValue !== '.';
        const bigNumberValue = hasValidValue
          ? utils.parseUnits(eventValue, decimalPlaces)
          : BigNumber.from('0');
        const minBigNumber = hasValidValue
          ? utils.parseUnits(min, decimalPlaces)
          : BigNumber.from('0');
        if (bigNumberValue.lte(minBigNumber)) {
          onChange({
            value: min,
            bigNumberValue: BigNumber.from(minBigNumber),
          });
          setInputValue(min);
        }
      }
    },
    [decimalPlaces, min, onChange]
  );

  // if the decimalPlaces change, need to update the value
  useEffect(() => {
    if (!inputValue) return;
    processValue(undefined, inputValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decimalPlaces]);

  return (
    <InputGroup>
      <Input
        value={inputValue}
        onChange={onChangeInput}
        onBlur={onBlur}
        {...rest}
      />
      {maxValue && (
        <InputRightElement width="4.5rem">
          <Button
            h="1.75rem"
            onClick={() => {
              const newValue = {
                value: truncateDecimalPlaces(utils.formatUnits(maxValue, decimalPlaces)),
                bigNumberValue: maxValue,
              };
              setInputValue(newValue.value);
              onChange(newValue);
            }}
            variant="text"
            size="md"
          >
            {t('max')}
          </Button>
        </InputRightElement>
      )}
    </InputGroup>
  );
}
