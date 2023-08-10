import { useQuery } from '@apollo/client';
import { useEffect, useRef } from 'react';
import { DAOQueryDocument } from '../../../../.graphclient';
import { useSubgraphChainName } from '../../../graphql/utils';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../providers/App/governance/action';
import useIPFSClient from '../../../providers/App/hooks/useIPFSClient';
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

  const chainName = useSubgraphChainName();

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
    context: { chainName },
    pollInterval: ONE_MINUTE,
    skip: !daoAddress,
  });

  useEffect(() => {
    const {
      isLoaded,
      azoriusContract,
      lockReleaseContract,
      erc721LinearVotingContract,
      ozLinearVotingContract,
    } = governanceContracts;

    const newLoadKey =
      daoAddress +
      (azoriusContract ? '1' : '0') +
      nodeHierarchy.parentAddress +
      !!guardContracts.freezeGuardContract;

    if (isLoaded && daoAddress && newLoadKey !== loadKey.current) {
      loadKey.current = newLoadKey;

      if (azoriusContract) {
        if (ozLinearVotingContract) {
          action.dispatch({
            type: FractalGovernanceAction.SET_GOVERNANCE_TYPE,
            payload: GovernanceType.AZORIUS_ERC20,
          });
          loadERC20Strategy();
          loadERC20Token();
          loadUnderlyingERC20Token();
          if (lockReleaseContract) {
            loadLockedVotesToken();
          }
        } else if (erc721LinearVotingContract) {
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
    } else if (!isLoaded) {
      loadKey.current = undefined;
    }
  }, [
    daoAddress,
    governanceContracts,
    loadDAOProposals,
    loadUnderlyingERC20Token,
    loadERC20Strategy,
    loadERC20Token,
    loadLockedVotesToken,
    nodeHierarchy.parentAddress,
    guardContracts.freezeGuardContract,
    loadERC721Strategy,
    loadERC721Tokens,
    action,
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
