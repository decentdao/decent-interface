import { HStack, Text } from '@chakra-ui/react';
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
      border="1px"
      borderColor="neutral-3"
      bg="neutral-3"
      px="0.75rem"
      borderRadius="625rem"
      _hover={{
        bg: 'neutral-4',
        borderColor: 'lilac-0',
      }}
      address={address}
      textAlign="center"
    >
      <HStack color="lilac-0">
        <Text pb="1px">{children || displayAddress.displayName}</Text>
        <ArrowUpRight />
      </HStack>
    </EtherscanLinkAddress>
  );
}
