import { Flex, Text } from '@chakra-ui/react';
import { ArrowAngleUp } from '@decent-org/fractal-ui';
import { createAccountSubstring } from '../../hooks/utils/useDisplayName';
import EtherscanTransactionLink from './EtherscanTransactionLink';

function EtherscanDisplayTransaction({ address }: { address?: string }) {
  if (!address) {
    return null;
  }

  const displayName = createAccountSubstring(address);
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
