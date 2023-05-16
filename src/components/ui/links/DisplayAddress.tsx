import { HStack, Text } from '@chakra-ui/react';
import { ArrowAngleUp } from '@decent-org/fractal-ui';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import EtherscanLinkAddress from './EtherscanLinkAddress';

export function DisplayAddress({
  address,
  truncate,
}: {
  address: string;
  truncate?: boolean | undefined;
}) {
  const displayAddress = useDisplayName(address, truncate);
  return (
    <EtherscanLinkAddress address={address}>
      <HStack
        color="gold.500"
        textStyle="text-base-sm-regular"
      >
        <Text>{displayAddress.displayName}</Text>
        <ArrowAngleUp />
      </HStack>
    </EtherscanLinkAddress>
  );
}
