import { useQuery } from '@apollo/client';
import { useEffect, useRef } from 'react';
import { DAOQueryDocument } from '../../../../.graphclient';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../providers/App/governance/action';
import useIPFSClient from '../../../providers/App/hooks/useIPFSClient';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { GovernanceType, ProposalTemplate } from '../../../types';
import { useERC20LinearStrategy } from './governance/useERC20LinearStrategy';
import { useERC20LinearToken } from './governance/useERC20LinearToken';
import { useERC721LinearStrategy } from './governance/useERC721LinearStrategy';
import useERC721Tokens from './governance/useERC721Tokens';
import { useLockRelease } from './governance/useLockRelease';
import { useLoadDAOProposals } from './useLoadDAOProposals';

export const useFractalGovernance = () => {
  // load key for component; helps prevent unnecessary calls
  const loadKey = useRef<string>();

  const {
    node: { safe },
    governanceContracts,
    action,
    governance: { type },
    guardContracts: { isGuardLoaded },
  } = useFractal();

  const safeAddress = safe?.address;

  const loadDAOProposals = useLoadDAOProposals();
  const loadERC20Strategy = useERC20LinearStrategy();
  const loadERC721Strategy = useERC721LinearStrategy();
  const { loadERC20Token, loadUnderlyingERC20Token } = useERC20LinearToken({});
  const { loadLockedVotesToken } = useLockRelease({});
  const loadERC721Tokens = useERC721Tokens();
  const ipfsClient = useIPFSClient();

  const ONE_MINUTE = 60 * 1000;

  const { subgraph } = useNetworkConfig();

  useQuery(DAOQueryDocument, {
    variables: { safeAddress },
    onCompleted: async data => {
      if (!safeAddress) return;
      const { daos } = data;
      const dao = daos[0];

      // `dao` might be undefined despite what the type says
      if (!dao) return;

      const { proposalTemplatesHash } = dao;

      if (!proposalTemplatesHash) {
        action.dispatch({
          type: FractalGovernanceAction.SET_PROPOSAL_TEMPLATES,
          payload: [],
        });
        return;
      }

      const proposalTemplates: ProposalTemplate[] | undefined =
        await ipfsClient.cat(proposalTemplatesHash);

      if (!proposalTemplates) {
        action.dispatch({
          type: FractalGovernanceAction.SET_PROPOSAL_TEMPLATES,
          payload: [],
        });
        return;
      }

      const mappedProposalTemplates = proposalTemplates.map(proposalTemplate => ({
        ...proposalTemplate,
        transactions: proposalTemplate.transactions.map(transaction => ({
          ...transaction,
          ethValue: {
            // bigintValue was serialized as a string, so we need to convert it back to a bigint
            bigintValue: BigInt(transaction.ethValue.bigintValue || 0n),
            value: transaction.ethValue.value ?? '0',
          },
        })),
      }));

      action.dispatch({
        type: FractalGovernanceAction.SET_PROPOSAL_TEMPLATES,
        payload: mappedProposalTemplates,
      });
    },
    context: {
      subgraphSpace: subgraph.space,
      subgraphSlug: subgraph.slug,
      subgraphVersion: subgraph.version,
    },
    pollInterval: ONE_MINUTE,
    skip: !safeAddress || !type,
  });

  useEffect(() => {
    const {
      isLoaded,
      moduleAzoriusAddress,
      lockReleaseAddress,
      linearVotingErc721Address,
      linearVotingErc20Address,
    } = governanceContracts;

    if (isLoaded && !type) {
      if (moduleAzoriusAddress) {
        if (linearVotingErc20Address) {
          action.dispatch({
            type: FractalGovernanceAction.SET_GOVERNANCE_TYPE,
            payload: GovernanceType.AZORIUS_ERC20,
          });
          loadERC20Strategy();
          loadERC20Token();
          loadUnderlyingERC20Token();
          if (lockReleaseAddress) {
            loadLockedVotesToken();
          }
        } else if (linearVotingErc721Address) {
          action.dispatch({
            type: FractalGovernanceAction.SET_GOVERNANCE_TYPE,
            payload: GovernanceType.AZORIUS_ERC721,
          });
          loadERC721Strategy();
          loadERC721Tokens();
        }
      } else {
        action.dispatch({
          type: FractalGovernanceAction.SET_GOVERNANCE_TYPE,
          payload: GovernanceType.MULTISIG,
        });
      }
    }
  }, [
    governanceContracts,
    loadUnderlyingERC20Token,
    loadERC20Strategy,
    loadERC20Token,
    loadLockedVotesToken,
    loadERC721Strategy,
    loadERC721Tokens,
    action,
    type,
  ]);

  useEffect(() => {
    const newLoadKey = safeAddress || '0x';
    if (type && safeAddress && safeAddress !== loadKey.current && isGuardLoaded) {
      loadKey.current = newLoadKey;
      loadDAOProposals();
    }
    if (!type || !safeAddress) {
      loadKey.current = undefined;
    }
  }, [type, loadDAOProposals, isGuardLoaded, safeAddress]);
};
