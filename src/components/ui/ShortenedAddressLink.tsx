import { HStack, Text } from '@chakra-ui/react';
import { ArrowAngleUp } from '@decent-org/fractal-ui';
import useDisplayName from '../../hooks/utlities/useDisplayName';
import EtherscanLinkAddress from './EtherscanLinkAddress';

export function ShortenedAddressLink({ address }: { address: string }) {
  const displayAddress = useDisplayName(address);
  return (
    <EtherscanLinkAddress address={address}>
      <HStack>
        <Text
          textStyle="text-base-sans-regular"
          color="gold.500"
          marginEnd="0.5rem"
        >
          {displayAddress.displayName}
        </Text>
        <ArrowAngleUp
          color="gold.500"
          w="1.25rem"
          h="1.25rem"
        />
      </HStack>
    </EtherscanLinkAddress>
  );
}
