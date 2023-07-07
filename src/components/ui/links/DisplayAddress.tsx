import { HStack, Text } from '@chakra-ui/react';
import { ArrowAngleUp } from '@decent-org/fractal-ui';
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
    <EtherscanLinkAddress address={address}>
      <HStack
        color="gold.500"
        _hover={{ color: 'gold.500-hover' }}
        textStyle="text-base-sm-regular"
      >
        <Text>{children || displayAddress.displayName}</Text>
        <ArrowAngleUp />
      </HStack>
    </EtherscanLinkAddress>
  );
}
