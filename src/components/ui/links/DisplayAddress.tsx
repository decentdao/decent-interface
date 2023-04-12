import { HStack, Text } from '@chakra-ui/react';
import { ArrowAngleUp } from '@decent-org/fractal-ui';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import EtherscanLinkAddress from './EtherscanLinkAddress';

export function DisplayAddress({ address }: { address: string }) {
  const displayAddress = useDisplayName(address);
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
