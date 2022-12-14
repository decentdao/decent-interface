import { Input, InputElementProps } from '@chakra-ui/react';
import { utils, BigNumber } from 'ethers';
import React from 'react';

export interface BigNumberValuePair {
  value: string;
  bigNumberValue: BigNumber | undefined;
}

export interface BigNumberInputProps extends Omit<InputElementProps, 'value' | 'onChange'> {
  value: BigNumberValuePair | undefined;
  onChange: (value: BigNumberValuePair) => void;
  decimals?: number;
}

export function BigNumberInput({ value, onChange, decimals = 18, ...rest }: BigNumberInputProps) {
  const [inputValue, setInputValue] = React.useState<BigNumberValuePair>();

  React.useEffect(() => {
    console.log(value?.bigNumberValue?.toString());
    setInputValue(value);
  }, [value]);

  const onBlur = () => {
    console.log('blur happens');
    // onChange({
    //   value: event.currentTarget.value,
    //   bigNumberValue: newValue,
    // });
  };

  const updateValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue: BigNumber;
    try {
      newValue = utils.parseUnits(event.currentTarget.value, decimals);
    } catch (e) {
      console.log('bignumber error', e);
      return;
    }

    onChange({
      value: event.currentTarget.value,
      bigNumberValue: newValue,
    });
  };

  return (
    <Input
      value={inputValue?.value}
      onChange={updateValue}
      {...rest}
    />
  );
}
