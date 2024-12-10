import { Flex, Text } from '@chakra-ui/react';
import { createAccountSubstring } from '../../../hooks/utils/useGetAccountName';
import EtherscanLink from './EtherscanLink';

export default function DisplayTransaction({ txHash }: { txHash: string }) {
  const displayName = createAccountSubstring(txHash);
  return (
    <EtherscanLink
      type="tx"
      value={txHash}
      pl={0}
      isTextLink
    >
      <Flex alignItems="center">
        <Text as="span">{displayName}</Text>
      </Flex>
    </EtherscanLink>
  );
}
