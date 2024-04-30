import { Text, Icon } from '@chakra-ui/react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { createAccountSubstring } from '../../../hooks/utils/useDisplayName';
import EtherscanLinkTransaction from './EtherscanLinkTransaction';

export default function DisplayTransaction({ txHash }: { txHash: string }) {
  const displayName = createAccountSubstring(txHash);
  return (
    <EtherscanLinkTransaction
      txHash={txHash}
      alignItems="center"
      display="flex"
    >
      <Text as="span">{displayName}</Text>
      <Icon
        as={ArrowUpRight}
        ml="0.5rem"
      />
    </EtherscanLinkTransaction>
  );
}
