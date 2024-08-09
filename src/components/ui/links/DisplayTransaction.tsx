import { Flex, Text, Icon } from '@chakra-ui/react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { Hex } from 'viem';
import { createAccountSubstring } from '../../../hooks/utils/useDisplayName';
import EtherscanLink from './EtherscanLink';

export default function DisplayTransaction({
  txHash,
  isTextLink,
}: {
  txHash: Hex;
  isTextLink?: boolean;
}) {
  const displayName = createAccountSubstring(txHash);
  return (
    <EtherscanLink
      type="tx"
      value={txHash}
      pl={0}
      isTextLink={isTextLink}
    >
      <Flex alignItems="center">
        <Text as="span">{displayName}</Text>
        {!isTextLink && (
          <Icon
            as={ArrowUpRight}
            ml="0.5rem"
          />
        )}
      </Flex>
    </EtherscanLink>
  );
}
