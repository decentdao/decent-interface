import { InputElementProps, FormControlOptions, Input } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import useAddress from '../../hooks/utils/useAddress';

export interface EthAddressInputProps
  extends Omit<InputElementProps, 'value' | 'onChange' | 'placeholder' | 'type'>,
    FormControlOptions {
  value?: string;
  onAddress: (address: string, isValid: boolean) => void;
}

export function EthAddressInput({ value, onAddress, ...rest }: EthAddressInputProps) {
  const [inputValue, setInputValue] = useState<string>(value ? value : '');
  const { address, isValidAddress } = useAddress(inputValue);

  useEffect(() => {
    onAddress(address || '', isValidAddress || false);
  }, [address, isValidAddress, onAddress]);

  return (
    <Input
      value={inputValue}
      placeholder="0x0000...0000"
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
      }}
      {...rest}
    />
  );
}
