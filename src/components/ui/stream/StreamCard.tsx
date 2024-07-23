import { Text } from '@chakra-ui/react';
import { Asset, Stream } from '../../../../.graphclient';
import { Card } from '../cards/Card';
import EtherscanLink from '../links/EtherscanLink';

// @dev potential placeholder for conditionally displaying stream data
interface StreamProps {
  // @todo - we need to build this type in a way our codebase would expect that
  stream: Partial<
    Omit<Stream, 'contract' | 'asset' | 'actions' | 'batch' | 'segments' | 'tranches'> & {
      asset: Omit<Asset, 'streams'>;
    }
  >;
}
export default function StreamCard({ stream }: StreamProps) {
  return (
    <Card margin="0.5rem">
      <Text>Stream ID: {stream.id}</Text>
      <Text>Category: {stream.category}</Text>
      <Text>
        Deposit Amount: {stream.depositAmount} {stream.asset?.symbol}
      </Text>
      <Text>
        Withdrawn Amount: {stream.withdrawnAmount} {stream.asset?.symbol}
      </Text>
      <EtherscanLink
        type="token"
        value={stream.asset?.address}
      >
        <Text>Token: {stream.asset?.name}</Text>
      </EtherscanLink>
      <EtherscanLink
        type="address"
        value={stream.sender}
      >
        <Text>Sender: {stream.sender}</Text>
      </EtherscanLink>
    </Card>
  );
}
