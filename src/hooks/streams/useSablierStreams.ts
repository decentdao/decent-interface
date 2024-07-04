import { useLazyQuery } from '@apollo/client';
import { useCallback } from 'react';
import { Address } from 'viem';
import { StreamsQueryDocument } from '../../../.graphclient';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';

export default function useSablierStreams() {
  const {
    sablierSubgraph: { space, slug },
  } = useNetworkConfig();
  const [fetchStreams, { loading, data, error }] = useLazyQuery(StreamsQueryDocument);

  const handleSearchStreams = useCallback(
    async (recipientAddress: Address) => {
      await fetchStreams({
        variables: { recipientAddress },
        context: { subgraphSpace: space, subgraphSlug: slug },
      });
    },
    [fetchStreams, space, slug],
  );

  return {
    loading,
    data,
    error,
    handleSearchStreams,
  };
}
