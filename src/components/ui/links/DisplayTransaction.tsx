import { Flex, Text, Icon } from '@chakra-ui/react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { createAccountSubstring } from '../../../hooks/utils/useDisplayName';
import EtherscanLink from './EtherscanLink';

export default function DisplayTransaction({ txHash }: { txHash: string }) {
  const displayName = createAccountSubstring(txHash);
  return (
    <EtherscanLink
      type="tx"
      value={txHash}
    >
      <Flex alignItems="center">
        <Text as="span">{displayName}</Text>
        <Icon
          as={ArrowUpRight}
          ml="0.5rem"
        />
      </Flex>
    </EtherscanLink>
  );
}
