import { Input, InputProps } from '@chakra-ui/react';

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
