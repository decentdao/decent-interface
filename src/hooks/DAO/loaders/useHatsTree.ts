import { useApolloClient } from '@apollo/client';
import { HatsSubgraphClient, Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PublicClient } from 'viem';
import { usePublicClient } from 'wagmi';
import { useFractal } from '../../../providers/App/AppProvider';
import useIPFSClient from '../../../providers/App/hooks/useIPFSClient';
import { useNetworkConfigStore } from '../../../providers/NetworkConfig/useNetworkConfigStore';
import { DecentHatsError } from '../../../store/roles/rolesStoreUtils';
import { useRolesStore } from '../../../store/roles/useRolesStore';
import { CacheExpiry, CacheKeys } from '../../utils/cache/cacheDefaults';
import { getValue, setValue } from '../../utils/cache/useLocalStorage';

const hatsSubgraphClient = new HatsSubgraphClient({});

const useHatsTree = () => {
  const { t } = useTranslation('roles');
  const {
    governanceContracts: {
      linearVotingErc20WithHatsWhitelistingAddress,
      linearVotingErc721WithHatsWhitelistingAddress,
    },
  } = useFractal();
  const { hatsTreeId, contextChainId, setHatsTree } = useRolesStore();

  const ipfsClient = useIPFSClient();
  const {
    sablierSubgraph,
    contracts: {
      hatsProtocol,
      erc6551Registry,
      hatsAccount1ofNMasterCopy: hatsAccountImplementation,
      hatsElectionsEligibilityMasterCopy: hatsElectionsImplementation,
    },
  } = useNetworkConfigStore();
  const publicClient = usePublicClient();
  const apolloClient = useApolloClient();

  const getHatsTree = useCallback(
    async (props: { hatsTreeId: number; contextChainId: number; publicClient: PublicClient }) => {
      try {
        const tree = await hatsSubgraphClient.getTree({
          chainId: props.contextChainId,
          treeId: props.hatsTreeId,
          props: {
            hats: {
              props: {
                prettyId: true,
                status: true,
                details: true,
                eligibility: true,
                wearers: {
                  props: {},
                },
              },
            },
          },
        });

        const hatsWithFetchedDetails = await Promise.all(
          (tree.hats || []).map(async hat => {
            const ipfsPrefix = 'ipfs://';

            if (hat.details === undefined || !hat.details.startsWith(ipfsPrefix)) {
              return hat;
            }

            const hash = hat.details.split(ipfsPrefix)[1];
            const cacheKey = {
              cacheName: CacheKeys.IPFS_HASH,
              hash,
              chainId: props.contextChainId,
            } as const;

            const cachedDetails = getValue(cacheKey);

            if (cachedDetails) {
              return { ...hat, details: cachedDetails };
            }

            try {
              const detailsFromIpfs = await ipfsClient.cat(hash);
              const jsonStringDetails = JSON.stringify(detailsFromIpfs);
              setValue(cacheKey, jsonStringDetails, CacheExpiry.NEVER);
              return { ...hat, details: jsonStringDetails };
            } catch {
              return hat;
            }
          }),
        );

        const treeWithFetchedDetails: Tree = { ...tree, hats: hatsWithFetchedDetails };

        try {
          await setHatsTree({
            hatsTree: treeWithFetchedDetails,
            chainId: BigInt(props.contextChainId),
            hatsProtocol,
            erc6551Registry,
            hatsAccountImplementation,
            hatsElectionsImplementation,
            publicClient: props.publicClient,
            whitelistingVotingStrategy:
              linearVotingErc20WithHatsWhitelistingAddress ||
              linearVotingErc721WithHatsWhitelistingAddress,
            apolloClient,
            sablierSubgraph,
          });
        } catch (e) {
          if (e instanceof DecentHatsError) {
            toast.error(e.message);
          }
        }
      } catch (e) {
        setHatsTree({
          hatsTree: null,
          chainId: BigInt(props.contextChainId),
          hatsProtocol,
          erc6551Registry,
          hatsAccountImplementation,
          hatsElectionsImplementation,
          publicClient: props.publicClient,
          apolloClient,
          sablierSubgraph,
        });
        const message = t('invalidHatsTreeIdMessage');
        toast.error(message);
        console.error(e, {
          message,
          args: {
            network: props.contextChainId,
            hatsTreeId: props.hatsTreeId,
          },
        });
      }
    },
    [
      apolloClient,
      erc6551Registry,
      hatsAccountImplementation,
      hatsElectionsImplementation,
      hatsProtocol,
      ipfsClient,
      linearVotingErc20WithHatsWhitelistingAddress,
      linearVotingErc721WithHatsWhitelistingAddress,
      sablierSubgraph,
      setHatsTree,
      t,
    ],
  );

  useEffect(() => {
    if (
      hatsTreeId === undefined ||
      hatsTreeId === null ||
      publicClient === undefined ||
      contextChainId === null
    ) {
      return;
    }
    getHatsTree({
      hatsTreeId,
      contextChainId,
      publicClient,
    });
  }, [
    contextChainId,
    erc6551Registry,
    hatsAccountImplementation,
    hatsElectionsImplementation,
    hatsProtocol,
    hatsTreeId,
    ipfsClient,
    publicClient,
    setHatsTree,
    t,
    linearVotingErc20WithHatsWhitelistingAddress,
    linearVotingErc721WithHatsWhitelistingAddress,
    apolloClient,
    sablierSubgraph,
    getHatsTree,
  ]);
};

export { useHatsTree };
