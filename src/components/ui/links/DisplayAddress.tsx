import { Text, Icon } from '@chakra-ui/react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { ReactNode } from 'react';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import EtherscanLinkAddress from './EtherscanLinkAddress';

export function DisplayAddress({
  address,
  truncate,
  children,
}: {
  address: string;
  truncate?: boolean | undefined;
  children?: ReactNode;
}) {
  const displayAddress = useDisplayName(address, truncate);
  return (
    <EtherscanLinkAddress
      address={address}
      alignItems="center"
      display="flex"
    >
      <Text as="span">{children || displayAddress.displayName}</Text>
      <Icon
        as={ArrowUpRight}
        ml="0.5rem"
      />
    </EtherscanLinkAddress>
  );
}
