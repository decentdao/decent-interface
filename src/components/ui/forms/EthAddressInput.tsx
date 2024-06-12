import { InputElementProps, FormControlOptions, Input, InputProps } from '@chakra-ui/react';
import { Dispatch, SetStateAction } from 'react';

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
