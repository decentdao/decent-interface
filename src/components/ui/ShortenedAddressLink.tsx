import { HStack, Image, Text } from '@chakra-ui/react';
import arrow from '../../assets/images/address-arrow.svg';
import useDisplayName from '../../hooks/useDisplayName';
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
        <Image
          src={arrow}
          w="0.625rem"
          h="0.625rem"
        />
      </HStack>
    </EtherscanLinkAddress>
  );
}
