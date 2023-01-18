import { InputElementProps, FormControlOptions, Input } from '@chakra-ui/react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import useAddress from '../../hooks/utils/useAddress';

export interface EthAddressInputProps
  extends Omit<InputElementProps, 'onChange' | 'placeholder' | 'type'>,
    FormControlOptions {
  value?: string;
  setValue?: Dispatch<SetStateAction<string>>;
  onAddressChange: (address: string, isValid: boolean) => void;
}

/**
 * @param value an optional stateful string value, if you'd like to have access to this outside this component
 * @param setValue the corresponding setter for the value parameter, both are required for either to be used
 * @param onAddressChange a callback that provides the current address, along with whether it is valid
 */
export function EthAddressInput({
  value,
  setValue,
  onAddressChange,
  ...rest
}: EthAddressInputProps) {
  // internal input value state, which is used if value / setValue are not provided
  const [valInternal, setValInternal] = useState<string>('');
  const [actualInputValue, setActualInputValue] =
    value && setValue ? [value, setValue] : [valInternal, setValInternal];
  const { address, isAddressLoading, isValidAddress } = useAddress(actualInputValue.toLowerCase());

  useEffect(() => {
    onAddressChange(address || '', isValidAddress || false);
  }, [address, actualInputValue, isValidAddress, onAddressChange]);

  return (
    <Input
      value={actualInputValue}
      placeholder="0x0000...0000"
      isDisabled={rest.isDisabled || isAddressLoading}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setActualInputValue(event.target.value);
      }}
      {...rest}
    />
  );
}
