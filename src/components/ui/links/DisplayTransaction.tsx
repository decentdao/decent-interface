import { HStack, Text } from '@chakra-ui/react';
import { ArrowAngleUp } from '@decent-org/fractal-ui';
import { createAccountSubstring } from '../../../hooks/utils/useDisplayName';
import EtherscanTransactionLink from './EtherscanTransactionLink';

export default function DisplayTransaction({ txHash }: { txHash: string }) {
  const displayName = createAccountSubstring(txHash);
  return (
    <EtherscanTransactionLink txHash={txHash}>
      <HStack
        color="gold.500"
        textStyle="text-base-sm-regular"
      >
        <Text>{displayName}</Text>
        <ArrowAngleUp />
      </HStack>
    </EtherscanTransactionLink>
  );
}
