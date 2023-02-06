import { Flex, Text } from '@chakra-ui/react';
import { ArrowAngleUp } from '@decent-org/fractal-ui';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import EtherscanTransactionLink from './EtherscanTransactionLink';

function EtherscanDisplayTransaction({ address }: { address?: string }) {
  const { displayName } = useDisplayName(address);

  if (!address) {
    return null;
  }

  return (
    <EtherscanTransactionLink txHash={address}>
      <Flex
        textStyle="text-base-sm-regular"
        color="gold.500"
        gap={2}
        alignItems="center"
      >
        <Text>{displayName}</Text>
        <ArrowAngleUp />
      </Flex>
    </EtherscanTransactionLink>
  );
}

export default EtherscanDisplayTransaction;
