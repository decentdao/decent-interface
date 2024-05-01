import { Text, Icon, LinkProps } from '@chakra-ui/react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { ReactNode } from 'react';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import EtherscanLinkAddress from './EtherscanLinkAddress';

export function DisplayAddress({
  address,
  truncate,
  children,
  ...rest
}: {
  address: string;
  truncate?: boolean | undefined;
  children?: ReactNode;
} & LinkProps) {
  const displayAddress = useDisplayName(address, truncate);
  return (
    <EtherscanLinkAddress
      address={address}
      alignItems="center"
      display="flex"
      {...rest}
    >
      <Text as="span">{children || displayAddress.displayName}</Text>
      <Icon
        as={ArrowUpRight}
        ml="0.5rem"
      />
    </EtherscanLinkAddress>
  );
}
