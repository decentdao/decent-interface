import { Flex, Text } from '@chakra-ui/react';
import { ArrowAngleUp } from '@decent-org/fractal-ui';
import useDisplayName from '../../hooks/utils/useDisplayName';
import EtherscanLinkAddress from './EtherscanLinkAddress';

function EtherscanDisplayNameLink({ address }: { address?: string }) {
  const { displayName } = useDisplayName(address);

  if (!address) {
    return null;
  }

  return (
    <EtherscanLinkAddress address={address}>
      <Flex
        textStyle="text-base-sm-regular"
        color="gold.500"
        gap={2}
        alignItems="center"
      >
        <Text>{displayName}</Text>
        <ArrowAngleUp />
      </Flex>
    </EtherscanLinkAddress>
  );
}

export default EtherscanDisplayNameLink;
