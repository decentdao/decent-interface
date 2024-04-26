import { InputElementProps, FormControlOptions, Input, InputProps } from '@chakra-ui/react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import useAddress from '../../../hooks/utils/useAddress';

/**
 * @deprecated we've replaced this component with validation via Yup
 * in {@link useValidationAddress}.
 */
export interface EthAddressInputProps
  extends Omit<InputElementProps, 'onChange' | 'placeholder' | 'type'>,
    FormControlOptions {
  value?: string;
  setValue?: Dispatch<SetStateAction<string>>;
  onAddressChange: (address: string | undefined, isValid: boolean) => void;
}

/**
 * @deprecated we've replaced this component with validation via Yup
 * in {@link useValidationAddress}.
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
  const { address, isAddressLoading, isValidAddress } = useAddress(
    actualInputValue.toLowerCase(),
  );

  useEffect(() => {
    onAddressChange(address, isValidAddress || false);
  }, [address, actualInputValue, isValidAddress, onAddressChange]);

  return (
    <Input
      // preface id with "search" to prevent showing 1password
      // https://1password.community/discussion/comment/606453/#Comment_606453
      id="searchButActuallyEthAddress"
      autoComplete="off"
      value={actualInputValue}
      placeholder="0x0000...0000"
      isDisabled={rest.isDisabled || isAddressLoading}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        const val = event.target.value;
        if (val.trim().includes(' ') || val.indexOf('.') !== val.lastIndexOf('.')) {
          return;
        }
        setActualInputValue(event.target.value.trim());
      }}
      {...rest}
    />
  );
}

/**
 * A simple Input for Ethereum addresses. Input validation is provided via Yup
 * in {@link useValidationAddress}
 */
export function AddressInput({ ...rest }: InputProps) {
  return (
    <Input
      // preface id with "search" to prevent showing 1password
      // https://1password.community/discussion/comment/606453/#Comment_606453
      id="searchButActuallyEthAddress"
      autoComplete="off"
      placeholder="0x0000...0000"
      {...rest}
    />
  );
}
