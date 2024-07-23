import { useLazyQuery } from '@apollo/client';
import { useCallback } from 'react';
import { Address } from 'viem';
import { StreamsQueryDocument } from '../../../.graphclient';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';

export default function useSablierStreams() {
  const { sablierSubgraph } = useNetworkConfig();
  const [fetchStreams, { loading, data, error }] = useLazyQuery(StreamsQueryDocument);

  const handleSearchStreams = useCallback(
    async (recipientAddress: Address) => {
      if (sablierSubgraph) {
        await fetchStreams({
          variables: { recipientAddress },
          context: { subgraphSpace: sablierSubgraph.space, subgraphSlug: sablierSubgraph.slug },
        });
      } else {
        // @todo Maybe try to read from onchain?
        throw new Error('Sablier Subgraph is not supported on this chain');
      }
    },
    [fetchStreams, sablierSubgraph],
  );

  return {
    loading,
    data,
    error,
    handleSearchStreams,
  };
}
