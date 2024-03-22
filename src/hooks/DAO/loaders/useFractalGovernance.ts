import { useQuery } from '@apollo/client';
import { useEffect, useRef } from 'react';
import { DAOQueryDocument } from '../../../../.graphclient';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../providers/App/governance/action';
import useIPFSClient from '../../../providers/App/hooks/useIPFSClient';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { GovernanceType } from '../../../types';
import { useERC20LinearStrategy } from './governance/useERC20LinearStrategy';
import { useERC20LinearToken } from './governance/useERC20LinearToken';
import { useERC721LinearStrategy } from './governance/useERC721LinearStrategy';
import useERC721Tokens from './governance/useERC721Tokens';
import { useLockRelease } from './governance/useLockRelease';
import { useDAOProposals } from './useProposals';

export const useFractalGovernance = () => {
  // load key for component; helps prevent unnecessary calls
  const loadKey = useRef<string>();

  const {
    node: { daoAddress, nodeHierarchy },
    governanceContracts,
    action,
    guardContracts,
    governance: { type },
  } = useFractal();

  const loadDAOProposals = useDAOProposals();
  const loadERC20Strategy = useERC20LinearStrategy();
  const loadERC721Strategy = useERC721LinearStrategy();
  const { loadERC20Token, loadUnderlyingERC20Token } = useERC20LinearToken({});
  const { loadLockedVotesToken } = useLockRelease({});
  const loadERC721Tokens = useERC721Tokens();
  const ipfsClient = useIPFSClient();

  const ONE_MINUTE = 60 * 1000;

  const { subgraphChainName } = useNetworkConfig();

  useQuery(DAOQueryDocument, {
    variables: { daoAddress },
    onCompleted: async data => {
      if (!daoAddress) return;
      const { daos } = data;
      const dao = daos[0];

      if (dao) {
        const { proposalTemplatesHash } = dao;
        if (proposalTemplatesHash) {
          const proposalTemplates = await ipfsClient.cat(proposalTemplatesHash);

          action.dispatch({
            type: FractalGovernanceAction.SET_PROPOSAL_TEMPLATES,
            payload: proposalTemplates || [],
          });
        } else {
          action.dispatch({
            type: FractalGovernanceAction.SET_PROPOSAL_TEMPLATES,
            payload: [],
          });
        }
      } else {
        action.dispatch({
          type: FractalGovernanceAction.SET_PROPOSAL_TEMPLATES,
          payload: [],
        });
      }
    },
    context: { chainName: subgraphChainName },
    pollInterval: ONE_MINUTE,
    skip: !daoAddress,
  });

  useEffect(() => {
    const {
      isLoaded,
      azoriusContractAddress,
      lockReleaseContractAddress,
      erc721LinearVotingContractAddress,
      ozLinearVotingContractAddress,
    } = governanceContracts;

    const newLoadKey =
      (azoriusContractAddress ? '1' : '0') +
      nodeHierarchy.parentAddress +
      !!guardContracts.freezeGuardContractAddress;

    if (isLoaded && newLoadKey !== loadKey.current) {
      loadKey.current = newLoadKey;

      if (azoriusContractAddress) {
        if (ozLinearVotingContractAddress) {
          action.dispatch({
            type: FractalGovernanceAction.SET_GOVERNANCE_TYPE,
            payload: GovernanceType.AZORIUS_ERC20,
          });
          loadERC20Strategy();
          loadERC20Token();
          loadUnderlyingERC20Token();
          if (lockReleaseContractAddress) {
            loadLockedVotesToken();
          }
        } else if (erc721LinearVotingContractAddress) {
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
    if (!daoAddress) {
      loadKey.current = undefined;
    }
  }, [
    governanceContracts,
    loadDAOProposals,
    loadUnderlyingERC20Token,
    loadERC20Strategy,
    loadERC20Token,
    loadLockedVotesToken,
    nodeHierarchy.parentAddress,
    guardContracts.freezeGuardContractAddress,
    loadERC721Strategy,
    loadERC721Tokens,
    action,
    daoAddress,
  ]);

  useEffect(() => {
    if (type) {
      // Since previous hook is the only place where governance type is set - we don't need any additional check
      // But it's better to be sure that governance type is defined before calling for proposals loading
      loadDAOProposals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);
};
